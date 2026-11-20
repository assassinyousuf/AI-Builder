import subprocess
import os

AUDIO_DIR = r"d:\daffodil\video\public\assets\audio"
SFX_DIR = r"d:\daffodil\openmontage-eval\.agents\skills\hyperframes-media\assets\sfx"

act1 = os.path.join(AUDIO_DIR, "v3_act1.mp3")
act2 = os.path.join(AUDIO_DIR, "v3_act2.mp3")
act3 = os.path.join(AUDIO_DIR, "v3_act3.mp3")
act4 = os.path.join(AUDIO_DIR, "v3_act4.mp3")
act5 = os.path.join(AUDIO_DIR, "v3_act5.mp3")

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

out_master = os.path.join(AUDIO_DIR, "fraudshield_v3_master_audio.mp3")

filter_complex = (
    # Voices placed at exact act start offsets (with 400ms lead-in)
    "[0:a]adelay=400|400,volume=1.05[v1];"
    "[1:a]adelay=30400|30400,volume=1.05[v2];"
    "[2:a]adelay=60400|60400,volume=1.05[v3];"
    "[3:a]adelay=120400|120400,volume=1.05[v4];"
    "[4:a]adelay=150400|150400,volume=1.05[v5];"
    # SFX
    "[5:a]adelay=3200|3200,volume=0.40[s_notif];"
    "[6:a]adelay=7500|7500,volume=0.30[s_click_soft];"
    "[7:a]adelay=28500|28500,volume=0.30[s_whoosh];"
    "[8:a]adelay=31500|31500,volume=0.25[s_chime];"
    "[9:a]adelay=74000|74000,volume=0.35[s_ping];"
    "[10:a]adelay=86000|86000,volume=0.25[s_sparkle];"
    "[11:a]adelay=98500|98500,volume=0.25[s_click];"
    "[12:a]adelay=109000|109000,volume=0.28[s_key];"
    "[13:a]adelay=119200|119200,volume=0.25[s_whoosh_s];"
    "[14:a]adelay=173500|173500,volume=0.40[s_imp];"
    # Ambient Synth Bed
    "aevalsrc=0.04*sin(2*PI*110*t)+0.025*sin(2*PI*164.81*t)+0.02*sin(2*PI*220*t)+0.012*sin(2*PI*329.63*t):s=48000:d=180,lowpass=f=420,volume=0.22,afade=t=out:st=176:d=4[ambient];"
    # Mix all 16 inputs
    "[ambient][v1][v2][v3][v4][v5][s_notif][s_click_soft][s_whoosh][s_chime][s_ping][s_sparkle][s_click][s_key][s_whoosh_s][s_imp]amix=inputs=16:duration=first:dropout_transition=0:normalize=0[mixed];"
    # Clean fade out ending at 180s and EBU R128 loudness normalization
    "[mixed]afade=t=out:st=176.5:d=3.5,loudnorm=I=-23.5:TP=-1.5:LRA=8[outa]"
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

print("Mixing v3 master audio soundtrack...")
res = subprocess.run(cmd, capture_output=True, text=True)
if res.returncode != 0:
    print("Error:", res.stderr)
else:
    print(f"v3 master soundtrack successfully created at: {out_master}")

check_cmd = ["ffmpeg", "-i", out_master, "-af", "volumedetect", "-f", "null", "-"]
subprocess.run(check_cmd)
