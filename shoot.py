#!/usr/bin/env python3
"""shoot.py — mengambil 4 screenshot game "Pasar Pagi" sesuai shots.json.

Menyalakan server statis SENDIRI (node serve.ts) di port khusus entri ini
(default 18097, bisa diubah via SHOOT_PORT), membuka tiap shot di Chromium
Playwright (viewport 1280x720), menunggu window.__shotReady, lalu menyimpan
JPEG kualitas 85 ke screenshots/.

Gagal (exit 1) bila ada pageerror, atau respons HTTP >= 400 selain favicon.
Jalankan dari root repo:  python3 shoot.py
"""

import json
import os
import subprocess
import sys
import time
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
SHOTS_JSON = os.path.join(HERE, "shots.json")
SHOTS_DIR = os.path.join(HERE, "screenshots")
CHROME = os.path.expanduser("~/.cache/ms-playwright/chromium-1148/chrome-linux/chrome")
# Port khusus entri ini (bukan 8080): builder akun lain bisa memakai 8080 di
# saat yang sama, dan server mereka akan menyajikan game YANG SALAH.
PORT = int(os.environ.get("SHOOT_PORT", "18097"))
BASE = os.environ.get("SHOOT_BASE_URL", f"http://localhost:{PORT}")
VIEWPORT = {"width": 1280, "height": 720}


def server_up():
    try:
        with urllib.request.urlopen(BASE + "/", timeout=2) as resp:
            return resp.status == 200
    except Exception:
        return False


def served_page_is_mine():
    """Pastikan yang disajikan benar game Pasar Pagi, bukan game akun lain."""
    try:
        with urllib.request.urlopen(BASE + "/", timeout=2) as resp:
            return "Pasar Pagi" in resp.read().decode("utf-8", "replace")
    except Exception:
        return False


def main():
    with open(SHOTS_JSON, encoding="utf-8") as fh:
        shots = json.load(fh)
    os.makedirs(SHOTS_DIR, exist_ok=True)

    # Selalu jalankan server SENDIRI di port khusus entri ini, dan verifikasi
    # halaman yang disajikan benar game ini. Jangan pernah memakai server
    # yang sudah berjalan: bisa jadi milik builder akun lain.
    server = subprocess.Popen(
        ["node", "serve.ts", "--port", str(PORT)],
        cwd=HERE,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    try:
        for _ in range(50):
            if server_up():
                break
            time.sleep(0.2)
        else:
            print("server tidak mau menyala di port", PORT, file=sys.stderr)
            server.terminate()
            return 1
        if not served_page_is_mine():
            print("ERROR: server di port", PORT, "tidak menyajikan Pasar Pagi",
                  file=sys.stderr)
            server.terminate()
            return 1
    except Exception:
        server.terminate()
        raise

    errors = []
    try:
        from playwright.sync_api import sync_playwright

        with sync_playwright() as pw:
            browser = pw.chromium.launch(executable_path=CHROME, args=["--no-sandbox"])
            page = browser.new_page(viewport=VIEWPORT)
            page.on("pageerror", lambda exc: errors.append(f"pageerror: {exc}"))
            page.on("response", lambda resp: (
                errors.append(f"HTTP {resp.status} {resp.url}")
                if resp.status >= 400 and "favicon" not in resp.url
                else None
            ))
            for shot in shots:
                url = BASE + "/" + shot["query"]
                page.goto(url, wait_until="load")
                ready = False
                for attempt in range(2):
                    try:
                        page.wait_for_function("window.__shotReady === true", timeout=15000)
                        ready = True
                        break
                    except Exception:
                        page.reload(wait_until="load")
                if not ready:
                    errors.append(f"{shot['name']}: __shotReady tidak muncul")
                    continue
                page.wait_for_timeout(300)
                out = os.path.join(SHOTS_DIR, shot["name"])
                page.screenshot(path=out, type="jpeg", quality=85)
                size = os.path.getsize(out)
                print(f"{shot['name']}: {size} byte")
                if size > 262144:
                    errors.append(f"{shot['name']}: {size} byte, di atas 256 KiB")
            browser.close()
    finally:
        if server is not None:
            server.terminate()

    if errors:
        for err in errors:
            print("ERROR:", err, file=sys.stderr)
        return 1
    print(f"selesai: {len(shots)} screenshot di {SHOTS_DIR}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
