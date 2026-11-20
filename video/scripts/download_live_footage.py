import urllib.request
import os
import subprocess

FOOTAGE_BASE = r"d:\daffodil\video\public\assets\footage"

# Curated list of genuine live-action clips from Mixkit (Free Mixkit Commercial License)
CLIPS = [
    # --- ACT 1: Human, Night City, Phone, Credit Card, ATM ---
    {
        "id": "act1_night_city",
        "category": "human",
        "title": "Night City Skyline with Traffic Flow",
        "url_720": "https://assets.mixkit.co/videos/42343/42343-720.mp4",
        "url_360": "https://assets.mixkit.co/videos/42343/42343-360.mp4",
        "source": "Mixkit",
        "license": "Mixkit Stock Video Free Commercial License",
        "desc": "Cinematic night city streets and skyscrapers showing late night transit"
    },
    {
        "id": "act1_sleeping_phone",
        "category": "human",
        "title": "Smartphone on Bed / Nightstand Late at Night",
        "url_720": "https://assets.mixkit.co/videos/4908/4908-720.mp4",
        "url_360": "https://assets.mixkit.co/videos/4908/4908-360.mp4",
        "source": "Mixkit",
        "license": "Mixkit Stock Video Free Commercial License",
        "desc": "Phone screen illuminating bedside in dark room"
    },
    {
        "id": "act1_credit_card_pos",
        "category": "banking",
        "title": "Contactless Credit Card Payment at Terminal",
        "url_720": "https://assets.mixkit.co/videos/35902/35902-720.mp4",
        "url_360": "https://assets.mixkit.co/videos/35902/35902-360.mp4",
        "source": "Mixkit",
        "license": "Mixkit Stock Video Free Commercial License",
        "desc": "Close up shot of customer tapping card on payment terminal"
    },
    {
        "id": "act1_atm_withdrawal",
        "category": "banking",
        "title": "Cash Dispensing from ATM Machine",
        "url_720": "https://assets.mixkit.co/videos/21911/21911-720.mp4",
        "url_360": "https://assets.mixkit.co/videos/21911/21911-360.mp4",
        "source": "Mixkit",
        "license": "Mixkit Stock Video Free Commercial License",
        "desc": "Bank ATM automated teller machine dispensing banknotes"
    },
    {
        "id": "act1_cyber_threat",
        "category": "technology",
        "title": "Global Cyber Network Data Nodes",
        "url_720": "https://assets.mixkit.co/videos/23704/23704-720.mp4",
        "url_360": "https://assets.mixkit.co/videos/23704/23704-360.mp4",
        "source": "Mixkit",
        "license": "Mixkit Stock Video Free Commercial License",
        "desc": "Cybersecurity digital lines and data nodes connecting overseas"
    },

    # --- ACT 2: Fintech Operations & Professionals ---
    {
        "id": "act2_fintech_office",
        "category": "banking",
        "title": "Financial Professionals in Modern Office",
        "url_720": "https://assets.mixkit.co/videos/1728/1728-720.mp4",
        "url_360": "https://assets.mixkit.co/videos/1728/1728-360.mp4",
        "source": "Mixkit",
        "license": "Mixkit Stock Video Free Commercial License",
        "desc": "Financial analysts collaborating in glass-walled fintech workspace"
    },

    # --- ACT 3: Security Operations Center & Server Infrastructure Cutaways ---
    {
        "id": "act3_soc_analyst",
        "category": "technology",
        "title": "Cybersecurity Analyst at Multi-Monitor Workstation",
        "url_720": "https://assets.mixkit.co/videos/46634/46634-720.mp4",
        "url_360": "https://assets.mixkit.co/videos/46634/46634-360.mp4",
        "source": "Mixkit",
        "license": "Mixkit Stock Video Free Commercial License",
        "desc": "Security analyst monitoring live threat detection feeds"
    },
    {
        "id": "act3_datacenter_servers",
        "category": "technology",
        "title": "High-Density Bank Datacenter Server Racks",
        "url_720": "https://assets.mixkit.co/videos/23219/23219-720.mp4",
        "url_360": "https://assets.mixkit.co/videos/23219/23219-360.mp4",
        "source": "Mixkit",
        "license": "Mixkit Stock Video Free Commercial License",
        "desc": "Camera tracking down illuminated server rack corridor with blinking optical lights"
    },

    # --- ACT 4: Software Engineering & Transformer Research ---
    {
        "id": "act4_developer_coding",
        "category": "technology",
        "title": "Software Engineer Writing Machine Learning Code",
        "url_720": "https://assets.mixkit.co/videos/47321/47321-720.mp4",
        "url_360": "https://assets.mixkit.co/videos/47321/47321-360.mp4",
        "source": "Mixkit",
        "license": "Mixkit Stock Video Free Commercial License",
        "desc": "Hands typing Python code and inspecting terminal logs on mechanical keyboard"
    },
    {
        "id": "act4_server_lights",
        "category": "technology",
        "title": "Server Chassis Optical Network Interfaces",
        "url_720": "https://assets.mixkit.co/videos/7887/7887-720.mp4",
        "url_360": "https://assets.mixkit.co/videos/7887/7887-360.mp4",
        "source": "Mixkit",
        "license": "Mixkit Stock Video Free Commercial License",
        "desc": "Macro close-up of fiber optic switch cables and activity indicators"
    },

    # --- ACT 5: Remittance, Family, & Human Connection ---
    {
        "id": "act5_family_video_call",
        "category": "remittance",
        "title": "Family Connected via Video Call on Smartphone",
        "url_720": "https://assets.mixkit.co/videos/6213/6213-720.mp4",
        "url_360": "https://assets.mixkit.co/videos/6213/6213-360.mp4",
        "source": "Mixkit",
        "license": "Mixkit Stock Video Free Commercial License",
        "desc": "Family smiling and talking to an overseas relative through phone screen"
    },
    {
        "id": "act5_family_home",
        "category": "remittance",
        "title": "Happy Family Together in Warm Home Setting",
        "url_720": "https://assets.mixkit.co/videos/4542/4542-720.mp4",
        "url_360": "https://assets.mixkit.co/videos/4542/4542-360.mp4",
        "source": "Mixkit",
        "license": "Mixkit Stock Video Free Commercial License",
        "desc": "Grounded human connection representing protected livelihoods"
    }
]

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

manifest_rows = []

for clip in CLIPS:
    target_dir = os.path.join(FOOTAGE_BASE, clip["category"])
    os.makedirs(target_dir, exist_ok=True)
    out_path = os.path.join(target_dir, f"{clip['id']}.mp4")

    print(f"Downloading [{clip['category']}] {clip['id']}...")
    downloaded = False
    for url in [clip["url_720"], clip["url_360"]]:
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=15) as resp:
                with open(out_path, "wb") as f:
                    f.write(resp.read())
            downloaded = True
            print(f"  -> Successfully downloaded: {out_path} ({os.path.getsize(out_path)} bytes)")
            break
        except Exception as e:
            print(f"  -> Failed url {url}: {e}")

    if downloaded:
        # Check duration and resolution with ffprobe
        res = subprocess.run([
            "ffprobe", "-v", "error",
            "-show_entries", "stream=width,height,r_frame_rate,duration",
            "-of", "csv=p=0", out_path
        ], capture_output=True, text=True)
        probe_info = res.stdout.strip().split("\n")[0]
        manifest_rows.append((clip, out_path, probe_info))

print("\nAll downloads complete! Registering assets...")
