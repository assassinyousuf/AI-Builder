import asyncio
import edge_tts
import os
import subprocess

OUT_DIR = r"d:\daffodil\video\public\audio"
VOICE = "en-US-ChristopherNeural"

ACTS = [
    {
        "id": "cinematic_act1",
        "rate": "+10%",
        "pitch": "-2Hz",
        "target_max_sec": 28.0,
        "text": (
            "It is 3:15 AM. A smartphone lights up in the dark with a four-thousand-eight-hundred-dollar outbound wire. "
            "The account credentials are valid. The device signature looks normal. "
            "To traditional rule engines, the transaction is invisible. "
            "But the behavioral sequence is deadly. "
            "In financial crime, static rules see isolated transactions. They miss behavior."
        )
    },
    {
        "id": "cinematic_act2",
        "rate": "+12%",
        "pitch": "-2Hz",
        "target_max_sec": 28.5,
        "text": (
            "This is FraudShield: behavioral intelligence for modern financial security. "
            "Developed through research published with Taylor and Francis at Dhaka International University, FraudShield treats banking actions as a language. "
            "By tokenizing user navigation into contextual sequences, our sixty-six-million parameter DistilBERT model achieved a ninety-two-point-five percent F-zero-point-five score in scientific evaluation—delivering high-precision defense without frustrating legitimate customers."
        )
    },
    {
        "id": "cinematic_act3",
        "rate": "+15%",
        "pitch": "-2Hz",
        "target_max_sec": 55.0,
        "text": (
            "Watch FraudShield intercept a coordinated account takeover in real time. "
            "Inside our Attack Simulator, an adversary changes credentials and immediately dispatches funds. "
            "In Live Monitoring, the transaction is flagged and automatically blocked in under fifteen milliseconds—safeguarding capital before settlement. "
            "In the Explainability Lab, SHAP attribution reveals exactly why: velocity anomalies and rapid beneficiary onboarding drove the risk score. "
            "Our Fraud Network intelligence maps the attack topology, exposing an interconnected mule ring across multiple accounts. "
            "And the AI Copilot compiles the entire investigation into an evidentiary report. "
            "Attack detected. Behavior analyzed. Network exposed. Evidence organized."
        )
    },
    {
        "id": "cinematic_act4",
        "rate": "+10%",
        "pitch": "-2Hz",
        "target_max_sec": 28.0,
        "text": (
            "Behind this defense is a lightweight, purpose-built transformer architecture. "
            "Anonymized API sequences pass through six transformer layers, yielding contextual embeddings with a memory footprint under three hundred megabytes. "
            "The research established a thirty-five to fifty millisecond CPU inference benchmark. "
            "Coupled with our modular Angular interface and containerized deployment roadmap, FraudShield delivers practical, low-latency financial protection."
        )
    },
    {
        "id": "cinematic_act5",
        "rate": "+8%",
        "pitch": "-2Hz",
        "target_max_sec": 27.5,
        "text": (
            "In remittance-dependent economies, over thirty billion dollars flow across borders each year—representing hard-earned family livelihoods that cannot afford compromise. "
            "Evaluated on over thirty-four thousand banking sequences, FraudShield was created by six researchers at Dhaka International University. "
            "Fraud doesn't wait—and neither should our defense. "
            "We are FraudShield. Secure, explainable, and buildable. Thank you."
        )
    }
]

async def generate():
    os.makedirs(OUT_DIR, exist_ok=True)
    for act in ACTS:
        out_path = os.path.join(OUT_DIR, f"{act['id']}.mp3")
        print(f"Generating {act['id']} with {VOICE} (rate: {act['rate']})...")
        communicate = edge_tts.Communicate(act["text"], VOICE, rate=act["rate"], pitch=act["pitch"])
        await communicate.save(out_path)
        
        # Check duration with ffprobe
        res = subprocess.run([
            "ffprobe", "-v", "error", "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1", out_path
        ], capture_output=True, text=True)
        dur = float(res.stdout.strip())
        print(f"  -> Generated {act['id']}.mp3: duration = {dur:.2f}s (target max: {act['target_max_sec']}s)")
        assert dur <= act["target_max_sec"], f"Exceeded max duration for {act['id']}: {dur}s > {act['target_max_sec']}s"

if __name__ == "__main__":
    asyncio.run(generate())
