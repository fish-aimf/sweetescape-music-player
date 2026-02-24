import asyncio
import websockets
import json
from pypresence import Presence
from pypresence.types import ActivityType
import threading
import time
import re
import sys
import pystray
from PIL import Image, ImageDraw
import subprocess
import os
from datetime import datetime
import atexit
import signal

CLIENT_ID = "1428031900877983825"

rpc = None
connected_to_discord = False
discord_lock = threading.Lock()
server_stats = {
    "connected_clients": 0,
    "total_updates": 0,
    "uptime_start": None,
    "last_song": None,
    "last_artist": None,
    "last_update": None,
    "errors": 0,
    "clears": 0
}
stats_lock = threading.Lock()

BASE_RPC_DATA = {
    "activity_type": ActivityType.LISTENING,
    "small_image": "favicon",
    "small_text": "sweetescape.vercel.app",
}

last_log_time = 0
LOG_INTERVAL = 1


def cleanup_discord():
    global rpc, connected_to_discord
    try:
        if rpc is not None:
            print("\nCleaning up Discord RPC...")
            try:
                rpc.clear()
            except Exception:
                pass
            try:
                rpc.close()
            except Exception:
                pass
            rpc = None
            with discord_lock:
                connected_to_discord = False
            print("Discord RPC cleaned up successfully")
    except Exception as e:
        print(f"Cleanup error: {e}")


atexit.register(cleanup_discord)


def signal_handler(signum, frame):
    print("\nReceived shutdown signal...")
    cleanup_discord()
    os._exit(0)


signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)


def init_discord():
    global rpc, connected_to_discord

    with discord_lock:
        connected_to_discord = False

    if rpc is not None:
        try:
            rpc.close()
        except Exception:
            pass
        rpc = None

    try:
        rpc = Presence(CLIENT_ID)
        rpc.connect()
        with discord_lock:
            connected_to_discord = True
        print("Discord RPC connected")
    except Exception as e:
        rpc = None
        print(f"Discord connection failed: {e}")
        with stats_lock:
            server_stats["errors"] += 1
        return False


def extract_youtube_id(url):
    if not url:
        return None
    patterns = [
        r'(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)',
        r'youtube\.com\/embed\/([^&\n?#]+)',
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None


def update_discord_rpc(song, artist, url):
    global last_log_time, rpc, connected_to_discord

    if rpc is None or not connected_to_discord:
        return False

    try:
        video_id = extract_youtube_id(url)
        rpc_data = BASE_RPC_DATA.copy()
        rpc_data["details"] = f"{song}"
        rpc_data["buttons"] = [
            {"label": "Listen on YouTube", "url": url},
            {"label": "Open SweetEscape", "url": "https://sweetescape.vercel.app"}
        ]
        if artist != "Unknown Artist":
            rpc_data["state"] = f"by {artist}"
        if video_id:
            rpc_data["large_image"] = f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg"
        else:
            rpc_data["large_image"] = "music_note"

        rpc.update(**rpc_data)

        with stats_lock:
            server_stats["total_updates"] += 1
            server_stats["last_song"] = song
            server_stats["last_artist"] = artist
            server_stats["last_update"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        current_time = time.time()
        if current_time - last_log_time >= LOG_INTERVAL:
            last_log_time = current_time
            timestamp = datetime.now().strftime("%H:%M:%S")
            print(f"[{timestamp}] {song[:40]} by {artist[:30]}")

        return True

    except Exception as e:
        print(f"Update failed: {e}")
        with discord_lock:
            connected_to_discord = False
        with stats_lock:
            server_stats["errors"] += 1
        return False


def clear_discord_rpc():
    global rpc, connected_to_discord
    if rpc is None:
        return True
    try:
        rpc.clear()
        with stats_lock:
            server_stats["clears"] += 1
            server_stats["last_song"] = None
            server_stats["last_artist"] = None
            server_stats["last_update"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] Discord presence cleared")
        return True
    except Exception as e:
        print(f"Clear failed: {e}")
        with discord_lock:
            connected_to_discord = False
        with stats_lock:
            server_stats["errors"] += 1
        return False


async def handle_client(websocket):
    global connected_to_discord

    with stats_lock:
        server_stats["connected_clients"] += 1
    print(f"Client connected (Total: {server_stats['connected_clients']})")

    try:
        await websocket.send(json.dumps({
            "status": "app_ready",
            "message": "Desktop app connected, linking to Discord..."
        }))

        if not connected_to_discord:
            discord_thread = threading.Thread(target=init_discord)
            discord_thread.start()
            discord_thread.join(timeout=10)

            if not connected_to_discord:
                await websocket.send(json.dumps({
                    "status": "error",
                    "stage": "discord",
                    "message": "Could not connect to Discord. Open Discord first, then click Retry."
                }))
                with stats_lock:
                    server_stats["connected_clients"] -= 1
                return

        await websocket.send(json.dumps({
            "status": "discord_ready",
            "message": "Discord API connected successfully"
        }))

        async for message in websocket:
            data = json.loads(message)

            if data.get('action') == 'clear' or data.get('enabled') == False:
                loop = asyncio.get_event_loop()
                success = await loop.run_in_executor(None, clear_discord_rpc)
                await websocket.send(json.dumps({
                    "status": "success" if success else "error",
                    "message": "Rich Presence cleared" if success else "Could not clear Discord presence",
                    "timestamp": datetime.now().isoformat()
                }))
                continue

            song   = data.get('song',   'Unknown')
            artist = data.get('artist', 'Unknown')
            url    = data.get('url',    '')

            loop = asyncio.get_event_loop()
            success = await loop.run_in_executor(None, update_discord_rpc, song, artist, url)

            if success:
                await websocket.send(json.dumps({
                    "status": "success",
                    "message": f"Rich Presence updated: {song} by {artist}",
                    "timestamp": datetime.now().isoformat()
                }))
            else:

                await websocket.send(json.dumps({
                    "status": "error",
                    "stage": "discord",
                    "message": "Lost connection to Discord. Click Retry to reconnect."
                }))

    except websockets.exceptions.ConnectionClosed:
        print(f"Client disconnected")
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, clear_discord_rpc)
    except Exception as e:
        print(f"Client error: {e}")
        with stats_lock:
            server_stats["errors"] += 1
    finally:

        with stats_lock:
            server_stats["connected_clients"] -= 1
        print(f"Client session ended (Remaining: {server_stats['connected_clients']})")


async def start_server():
    async with websockets.serve(
        handle_client,
        "localhost",
        9112,
        ping_interval=None,
        ping_timeout=None,
        compression=None,
        max_size=10_485_760,
        max_queue=32
    ):
        print("Discord RPC Server started on ws://localhost:9112")
        print("=" * 60)
        await asyncio.Future()


def create_icon():
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        icon_path = os.path.join(script_dir, 'sweetescapesystemtray.png')
        if os.path.exists(icon_path):
            return Image.open(icon_path).resize((64, 64))
        width = height = 64
        image = Image.new('RGB', (width, height), (30, 30, 30))
        dc = ImageDraw.Draw(image)
        dc.ellipse([16, 16, 48, 48], fill=(88, 101, 242))
        dc.ellipse([24, 32, 40, 48], fill=(255, 255, 255))
        return image
    except Exception:
        width = height = 64
        image = Image.new('RGB', (width, height), (30, 30, 30))
        dc = ImageDraw.Draw(image)
        dc.ellipse([16, 16, 48, 48], fill=(88, 101, 242))
        return image


def get_uptime():
    if not server_stats["uptime_start"]:
        return "0s"
    elapsed = time.time() - server_stats["uptime_start"]
    hours, remainder = divmod(int(elapsed), 3600)
    minutes, seconds = divmod(remainder, 60)
    if hours > 0:
        return f"{hours}h {minutes}m {seconds}s"
    elif minutes > 0:
        return f"{minutes}m {seconds}s"
    else:
        return f"{seconds}s"


def show_console(icon, item):
    with stats_lock:
        status     = "Connected" if connected_to_discord else "Disconnected"
        uptime     = get_uptime()
        last_song  = server_stats["last_song"]  or "None"
        last_artist= server_stats["last_artist"] or "None"
        last_update= server_stats["last_update"] or "Never"
        total_updates = server_stats["total_updates"]
        clears     = server_stats["clears"]
        errors     = server_stats["errors"]
        clients    = server_stats["connected_clients"]

    if sys.platform == 'win32':
        script = f'''
import time
print("=" * 70)
print("DISCORD RPC SERVER - LIVE STATUS")
print("=" * 70)
print("SERVER STATUS:")
print("  Server: Running on localhost:9112")
print("  Discord: {status}")
print("  Uptime: {uptime}")
print("STATISTICS:")
print("  Total Updates: {total_updates}")
print("  Total Clears: {clears}")
print("  Active Clients: {clients}")
print("  Errors: {errors}")
print("CURRENT TRACK:")
print("  Song: {last_song}")
print("  Artist: {last_artist}")
print("  Last Updated: {last_update}")
print("=" * 70)
input("\\nPress Enter to close...")
'''
        subprocess.Popen(['python', '-c', script], creationflags=subprocess.CREATE_NEW_CONSOLE)
    else:
        print("=" * 70)
        print(f"Discord: {status} | Uptime: {uptime} | Updates: {total_updates} | Errors: {errors}")
        print(f"Now: {last_song} by {last_artist} ({last_update})")
        print("=" * 70)


def quit_action(icon, item):
    print("\nShutting down...")
    cleanup_discord()
    icon.stop()
    os._exit(0)


def main():
    server_stats["uptime_start"] = time.time()
    print("SweetEscape Discord RPC Server")
    print("=" * 60)

    loop = asyncio.new_event_loop()

    def run_server():
        asyncio.set_event_loop(loop)
        loop.run_until_complete(start_server())

    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()
    time.sleep(1)

    icon = pystray.Icon(
        "discord_rpc",
        create_icon(),
        "Discord RPC Server",
        menu=pystray.Menu(
            pystray.MenuItem("Show Status", show_console),
            pystray.MenuItem("Quit", quit_action)
        )
    )
    icon.run()


if __name__ == "__main__":
    main()
