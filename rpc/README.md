# SweetEscape RPC

A small tray app that puts the song you're playing on SweetEscape into your Discord status.

Browsers aren't allowed to talk to Discord, so the website sends the song to this app over a
local WebSocket and the app passes it on to the Discord client running on the same PC.

The whole program is [`sweetescape_rpc.pyw`](sweetescape_rpc.pyw), about 700 lines of Python.
If you're deciding whether to trust it, that file is the thing to read. This page tells you
where to look.

## Install

**Windows:** download `SweetEscape-RPC.exe` from the
[latest release](https://github.com/fish-aimf/sweetescape-music-player/releases/latest) and run it.
It shows up in the system tray. There is no installer: the exe is the whole app, so put it
wherever you like first (Documents, a Programs folder, etc.).

The exe is not code-signed, so Windows SmartScreen will say "Windows protected your PC" the first
time. Click *More info*, then *Run anyway*. Some antivirus programs also flag PyInstaller apps
in general. If you'd rather not click through that, run it from source instead.

**From source (any OS with Python 3.11+):**

```
pip install --require-hashes -r requirements.txt
pythonw sweetescape_rpc.pyw
```

On macOS and Linux use `python3`. The tray icon and Discord status work there too. The
`sweetescape-rpc://` link and *Start with Windows* are Windows-only.

## What it touches

| | |
|---|---|
| Network | Listens on `localhost:9112` only. Nothing outside your PC can reach it. |
| Internet | None. It makes no web requests, has no telemetry, and never updates itself. |
| Discord | Talks to the Discord app through Discord's local IPC pipe, the same way games do. |
| Files | `%LOCALAPPDATA%\SweetEscape RPC\rpc.log` (connection events and errors, no song titles, capped at 400 KB) and `settings.json` there. |
| Registry | `HKCU\Software\Classes\sweetescape-rpc` (the browser link) and, only if you tick *Start with Windows*, one value under `HKCU\...\CurrentVersion\Run`. Both are per-user; it never asks for admin. |

## Who can talk to it

Only pages served from `https://sweetescape.vercel.app`. Every browser sends an `Origin` header
with a WebSocket connection, and a page cannot fake it. The app refuses any other origin with
HTTP 403 before reading a single message. So a random site you have open can't connect to it
and change your status. See `ORIGINS` and the `origins=` argument passed to `serve()`.

Running with `--dev` also allows `http://localhost:4173`, the local dev server.

What it does *not* protect against: other programs already running on your PC. They can send
any `Origin` they like. But a program like that could just talk to Discord directly, so the
app adds nothing it couldn't already do.

## What a message can do

A connected page can set your Discord status and nothing else. `build_activity()` is the only
place a message turns into something Discord sees, and it is strict about it:

- Title and artist are cut to Discord's 128-character limit, with control characters removed.
- The YouTube button and link are rebuilt from an 11-character video id. A page cannot put an
  arbitrary link in your profile. The only other button is a fixed link to the SweetEscape site.
- The cover image must be an `https://` URL (Discord fetches it, not your PC). Anything else
  falls back to the video thumbnail.
- Times must be real numbers between 0 and 24 hours.
- Messages over 4 KB close the connection.

Untick *Show SweetEscape on my status* in the tray menu and the SweetEscape icon and the
*Open SweetEscape* button are left off (`without_branding()`). The heading above your status
still reads "Listening to SweetEscape", because that is the name of the Discord application the
app reports through.

Updates are coalesced to at most one every 4 seconds, which keeps inside Discord's rate limit.
If two tabs are open, the last one to send a song owns the status, and closing the other tab
doesn't clear it.

## The "Open app?" link

So that the website can start the app for you, it registers a `sweetescape-rpc://` link handler
when it starts. The registry command is just the path to the app plus `--from-browser`:

```
"C:\...\SweetEscape-RPC.exe" --from-browser
```

There's no `%1` in that command, so whatever comes after `sweetescape-rpc://` in a link is never
passed to the program. A link can start the app and that's all. If the app is already running, the
second copy sees the port is taken and exits.

The browser asks before following the link, and offers to always allow it for SweetEscape. You
can turn the link off from the tray menu (*Let the website open this app*).

Once the app has connected to the site at least once, the site starts it by itself when it isn't
running: on your first click or keypress on the page, because browsers only follow these links
during one. Turn that off with *Open the app automatically* in the site's Discord dialog.

## Checking a download

Each release is built by [`.github/workflows/rpc-release.yml`](../.github/workflows/rpc-release.yml)
on GitHub's own Windows runners, from the tagged commit, with every dependency pinned by hash in
[`requirements-build.txt`](requirements-build.txt). Nothing is built on anyone's personal machine.

1. Compare the hash with the one on the release page:

   ```
   Get-FileHash .\SweetEscape-RPC.exe -Algorithm SHA256
   ```

2. Check GitHub's signed build record. It proves the file came out of that workflow and names the
   exact commit:

   ```
   gh attestation verify .\SweetEscape-RPC.exe --repo fish-aimf/sweetescape-music-player
   ```

   It's also listed under the repository's *Attestations* tab.

3. Or skip the exe and run the source file, or build it yourself with the same commands the
   workflow runs.

## Reading the code

In order, top to bottom:

- **Settings and logging:** `data_dir`, `setup_logging`, `Settings`.
- **Input checking:** `clean_text`, `https_url`, `seconds`, `video_id`, `build_activity`.
  This is the part to read closely.
- **Discord:** `DiscordLink`. One thread owns the Discord connection, reconnects every 10 s if
  Discord isn't running, and pushes the latest wanted status.
- **WebSocket:** `Bridge`. Accepts tabs, replies with status messages, hands songs to `DiscordLink`.
- **Windows registry:** `register_protocol`, `set_start_with_windows`, `remove_everything`.
  Only these functions write to the registry. `forget_this_pc` deletes the app's own folder.
- **Tray:** `Tray` and `main`.

Third-party code: [pypresence](https://github.com/qwertyquerty/pypresence) (Discord IPC),
[websockets](https://github.com/python-websockets/websockets), [pystray](https://github.com/moses-palmer/pystray)
and [Pillow](https://github.com/python-pillow/Pillow) (tray icon).

## Removing it

Tray menu → *Remove from this PC and quit*. Or run `SweetEscape-RPC.exe --uninstall`. Either
deletes the registry entries above and the `%LOCALAPPDATA%\SweetEscape RPC` folder, then opens
Explorer with the exe selected. The app doesn't delete itself; delete the exe and you're done.
Running it again later sets it up from scratch.

## Message format

The page sends JSON:

```json
{"song": "Title", "artist": "Artist", "videoId": "dQw4w9WgXcQ",
 "image": "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
 "position": 42.5, "duration": 213, "rate": 1, "paused": false}
```

Only `song` is required. `{"action": "clear"}` removes the status. The older
`{"song", "artist", "url"}` shape from version 1 still works.

The app replies with `{"status": ...}`: `app_ready` (includes `version`), `discord_ready`,
`success`, `ignored`, or `error` with `"stage": "discord"` when Discord isn't running.
`discord_ready` is sent again by itself when Discord comes back.

## Releasing

1. Bump `VERSION` in `sweetescape_rpc.pyw`, and `DISCORD_APP_VERSION` in `public/script.js` so
   the site tells older copies to update.
2. Commit, then `git tag rpc-vX.Y.Z && git push origin rpc-vX.Y.Z` with the new version. The workflow refuses to run if the
   tag and `VERSION` disagree.

To refresh the dependency pins, pin the new versions and rerun:

```
printf "pypresence==4.6.2\nwebsockets==17.2\npystray==0.19.5\npillow==12.3.0\n" > app.in
uv pip compile app.in --universal --python-version 3.11 --generate-hashes --no-header --no-annotate -o requirements.txt
printf -- "-r app.in\npyinstaller==6.22.3\n" > build.in
uv pip compile build.in --generate-hashes --python-platform windows --python-version 3.12 --no-header --no-annotate -o requirements-build.txt
```
