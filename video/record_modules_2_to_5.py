import os, time, subprocess
from playwright.sync_api import sync_playwright

CHROME_PATH = r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
OUTPUT_DIR = r"d:\daffodil\video\public\assets\recordings"
TEMP_DIR = r"d:\daffodil\video\temp_rec"
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(TEMP_DIR, exist_ok=True)

CURSOR_SCRIPT = """
(() => {
  if (document.getElementById('__custom_cursor__')) return;
  
  const style = document.createElement('style');
  style.innerHTML = `
    #__custom_cursor__ {
      position: fixed;
      top: 0;
      left: 0;
      width: 28px;
      height: 28px;
      pointer-events: none;
      z-index: 9999999;
      transform: translate(-3px, -3px);
      transition: transform 0.04s ease-out;
      filter: drop-shadow(0 2px 8px rgba(0,0,0,0.8));
    }
    @keyframes cursorClickPulse {
      0% { transform: scale(0.6); opacity: 1; border-width: 4px; }
      100% { transform: scale(2.2); opacity: 0; border-width: 1px; }
    }
    .cursor-ripple {
      position: fixed;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 3px solid #C084FC;
      background: rgba(192, 132, 252, 0.25);
      pointer-events: none;
      z-index: 9999998;
      animation: cursorClickPulse 0.45s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
    }
  `;
  document.head.appendChild(style);

  const cursor = document.createElement('div');
  cursor.id = '__custom_cursor__';
  cursor.innerHTML = `
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M4 2L22 13L13.5 15.5L9.5 24L4 2Z" fill="#9333EA" stroke="#FFFFFF" stroke-width="2.2" stroke-linejoin="round"/>
      <circle cx="8" cy="8" r="2" fill="#F472B6"/>
    </svg>
  `;
  document.body.appendChild(cursor);

  window.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });

  window.addEventListener('mousedown', (e) => {
    const rip = document.createElement('div');
    rip.className = 'cursor-ripple';
    rip.style.left = (e.clientX - 18) + 'px';
    rip.style.top = (e.clientY - 18) + 'px';
    document.body.appendChild(rip);
    setTimeout(() => rip.remove(), 450);
  });
})();
"""

def smooth_move(page, start_x, start_y, end_x, end_y, steps=25, delay=0.015):
    for i in range(1, steps + 1):
        x = start_x + (end_x - start_x) * (i / steps)
        y = start_y + (end_y - start_y) * (i / steps)
        page.mouse.move(x, y)
        time.sleep(delay)

def convert_to_mp4(webm_path, target_mp4, duration=None):
    cmd = ["ffmpeg", "-y", "-i", webm_path]
    if duration:
        cmd.extend(["-t", str(duration)])
    cmd.extend([
        "-vf", "scale=1920:1080:flags=lanczos,fps=30",
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "18",
        "-pix_fmt", "yuv420p",
        target_mp4
    ])
    subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    print(f"Exported {target_mp4} ({os.path.getsize(target_mp4)} bytes)")

def record_remaining():
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=CHROME_PATH,
            headless=True,
            args=["--disable-blink-features=AutomationControlled", "--no-sandbox"]
        )

        def get_auth_context():
            ctx = browser.new_context(
                viewport={"width": 1920, "height": 1080},
                record_video_dir=TEMP_DIR,
                record_video_size={"width": 1920, "height": 1080}
            )
            pg = ctx.new_page()
            pg.goto("http://localhost:4200/auth/sign-in")
            pg.wait_for_selector('input[name="email"]')
            pg.fill('input[name="email"]', "analyst@fraudshield.ai")
            pg.fill('input[name="password"]', "FraudShield2026!")
            pg.click('button[type="submit"]')
            pg.wait_for_url("**/app**", timeout=10000)
            return ctx, pg

        # -------------------------------------------------------------
        # MODULE 2: LIVE MONITORING
        # -------------------------------------------------------------
        print("\n=== RECORDING MODULE 2: LIVE MONITORING ===")
        ctx, page = get_auth_context()
        page.goto("http://localhost:4200/app/monitoring")
        page.wait_for_load_state("networkidle")
        time.sleep(1.5)
        page.evaluate(CURSOR_SCRIPT)
        page.mouse.move(960, 300)
        time.sleep(1.0)

        table_row = page.locator('table tbody tr').first
        box = table_row.bounding_box()
        if box:
            click_x = box['x'] + 350
            click_y = box['y'] + box['height'] / 2
            smooth_move(page, 960, 300, click_x, click_y, steps=25)
            time.sleep(1.2)
            
            # Hover over Decision BLOCKED / score
            smooth_move(page, click_x, click_y, box['x'] + 720, click_y, steps=15)
            time.sleep(1.2)
            
            # Click row to open Drawer
            page.mouse.click(box['x'] + 720, click_y)
            time.sleep(1.5)
            
            # Glide cursor over drawer details on the right
            smooth_move(page, box['x'] + 720, click_y, 1600, 380, steps=25)
            time.sleep(1.5)
            smooth_move(page, 1600, 380, 1600, 620, steps=20)
            time.sleep(2.5)

        video_path = page.video.path()
        ctx.close()
        target_mp4 = os.path.join(OUTPUT_DIR, "rec_module2_monitoring.mp4")
        convert_to_mp4(video_path, target_mp4, duration=11.0)

        # -------------------------------------------------------------
        # MODULE 3: EXPLAINABILITY LAB
        # -------------------------------------------------------------
        print("\n=== RECORDING MODULE 3: EXPLAINABILITY LAB ===")
        ctx, page = get_auth_context()
        page.goto("http://localhost:4200/app/explainability")
        page.wait_for_load_state("networkidle")
        time.sleep(1.2)
        page.evaluate(CURSOR_SCRIPT)
        page.mouse.move(960, 400)
        time.sleep(1.0)

        # Hover over Risk Gauge
        smooth_move(page, 960, 400, 380, 320, steps=25)
        time.sleep(1.2)

        # Hover over SHAP horizontal bar chart & feature cards
        smooth_move(page, 380, 320, 1050, 260, steps=25)
        time.sleep(1.5)
        smooth_move(page, 1050, 260, 850, 420, steps=20)
        time.sleep(1.0)

        # Scroll down to Reason Codes & click "Generate Explanation"
        page.evaluate("window.scrollBy({top: 280, behavior: 'smooth'})")
        time.sleep(0.8)
        
        gen_btn = page.locator('button:has-text("Generate Explanation")').first
        box = gen_btn.bounding_box()
        if box:
            target_x = box['x'] + box['width'] / 2
            target_y = box['y'] + box['height'] / 2
            smooth_move(page, 850, 420, target_x, target_y, steps=25)
            time.sleep(0.4)
            page.mouse.click(target_x, target_y)
            time.sleep(3.5)

        video_path = page.video.path()
        ctx.close()
        target_mp4 = os.path.join(OUTPUT_DIR, "rec_module3_explainability.mp4")
        convert_to_mp4(video_path, target_mp4, duration=11.0)

        # -------------------------------------------------------------
        # MODULE 4: FRAUD NETWORK INTELLIGENCE
        # -------------------------------------------------------------
        print("\n=== RECORDING MODULE 4: FRAUD NETWORK INTELLIGENCE ===")
        ctx, page = get_auth_context()
        page.goto("http://localhost:4200/app/fraud-network")
        page.wait_for_load_state("networkidle")
        time.sleep(2.0)
        page.evaluate(CURSOR_SCRIPT)
        page.mouse.move(960, 450)
        time.sleep(1.0)

        cluster_btn = page.locator('button:has-text("Mule Ring")').first
        if cluster_btn.count() > 0:
            box = cluster_btn.bounding_box()
            if box:
                btn_x = box['x'] + box['width'] / 2
                btn_y = box['y'] + box['height'] / 2
                smooth_move(page, 960, 450, btn_x, btn_y, steps=20)
                time.sleep(0.3)
                page.mouse.click(btn_x, btn_y)
                time.sleep(1.5)

        zoom_in_btn = page.locator('button[title="Zoom In"]').first
        if zoom_in_btn.count() > 0:
            box = zoom_in_btn.bounding_box()
            if box:
                zx = box['x'] + box['width'] / 2
                zy = box['y'] + box['height'] / 2
                smooth_move(page, 500, 150, zx, zy, steps=15)
                page.mouse.click(zx, zy)
                time.sleep(0.4)
                page.mouse.click(zx, zy)
                time.sleep(1.0)

        # Move mouse into graph canvas and click
        smooth_move(page, 1200, 150, 750, 480, steps=25)
        page.mouse.click(750, 480)
        time.sleep(2.5)

        video_path = page.video.path()
        ctx.close()
        target_mp4 = os.path.join(OUTPUT_DIR, "rec_module4_fraud_network.mp4")
        convert_to_mp4(video_path, target_mp4, duration=11.0)

        # -------------------------------------------------------------
        # MODULE 5: ANALYST COPILOT
        # -------------------------------------------------------------
        print("\n=== RECORDING MODULE 5: ANALYST COPILOT ===")
        ctx, page = get_auth_context()
        page.goto("http://localhost:4200/app/copilot")
        page.wait_for_load_state("networkidle")
        time.sleep(1.5)
        page.evaluate(CURSOR_SCRIPT)
        page.mouse.move(960, 300)
        time.sleep(1.0)

        prompt_btn = page.locator('.border-b button').first
        if prompt_btn.count() > 0:
            box = prompt_btn.bounding_box()
            if box:
                px = box['x'] + box['width'] / 2
                py = box['y'] + box['height'] / 2
                smooth_move(page, 960, 300, px, py, steps=20)
                time.sleep(0.4)
                page.mouse.click(px, py)
                print("Clicked prompt")

        # Wait for AI Copilot typing and streaming
        time.sleep(4.0)

        # Smooth hover over the generated SAR brief
        smooth_move(page, 450, 200, 600, 450, steps=25)
        time.sleep(1.5)
        
        # Move over to active investigation context panel on the right
        smooth_move(page, 600, 450, 1600, 350, steps=25)
        time.sleep(2.5)

        video_path = page.video.path()
        ctx.close()
        target_mp4 = os.path.join(OUTPUT_DIR, "rec_module5_copilot.mp4")
        convert_to_mp4(video_path, target_mp4, duration=11.0)

        browser.close()
        print("\nMODULES 2-5 RECORDED AND EXPORTED SUCCESSFULLY!")

if __name__ == "__main__":
    record_remaining()
