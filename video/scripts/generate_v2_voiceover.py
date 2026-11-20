import asyncio
import edge_tts
import os
import subprocess

OUT_DIR = r"d:\daffodil\video\public\assets\audio"
os.makedirs(OUT_DIR, exist_ok=True)
VOICE = "en-US-ChristopherNeural"

ACTS = [
    {
        "id": "v2_act1",
        "rate": "+6%",
        "pitch": "-2Hz",
        "target_max_sec": 28.5,
        "text": (
            "Across global capitals, millions of migrant workers send their hard-earned earnings across borders. "
            "At 3:15 AM, while a city sleeps, a smartphone lights up with an urgent notification: a four-thousand-eight-hundred-dollar outbound wire. "
            "The credentials are valid. The POS swipe and ATM patterns appear normal. "
            "To legacy rule engines, this transaction looks legitimate. "
            "In modern cybercrime, static rules see isolated payments. They miss behavior."
        )
    },
    {
        "id": "v2_act2",
        "rate": "+8%",
        "pitch": "-2Hz",
        "target_max_sec": 28.5,
        "text": (
            "Meet FraudShield: an enterprise behavioral intelligence platform that redefines financial security. "
            "Born from peer-reviewed research published with Taylor and Francis by researchers at Dhaka International University, FraudShield treats banking actions as an evolving language. "
            "By transforming API events into contextual sequences, our sixty-six-million parameter DistilBERT transformer achieved a ninety-two-point-five percent F-zero-point-five precision score—protecting institutions while eliminating false-positive friction for honest consumers."
        )
    },
    {
        "id": "v2_act3",
        "rate": "+12%",
        "pitch": "-2Hz",
        "target_max_sec": 56.0,
        "text": (
            "Watch FraudShield intercept a coordinated account takeover in real time. "
            "Inside the Attack Simulator, an adversary injects credential mutations and rapid wire commands. "
            "In Live Monitoring, the anomaly is intercepted in under fifteen milliseconds—freezing funds before interbank settlement occurs. "
            "Behind the scenes, our Explainability Lab deploys SHAP attribution, decomposing risk into velocity spikes and just-in-time payee onboarding. "
            "Our Fraud Network intelligence maps the attack topology, uncovering an interconnected mule ring across multiple accounts. "
            "Finally, the AI Copilot synthesizes forensic telemetry into a compliance-ready dossier. "
            "Attack detected. Behavior analyzed. Network exposed. Evidence organized."
        )
    },
    {
        "id": "v2_act4",
        "rate": "+7%",
        "pitch": "-2Hz",
        "target_max_sec": 28.0,
        "text": (
            "Powering this defense is a purpose-built sequence transformer architecture. "
            "Anonymized banking action strings pass through six encoder layers, generating contextual embeddings with a memory footprint under three hundred megabytes. "
            "Research established a thirty-five to fifty millisecond CPU inference benchmark. "
            "Coupled with our modular Angular interface and containerized FastAPI roadmap, FraudShield delivers practical, low-latency financial protection."
        )
    },
    {
        "id": "v2_act5",
        "rate": "+6%",
        "pitch": "-2Hz",
        "target_max_sec": 27.5,
        "text": (
            "In remittance-dependent economies, over thirty billion dollars flow across borders each year—representing family livelihoods that cannot afford compromise. "
            "Evaluated on thirty-four thousand banking sequences, FraudShield was created by six researchers at Dhaka International University. "
            "Fraud doesn't wait—and neither should our defense. "
            "We are FraudShield: secure, explainable, and buildable. Thank you."
        )
    }
]

async def generate():
    for act in ACTS:
        out_path = os.path.join(OUT_DIR, f"{act['id']}.mp3")
        print(f"Generating {act['id']} with {VOICE} (rate: {act['rate']})...")
        communicate = edge_tts.Communicate(act["text"], VOICE, rate=act["rate"], pitch=act["pitch"])
        await communicate.save(out_path)
        
        res = subprocess.run([
            "ffprobe", "-v", "error", "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1", out_path
        ], capture_output=True, text=True)
        dur = float(res.stdout.strip())
        print(f"  -> Generated {act['id']}.mp3: duration = {dur:.2f}s (target max: {act['target_max_sec']}s)")

if __name__ == "__main__":
    asyncio.run(generate())
