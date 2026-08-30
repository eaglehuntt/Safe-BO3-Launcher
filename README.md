# Safe BO3 Launcher

A tiny Windows utility that launches the **T7 patch** before **Call of Duty: Black Ops 3**, so the patch is guaranteed to be active before the game process ever starts.

![Platform](https://img.shields.io/badge/platform-Windows-0078D6)
![Python](https://img.shields.io/badge/python-3.11-3776AB)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Why this exists

Launch order matters. If Black Ops 3 starts before the T7 patch is running, you're playing unpatched — which is exactly the window bad actors rely on. This launcher removes the guesswork:

1. Launches the T7 patch executable.
2. Polls running processes until the patch is **confirmed** running (not just "we called it").
3. Only then launches Black Ops 3.

If the patch doesn't come up within 30 seconds, BO3 is never launched and you're told why.

## Features

- Simple two-field UI — point it at your T7 patch `.exe` and your BO3 `.exe` once.
- Paths are saved locally next to the app, so you only set them up once.
- Real process-confirmation (via `psutil`) between launching the patch and launching the game — no blind delays or guessing.
- Background launch thread — the UI never freezes while waiting.
- Clear status messages at every step, including failure/timeout cases.
- Ships as a single portable `.exe` — no Python install required for end users.

## Getting started

### Option 1 — just run the exe

Grab the latest build from the [Releases](../../releases) page, run `BO3_Launcher.exe`, and set your two paths on first launch.

### Option 2 — run from source

```bash
git clone https://github.com/eaglehuntt/Safe-BO3-Launcher.git
cd Safe-BO3-Launcher
python -m pip install -r requirements.txt
python bo3_launcher.py
```

Requires Python 3.9+ on Windows.

## Building your own exe

```bash
python -m pip install -r requirements.txt
python -m PyInstaller --onefile --windowed --name "BO3_Launcher" bo3_launcher.py
```

The compiled binary lands in `dist/BO3_Launcher.exe`.

## Usage

1. Open the launcher.
2. Click **Browse...** next to *T7 Patch executable* and select your patch `.exe`.
3. Click **Browse...** next to *Black Ops 3 executable* and select `BlackOps3.exe`.
4. Click **Launch T7 Patch -> BO3**.

The launcher will:

- Start the T7 patch.
- Watch for its process to appear (checked every 0.5s, up to 30s).
- Launch Black Ops 3 automatically once the patch is confirmed running.

Your paths are remembered for next time — no need to re-browse on every launch.

## Configuration

Paths are stored in `bo3_launcher_config.json`, created next to the exe on first save. This file is machine-specific and intentionally excluded from version control.

## Project structure

```
Safe-BO3-Launcher/
├── bo3_launcher.py          # Application source
├── requirements.txt         # Runtime + build dependencies
├── BO3_Launcher.spec        # PyInstaller build spec
└── README.md
```

## Disclaimer

This tool is a personal launch-order convenience utility. It does not modify game files, inject into processes, or interact with anti-cheat systems — it only starts two executables you point it at, in a fixed order. Use at your own discretion and in accordance with the terms of service of the software you're launching.

## License

MIT
