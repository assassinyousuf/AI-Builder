import os, time, subprocess
from playwright.sync_api import sync_playwright

CHROME_PATH = r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
OUTPUT_DIR = r"d:\daffodil\video\public\assets\recordings"
TEMP_DIR = r"d:\daffodil\video\temp_rec"

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=CHROME_PATH, headless=True)
    ctx = browser.new_context(viewport={"width": 1920, "height": 1080}, record_video_dir=TEMP_DIR, record_video_size={"width": 1920, "height": 1080})
    page = ctx.new_page()
    page.goto("http://localhost:4200/auth/sign-in")
    page.wait_for_selector('input[name="email"]')
    time.sleep(1.0)
    page.fill('input[name="email"]', "analyst@fraudshield.ai")
    time.sleep(0.5)
    page.fill('input[name="password"]', "FraudShield2026!")
    time.sleep(0.8)
    page.click('button[type="submit"]')
    time.sleep(2.0)
    vpath = page.video.path()
    ctx.close()
    browser.close()
    target = os.path.join(OUTPUT_DIR, "rec_module0_signin.mp4")
    cmd = ["ffmpeg", "-y", "-i", vpath, "-t", "6.0", "-vf", "scale=1920:1080:flags=lanczos,fps=30", "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p", target]
    subprocess.run(cmd, check=True)
    print("Exported", target)
