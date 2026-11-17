import asyncio
import base64
import json
import logging
import logging.handlers
import lzma
import math
import os
import re
import shutil
import signal
import subprocess
import sys
import threading
import time
import webbrowser
import zlib
from datetime import datetime, timedelta
from pathlib import Path
from typing import NamedTuple
from urllib.parse import urlsplit

import pystray
from PIL import Image
from pypresence import Presence
from pypresence.types import ActivityType, StatusDisplayType
from websockets.asyncio.server import serve
from websockets.exceptions import ConnectionClosed

APP_NAME = "SweetEscape RPC"
VERSION = "2.2.0"
CLIENT_ID = "1428031900877983825"
SITE = "https://sweetescape.vercel.app"
PORT = 9112
SCHEME = "sweetescape-rpc"
ORIGINS = [SITE]
DEV_ORIGINS = ["http://localhost:4173", "http://127.0.0.1:4173"]
MAX_MESSAGE_BYTES = 4096
MIN_UPDATE_GAP = 4.0
RECONNECT_DELAY = 10.0
DISCORD_WAIT = 6.0
MAX_BACKUP_CODE = 16 * 1024 * 1024
MAX_BACKUP_JSON = 256 * 1024 * 1024
BACKUP_INTERVALS = {1: "Every day", 7: "Every week", 30: "Every month", 0: "Never"}
BACKUP_KEEP = (5, 10, 30)

WINDOWS = sys.platform == "win32"
DEV = "--dev" in sys.argv
VIDEO_ID = re.compile(r"[A-Za-z0-9_-]{11}")
BACKUP_CODE = re.compile(r"[A-Za-z0-9_-]+")
BACKUP_NAME = re.compile(r"^(\d{8}-\d{6})_(\d+)s_(\d+)p\.json\.xz$")
VIDEO_URL = re.compile(
    r"^https://(?:www\.|m\.|music\.)?(?:youtube\.com/(?:watch\?(?:[^#]*&)?v=|embed/|shorts/)|youtu\.be/)"
    r"([A-Za-z0-9_-]{11})"
)

if WINDOWS:
    import ctypes
    import winreg

log = logging.getLogger("sweetescape-rpc")


def data_dir():
    if WINDOWS:
        base = Path(os.environ.get("LOCALAPPDATA") or Path.home())
    elif sys.platform == "darwin":
        base = Path.home() / "Library" / "Application Support"
    else:
        base = Path(os.environ.get("XDG_STATE_HOME") or Path.home() / ".local" / "state")
    path = base / APP_NAME
    path.mkdir(parents=True, exist_ok=True)
    return path


def resource(name):
    base = getattr(sys, "_MEIPASS", None) or Path(__file__).resolve().parent
    return Path(base) / name


def setup_logging():
    handler = logging.handlers.RotatingFileHandler(
        data_dir() / "rpc.log", maxBytes=200_000, backupCount=1, encoding="utf-8"
    )
    handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(message)s"))
    handlers = [handler]
    if sys.stderr is not None:
        handlers.append(logging.StreamHandler())
    logging.basicConfig(level=logging.INFO, handlers=handlers)
    logging.getLogger("websockets").setLevel(logging.WARNING)
    logging.getLogger("asyncio").setLevel(logging.WARNING)
    threading.excepthook = lambda args: log.error(
        "Unhandled error in %s", args.thread.name, exc_info=(args.exc_type, args.exc_value, args.exc_traceback)
    )


class Settings:
    def __init__(self):
        self.path = data_dir() / "settings.json"
        self.values = {
            "open_from_browser": True,
            "show_branding": True,
            "backup_every_days": 7,
            "backup_keep": 10,
        }
        try:
            stored = json.loads(self.path.read_text(encoding="utf-8"))
            if isinstance(stored, dict):
                self.values.update(
                    {k: v for k, v in stored.items() if k in self.values and type(v) is type(self.values[k])}
                )
        except (OSError, ValueError):
            pass

    def __getitem__(self, key):
        return self.values[key]

    def __setitem__(self, key, value):
        self.values[key] = value
        try:
            self.path.write_text(json.dumps(self.values, indent=2), encoding="utf-8")
        except OSError as error:
            log.warning("Could not save settings: %s", error)


def clean_text(value, limit=128):
    if not isinstance(value, str):
        return ""
    text = "".join(ch for ch in " ".join(value.split()) if ch.isprintable())
    if len(text) > limit:
        text = text[: limit - 1].rstrip() + "\u2026"
    return text


def at_least_two(text):
    return text if len(text) >= 2 else text + "\u2800"


def https_url(value, limit=256):
    if not isinstance(value, str) or len(value) > limit:
        return None
    parts = urlsplit(value)
    if parts.scheme != "https" or not parts.hostname or any(ch.isspace() for ch in value):
        return None
    return value


def seconds(value):
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        return None
    if not math.isfinite(value) or value < 0 or value > 86_400:
        return None
    return float(value)


def video_id(data):
    given = data.get("videoId")
    if isinstance(given, str) and VIDEO_ID.fullmatch(given):
        return given
    url = data.get("url")
    if isinstance(url, str):
        match = VIDEO_URL.match(url)
        if match:
            return match.group(1)
    return None


def build_activity(data):
    title = clean_text(data.get("song"))
    if not title:
        return None
    artist = clean_text(data.get("artist"), 100)
    if artist.lower() in ("unknown", "unknown artist"):
        artist = ""
    video = video_id(data)
    link = f"https://www.youtube.com/watch?v={video}" if video else None
    paused = data.get("paused") is True

    activity = {
        "activity_type": ActivityType.LISTENING,
        "status_display_type": StatusDisplayType.DETAILS,
        "details": at_least_two(title),
        "large_image": https_url(data.get("image"))
        or (f"https://i.ytimg.com/vi/{video}/hqdefault.jpg" if video else "music_note"),
        "small_image": "favicon",
        "small_text": "Paused" if paused else "SweetEscape",
        "buttons": [{"label": "Open SweetEscape", "url": SITE}],
    }
    if paused:
        activity["state"] = f"Paused \u00b7 {artist}" if artist else "Paused"
    elif artist:
        activity["state"] = at_least_two(artist)
    if link:
        activity["details_url"] = link
        activity["large_url"] = link
        activity["buttons"].insert(0, {"label": "Listen on YouTube", "url": link})

    duration = seconds(data.get("duration"))
    position = seconds(data.get("position"))
    rate = seconds(data.get("rate")) or 1.0
    rate = min(max(rate, 0.25), 4.0)
    if not paused and duration and position is not None and position <= duration:
        end = time.time() + (duration - position) / rate
        activity["start"] = int(end - duration / rate)
        activity["end"] = int(end)
    return activity


def without_branding(activity):
    activity = {k: v for k, v in activity.items() if k not in ("small_image", "small_text")}
    buttons = [b for b in activity.get("buttons", []) if b["url"] != SITE]
    if buttons:
        activity["buttons"] = buttons
    else:
        activity.pop("buttons", None)
    return activity


def same_activity(a, b):
    if a is None or b is None:
        return a is b
    keys = (set(a) | set(b)) - {"start", "end"}
    if any(a.get(k) != b.get(k) for k in keys):
        return False
    if ("end" in a) != ("end" in b):
        return False
    return "end" not in a or abs(a["end"] - b["end"]) <= 2


class Backup(NamedTuple):
    path: Path
    created: datetime
    songs: int
    playlists: int
    size: int


def decode_backup(code):
    if not isinstance(code, str) or len(code) > MAX_BACKUP_CODE or not BACKUP_CODE.fullmatch(code):
        raise ValueError("that isn't a SweetEscape backup")
    raw = base64.urlsafe_b64decode(code + "=" * (-len(code) % 4))
    inflater = zlib.decompressobj()
    data = inflater.decompress(raw, MAX_BACKUP_JSON)
    if inflater.unconsumed_tail or not inflater.eof:
        raise ValueError("the backup is incomplete or too large")
    payload = json.loads(data)
    if (
        not isinstance(payload, dict)
        or payload.get("v") not in (1, 2)
        or not isinstance(payload.get("songLibrary"), list)
        or not isinstance(payload.get("playlists"), list)
    ):
        raise ValueError("that isn't a SweetEscape backup")
    return data, payload


def pack(data):
    dict_size = min(max(1 << 16, 1 << max(len(data) - 1, 1).bit_length()), 1 << 26)
    filters = [{"id": lzma.FILTER_LZMA2, "preset": 9 | lzma.PRESET_EXTREME, "dict_size": dict_size}]
    return lzma.compress(data, format=lzma.FORMAT_XZ, filters=filters)


def human_size(size):
    if size < 1024:
        return f"{size} bytes"
    if size < 1024 * 1024:
        return f"{size / 1024:.0f} KB"
    return f"{size / 1024 / 1024:.1f} MB"


def human_time(moment):
    days = (moment.date() - datetime.now().date()).days
    if days == 0:
        return f"today at {moment:%H:%M}"
    if days == -1:
        return f"yesterday at {moment:%H:%M}"
    if days == 1:
        return f"tomorrow at {moment:%H:%M}"
    return f"{moment:%d %b %Y}"


class Backups:
    def __init__(self, settings):
        self.settings = settings
        self.folder = data_dir() / "backups"
        self._lock = threading.Lock()
        self._cache = None

    def list(self):
        with self._lock:
            if self._cache is None:
                self._cache = self._scan()
            return list(self._cache)

    def forget_cache(self):
        with self._lock:
            self._cache = None

    def _scan(self):
        found = []
        try:
            entries = list(self.folder.iterdir())
        except OSError:
            return found
        for path in entries:
            match = BACKUP_NAME.match(path.name)
            if not match:
                continue
            try:
                created = datetime.strptime(match.group(1), "%Y%m%d-%H%M%S")
                size = path.stat().st_size
            except (ValueError, OSError):
                continue
            found.append(Backup(path, created, int(match.group(2)), int(match.group(3)), size))
        return sorted(found, key=lambda b: b.created, reverse=True)

    def latest(self):
        backups = self.list()
        return backups[0] if backups else None

    def next_due(self):
        days = self.settings["backup_every_days"]
        if days <= 0:
            return None
        latest = self.latest()
        return latest.created + timedelta(days=days) if latest else datetime.now()

    def due(self):
        when = self.next_due()
        return when is not None and when <= datetime.now()

    def save(self, code):
        data, payload = decode_backup(code)
        songs, playlists = len(payload["songLibrary"]), len(payload["playlists"])
        if not songs and not playlists:
            raise ValueError("the library is empty, so there was nothing to back up")
        packed = pack(data)
        created = datetime.now().replace(microsecond=0)
        with self._lock:
            self.folder.mkdir(parents=True, exist_ok=True)
            path = self.folder / f"{created:%Y%m%d-%H%M%S}_{songs}s_{playlists}p.json.xz"
            temp = path.with_name(path.name + ".tmp")
            temp.write_bytes(packed)
            os.replace(temp, path)
            self._cache = None
        self.prune()
        return Backup(path, created, songs, playlists, len(packed))

    def prune(self):
        backups = self.list()
        if not backups:
            return
        keep = {b.path for b in backups[: max(1, self.settings["backup_keep"])]}
        keep.add(max(backups, key=lambda b: (b.songs, b.created)).path)
        for backup in backups:
            if backup.path not in keep:
                try:
                    backup.path.unlink()
                except OSError as error:
                    log.warning("Could not delete old backup %s: %s", backup.path.name, error)
        self.forget_cache()

    def read_code(self, backup):
        data = lzma.decompress(backup.path.read_bytes(), format=lzma.FORMAT_XZ)
        json.loads(data)
        return base64.urlsafe_b64encode(zlib.compress(data, 9)).rstrip(b"=").decode("ascii")


class DiscordLink:
    def __init__(self):
        self._cond = threading.Condition()
        self._rpc = None
        self._wanted = None
        self._shown = None
        self._dirty = False
        self._sent_at = 0.0
        self._retry_at = 0.0
        self._connect_now = False
        self._stopping = False
        self.sharing = True
        self.branding = True
        self.status = "idle"
        self.tabs = 0
        self.on_status = lambda status: None
        self.on_track = lambda: None

    @property
    def connected(self):
        return self.status == "connected"

    @property
    def track(self):
        activity = self._wanted
        if activity is None or not self.sharing:
            return None
        return activity["details"].rstrip("\u2800"), activity.get("state", "")

    def show(self, activity):
        with self._cond:
            self._wanted = activity
            self._dirty = True
            self._cond.notify()
        self.on_track()

    def set_branding(self, branding):
        with self._cond:
            self.branding = branding
            self._dirty = True
            self._cond.notify()

    def set_sharing(self, sharing):
        with self._cond:
            self.sharing = sharing
            self._dirty = True
            self._cond.notify()
        self.on_track()

    def set_tabs(self, tabs):
        with self._cond:
            self.tabs = tabs
            self._cond.notify()

    def connect_soon(self):
        with self._cond:
            self._connect_now = True
            self._cond.notify()

    def stop(self):
        with self._cond:
            self._stopping = True
            self._cond.notify()

    def run(self):
        while True:
            with self._cond:
                self._cond.wait(self._wait_time())
                if self._stopping:
                    break
                connect_now = self._connect_now
                self._connect_now = False
            now = time.monotonic()
            if self._rpc is None and (connect_now or (self.tabs and now >= self._retry_at)):
                self._connect()
            if self._rpc is not None and self._dirty and now - self._sent_at >= MIN_UPDATE_GAP:
                self._push()
        self._disconnect(clear=True)

    def _wait_time(self):
        if self._stopping or self._connect_now:
            return 0
        if self._rpc is None:
            return max(0.0, self._retry_at - time.monotonic()) if self.tabs else None
        if self._dirty:
            return max(0.0, self._sent_at + MIN_UPDATE_GAP - time.monotonic())
        return None

    def _set_status(self, status):
        if status != self.status:
            self.status = status
            self.on_status(status)

    def _connect(self):
        rpc = None
        try:
            rpc = Presence(CLIENT_ID, connection_timeout=5, response_timeout=5)
            rpc.connect()
        except Exception as error:
            if rpc is not None:
                try:
                    rpc.loop.close()
                except Exception:
                    pass
            self._retry_at = time.monotonic() + RECONNECT_DELAY
            if self.status != "no-discord":
                log.info("Discord not reachable: %s", error)
            self._set_status("no-discord")
            return
        self._rpc = rpc
        self._shown = None
        with self._cond:
            self._dirty = True
        log.info("Connected to Discord")
        self._set_status("connected")

    def _push(self):
        with self._cond:
            activity = self._wanted if self.sharing else None
            if activity is not None and not self.branding:
                activity = without_branding(activity)
            self._dirty = False
        if same_activity(activity, self._shown):
            return
        try:
            if activity is None:
                self._rpc.clear()
            else:
                self._rpc.update(**activity)
        except Exception as error:
            log.warning("Discord rejected the update: %s", error)
            with self._cond:
                self._dirty = True
            self._disconnect(clear=False)
            self._retry_at = time.monotonic() + 1
            self._set_status("no-discord")
            return
        self._shown = activity
        self._sent_at = time.monotonic()

    def _disconnect(self, clear):
        rpc, self._rpc = self._rpc, None
        self._shown = None
        if rpc is None:
            return
        if clear:
            try:
                rpc.clear()
            except Exception:
                pass
        try:
            rpc.close()
        except Exception:
            pass


class Bridge:
    def __init__(self, link, backups):
        self.link = link
        self.backups = backups
        self.pending = None
        self.awaiting = None
        self.manual = False
        self.asked_at = 0.0
        self.on_backup = lambda message: None
        self.clients = {}
        self.owner = None
        self.loop = None
        self.server = None
        self.ready = threading.Event()
        self.error = None

    async def handle(self, ws):
        self.clients[ws] = None
        self.link.set_tabs(len(self.clients))
        log.info("Browser tab connected (%d open)", len(self.clients))
        try:
            await ws.send(json.dumps({
                "status": "app_ready",
                "app": "sweetescape-rpc",
                "version": VERSION,
                "message": "Desktop app connected, linking to Discord...",
            }))
            if not self.link.connected:
                self.link.connect_soon()
                deadline = time.monotonic() + DISCORD_WAIT
                while not self.link.connected and time.monotonic() < deadline:
                    await asyncio.sleep(0.25)
            await self.report(ws)
            await self.after_connect(ws)
            async for raw in ws:
                await self.receive(ws, raw)
        except ConnectionClosed:
            pass
        finally:
            del self.clients[ws]
            self.link.set_tabs(len(self.clients))
            if self.awaiting is ws:
                self.awaiting = None
            if self.owner is ws:
                self.owner = None
                self.link.show(None)
            log.info("Browser tab disconnected (%d open)", len(self.clients))

    async def report(self, ws):
        connected = self.link.connected
        if ws not in self.clients or self.clients[ws] is connected:
            return
        self.clients[ws] = connected
        if connected:
            message = {"status": "discord_ready", "message": "Discord API connected successfully"}
        else:
            message = {
                "status": "error",
                "stage": "discord",
                "message": "Discord isn't running. Open Discord and this will connect by itself.",
            }
        try:
            await ws.send(json.dumps(message))
        except ConnectionClosed:
            pass

    def newest(self):
        return next(reversed(self.clients)) if self.clients else None

    async def after_connect(self, ws):
        job, self.pending = self.pending, None
        if job is not None:
            await self.run_job(ws, job)
        elif self.backups.due():
            await self.ask_for_backup(ws, manual=False)

    async def ask_for_backup(self, ws, manual):
        if not manual and time.monotonic() - self.asked_at < 600:
            return
        self.asked_at = time.monotonic()
        self.awaiting = ws
        self.manual = manual
        try:
            await ws.send(json.dumps({"status": "backup_request"}))
        except ConnectionClosed:
            self.awaiting = None

    async def run_job(self, ws, job):
        if job == "backup":
            await self.ask_for_backup(ws, manual=True)
            return
        try:
            code = await asyncio.get_running_loop().run_in_executor(None, self.backups.read_code, job)
        except (OSError, ValueError, lzma.LZMAError) as error:
            log.warning("Could not read backup %s: %s", job.path.name, error)
            self.on_backup(f"That backup could not be read: {error}")
            return
        try:
            await ws.send(json.dumps({
                "status": "restore",
                "code": code,
                "created": job.created.isoformat(),
                "songs": job.songs,
                "playlists": job.playlists,
            }))
        except ConnectionClosed:
            self.pending = job
            return
        self.on_backup("Sent to SweetEscape. Confirm the restore in your browser.")

    def request(self, job):
        if self.loop is not None:
            asyncio.run_coroutine_threadsafe(self._request(job), self.loop)

    async def _request(self, job):
        ws = self.newest()
        if ws is not None and self.clients[ws] is not None:
            await self.run_job(ws, job)
            return
        self.pending = job
        if ws is None:
            webbrowser.open(SITE)

    async def save_backup(self, ws, data):
        if ws is not self.awaiting:
            return
        self.awaiting = None
        manual, self.manual = self.manual, False
        try:
            if data.get("empty") is True:
                raise ValueError("the library in the open tab is empty, so there was nothing to back up")
            saved = await asyncio.get_running_loop().run_in_executor(None, self.backups.save, data.get("code"))
        except (ValueError, RecursionError, OSError, zlib.error, lzma.LZMAError) as error:
            log.warning("Backup not saved: %s", error)
            reply = {"status": "backup_failed", "message": str(error)}
            if manual:
                self.on_backup(f"Backup not saved: {error}")
        else:
            log.info("Saved backup %s (%s)", saved.path.name, human_size(saved.size))
            reply = {"status": "backup_saved", "songs": saved.songs, "playlists": saved.playlists, "bytes": saved.size}
            if manual:
                self.on_backup(
                    f"Backed up {saved.songs:,} songs and {saved.playlists:,} playlists ({human_size(saved.size)})."
                )
        try:
            await ws.send(json.dumps(reply))
        except ConnectionClosed:
            pass

    async def backup_timer(self):
        while True:
            await asyncio.sleep(3600)
            ws = self.newest()
            if ws is not None and self.backups.due():
                await self.ask_for_backup(ws, manual=False)

    def status_changed(self, status):
        for ws, told in list(self.clients.items()):
            if told is not None:
                asyncio.ensure_future(self.report(ws))

    async def receive(self, ws, raw):
        try:
            data = json.loads(raw)
        except (ValueError, RecursionError):
            return
        if not isinstance(data, dict):
            return
        if data.get("action") == "backup":
            await self.save_backup(ws, data)
            return
        if len(raw) > MAX_MESSAGE_BYTES:
            return
        if data.get("action") == "clear" or data.get("enabled") is False:
            if self.owner in (None, ws):
                self.owner = None
                self.link.show(None)
            await ws.send(json.dumps({"status": "success", "message": "Rich Presence cleared"}))
            return
        activity = build_activity(data)
        if activity is None:
            await ws.send(json.dumps({"status": "ignored", "message": "No song title in the update"}))
            return
        self.owner = ws
        self.link.show(activity)
        if not self.link.connected:
            await self.report(ws)
            return
        await ws.send(json.dumps({"status": "success", "message": "Rich Presence updated"}))

    def run(self):
        self.loop = asyncio.new_event_loop()
        asyncio.set_event_loop(self.loop)
        self.loop.run_until_complete(self._serve())

    async def _serve(self):
        origins = ORIGINS + (DEV_ORIGINS if DEV else [])
        try:
            self.server = await serve(
                self.handle,
                "localhost",
                PORT,
                origins=origins,
                max_size=MAX_BACKUP_CODE + 4096,
                max_queue=8,
                compression=None,
                server_header=None,
            )
        except OSError as error:
            self.error = error
            self.ready.set()
            return
        log.info("Listening on ws://localhost:%d for %s", PORT, ", ".join(origins))
        self.ready.set()
        timer = asyncio.ensure_future(self.backup_timer())
        await self.server.wait_closed()
        timer.cancel()

    def stop(self):
        if self.loop is not None and self.server is not None:
            self.loop.call_soon_threadsafe(self.server.close)

    def notify(self, status):
        if self.loop is not None:
            self.loop.call_soon_threadsafe(self.status_changed, status)


def launch_command():
    if getattr(sys, "frozen", False):
        return f'"{sys.executable}"'
    interpreter = Path(sys.executable)
    pythonw = interpreter.with_name("pythonw.exe")
    if pythonw.exists():
        interpreter = pythonw
    return f'"{interpreter}" "{Path(__file__).resolve()}"'


PROTOCOL_KEY = rf"Software\Classes\{SCHEME}"
RUN_KEY = r"Software\Microsoft\Windows\CurrentVersion\Run"


def read_value(path, name=None):
    try:
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, path) as key:
            return winreg.QueryValueEx(key, name)[0]
    except OSError:
        return None


def write_value(path, name, value):
    with winreg.CreateKey(winreg.HKEY_CURRENT_USER, path) as key:
        winreg.SetValueEx(key, name, 0, winreg.REG_SZ, value)


def delete_tree(path):
    try:
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, path) as key:
            children = []
            while True:
                try:
                    children.append(winreg.EnumKey(key, len(children)))
                except OSError:
                    break
        for child in children:
            delete_tree(rf"{path}\{child}")
        winreg.DeleteKey(winreg.HKEY_CURRENT_USER, path)
    except FileNotFoundError:
        pass


def browser_command():
    return f"{launch_command()} --from-browser"


def protocol_registered():
    return read_value(rf"{PROTOCOL_KEY}\shell\open\command") is not None


def register_protocol():
    write_value(PROTOCOL_KEY, None, f"URL:{APP_NAME}")
    write_value(PROTOCOL_KEY, "URL Protocol", "")
    if getattr(sys, "frozen", False):
        write_value(rf"{PROTOCOL_KEY}\DefaultIcon", None, f'"{sys.executable}",0')
    write_value(rf"{PROTOCOL_KEY}\shell\open\command", None, browser_command())


def unregister_protocol():
    delete_tree(PROTOCOL_KEY)


def starts_with_windows():
    return read_value(RUN_KEY, APP_NAME) is not None


def set_start_with_windows(enabled):
    if enabled:
        write_value(RUN_KEY, APP_NAME, f"{launch_command()} --startup")
        return
    try:
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, RUN_KEY, 0, winreg.KEY_SET_VALUE) as key:
            winreg.DeleteValue(key, APP_NAME)
    except FileNotFoundError:
        pass


def refresh_registrations(settings):
    try:
        if settings["open_from_browser"]:
            if read_value(rf"{PROTOCOL_KEY}\shell\open\command") != browser_command():
                register_protocol()
                log.info("Registered %s:// for this copy of the app", SCHEME)
        if starts_with_windows() and read_value(RUN_KEY, APP_NAME) != f"{launch_command()} --startup":
            set_start_with_windows(True)
    except OSError as error:
        log.warning("Could not update registry entries: %s", error)


def remove_everything():
    unregister_protocol()
    set_start_with_windows(False)


def forget_this_pc():
    folder = data_dir()
    logging.shutdown()
    for path in folder.iterdir():
        if path.name == "backups":
            continue
        if path.is_dir():
            shutil.rmtree(path, ignore_errors=True)
        else:
            path.unlink(missing_ok=True)
    try:
        folder.rmdir()
    except OSError:
        pass
    if WINDOWS and getattr(sys, "frozen", False):
        subprocess.Popen(["explorer", f"/select,{sys.executable}"])


def message_box(text, ask=False):
    if not WINDOWS:
        log.warning(text)
        return True
    flags = 0x50000 | (0x121 if ask else 0x40)
    return ctypes.windll.user32.MessageBoxW(None, text, APP_NAME, flags) == 1


def tray_image():
    try:
        return Image.open(resource("icon.png")).convert("RGBA").resize((64, 64), Image.LANCZOS)
    except OSError:
        return Image.new("RGBA", (64, 64), (93, 156, 89, 255))


def open_folder(path):
    if WINDOWS:
        os.startfile(path)
    elif sys.platform == "darwin":
        subprocess.Popen(["open", str(path)])
    else:
        subprocess.Popen(["xdg-open", str(path)])


class Tray:
    def __init__(self, link, bridge, settings, backups):
        self.link = link
        self.bridge = bridge
        self.settings = settings
        self.backups = backups
        self.removing = False
        self.removed = False
        self.icon = pystray.Icon("sweetescape-rpc", tray_image(), APP_NAME, self.menu())

    def menu(self):
        item = pystray.MenuItem
        return pystray.Menu(
            item(f"{APP_NAME} {VERSION}", None, enabled=False),
            item(lambda _: self.discord_line(), None, enabled=False),
            item(lambda _: self.track_line(), None, enabled=False, visible=lambda _: self.link.track is not None),
            pystray.Menu.SEPARATOR,
            item("Open SweetEscape", self.open_site, default=True),
            item("Pause sharing", self.toggle_sharing, checked=lambda _: not self.link.sharing),
            item("Show SweetEscape on my status", self.toggle_branding, checked=lambda _: self.link.branding),
            item(
                "Let the website open this app",
                self.toggle_browser_launch,
                checked=lambda _: self.settings["open_from_browser"],
                visible=WINDOWS,
            ),
            item("Start with Windows", self.toggle_startup, checked=lambda _: starts_with_windows(), visible=WINDOWS),
            pystray.Menu.SEPARATOR,
            item("Library backups", self.backup_menu()),
            item("Open log folder", lambda: open_folder(data_dir())),
            pystray.Menu.SEPARATOR,
            item("Remove from this PC and quit", self.remove, visible=WINDOWS),
            item("Quit", self.quit),
        )

    def backup_menu(self):
        item = pystray.MenuItem
        every = pystray.Menu(*[
            item(label, self.choose(lambda d=days: self.set_setting("backup_every_days", d)),
                 checked=lambda _, d=days: self.settings["backup_every_days"] == d, radio=True)
            for days, label in BACKUP_INTERVALS.items()
        ])
        keep = pystray.Menu(*[
            item(f"Last {count}", self.choose(lambda c=count: self.set_setting("backup_keep", c)),
                 checked=lambda _, c=count: self.settings["backup_keep"] == c, radio=True)
            for count in BACKUP_KEEP
        ])
        return pystray.Menu(
            item(lambda _: self.backup_summary(), None, enabled=False),
            item(lambda _: self.backup_contents(), None, enabled=False,
                 visible=lambda _: self.backups.latest() is not None),
            item(lambda _: self.backup_schedule(), None, enabled=False),
            item("Covers library, playlists, themes, settings and stats", None, enabled=False),
            pystray.Menu.SEPARATOR,
            item("Back up now", self.backup_now),
            item(lambda _: f"Restore ({len(self.backups.list())})", pystray.Menu(self.restore_items)),
            pystray.Menu.SEPARATOR,
            item("Back up automatically", every),
            item("Keep", keep),
            item("Open backup folder", self.open_backups),
        )

    def choose(self, action):
        return lambda: action()

    def set_setting(self, key, value):
        self.settings[key] = value
        if key == "backup_keep":
            self.backups.prune()
        self.refresh()

    def backup_summary(self):
        latest = self.backups.latest()
        return f"Last backup: {human_time(latest.created)}" if latest else "No backups yet"

    def backup_contents(self):
        latest = self.backups.latest()
        if latest is None:
            return ""
        return f"{latest.songs:,} songs, {latest.playlists:,} playlists, {human_size(latest.size)}"

    def backup_schedule(self):
        when = self.backups.next_due()
        if when is None:
            return "Automatic backups are off"
        if when <= datetime.now():
            return "Next backup: as soon as SweetEscape is open"
        return f"Next backup: {human_time(when)}"

    def restore_items(self):
        item = pystray.MenuItem
        backups = self.backups.list()
        if not backups:
            yield item("No backups yet", None, enabled=False)
            return
        for backup in backups:
            label = f"{backup.created:%d %b %Y, %H:%M} \u2013 {backup.songs:,} songs, {backup.playlists:,} playlists"
            yield item(label, self.choose(lambda b=backup: self.restore(b)))

    def backup_now(self):
        if not self.bridge.clients:
            self.notify("Opening SweetEscape to take the backup\u2026")
        self.bridge.request("backup")

    def restore(self, backup):
        if not backup.path.exists():
            self.backups.forget_cache()
            self.notify("That backup file is gone. Pick another one.")
            return
        if not self.bridge.clients:
            self.notify("Opening SweetEscape to restore the backup\u2026")
        self.bridge.request(backup)

    def open_backups(self):
        self.backups.folder.mkdir(parents=True, exist_ok=True)
        self.backups.forget_cache()
        open_folder(self.backups.folder)

    def notify(self, message):
        try:
            self.icon.notify(message, APP_NAME)
        except Exception:
            log.info(message)
        self.refresh()

    def discord_state(self):
        return {
            "connected": "connected",
            "no-discord": "not running",
            "idle": "waiting for SweetEscape",
        }.get(self.link.status, "connecting\u2026")

    def discord_line(self):
        return f"Discord: {self.discord_state()}"

    def track_line(self):
        track = self.link.track
        if track is None:
            return ""
        title, artist = track
        line = f"{title} \u2013 {artist}" if artist else title
        return line if len(line) <= 60 else line[:59] + "\u2026"

    def refresh(self, *_):
        tabs = len(self.bridge.clients)
        self.icon.title = f"{APP_NAME} \u2013 Discord {self.discord_state()}, {tabs} tab{'s' if tabs != 1 else ''}"
        self.icon.update_menu()

    def open_site(self):
        webbrowser.open(SITE)

    def toggle_sharing(self):
        self.link.set_sharing(not self.link.sharing)

    def toggle_branding(self):
        branding = not self.link.branding
        self.link.set_branding(branding)
        self.settings["show_branding"] = branding

    def toggle_browser_launch(self):
        enabled = not self.settings["open_from_browser"]
        try:
            if enabled:
                register_protocol()
            else:
                unregister_protocol()
        except OSError as error:
            message_box(f"Could not change the setting: {error}")
            return
        self.settings["open_from_browser"] = enabled

    def toggle_startup(self):
        try:
            set_start_with_windows(not starts_with_windows())
        except OSError as error:
            message_box(f"Could not change the setting: {error}")

    def remove(self):
        if self.removing:
            return
        self.removing = True
        threading.Thread(target=self._confirm_remove, name="remove", daemon=True).start()

    def _confirm_remove(self):
        try:
            confirmed = message_box(
                "Remove SweetEscape RPC from this PC?\n\n"
                "This deletes the sweetescape-rpc:// link, the startup entry, and the app's "
                "settings and log, then quits. Explorer will open with the program file "
                "selected so you can delete it too.\n\n"
                f"Your library backups are kept in {self.backups.folder}. Delete that folder "
                "yourself if you don't need them.",
                ask=True,
            )
            if confirmed:
                log.info("Removing registry entries and app data")
                remove_everything()
                self.removed = True
                self.quit()
        except Exception:
            log.exception("Remove failed")
            message_box("Something went wrong while removing. Details are in the log file.")
        finally:
            self.removing = False

    def quit(self):
        self.icon.stop()

    def run(self):
        self.icon.run(setup=self._visible)

    def _visible(self, icon):
        icon.visible = True
        self.link.on_status = lambda status: (self.bridge.notify(status), self.refresh())
        self.link.on_track = self.refresh
        self.bridge.on_backup = self.notify
        self.refresh()


def main():
    setup_logging()
    if WINDOWS and "--uninstall" in sys.argv:
        remove_everything()
        forget_this_pc()
        return

    settings = Settings()
    backups = Backups(settings)
    link = DiscordLink()
    bridge = Bridge(link, backups)
    threading.Thread(target=bridge.run, name="websocket", daemon=True).start()
    bridge.ready.wait(10)
    if bridge.error is not None:
        log.info("Port %d is busy, assuming another copy is running: %s", PORT, bridge.error)
        if "--from-browser" not in sys.argv and "--startup" not in sys.argv:
            message_box(f"{APP_NAME} is already running. Look for its icon in the system tray.")
        return

    log.info("%s %s started%s", APP_NAME, VERSION, " (dev origins allowed)" if DEV else "")
    link.branding = settings["show_branding"]
    if WINDOWS:
        refresh_registrations(settings)

    tray = Tray(link, bridge, settings, backups)
    link.on_status = bridge.notify
    worker = threading.Thread(target=link.run, name="discord", daemon=True)
    worker.start()
    signal.signal(signal.SIGINT, lambda *_: tray.quit())

    try:
        tray.run()
    finally:
        bridge.stop()
        link.stop()
        worker.join(5)
        log.info("Stopped")
        if tray.removed:
            forget_this_pc()


if __name__ == "__main__":
    main()
