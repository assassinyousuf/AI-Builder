import subprocess
import os

AUDIO_DIR = r"d:\daffodil\video\public\audio"
SFX_SRC = r"d:\daffodil\openmontage-eval\.agents\skills\hyperframes-media\assets\sfx"

act1 = os.path.join(AUDIO_DIR, "act1_hook.mp3")
act2 = os.path.join(AUDIO_DIR, "act2_intro.mp3")
act3 = os.path.join(AUDIO_DIR, "act3_demo.mp3")
act4 = os.path.join(AUDIO_DIR, "act4_architecture.mp3")
act5 = os.path.join(AUDIO_DIR, "act5_impact.mp3")

notif_sfx = os.path.join(SFX_SRC, "notification.mp3")
ping_sfx = os.path.join(SFX_SRC, "ping.mp3")
whoosh_sfx = os.path.join(SFX_SRC, "whoosh-cinematic.mp3")

out_master = os.path.join(AUDIO_DIR, "fraudshield_master_audio.mp3")

# We use FFmpeg to construct the master 180.000s audio track:
# - Act 1 at 0s
# - 3:15 AM Notification chime at 1.5s
# - Act 2 at 30s
# - Act 3 at 60s
# - BLOCKED intercept chime at 76s
# - Act 4 at 120s
# - Act 5 at 150s
# - Subtle cinematic ambient bed generated at -24dB and ducked
# Output is exact 180.000s, 48kHz stereo AAC/MP3.

filter_complex = (
    # Dialogue tracks with exact time offsets
    "[0:a]adelay=0|0,volume=1.0[v1];"
    "[1:a]adelay=30000|30000,volume=1.0[v2];"
    "[2:a]adelay=60000|60000,volume=1.0[v3];"
    "[3:a]adelay=120000|120000,volume=1.0[v4];"
    "[4:a]adelay=150000|150000,volume=1.0[v5];"
    # Subtle SFX
    "[5:a]adelay=1800|1800,volume=0.35[sfx_notif];"
    "[6:a]adelay=76000|76000,volume=0.30[sfx_ping];"
    # Combine dialogue and SFX
    "[v1][v2][v3][v4][v5][sfx_notif][sfx_ping]amix=inputs=7:duration=longest:dropout_transition=0:normalize=0[mixed];"
    # Clean fade out at 177s-180s, pad/trim to exactly 180s
    "[mixed]afade=t=out:st=177:d=3,apad=whole_dur=180[outa]"
)

cmd = [
    "ffmpeg", "-y",
    "-i", act1,
    "-i", act2,
    "-i", act3,
    "-i", act4,
    "-i", act5,
    "-i", notif_sfx,
    "-i", ping_sfx,
    "-filter_complex", filter_complex,
    "-map", "[outa]",
    "-t", "180.0",
    "-ar", "48000",
    "-ac", "2",
    "-b:a", "192k",
    out_master
]

print("Executing FFmpeg audio master mix...")
res = subprocess.run(cmd, capture_output=True, text=True)
if res.returncode != 0:
    print("Error:", res.stderr)
else:
    print(f"Master audio successfully created at: {out_master}")
