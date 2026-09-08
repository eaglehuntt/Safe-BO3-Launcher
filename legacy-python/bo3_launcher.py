"""
BO3 Secure Launcher
--------------------
Launches the T7 patch first, waits for it to actually be running (confirmed
via process detection, not just "we called subprocess.Popen"), and only then
launches Black Ops 3 itself. This ordering is a QoL/anti-cheat-safety measure
so the patch is guaranteed to be active before the game process starts.

Paths are configured once (stored in a small JSON config next to the exe/script)
and can be changed later from the UI.
"""

import json
import os
import subprocess
import sys
import threading
import time
import tkinter as tk
from tkinter import filedialog, messagebox, ttk

import psutil

CONFIG_FILENAME = "bo3_launcher_config.json"
T7_PROCESS_TIMEOUT = 30  # seconds to wait for the T7 patch process to appear
T7_POLL_INTERVAL = 0.5   # seconds between process checks


def get_config_path() -> str:
    """Store config next to the compiled exe (or the script when run from source)."""
    if getattr(sys, "frozen", False):
        base_dir = os.path.dirname(sys.executable)
    else:
        base_dir = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(base_dir, CONFIG_FILENAME)


def load_config() -> dict:
    path = get_config_path()
    if os.path.exists(path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, OSError):
            return {}
    return {}


def save_config(config: dict) -> None:
    path = get_config_path()
    with open(path, "w", encoding="utf-8") as f:
        json.dump(config, f, indent=2)


def is_process_running(exe_path: str) -> bool:
    """Check whether a process matching exe_path's filename is currently running."""
    target_name = os.path.basename(exe_path).lower()
    for proc in psutil.process_iter(["name"]):
        try:
            if proc.info["name"] and proc.info["name"].lower() == target_name:
                return True
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue
    return False


class BO3LauncherApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("BO3 Secure Launcher")
        self.geometry("560x360")
        self.resizable(False, False)

        self.config_data = load_config()
        self.t7_path_var = tk.StringVar(value=self.config_data.get("t7_patch_path", ""))
        self.bo3_path_var = tk.StringVar(value=self.config_data.get("bo3_game_path", ""))
        self.status_var = tk.StringVar(value="Ready.")

        self._build_ui()
        self._launch_thread = None

    def _build_ui(self):
        pad = {"padx": 12, "pady": 6}

        frame = ttk.Frame(self)
        frame.pack(fill="both", expand=True, **pad)

        # T7 Patch path row
        ttk.Label(frame, text="T7 Patch executable:").grid(row=0, column=0, sticky="w", pady=(0, 4))
        t7_entry = ttk.Entry(frame, textvariable=self.t7_path_var, width=55)
        t7_entry.grid(row=1, column=0, sticky="we")
        ttk.Button(frame, text="Browse...", command=self._browse_t7).grid(row=1, column=1, padx=(6, 0))

        # BO3 path row
        ttk.Label(frame, text="Black Ops 3 executable:").grid(row=2, column=0, sticky="w", pady=(16, 4))
        bo3_entry = ttk.Entry(frame, textvariable=self.bo3_path_var, width=55)
        bo3_entry.grid(row=3, column=0, sticky="we")
        ttk.Button(frame, text="Browse...", command=self._browse_bo3).grid(row=3, column=1, padx=(6, 0))

        ttk.Button(frame, text="Save Paths", command=self._save_paths).grid(
            row=4, column=0, sticky="w", pady=(16, 0)
        )

        ttk.Separator(frame, orient="horizontal").grid(
            row=5, column=0, columnspan=2, sticky="we", pady=16
        )

        self.launch_button = ttk.Button(
            frame, text="Launch T7 Patch -> BO3", command=self._on_launch_clicked
        )
        self.launch_button.grid(row=6, column=0, columnspan=2, sticky="we")

        self.progress = ttk.Progressbar(frame, mode="indeterminate")
        self.progress.grid(row=7, column=0, columnspan=2, sticky="we", pady=(12, 0))

        status_label = ttk.Label(frame, textvariable=self.status_var, wraplength=520)
        status_label.grid(row=8, column=0, columnspan=2, sticky="w", pady=(10, 0))

        frame.columnconfigure(0, weight=1)

    def _browse_t7(self):
        path = filedialog.askopenfilename(
            title="Select T7 Patch executable",
            filetypes=[("Executable", "*.exe"), ("All files", "*.*")],
        )
        if path:
            self.t7_path_var.set(path)

    def _browse_bo3(self):
        path = filedialog.askopenfilename(
            title="Select Black Ops 3 executable",
            filetypes=[("Executable", "*.exe"), ("All files", "*.*")],
        )
        if path:
            self.bo3_path_var.set(path)

    def _save_paths(self):
        self.config_data["t7_patch_path"] = self.t7_path_var.get().strip()
        self.config_data["bo3_game_path"] = self.bo3_path_var.get().strip()
        save_config(self.config_data)
        self._set_status("Paths saved.")

    def _set_status(self, text: str):
        self.status_var.set(text)

    def _on_launch_clicked(self):
        if self._launch_thread and self._launch_thread.is_alive():
            return

        t7_path = self.t7_path_var.get().strip()
        bo3_path = self.bo3_path_var.get().strip()

        if not t7_path or not os.path.isfile(t7_path):
            messagebox.showerror("Missing path", "Please select a valid T7 patch executable.")
            return
        if not bo3_path or not os.path.isfile(bo3_path):
            messagebox.showerror("Missing path", "Please select a valid Black Ops 3 executable.")
            return

        # Persist the paths automatically so the user doesn't have to remember to save.
        self._save_paths()

        self.launch_button.config(state="disabled")
        self.progress.start(12)
        self._launch_thread = threading.Thread(
            target=self._launch_sequence, args=(t7_path, bo3_path), daemon=True
        )
        self._launch_thread.start()

    def _launch_sequence(self, t7_path: str, bo3_path: str):
        try:
            self._update_status_threadsafe(f"Launching T7 patch: {os.path.basename(t7_path)} ...")
            subprocess.Popen([t7_path], cwd=os.path.dirname(t7_path))

            self._update_status_threadsafe("Waiting for T7 patch process to start...")
            confirmed = self._wait_for_process(t7_path, T7_PROCESS_TIMEOUT)

            if not confirmed:
                self._update_status_threadsafe(
                    "T7 patch process was not detected in time. Aborting BO3 launch."
                )
                self._finish_threadsafe()
                return

            self._update_status_threadsafe("T7 patch confirmed running. Launching Black Ops 3...")
            subprocess.Popen([bo3_path], cwd=os.path.dirname(bo3_path))

            self._update_status_threadsafe("Black Ops 3 launched. You're good to go.")
        except OSError as exc:
            self._update_status_threadsafe(f"Launch failed: {exc}")
        finally:
            self._finish_threadsafe()

    def _wait_for_process(self, exe_path: str, timeout: float) -> bool:
        deadline = time.time() + timeout
        while time.time() < deadline:
            if is_process_running(exe_path):
                return True
            time.sleep(T7_POLL_INTERVAL)
        return is_process_running(exe_path)

    def _update_status_threadsafe(self, text: str):
        self.after(0, lambda: self._set_status(text))

    def _finish_threadsafe(self):
        def _finish():
            self.progress.stop()
            self.launch_button.config(state="normal")

        self.after(0, _finish)


if __name__ == "__main__":
    app = BO3LauncherApp()
    app.mainloop()
