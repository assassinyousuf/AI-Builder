import os, subprocess

AUDIO_DIR = r"d:\daffodil\video\public\assets\audio"
BG_MUSIC = os.path.join(AUDIO_DIR, "background_music.mp3")
MASTER_OUT = os.path.join(AUDIO_DIR, "fraudshield_v3_master_audio.mp3")

# Act voiceover paths
ACT1_VO = os.path.join(AUDIO_DIR, "v3_act1.mp3")
ACT2_VO = os.path.join(AUDIO_DIR, "v3_act2.mp3")
ACT3_VO = os.path.join(AUDIO_DIR, "v3_act3.mp3")
ACT4_VO = os.path.join(AUDIO_DIR, "v3_act4.mp3")
ACT5_VO = os.path.join(AUDIO_DIR, "v3_act5.mp3")

# SFX paths
SFX_ALERT = os.path.join(AUDIO_DIR, "sfx_alert.mp3")
SFX_BLOCKED = os.path.join(AUDIO_DIR, "sfx_blocked.mp3")
SFX_CHIME = os.path.join(AUDIO_DIR, "sfx_chime.mp3")
SFX_CLICK = os.path.join(AUDIO_DIR, "sfx_click.mp3")
SFX_IMPACT = os.path.join(AUDIO_DIR, "sfx_impact.mp3")
SFX_SWOOSH = os.path.join(AUDIO_DIR, "sfx_swoosh.mp3")

filter_complex = (
    # Inputs:
    # 0: BG music (loop or trim to 180s)
    # 1: Act 1 VO (delay 500ms)
    # 2: Act 2 VO (delay 30500ms)
    # 3: Act 3 VO (delay 60500ms)
    # 4: Act 4 VO (delay 120500ms)
    # 5: Act 5 VO (delay 150500ms)
    # 6: SFX alert (2.5s)
    # 7: SFX chime (6.2s)
    # 8: SFX swoosh (29.5s)
    # 9: SFX chime (31.0s)
    # 10: SFX click (62.5s)
    # 11: SFX blocked (73.5s)
    # 12: SFX chime (86.0s)
    # 13: SFX click (110.0s)
    # 14: SFX swoosh (119.5s)
    # 15: SFX impact (149.5s)
    "[0:a]aloop=loop=-1:size=2e+09,atrim=0:180,volume=0.22,afade=t=out:st=177:d=3[bg];"
    "[1:a]adelay=500|500,volume=1.05[vo1];"
    "[2:a]adelay=30500|30500,volume=1.05[vo2];"
    "[3:a]adelay=60500|60500,volume=1.05[vo3];"
    "[4:a]adelay=120500|120500,volume=1.05[vo4];"
    "[5:a]adelay=150500|150500,volume=1.05[vo5];"
    "[6:a]adelay=2500|2500,volume=0.6[sfx1];"
    "[7:a]adelay=6200|6200,volume=0.5[sfx2];"
    "[8:a]adelay=29500|29500,volume=0.55[sfx3];"
    "[9:a]adelay=31000|31000,volume=0.6[sfx4];"
    "[10:a]adelay=62500|62500,volume=0.55[sfx5];"
    "[11:a]adelay=73500|73500,volume=0.75[sfx6];"
    "[12:a]adelay=86000|86000,volume=0.5[sfx7];"
    "[13:a]adelay=110000|110000,volume=0.45[sfx8];"
    "[14:a]adelay=119500|119500,volume=0.55[sfx9];"
    "[15:a]adelay=149500|149500,volume=0.7[sfx10];"
    "[bg][vo1][vo2][vo3][vo4][vo5][sfx1][sfx2][sfx3][sfx4][sfx5][sfx6][sfx7][sfx8][sfx9][sfx10]amix=inputs=16:duration=first:dropout_transition=2[mixed];"
    "[mixed]loudnorm=I=-16:TP=-1.5:LRA=11[out]"
)

cmd = [
    "ffmpeg", "-y",
    "-i", BG_MUSIC,
    "-i", ACT1_VO,
    "-i", ACT2_VO,
    "-i", ACT3_VO,
    "-i", ACT4_VO,
    "-i", ACT5_VO,
    "-i", SFX_ALERT,
    "-i", SFX_CHIME,
    "-i", SFX_SWOOSH,
    "-i", SFX_CHIME,
    "-i", SFX_CLICK,
    "-i", SFX_BLOCKED,
    "-i", SFX_CHIME,
    "-i", SFX_CLICK,
    "-i", SFX_SWOOSH,
    "-i", SFX_IMPACT,
    "-filter_complex", filter_complex,
    "-map", "[out]",
    "-t", "180.0",
    "-c:a", "libmp3lame",
    "-b:a", "192k",
    MASTER_OUT
]

print("Mixing master audio...")
subprocess.run(cmd, check=True)
print("Finished mixing master audio:", MASTER_OUT)

# Check volume and duration
check_cmd = ["ffmpeg", "-i", MASTER_OUT, "-af", "volumedetect", "-f", "null", "-"]
subprocess.run(check_cmd)
