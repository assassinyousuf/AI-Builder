import os, asyncio, edge_tts, subprocess

AUDIO_DIR = r"d:\daffodil\video\public\assets\audio"
os.makedirs(AUDIO_DIR, exist_ok=True)
VOICE = "en-US-ChristopherNeural"

SCRIPTS = {
    "v3_act1": {
        "text": "Meet Rafiq, sending his hard-earned savings home. At 3:15 AM, an automated bot farm runs a one-dollar authorization test. Forty-five seconds later, forty-eight hundred dollars is drained through layered mule accounts. When he calls his bank, they say: 'The credentials matched; our static rules saw nothing.' From the eighty-one million dollar Bangladesh Bank heist to automated botnets, static rules fail because they inspect transactions in isolation—blind to behavioral intent.",
        "rate": "+15%"
    },
    "v3_act2": {
        "text": "We are Team FraudShield from Dhaka International University. Backed by our peer-reviewed research, FraudShield models user sessions not as numbers, but as a language. With native enterprise authentication and granular RBAC, our fine-tuned DistilBERT transformer delivers sub-15 millisecond latency and a 92.5% F0.5 score—stopping fraud before funds leave the bank.",
        "rate": "+14%"
    },
    "v3_act3": {
        "text": "Let's prove this live in our application. In our Attack Simulator, we launch an adversarial Account Takeover via a headless browser proxy. Clicking Launch Simulation, staged events execute live. Instantly, in our Live Monitoring stream, transaction 4821 arrives in red—flagged with a 96 out of 100 risk score and an automated BLOCK in under fifteen milliseconds. In our Explainability Lab, transparent SHAP attributions prove why: impossible travel added plus-0.24, and headless device added plus-0.19, synthesizing deterministic reason codes. Our Cytoscape Fraud Network unmasks the wider ring: five connected mule accounts linked to the exact same device footprint. Finally, with one click, our AI Copilot synthesizes all evidence into a compliance-ready audit report, cutting triage time by 75%.",
        "rate": "+15%"
    },
    "v3_act4": {
        "text": "FraudShield replaces static rules by modeling banking actions as a language sequence. Our pipeline encodes API tokens through a fine-tuned 66-million parameter DistilBERT transformer. On thirty-four thousand banking sequences, it achieves a 92.5% F0.5 score—beating legacy baselines by thirty percent at just 250 megabytes memory footprint. Our production roadmap scales this via containerized FastAPI microservices and ONNX quantization.",
        "rate": "+15%"
    },
    "v3_act5": {
        "text": "Over thirty billion dollars in remittances powers families and national economies. FraudShield safeguards every transfer. Behind FraudShield is our research team from Dhaka International University: Mehedi Hasan, Abdul Al Mahin, Swadhin Chakraborty, Marjanah Afrose, Ayon Mia, and faculty advisor Md. Abdul Based. Fraud doesn't wait—neither should our defense. We are FraudShield: secure, explainable, and buildable. Thank you.",
        "rate": "+15%"
    }
}

async def generate():
    for act_name, data in SCRIPTS.items():
        out_path = os.path.join(AUDIO_DIR, f"{act_name}.mp3")
        comm = edge_tts.Communicate(data["text"], VOICE, rate=data["rate"])
        await comm.save(out_path)
        
        cmd = ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", out_path]
        res = subprocess.run(cmd, capture_output=True, text=True, check=True)
        dur = float(res.stdout.strip())
        print(f"{act_name}: duration = {dur:.2f} s")

if __name__ == "__main__":
    asyncio.run(generate())
