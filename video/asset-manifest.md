# FraudShield — Asset Register & Licensing Manifest (v3 Creative Overhaul)

### Video Specifications
- **Master Render Target**: `out/fraudshield-pitch-v3.mp4`
- **Resolution**: 1920 × 1080 (Full HD, 16:9)
- **Framerate**: 30.000 FPS
- **Duration**: Exactly 180.000 seconds (5,400 frames)
- **Video Codec**: H.264 (High Profile, CRF 18, `yuv420p` pixel format)
- **Audio Codec**: AAC Stereo, 48,000 Hz, 192 kbps
- **Preserved Backups**:
  - `out/fraudshield-pitch-v2.mp4` (66.4 MB)
  - `out/fraudshield-cinematic-master.mp4` (57.1 MB)
  - `out/fraudshield-pitch-final.mp4` (17.8 MB)
  - `out/fraudshield-pitch.mp4` (10.3 MB)

---

### Authentic Live Application Screen Recordings (`public/assets/recordings/`)
Recorded directly from the running FraudShield application via Chromium CDP / Playwright at native 1080p:

| Local Asset Path | Resolution / FPS | Duration | Application Module | Description & Interaction |
| :--- | :--- | :--- | :--- | :--- |
| `rec_module0_signin.mp4` | 1920×1080 @ 30 fps | 6.0s | `/auth/sign-in` | Authentic browser login, credentials entry, and workspace transition |
| `rec_module1_simulator.mp4` | 1920×1080 @ 30 fps | 11.0s | `/app/simulator` | Selecting Account Takeover scenario, clicking Launch Simulation, live staged event progression, detection summary card |
| `rec_module2_monitoring.mp4` | 1920×1080 @ 30 fps | 11.0s | `/app/monitoring` | Real-time stream updating, TXN-4821 arriving in red ($4,800, Risk 96, BLOCKED), clicking row, slide-out Transaction Drawer |
| `rec_module3_explainability.mp4`| 1920×1080 @ 30 fps| 11.0s | `/app/explainability`| ECharts SHAP waterfall inspection, clicking Generate Explanation $\to$ deterministic reason code `[GEO_VELOCITY_ANOMALY]` |
| `rec_module4_fraud_network.mp4` | 1920×1080 @ 30 fps| 11.0s | `/app/fraud-network` | Cytoscape interactive graph physics settling, clicking Mule Ring cluster, inspecting shared device node `DEV-9921-X` |
| `rec_module5_copilot.mp4` | 1920×1080 @ 30 fps| 11.0s | `/app/copilot` | Clicking investigation prompt, animated typing dots, live executive SAR audit brief streaming with evidence citation |

---

### Genuine Live-Action Stock Video Register
All stock video footage was sourced from **Mixkit** under the **Mixkit Free Stock Video Commercial License** (Permits worldwide commercial & non-commercial video production, broadcast, online distribution, with no watermarks and no required on-screen attribution).

| Local Asset Path | Resolution / FPS | Duration | Source / Provider | License Type | Production Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `assets/footage/human/act1_night_city.mp4` | 1280×720 @ 23.98 fps | 27.0s | Mixkit (Clip #42343) | Mixkit Free License | Act 1: Night city transit corridor |
| `assets/footage/human/act1_sleeping_phone.mp4`| 1280×720 @ 24.00 fps | 12.0s | Mixkit (Clip #4908) | Mixkit Free License | Act 1: Sleeping bedside phone alert (03:15 AM) |
| `assets/footage/banking/act1_credit_card_pos.mp4`| 1280×720 @ 23.98 fps| 20.5s | Mixkit (Clip #35902) | Mixkit Free License | Act 1: Contactless POS card tap checkout probe |
| `assets/footage/banking/act1_atm_withdrawal.mp4`| 1280×720 @ 23.98 fps | 15.0s | Mixkit (Clip #21911) | Mixkit Free License | Act 1: Automated teller machine cash liquidation |
| `assets/footage/technology/act1_cyber_threat.mp4`| 1280×720 @ 25.00 fps| 26.0s | Mixkit (Clip #23704) | Mixkit Free License | Act 1: Global cyber data network nodes overlay |
| `assets/footage/banking/act2_fintech_office.mp4`| 1280×720 @ 24.00 fps | 18.3s | Mixkit (Clip #1728) | Mixkit Free License | Act 2: Financial technology professionals in office |
| `assets/footage/technology/act3_soc_analyst.mp4`| 1280×720 @ 59.94 fps | 25.9s | Mixkit (Clip #46634) | Mixkit Free License | Act 3: Security Operations Center (SOC) cutaway |
| `assets/footage/technology/act3_datacenter_servers.mp4`| 1280×720 @ 25.00 fps| 15.4s | Mixkit (Clip #23219) | Mixkit Free License | Act 3: Datacenter optical server corridor cutaway |
| `assets/footage/technology/act4_developer_coding.mp4`| 1280×720 @ 59.94 fps| 17.1s | Mixkit (Clip #47321) | Mixkit Free License | Act 4: Software engineer coding PyTorch transformer |
| `assets/footage/technology/act4_server_lights.mp4`| 1280×720 @ 24.00 fps | 11.0s | Mixkit (Clip #7887) | Mixkit Free License | Act 4: High-density optical network chassis |
| `assets/footage/remittance/act5_family_video_call.mp4`| 1280×720 @ 29.97 fps| 24.6s | Mixkit (Clip #6213) | Mixkit Free License | Act 1 & 5: Migrant family video call cold open |
| `assets/footage/remittance/act5_family_home.mp4`| 1280×720 @ 30.00 fps | 8.8s | Mixkit (Clip #4542) | Mixkit Free License | Act 5: Warm family home setting transitioning to team |

---

### Research Assets (`assets/research/`)
| Local Asset Path | Source | Description / Role |
| :--- | :--- | :--- |
| `assets/research/590_Camera Ready (1).pdf` | Original PDF (645 KB) | Taylor & Francis peer-reviewed book chapter manuscript |
| `assets/research/paper_page_1.png` | PyMuPDF High-Res Render (200 DPI) | Page 1 publication title, book chapter imprint & abstract |
| `assets/research/paper_page_6.png` | PyMuPDF High-Res Render (200 DPI) | Page 6 Figure 1.2 Pipeline Architecture |
| `assets/research/paper_page_14.png`| PyMuPDF High-Res Render (200 DPI) | Page 14 Table 1.4 Baseline Evaluation Comparison Table |

---

### Master Audio & Sound Effects (`assets/audio/`)
- `assets/audio/fraudshield_v3_master_audio.mp3`: 180.00s master soundtrack (EBU R128 mastered, -23.5 dB LUFS mean volume, -1.5 dB true peak headroom).
- Synchronized SFX Cue Sheet:
  - 00:03.200 (Act 1): `notification.mp3` (-10 dB) — 3:15 AM smartphone notification ping
  - 00:07.500 (Act 1): `click-soft.mp3` (-12 dB) — POS contactless card tap
  - 00:28.500 (Act 1 $\to$ 2): `whoosh-cinematic.mp3` (-12 dB) — Transition into FraudShield reveal
  - 00:31.500 (Act 2): `chime.mp3` (-14 dB) — FraudShield 3D shield lockup
  - 01:14.000 (Act 3): `ping.mp3` (-10 dB) — Sub-15ms automated block ping
  - 01:26.000 (Act 3): `sparkle.mp3` (-14 dB) — SHAP feature explainability decomposition
  - 01:38.500 (Act 3): `click.mp3` (-12 dB) — Cytoscape graph cluster click
  - 01:49.000 (Act 3): `key-press.mp3` (-12 dB) — AI Copilot SAR report generation
  - 01:59.200 (Act 3 $\to$ 4): `whoosh-short.mp3` (-12 dB) — Transition to Architecture
  - 02:53.500 (Act 5): `impact-bass-2.mp3` (-8 dB) — Final brand lockup resolve
