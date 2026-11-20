// Scene 1: The Human Cost of Invisible Fraud (0:00–0:30 → 900 frames @ 30fps)
// Fast-Paced Documentary Montage: Real Human Impact, Bedside Threat, Rapid Botnet Drainage
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Video,
  staticFile,
} from "remotion";

export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 6 Rapid Documentary Beats across 900 frames (30s):
  // Beat 1: 0 - 75 (00:00 - 00:02.5): Migrant Worker Family Connection (Human Connection Cold Open)
  // Beat 2: 75 - 195 (00:02.5 - 00:06.5): 3:15 AM Bedside Phone Alert
  // Beat 3: 195 - 315 (00:06.5 - 00:10.5): Contactless POS Card Probe ($1.00 Authorization)
  // Beat 4: 315 - 435 (00:10.5 - 00:14.5): ATM Rapid Cash Liquidation
  // Beat 5: 435 - 630 (00:14.5 - 00:21.0): Cyber Threat Telemetry & 45-Second Drainage Sequence
  // Beat 6: 630 - 900 (00:21.0 - 00:30.0): $81M Historical Precedent & Core Thesis Breakdown

  const thesisSpring = spring({
    frame: Math.max(0, frame - 700),
    fps,
    from: 0.85,
    to: 1,
    config: { damping: 12 },
  });

  const sceneExit = interpolate(frame, [870, 900], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const apiSteps = [
    { time: "03:14:10", action: "POST /auth/login", status: "VALID CREDENTIALS · NEW IP", color: "#10b981" },
    { time: "03:14:22", action: "PATCH /account/password", status: "CREDENTIAL MUTATION", color: "#f59e0b" },
    { time: "03:14:48", action: "POST /beneficiaries/add", status: "JUST-IN-TIME MULE PAYEE", color: "#FF394F" },
    { time: "03:15:01", action: "POST /wire/transfer", status: "$4,800 RAPID DISPATCH (45s)", color: "#FF394F" },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#050509",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        overflow: "hidden",
        opacity: sceneExit,
      }}
    >
      {/* ============================================================== */}
      {/* BEAT 1 (Frames 0 - 75): MIGRANT WORKER FAMILY CALL (COLD OPEN) */}
      {/* ============================================================== */}
      {frame >= 0 && frame < 80 && (
        <AbsoluteFill>
          <Video
            src={staticFile("assets/footage/remittance/act5_family_video_call.mp4")}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            startFrom={10}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(5,5,9,0.85) 0%, rgba(5,5,9,0.2) 50%, rgba(5,5,9,0.7) 100%)" }} />
          {/* Lower Third */}
          <div style={{ position: "absolute", bottom: 60, left: 80, display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#00D4FF", boxShadow: "0 0 12px #00D4FF" }} />
              <span style={{ color: "#00D4FF", fontSize: 13, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase" }}>
                Human Reality · Migrant Remittance Lifeline
              </span>
            </div>
            <h2 style={{ fontSize: 34, fontWeight: 900, color: "#ffffff", margin: 0, letterSpacing: -0.5 }}>
              Rafiq · Dubai Expatriate Sending Monthly Earnings Home
            </h2>
          </div>
        </AbsoluteFill>
      )}

      {/* ============================================================== */}
      {/* BEAT 2 (Frames 75 - 195): BEDSIDE PHONE ALERT (LIVE ACTION)    */}
      {/* ============================================================== */}
      {frame >= 75 && frame < 200 && (
        <AbsoluteFill>
          <Video
            src={staticFile("assets/footage/human/act1_sleeping_phone.mp4")}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            startFrom={15}
          />
          <div style={{ position: "absolute", inset: 0, background: "rgba(5, 5, 9, 0.45)" }} />
          {/* High-Contrast Banking Notification Callout */}
          <div
            style={{
              position: "absolute",
              top: 80,
              right: 80,
              width: 460,
              backgroundColor: "rgba(8, 15, 30, 0.94)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 57, 79, 0.5)",
              borderRadius: 20,
              padding: "22px 26px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(255, 57, 79, 0.2)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#FF394F", animation: "pulse 1.5s infinite" }} />
                <span style={{ color: "#FF394F", fontSize: 11, fontWeight: 800, letterSpacing: 1.5 }}>ALERT · 03:15:01 AM</span>
              </div>
              <span style={{ color: "#8A96A8", fontSize: 11 }}>PUSH NOTIFICATION</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#ffffff", letterSpacing: -0.5 }}>
              $4,800.00 Outbound Wire
            </div>
            <div style={{ color: "#00D4FF", fontSize: 13, fontWeight: 600, marginTop: 4 }}>
              Destination: Mule Payee (Dubai / Manila)
            </div>
            <div style={{ color: "#8A96A8", fontSize: 11, marginTop: 10, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 10 }}>
              Preceded by $1.00 micro-probe authorization 45s earlier.
            </div>
          </div>

          <div style={{ position: "absolute", bottom: 60, left: 80 }}>
            <span style={{ color: "#FF394F", fontSize: 13, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase" }}>
              The 3:15 AM Ambush
            </span>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: "#ffffff", margin: "4px 0 0 0" }}>
              Account Drained in 45 Seconds While He Sleeps
            </h2>
          </div>
        </AbsoluteFill>
      )}

      {/* ============================================================== */}
      {/* BEAT 3 (Frames 195 - 315): POS CARD PAYMENT TAP                */}
      {/* ============================================================== */}
      {frame >= 195 && frame < 320 && (
        <AbsoluteFill>
          <Video
            src={staticFile("assets/footage/banking/act1_credit_card_pos.mp4")}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            startFrom={5}
          />
          <div style={{ position: "absolute", inset: 0, background: "rgba(5, 5, 9, 0.45)" }} />
          <div style={{ position: "absolute", bottom: 60, left: 80, maxWidth: 800 }}>
            <span style={{ color: "#00D4FF", fontSize: 13, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase" }}>
              Automated Micro-Testing
            </span>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: "#ffffff", margin: "4px 0 0 0" }}>
              Bot Farms Test Stolen Cards with Tiny $1.00 Charges
            </h2>
          </div>
        </AbsoluteFill>
      )}

      {/* ============================================================== */}
      {/* BEAT 4 (Frames 315 - 435): ATM RAPID DISPENSE                  */}
      {/* ============================================================== */}
      {frame >= 315 && frame < 440 && (
        <AbsoluteFill>
          <Video
            src={staticFile("assets/footage/banking/act1_atm_withdrawal.mp4")}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            startFrom={5}
          />
          <div style={{ position: "absolute", inset: 0, background: "rgba(5, 5, 9, 0.55)" }} />
          <div style={{ position: "absolute", bottom: 60, left: 80, maxWidth: 850 }}>
            <span style={{ color: "#FF394F", fontSize: 13, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase" }}>
              Mule Account Liquidation
            </span>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: "#ffffff", margin: "4px 0 0 0" }}>
              Instant ATM Cashouts Across Transnational Corridors
            </h2>
          </div>
        </AbsoluteFill>
      )}

      {/* ============================================================== */}
      {/* BEAT 5 (Frames 435 - 630): CYBER THREAT & 45S API TELEMETRY     */}
      {/* ============================================================== */}
      {frame >= 435 && frame < 635 && (
        <AbsoluteFill>
          <Video
            src={staticFile("assets/footage/technology/act1_cyber_threat.mp4")}
            style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.35 }}
            startFrom={10}
          />
          <div style={{ position: "absolute", inset: 0, background: "rgba(5, 5, 9, 0.75)" }} />

          {/* Sequential API Telemetry Card */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 820,
              backgroundColor: "rgba(8, 15, 30, 0.94)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(0, 212, 255, 0.3)",
              borderRadius: 20,
              padding: "30px 36px",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.8)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.08)", pb: 14 }}>
              <div>
                <span style={{ color: "#00D4FF", fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase" }}>
                  Real-World Forensic Telemetry
                </span>
                <h3 style={{ color: "#ffffff", fontSize: 20, fontWeight: 800, margin: "4px 0 0 0" }}>
                  Automated Attack Chain: 45-Second Drainage
                </h3>
              </div>
              <div style={{ padding: "6px 14px", borderRadius: 20, backgroundColor: "rgba(255, 57, 79, 0.15)", border: "1px solid #FF394F", color: "#FF394F", fontSize: 12, fontWeight: 800 }}>
                BYPASSED STATIC RULES
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {apiSteps.map((st, i) => {
                const stepOp = interpolate(frame, [435 + i * 35, 455 + i * 35], [0, 1], { extrapolateRight: "clamp" });
                return (
                  <div
                    key={st.action}
                    style={{
                      opacity: stepOp,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      backgroundColor: "rgba(12, 22, 45, 0.7)",
                      padding: "10px 18px",
                      borderRadius: 10,
                      border: "1px solid rgba(255,255,255,0.06)",
                      fontFamily: "monospace",
                    }}
                  >
                    <span style={{ color: "#8A96A8", fontSize: 12 }}>{st.time}</span>
                    <span style={{ color: "#ffffff", fontSize: 13, fontWeight: 700 }}>{st.action}</span>
                    <span style={{ color: st.color, fontSize: 12, fontWeight: 800 }}>{st.status}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* ============================================================== */}
      {/* BEAT 6 (Frames 630 - 900): $81M HEIST & CORE PARADIGM SHIFT   */}
      {/* ============================================================== */}
      {frame >= 630 && (
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 80px",
            background: "radial-gradient(circle at 50% 50%, rgba(18, 59, 105, 0.35) 0%, rgba(5, 5, 9, 0.98) 75%)",
          }}
        >
          <div
            style={{
              transform: `scale(${thesisSpring})`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              maxWidth: 1050,
            }}
          >
            {/* Historical Precedent Badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 30, backgroundColor: "rgba(255, 57, 79, 0.15)", border: "1px solid rgba(255, 57, 79, 0.4)", marginBottom: 16 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#FF394F" }} />
              <span style={{ color: "#FF394F", fontSize: 12, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase" }}>
                Historical Precedent · $81M Bangladesh Bank Cyber-Heist
              </span>
            </div>

            <h1 style={{ fontSize: 44, fontWeight: 900, color: "#ffffff", lineHeight: 1.2, letterSpacing: -1, margin: "0 0 16px 0" }}>
              "The credentials matched. Static rules saw nothing."
            </h1>

            <p style={{ fontSize: 18, color: "#8A96A8", maxWidth: 840, lineHeight: 1.6, margin: "0 0 32px 0" }}>
              Global digital payment fraud drains <span style={{ color: "#FF394F", fontWeight: 800 }}>$48+ Billion annually</span> because legacy systems evaluate transactions in isolation—completely blind to behavioral intent.
            </p>

            {/* Side-by-side paradigm breakdown */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, width: "100%" }}>
              {/* Legacy Failure */}
              <div style={{ backgroundColor: "rgba(18, 6, 8, 0.8)", border: "1px solid rgba(255, 57, 79, 0.35)", borderRadius: 16, padding: "20px 24px", textAlign: "left" }}>
                <div style={{ color: "#FF394F", fontSize: 13, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase" }}>
                  Legacy Paradigm: Isolated Checks
                </div>
                <div style={{ color: "#ffffff", fontSize: 15, fontWeight: 700, marginTop: 6 }}>
                  Static Filter Failure
                </div>
                <p style={{ color: "#8A96A8", fontSize: 13, marginTop: 4, lineHeight: 1.5 }}>
                  Evaluates each request on individual features. Valid credentials mean zero alarms—letting botnets execute full cashouts.
                </p>
              </div>

              {/* FraudShield Solution */}
              <div style={{ backgroundColor: "rgba(8, 20, 40, 0.85)", border: "1px solid rgba(0, 212, 255, 0.4)", borderRadius: 16, padding: "20px 24px", textAlign: "left" }}>
                <div style={{ color: "#00D4FF", fontSize: 13, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase" }}>
                  FraudShield Paradigm: NLP Sequence
                </div>
                <div style={{ color: "#ffffff", fontSize: 15, fontWeight: 700, marginTop: 6 }}>
                  Behavioral Context Modeling
                </div>
                <p style={{ color: "#8A96A8", fontSize: 13, marginTop: 4, lineHeight: 1.5 }}>
                  Treats banking sessions as language sentences. Intercepts anomalous credential-mutation sequences in under 15 milliseconds.
                </p>
              </div>
            </div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
