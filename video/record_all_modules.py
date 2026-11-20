import os, time, subprocess, shutil
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
    cmd = [
        "ffmpeg", "-y",
        "-i", webm_path,
    ]
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

def record_all():
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=CHROME_PATH,
            headless=True,
            args=["--disable-blink-features=AutomationControlled", "--no-sandbox"]
        )

        # Helper to get authenticated context
        def get_auth_context():
            ctx = browser.new_context(
                viewport={"width": 1920, "height": 1080},
                record_video_dir=TEMP_DIR,
                record_video_size={"width": 1920, "height": 1080}
            )
            pg = ctx.new_page()
            # Perform login once
            pg.goto("http://localhost:4200/auth/sign-in")
            pg.wait_for_selector('input[name="email"]')
            pg.fill('input[name="email"]', "analyst@fraudshield.ai")
            pg.fill('input[name="password"]', "FraudShield2026!")
            pg.click('button[type="submit"]')
            pg.wait_for_url("**/app**", timeout=10000)
            return ctx, pg

        # -------------------------------------------------------------
        # MODULE 1: ATTACK SIMULATOR
        # -------------------------------------------------------------
        print("\n=== RECORDING MODULE 1: ATTACK SIMULATOR ===")
        ctx, page = get_auth_context()
        page.goto("http://localhost:4200/app/simulator")
        page.wait_for_load_state("networkidle")
        time.sleep(1)
        page.evaluate(CURSOR_SCRIPT)
        page.mouse.move(960, 540)
        time.sleep(1)

        # Move to Account Takeover scenario card
        smooth_move(page, 960, 540, 480, 480, steps=25)
        time.sleep(0.8)
        
        # Click "Launch Simulation" button on the first scenario card
        launch_btn = page.locator('button:has-text("Launch Simulation")').first
        box = launch_btn.bounding_box()
        if box:
            smooth_move(page, 480, 480, box['x'] + box['width']/2, box['y'] + box['height']/2, steps=20)
            time.sleep(0.4)
            page.mouse.down()
            time.sleep(0.1)
            page.mouse.up()
            launch_btn.click()
        
        # Watch the simulation progress (ticks through steps)
        time.sleep(2.0)
        # Scroll down slightly to show execution telemetry
        page.evaluate("window.scrollBy({top: 250, behavior: 'smooth'})")
        smooth_move(page, 600, 500, 960, 650, steps=30)
        time.sleep(4.5) # Wait for simulation completion
        
        video_path = page.video.path()
        ctx.close()
        target_mp4 = os.path.join(OUTPUT_DIR, "rec_module1_simulator.mp4")
        convert_to_mp4(video_path, target_mp4, duration=11.0)

        # -------------------------------------------------------------
        # MODULE 2: LIVE MONITORING
        # -------------------------------------------------------------
        print("\n=== RECORDING MODULE 2: LIVE MONITORING ===")
        ctx, page = get_auth_context()
        page.goto("http://localhost:4200/app/monitoring")
        page.wait_for_load_state("networkidle")
        time.sleep(1)
        page.evaluate(CURSOR_SCRIPT)
        page.mouse.move(960, 300)
        time.sleep(1.2)

        # Locate first row in transaction stream (highlighting blocked/high risk)
        table_row = page.locator('table tbody tr').first
        box = table_row.bounding_box()
        if box:
            # Move cursor to transaction row
            smooth_move(page, 960, 300, box['x'] + 300, box['y'] + box['height']/2, steps=25)
            time.sleep(1.0)
            
            # Hover over BLOCKED badge / risk score
            smooth_move(page, box['x'] + 300, box['y'] + box['height']/2, box['x'] + 720, box['y'] + box['height']/2, steps=15)
            time.sleep(1.2)
            
            # Click row to open Transaction Drawer
            page.mouse.down()
            time.sleep(0.1)
            page.mouse.up()
            table_row.click()
            time.sleep(1.5)
            
            # Glide cursor over drawer details on the right
            smooth_move(page, box['x'] + 720, box['y'] + box['height']/2, 1600, 380, steps=25)
            time.sleep(1.5)
            smooth_move(page, 1600, 380, 1600, 620, steps=20)
            time.sleep(2.0)

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
        time.sleep(1)
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
            smooth_move(page, 850, 420, box['x'] + box['width']/2, box['y'] + box['height']/2, steps=25)
            time.sleep(0.4)
            page.mouse.down()
            time.sleep(0.1)
            page.mouse.up()
            gen_btn.click()
            time.sleep(3.0)

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
        time.sleep(1.5) # Wait for Cytoscape to settle physics
        page.evaluate(CURSOR_SCRIPT)
        page.mouse.move(960, 450)
        time.sleep(1.0)

        # Click Mule Ring Cluster button if available
        cluster_btn = page.locator('button:has-text("Mule Ring")').first
        if cluster_btn.count() > 0:
            box = cluster_btn.bounding_box()
            if box:
                smooth_move(page, 960, 450, box['x'] + box['width']/2, box['y'] + box['height']/2, steps=20)
                time.sleep(0.3)
                cluster_btn.click()
                time.sleep(1.5)

        # Click Zoom In button twice to show graph interaction
        zoom_in_btn = page.locator('button[title="Zoom In"]').first
        if zoom_in_btn.count() > 0:
            box = zoom_in_btn.bounding_box()
            if box:
                smooth_move(page, page.mouse._x if hasattr(page.mouse, '_x') else 1000, 150, box['x'] + box['width']/2, box['y'] + box['height']/2, steps=15)
                zoom_in_btn.click()
                time.sleep(0.4)
                zoom_in_btn.click()
                time.sleep(1.0)

        # Move mouse into graph canvas and drag slightly
        smooth_move(page, 1200, 150, 700, 500, steps=25)
        page.mouse.down()
        smooth_move(page, 700, 500, 620, 460, steps=20)
        page.mouse.up()
        time.sleep(0.5)

        # Click a node inside canvas
        page.mouse.click(620, 460)
        time.sleep(2.0)

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
        time.sleep(1.2)
        page.evaluate(CURSOR_SCRIPT)
        page.mouse.move(960, 300)
        time.sleep(1.0)

        # Click first suggested prompt
        prompt_btn = page.locator('.border-b button').first
        if prompt_btn.count() > 0:
            box = prompt_btn.bounding_box()
            if box:
                smooth_move(page, 960, 300, box['x'] + box['width']/2, box['y'] + box['height']/2, steps=20)
                time.sleep(0.4)
                page.mouse.down()
                time.sleep(0.1)
                page.mouse.up()
                prompt_btn.click()
                print("Clicked prompt:", prompt_btn.inner_text())

        # Wait for AI streaming / response to complete
        time.sleep(3.5)

        # Hover over the generated Copilot SAR report & evidence badges
        smooth_move(page, 450, 200, 600, 450, steps=25)
        time.sleep(1.5)
        
        # Move over to active investigation context panel on the right
        smooth_move(page, 600, 450, 1600, 350, steps=25)
        time.sleep(2.0)

        video_path = page.video.path()
        ctx.close()
        target_mp4 = os.path.join(OUTPUT_DIR, "rec_module5_copilot.mp4")
        convert_to_mp4(video_path, target_mp4, duration=11.0)

        browser.close()
        print("\nALL 5 MODULES RECORDED SUCCESSFULLY!")

if __name__ == "__main__":
    record_all()
