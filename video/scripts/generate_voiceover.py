import asyncio
import os
import edge_tts

VOICE = "en-US-ChristopherNeural"

# Speeds tuned so each act finishes with 2-4 seconds breathing room before the transition
ACTS = {
    "act1_hook.mp3": {
        "text": (
            "In 2016, the eighty-one million dollar Bangladesh Bank heist bypassed static filters. "
            "Today, automated botnets attack everyday people. "
            "At 3:15 AM, while an overseas expatriate sleeps, bots run a micro-authorization test, "
            "then siphon four thousand eight hundred dollars through layered Dubai mule accounts. "
            "His family's savings: gone. "
            "Static rules inspect transactions in isolation—completely blind to behavioral intent."
        ),
        "rate": "+15%",
    },
    "act2_intro.mp3": {
        "text": (
            "We are Team FraudShield from Dhaka International University. "
            "Backed by our peer-reviewed research on transformer-based behavioral sequences, "
            "we treat user sessions not as isolated numbers, but as a language. "
            "Security begins at the perimeter with enterprise-grade authentication, "
            "multi-tenant workspaces, and granular Role-Based Access Control. "
            "By tokenizing API actions, our fine-tuned DistilBERT transformer delivers "
            "sub-fifteen millisecond inference and an industry-leading F0.5 score of 92.5%, "
            "weighting high precision to protect legitimate users."
        ),
        "rate": "+24%",
    },
    "act3_demo.mp3": {
        "text": (
            "Let's see this live in our Attack Simulator. "
            "We launch an Account Takeover: an impossible-travel session via a headless proxy attempting rapid cash-out. "
            "Watch our live stream react. In under fifteen milliseconds, "
            "FraudShield calculates a 96 out of 100 risk score and triggers an instant automated block before funds escape. "
            "In our Explainability Lab, transparent SHAP attributions prove why: "
            "impossible travel contributed plus 0.24, and proxy fingerprints contributed plus 0.19, "
            "generating deterministic reason codes. "
            "Next, our graph-based fraud network analysis unmasks the wider syndicate, "
            "revealing five connected mule accounts linked to the identical device footprint. "
            "Finally, our AI Copilot synthesizes the evidence into an audit-ready compliance report, "
            "reducing investigator triage time by 75%."
        ),
        "rate": "+12%",
    },
    "act4_architecture.mp3": {
        "text": (
            "Our architecture is modular and lightweight. "
            "We fine-tuned a 66-million parameter DistilBERT model modeling API sequences as pseudo-sentences, "
            "delivering a forty percentage point improvement over legacy baselines with just 250 megabytes of memory. "
            "Our production roadmap introduces containerized FastAPI microservices with ONNX quantization, "
            "privacy-preserving federated learning across banking consortiums, "
            "and native Bangla localization for regional compliance."
        ),
        "rate": "+16%",
    },
    "act5_impact.mp3": {
        "text": (
            "In South Asia alone, over thirty billion dollars in annual remittances powers families and national economies. "
            "FraudShield ensures not a single dollar is lost to invisible syndicates. "
            "Built with passion by Dhaka International University (DIU CSE) researchers and engineers. "
            "Fraud doesn't wait—and neither should our defense. "
            "We are FraudShield. Secure, explainable, and production-ready. Thank you."
        ),
        "rate": "+18%",
    },
}

async def generate_act(filename, cfg, output_dir):
    out_path = os.path.join(output_dir, filename)
    communicate = edge_tts.Communicate(cfg["text"], VOICE, rate=cfg["rate"], pitch="+0Hz")
    await communicate.save(out_path)

async def main():
    output_dir = r"d:\daffodil\video\public\audio"
    os.makedirs(output_dir, exist_ok=True)
    for filename, cfg in ACTS.items():
        await generate_act(filename, cfg, output_dir)
    print("Regenerated all voiceover acts!")

if __name__ == "__main__":
    asyncio.run(main())
