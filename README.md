# GameSafe Launcher

A desktop app that launches older online games' community safety patches and confirms they're actually running before the game process ever starts.

![Platform](https://img.shields.io/badge/platform-Windows-0078D6)
![Electron](https://img.shields.io/badge/electron-33-47848F)
![TypeScript](https://img.shields.io/badge/typescript-5-3178C6)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Why this exists

Launch order matters. If a game starts before its community patch is running, you're playing unprotected — exactly the window bad actors rely on. GameSafe Launcher removes the guesswork: for any game that needs a safety tool, it launches the tool, polls until it's **confirmed** running (not just "we called it"), and only then launches the game. If the tool doesn't come up in time, the game is never launched and you're told why.

Currently supports **Black Ops III** (via [T7 Patch](https://github.com/Scroptss/T7Patch)). Built to add more titles over time — each game plugs in its own safety tool (or none at all) without touching the core launch logic.

## Features

- Electron + React + TypeScript desktop app with an animated, gradient-driven UI.
- Two views, one click apart — click the cover art (or the logo mark in the top-left corner) to switch between them:
  - **Play** — cover art, a live step-by-step launch stepper (patch → confirm → game), and the Launch button.
  - **Info** — tabbed Home / Setup / Safety Guide panel alongside the cover art and a persistent Play button. Your last-used view is remembered between launches.
- **Home tab**: recent releases for both the launcher itself and the game's safety tool, pulled live from GitHub and cached for a few minutes so repeat checks don't hammer the API.
- **Setup tab**: point the launcher at the game and safety-tool executables (with Steam auto-detect), plus a two-step "reset to factory defaults" control that wipes saved settings and restarts onboarding.
- **Safety Guide tab**: built-in summary of community guidance on playing safely, for games that have one.
- A step-by-step onboarding wizard for first-time setup: get the tool, locate it, locate the game, confirm.
- Auto-detects installs via Steam (reads the registry + library folders + the game's app manifest, rather than guessing folder names) — falls back to manual browse if it can't find it.
- Guards against duplicate safety-tool instances: if it's already running, the launcher confirms that instead of spawning a second copy, and shows it directly on the launch stepper.
- Checks each game's safety-tool repo for a newer release whenever you navigate, using a timestamp of when you last pointed the launcher at that tool (not the file's mtime, which extraction/copying resets and made this check unreliable in earlier versions).
- Checks its own GitHub releases too, so a new version of the launcher itself is easy to notice.
- Resizable window (1080×640 minimum, so the layout always has room to breathe; capped at 900px tall so the info panel never ends up floating in a sea of dead space).

## Getting started

### Option 1 — download the installer

Grab the latest `GameSafe Launcher Setup <version>.exe` from the [Releases page](https://github.com/eaglehuntt/Safe-BO3-Launcher/releases) and run it. It's an NSIS installer — you'll get to pick the install location and it adds a Start Menu shortcut.

> The installer isn't code-signed, so Windows SmartScreen may warn you the first time you run it. Click **More info → Run anyway**.

### Option 2 — run from source

```bash
git clone https://github.com/eaglehuntt/Safe-BO3-Launcher.git
cd Safe-BO3-Launcher
npm install
npm run dev
```

Requires Node.js 20+ on Windows.

### Option 3 — build the installer yourself

```bash
npm install
npm run dist:win
```

Produces `release/GameSafe Launcher Setup <version>.exe`.

> **Note:** building the installer on Windows requires **Developer Mode** enabled (Settings → Privacy & security → For developers). Without it, `electron-builder` can't extract one of its helper toolchains (it contains symlinks, which Windows blocks for non-admin accounts unless Developer Mode is on).

## Usage

1. First launch walks you through onboarding: get the safety tool, point the launcher at it, point it at the game (or let auto-detect via Steam find it).
2. Once set up, you land on the **Info** view. Click the cover art any time to jump to **Play** and hit **Launch Safely** — or use the **Play** button next to the cover art in the Info view.
3. Use the **Home** tab to check for updates to the launcher or the safety tool, **Setup** to change paths or reset everything, and **Safety Guide** for community best practices.

## Adding a new game

Add an entry to `GAME_CATALOG` in `src/shared/gameDefinitions.ts` — a name, Steam app ID, exe filename, and (if it needs one) a `safetyTool` with a repo URL and setup instructions. Onboarding, the launch sequence, the Home feed, and update checks all pick it up automatically; no other code changes needed unless the game needs a genuinely different launch flow than "tool, then game."

## Configuration

Each game's paths are stored in a `settings.json` file in the app's user-data directory, keyed by game. This is machine-specific and intentionally excluded from version control. Setup's "Reset to factory defaults" button wipes this file and returns you to onboarding.

## Shipping an update

Bump `version` in `package.json`, build the installer (`npm run dist:win`), then publish a [GitHub release](https://github.com/eaglehuntt/Safe-BO3-Launcher/releases/new) tagged `vX.Y.Z` with that installer attached. Installed copies check the release feed on launch (and periodically while running) and show an "Update available" pill once the tag is newer than their running version — clicking it opens the release page to download.

## Project structure

```
Safe-BO3-Launcher/
├── src/
│   ├── main/            # Electron main process: window, IPC, launch sequence, Steam detection
│   ├── preload/          # contextBridge API exposed to the renderer
│   ├── renderer/         # React UI (PlayView, InfoView + its Home/Setup/Safety tabs, shared components)
│   └── shared/           # Types + game catalog, shared between main/preload/renderer
├── build/                # App icon (source SVG + generated .ico/.png)
├── electron.vite.config.ts
├── package.json
└── legacy-python/        # Original single-game Python/Tkinter version, kept for reference
```

## A note on cover art

Game tiles fetch cover art live from Steam's own public CDN (`cdn.akamai.steamstatic.com`) by app ID — the same images your browser loads on a store page. Nothing is downloaded or bundled into this repo; it's a live hotlink, the same technique other third-party game-library tools use.

## Disclaimer

This tool is a personal launch-order convenience utility. It does not modify game files, inject into processes, or interact with anti-cheat systems — it only starts the executables you point it at, in a fixed order. Use at your own discretion and in accordance with the terms of service of the software you're launching.

## License

MIT
