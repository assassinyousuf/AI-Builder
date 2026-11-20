import os, time
from playwright.sync_api import sync_playwright

CHROME_PATH = r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
REC_DIR = r"d:\daffodil\video\temp_rec"
os.makedirs(REC_DIR, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=CHROME_PATH, headless=True)
    context = browser.new_context(
        viewport={"width": 1920, "height": 1080},
        record_video_dir=REC_DIR,
        record_video_size={"width": 1920, "height": 1080}
    )
    page = context.new_page()
    
    print("Navigating to Sign-In...")
    page.goto("http://localhost:4200/auth/sign-in")
    page.wait_for_selector('input[name="email"]')
    
    # Fill login form
    page.fill('input[name="email"]', "analyst@fraudshield.ai")
    page.fill('input[name="password"]', "FraudShield2026!")
    time.sleep(0.5)
    page.click('button[type="submit"]')
    
    print("Waiting for navigation to /app...")
    page.wait_for_url("**/app**", timeout=10000)
    print("Logged in! Current URL:", page.url)
    time.sleep(1)
    
    # Navigate to Simulator
    print("Navigating to /app/simulator...")
    page.goto("http://localhost:4200/app/simulator")
    page.wait_for_load_state("networkidle")
    time.sleep(2)
    
    video_path = page.video.path()
    context.close()
    browser.close()
    print("Finished test. Video saved at:", video_path)
