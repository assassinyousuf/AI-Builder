import subprocess
import os

AUDIO_DIR = r"d:\daffodil\video\public\assets\audio"
SFX_DIR = r"d:\daffodil\openmontage-eval\.agents\skills\hyperframes-media\assets\sfx"

act1 = os.path.join(AUDIO_DIR, "v2_act1.mp3")
act2 = os.path.join(AUDIO_DIR, "v2_act2.mp3")
act3 = os.path.join(AUDIO_DIR, "v2_act3.mp3")
act4 = os.path.join(AUDIO_DIR, "v2_act4.mp3")
act5 = os.path.join(AUDIO_DIR, "v2_act5.mp3")

sfx_notif = os.path.join(SFX_DIR, "notification.mp3")
sfx_click_soft = os.path.join(SFX_DIR, "click-soft.mp3")
sfx_whoosh = os.path.join(SFX_DIR, "whoosh-cinematic.mp3")
sfx_chime = os.path.join(SFX_DIR, "chime.mp3")
sfx_ping = os.path.join(SFX_DIR, "ping.mp3")
sfx_sparkle = os.path.join(SFX_DIR, "sparkle.mp3")
sfx_click = os.path.join(SFX_DIR, "click.mp3")
sfx_key = os.path.join(SFX_DIR, "key-press.mp3")
sfx_whoosh_short = os.path.join(SFX_DIR, "whoosh-short.mp3")
sfx_impact = os.path.join(SFX_DIR, "impact-bass-2.mp3")

out_master = os.path.join(AUDIO_DIR, "fraudshield_v2_master_audio.mp3")

filter_complex = (
    # Voices placed at exact 30s scene intervals
    "[0:a]adelay=0|0,volume=1.0[v1];"
    "[1:a]adelay=30000|30000,volume=1.0[v2];"
    "[2:a]adelay=60000|60000,volume=1.0[v3];"
    "[3:a]adelay=120000|120000,volume=1.0[v4];"
    "[4:a]adelay=150000|150000,volume=1.0[v5];"
    # SFX
    "[5:a]adelay=6000|6000,volume=0.35[s_notif];"
    "[6:a]adelay=14000|14000,volume=0.25[s_click_soft];"
    "[7:a]adelay=28200|28200,volume=0.25[s_whoosh];"
    "[8:a]adelay=32000|32000,volume=0.22[s_chime];"
    "[9:a]adelay=74500|74500,volume=0.32[s_ping];"
    "[10:a]adelay=86000|86000,volume=0.20[s_sparkle];"
    "[11:a]adelay=98000|98000,volume=0.22[s_click];"
    "[12:a]adelay=110000|110000,volume=0.25[s_key];"
    "[13:a]adelay=124000|124000,volume=0.20[s_whoosh_s];"
    "[14:a]adelay=174000|174000,volume=0.35[s_imp];"
    # Mix all 15 inputs
    "[v1][v2][v3][v4][v5][s_notif][s_click_soft][s_whoosh][s_chime][s_ping][s_sparkle][s_click][s_key][s_whoosh_s][s_imp]amix=inputs=15:duration=longest:dropout_transition=0:normalize=0[mixed];"
    # Clean 3.5s fade out ending at 180s
    "[mixed]afade=t=out:st=176.5:d=3.5,apad=whole_dur=180[outa]"
)

cmd = [
    "ffmpeg", "-y",
    "-i", act1,
    "-i", act2,
    "-i", act3,
    "-i", act4,
    "-i", act5,
    "-i", sfx_notif,
    "-i", sfx_click_soft,
    "-i", sfx_whoosh,
    "-i", sfx_chime,
    "-i", sfx_ping,
    "-i", sfx_sparkle,
    "-i", sfx_click,
    "-i", sfx_key,
    "-i", sfx_whoosh_short,
    "-i", sfx_impact,
    "-filter_complex", filter_complex,
    "-map", "[outa]",
    "-t", "180.0",
    "-ar", "48000",
    "-ac", "2",
    "-b:a", "192k",
    out_master
]

print("Mixing v2 cinematic soundtrack...")
res = subprocess.run(cmd, capture_output=True, text=True)
if res.returncode != 0:
    print("Error:", res.stderr)
else:
    print(f"v2 master soundtrack successfully created at: {out_master}")
