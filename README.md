# Safe BO3 Launcher

A desktop app that launches the **T7 patch** before **Call of Duty: Black Ops 3**, and confirms it's actually running before the game process ever starts.

![Platform](https://img.shields.io/badge/platform-Windows-0078D6)
![Electron](https://img.shields.io/badge/electron-33-47848F)
![TypeScript](https://img.shields.io/badge/typescript-5-3178C6)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Why this exists

Launch order matters. If Black Ops 3 starts before the T7 patch is running, you're playing unpatched — exactly the window bad actors rely on. This launcher removes the guesswork:

1. Launches the T7 patch executable (or, if it's already running, skips straight to the next step — it will never spawn a duplicate copy).
2. Polls running processes until the patch is **confirmed** running (not just "we called it").
3. Only then launches Black Ops 3.

If the patch doesn't come up within 30 seconds, BO3 is never launched and you're told why.

## Features

- Electron + React + TypeScript desktop app with an animated, gradient-driven UI.
- Auto-detects your Black Ops 3 install via Steam's registry entry and library folders — falls back to manual browse if it can't find it.
- Guards against duplicate T7 patch instances: if it's already running, the launcher confirms that instead of spawning a second copy.
- Live launch progress with a step-by-step status indicator (T7 Patch → Confirm → Black Ops 3).
- Built-in Setup tab with install instructions and a direct link to the [T7 Patch repo](https://github.com/Scroptss/T7Patch).
- Built-in Safety Guide summarizing community guidance on playing safely (lobby passwords, hiding your Steam profile, etc.), with a link to the source thread.
- Paths are saved locally next to the app — set them up once.
- Checks the [T7Patch repo](https://github.com/Scroptss/T7Patch)'s release feed on launch and flags it if a newer build is out.
- Checks its own GitHub releases on launch too, so a new version of the launcher itself is easy to notice.
- Fixed-size window (no accidental resizing/maximizing).

## Getting started

### Option 1 — run from source

```bash
git clone https://github.com/eaglehuntt/Safe-BO3-Launcher.git
cd Safe-BO3-Launcher
npm install
npm run dev
```

Requires Node.js 20+ on Windows.

### Option 2 — build the installer

```bash
npm install
npm run dist:win
```

Produces `release/Safe BO3 Launcher Setup <version>.exe` (NSIS installer, lets you pick the install location, adds a Start Menu shortcut).

> **Note:** building the installer on Windows requires **Developer Mode** enabled (Settings → Privacy & security → For developers). Without it, `electron-builder` can't extract one of its helper toolchains (it contains symlinks, which Windows blocks for non-admin accounts unless Developer Mode is on).

## Usage

1. Open the launcher — if no paths are set yet, it opens on the Setup tab.
2. Browse to your T7 patch `.exe`. It doesn't matter where it's installed.
3. Browse to `BlackOps3.exe`, or click **Auto-detect via Steam** to find it automatically.
4. Save, then head to the Launch tab.
5. Click **Launch T7 Patch → BO3**.

The launcher will:

- Start the T7 patch (or detect it's already running and skip duplicate-launching it).
- Watch for its process to appear (checked every 0.5s, up to 30s).
- Launch Black Ops 3 automatically once the patch is confirmed running.

## Configuration

Paths are stored in a `settings.json` file in the app's user-data directory. This is machine-specific and intentionally excluded from version control.

## Shipping an update

Bump `version` in `package.json`, build the installer (`npm run dist:win`), then publish a [GitHub release](https://github.com/eaglehuntt/Safe-BO3-Launcher/releases/new) tagged `vX.Y.Z` with that installer attached. Installed copies check the release feed on launch and show an "Update available" pill once the tag is newer than their running version — clicking it opens the release page to download.

## Project structure

```
Safe-BO3-Launcher/
├── src/
│   ├── main/           # Electron main process: window, IPC, launch sequence, Steam detection
│   ├── preload/         # contextBridge API exposed to the renderer
│   ├── renderer/         # React UI (components, styles)
│   └── shared/          # Types shared between main/preload/renderer
├── electron.vite.config.ts
├── package.json
└── legacy-python/       # Original Python/Tkinter version, kept for reference
```

## Disclaimer

This tool is a personal launch-order convenience utility. It does not modify game files, inject into processes, or interact with anti-cheat systems — it only starts the executables you point it at, in a fixed order. Use at your own discretion and in accordance with the terms of service of the software you're launching.

## License

MIT
