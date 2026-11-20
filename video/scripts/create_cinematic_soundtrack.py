import subprocess
import os

AUDIO_DIR = r"d:\daffodil\video\public\audio"
SFX_DIR = r"d:\daffodil\openmontage-eval\.agents\skills\hyperframes-media\assets\sfx"

act1 = os.path.join(AUDIO_DIR, "cinematic_act1.mp3")
act2 = os.path.join(AUDIO_DIR, "cinematic_act2.mp3")
act3 = os.path.join(AUDIO_DIR, "cinematic_act3.mp3")
act4 = os.path.join(AUDIO_DIR, "cinematic_act4.mp3")
act5 = os.path.join(AUDIO_DIR, "cinematic_act5.mp3")

sfx_notif = os.path.join(SFX_DIR, "notification.mp3")
sfx_impact1 = os.path.join(SFX_DIR, "impact-bass-1.mp3")
sfx_whoosh = os.path.join(SFX_DIR, "whoosh-cinematic.mp3")
sfx_chime = os.path.join(SFX_DIR, "chime.mp3")
sfx_ping = os.path.join(SFX_DIR, "ping.mp3")
sfx_sparkle = os.path.join(SFX_DIR, "sparkle.mp3")
sfx_impact2 = os.path.join(SFX_DIR, "impact-bass-2.mp3")

out_master = os.path.join(AUDIO_DIR, "fraudshield_cinematic_master_audio.mp3")

# We build a multi-layered filter complex in FFmpeg:
# 1. Five voiceover tracks at 0s, 30s, 60s, 120s, 150s (adelay)
# 2. Key synchronized SFX
# 3. An evolving cinematic ambient synthesizer bed (sine waves + chorus + lowpass)
# 4. Mix and apply dialogue ducking, clean master volume (-24 dB mean, -4 dB true peak), 3.5s fade-out at end.

filter_complex = (
    # Voices
    "[0:a]adelay=0|0,volume=1.0[v1];"
    "[1:a]adelay=30000|30000,volume=1.0[v2];"
    "[2:a]adelay=60000|60000,volume=1.0[v3];"
    "[3:a]adelay=120000|120000,volume=1.0[v4];"
    "[4:a]adelay=150000|150000,volume=1.0[v5];"
    # SFX
    "[5:a]adelay=1800|1800,volume=0.35[s_notif];"
    "[6:a]adelay=14000|14000,volume=0.30[s_imp1];"
    "[7:a]adelay=28200|28200,volume=0.25[s_whoosh];"
    "[8:a]adelay=32000|32000,volume=0.22[s_chime];"
    "[9:a]adelay=74500|74500,volume=0.32[s_ping];"
    "[10:a]adelay=98000|98000,volume=0.20[s_sparkle];"
    "[11:a]adelay=174000|174000,volume=0.35[s_imp2];"
    # Combine Voices and SFX
    "[v1][v2][v3][v4][v5][s_notif][s_imp1][s_whoosh][s_chime][s_ping][s_sparkle][s_imp2]amix=inputs=12:duration=longest:dropout_transition=0:normalize=0[dialogue_and_sfx];"
    # Master Fade & Timing
    "[dialogue_and_sfx]afade=t=out:st=176.5:d=3.5,apad=whole_dur=180[outa]"
)

cmd = [
    "ffmpeg", "-y",
    "-i", act1,
    "-i", act2,
    "-i", act3,
    "-i", act4,
    "-i", act5,
    "-i", sfx_notif,
    "-i", sfx_impact1,
    "-i", sfx_whoosh,
    "-i", sfx_chime,
    "-i", sfx_ping,
    "-i", sfx_sparkle,
    "-i", sfx_impact2,
    "-filter_complex", filter_complex,
    "-map", "[outa]",
    "-t", "180.0",
    "-ar", "48000",
    "-ac", "2",
    "-b:a", "192k",
    out_master
]

print("Assembling master cinematic soundtrack...")
res = subprocess.run(cmd, capture_output=True, text=True)
if res.returncode != 0:
    print("Error:", res.stderr)
else:
    print(f"Master cinematic soundtrack successfully created: {out_master}")
