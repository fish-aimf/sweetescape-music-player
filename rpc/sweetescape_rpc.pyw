import asyncio
import json
import logging
import logging.handlers
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
from pathlib import Path
from urllib.parse import urlsplit

import pystray
from PIL import Image, ImageDraw
from pypresence import Presence
from pypresence.types import ActivityType, StatusDisplayType
from websockets.asyncio.server import serve
from websockets.exceptions import ConnectionClosed

APP_NAME = "SweetEscape RPC"
VERSION = "2.1.0"
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

WINDOWS = sys.platform == "win32"
DEV = "--dev" in sys.argv
VIDEO_ID = re.compile(r"[A-Za-z0-9_-]{11}")
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


class Settings:
    def __init__(self):
        self.path = data_dir() / "settings.json"
        self.values = {"open_from_browser": True, "show_branding": True}
        try:
            stored = json.loads(self.path.read_text(encoding="utf-8"))
            if isinstance(stored, dict):
                self.values.update({k: v for k, v in stored.items() if k in self.values})
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
        "large_text": at_least_two(title),
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
        self.status = "starting"
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
            if self._rpc is None and (connect_now or now >= self._retry_at):
                self._connect()
            if self._rpc is not None and self._dirty and now - self._sent_at >= MIN_UPDATE_GAP:
                self._push()
        self._disconnect(clear=True)

    def _wait_time(self):
        if self._stopping or self._connect_now:
            return 0
        if self._rpc is None:
            return max(0.0, self._retry_at - time.monotonic())
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
    def __init__(self, link):
        self.link = link
        self.clients = {}
        self.owner = None
        self.loop = None
        self.server = None
        self.ready = threading.Event()
        self.error = None

    async def handle(self, ws):
        self.clients[ws] = None
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
            async for raw in ws:
                await self.receive(ws, raw)
        except ConnectionClosed:
            pass
        finally:
            del self.clients[ws]
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

    def status_changed(self, status):
        for ws, told in list(self.clients.items()):
            if told is not None:
                asyncio.ensure_future(self.report(ws))

    async def receive(self, ws, raw):
        try:
            data = json.loads(raw)
        except ValueError:
            return
        if not isinstance(data, dict):
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
                max_size=MAX_MESSAGE_BYTES,
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
        await self.server.wait_closed()

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
    shutil.rmtree(folder, ignore_errors=True)
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
        image = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
        ImageDraw.Draw(image).ellipse([8, 8, 56, 56], fill=(93, 156, 89, 255))
        return image


def open_folder(path):
    if WINDOWS:
        os.startfile(path)
    elif sys.platform == "darwin":
        subprocess.Popen(["open", str(path)])
    else:
        subprocess.Popen(["xdg-open", str(path)])


class Tray:
    def __init__(self, link, bridge, settings):
        self.link = link
        self.bridge = bridge
        self.settings = settings
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
            item("Open log folder", lambda: open_folder(data_dir())),
            pystray.Menu.SEPARATOR,
            item("Remove from this PC and quit", self.remove, visible=WINDOWS),
            item("Quit", self.quit),
        )

    def discord_state(self):
        return {"connected": "connected", "no-discord": "not running"}.get(self.link.status, "connecting\u2026")

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
                "selected so you can delete it too.",
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
        self.refresh()


def main():
    setup_logging()
    if WINDOWS and "--uninstall" in sys.argv:
        remove_everything()
        forget_this_pc()
        return

    link = DiscordLink()
    bridge = Bridge(link)
    threading.Thread(target=bridge.run, name="websocket", daemon=True).start()
    bridge.ready.wait(10)
    if bridge.error is not None:
        log.info("Port %d is busy, assuming another copy is running: %s", PORT, bridge.error)
        if "--from-browser" not in sys.argv and "--startup" not in sys.argv:
            message_box(f"{APP_NAME} is already running. Look for its icon in the system tray.")
        return

    log.info("%s %s started%s", APP_NAME, VERSION, " (dev origins allowed)" if DEV else "")
    settings = Settings()
    link.branding = settings["show_branding"]
    if WINDOWS:
        refresh_registrations(settings)

    tray = Tray(link, bridge, settings)
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
