// Scene 2: Introducing FraudShield (0:30–1:00 → 900 frames @ 30fps)
// Real Fintech Live-Action, Authentic Research Paper PDF, and Live Application Authentication Video
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Easing,
  useCurrentFrame,
  Video,
  Img,
  staticFile,
} from "remotion";

export const Scene2Intro: React.FC = () => {
  const frame = useCurrentFrame();

  // 4 Connected Beats across 900 frames (30s) with smooth cross-dissolves:
  // Beat 1: 0 - 245 (0:30 - 0:38): Fintech Office Live Action + Engineered Logo Reveal
  // Cross-dissolve: 230 - 250 (20 frames)
  // Beat 2: 230 - 485 (0:38 - 0:46): Real Research Publication Page 1 (Taylor & Francis + DIU CSE)
  // Cross-dissolve: 470 - 490 (20 frames)
  // Beat 3: 470 - 725 (0:46 - 0:54): Live Application Authentication Video & 4-Tier RBAC
  // Cross-dissolve: 710 - 730 (20 frames)
  // Beat 4: 710 - 900 (0:54 - 1:00): Behavioral Sequence Modeling & Evaluation Benchmarks

  // Head entrance (0 - 20): Smooth continuity from Scene 1
  const headScale = interpolate(frame, [0, 20], [1.04, 1.0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateRight: "clamp",
  });
  const headOpacity = interpolate(frame, [0, 15], [0.85, 1.0], {
    extrapolateRight: "clamp",
  });

  // Tail exit (885 - 900): Subtle forward focus into Scene 3's interface
  const tailScale = interpolate(frame, [885, 900], [1.0, 0.98], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const logoScale = interpolate(frame, [0, 45], [0.88, 1.0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateRight: "clamp",
  });

  const researchMetrics = [
    { val: "66M", label: "Model Parameters", sub: "Lightweight DistilBERT Core", color: "#00D4FF" },
    { val: "92.5%", label: "F0.5 Precision Score", sub: "Published Benchmark (Table 1.4)", color: "#10b981" },
    { val: "92.1%", label: "F1 Score", sub: "Harmonic Class Balance", color: "#3986DB" },
    { val: "93.6%", label: "F2 Score", sub: "Recall-Oriented Coverage", color: "#a855f7" },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#050509",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        overflow: "hidden",
        opacity: headOpacity,
        transform: `scale(${frame < 20 ? headScale : tailScale})`,
      }}
    >
      {/* ============================================================== */}
      {/* BEAT 1 (Frames 0 - 245): FINTECH FOOTAGE + LOGO REVEAL         */}
      {/* ============================================================== */}
      {frame < 250 && (
        <AbsoluteFill
          style={{
            opacity:
              frame < 230
                ? 1
                : interpolate(frame, [230, 250], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        >
          <Video
            src={staticFile("assets/footage/banking/act2_fintech_office.mp4")}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            startFrom={10}
          />
          <div style={{ position: "absolute", inset: 0, background: "rgba(5, 5, 9, 0.75)" }} />

          {/* Centered Engineered Logo & Identity with subtle breathing ease */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${logoScale})`,
            }}
          >
            <svg width={120} height={135} viewBox="0 0 130 145" fill="none">
              <defs>
                <linearGradient id="s2Grad" x1="0" y1="0" x2="130" y2="145" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#00D4FF" />
                  <stop offset="0.5" stopColor="#3986DB" />
                  <stop offset="1" stopColor="#123B69" />
                </linearGradient>
              </defs>
              <path
                d="M65 8 L120 32 V78 C120 110 65 137 65 137 C65 137 10 110 10 78 V32 L65 8 Z"
                stroke="url(#s2Grad)"
                strokeWidth="4"
                strokeLinejoin="round"
                fill="rgba(8, 15, 30, 0.9)"
              />
              <path
                d="M65 26 L102 44 V74 C102 96 65 116 65 116 C65 116 28 96 28 74 V44 L65 26 Z"
                stroke="#00D4FF"
                strokeWidth="1.5"
                strokeOpacity="0.6"
                fill="rgba(0, 212, 255, 0.08)"
              />
              <circle cx="65" cy="70" r="10" fill="#00D4FF" />
            </svg>

            <h1 style={{ fontSize: 56, fontWeight: 900, color: "#ffffff", letterSpacing: -1, marginTop: 16 }}>
              FraudShield
            </h1>
            <div
              style={{
                color: "#00D4FF",
                fontSize: 15,
                fontWeight: 800,
                letterSpacing: 4,
                textTransform: "uppercase",
                marginTop: 4,
              }}
            >
              Behavioral Banking Sequence Intelligence
            </div>
            <div style={{ color: "#8A96A8", fontSize: 13, marginTop: 8 }}>
              Department of Computer Science &amp; Engineering · Dhaka International University
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* ============================================================== */}
      {/* BEAT 2 (Frames 230 - 485): AUTHENTIC RESEARCH PAPER SCAN       */}
      {/* ============================================================== */}
      {frame >= 230 && frame < 490 && (
        <AbsoluteFill
          style={{
            opacity:
              frame < 250
                ? interpolate(frame, [230, 250], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
                : frame < 470
                ? 1
                : interpolate(frame, [470, 490], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 90px",
            background:
              "radial-gradient(circle at 65% 50%, rgba(18, 59, 105, 0.35) 0%, rgba(5, 5, 9, 0.98) 75%)",
          }}
        >
          {/* Left: Scientific Credential Details */}
          <div
            style={{
              maxWidth: 580,
              opacity: interpolate(frame, [240, 260], [0, 1], { extrapolateRight: "clamp" }),
              transform: `translateX(${interpolate(frame, [240, 260], [-20, 0], {
                easing: Easing.bezier(0.16, 1, 0.3, 1),
                extrapolateRight: "clamp",
              })}px)`,
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: "6px 14px",
                borderRadius: 20,
                backgroundColor: "rgba(0, 212, 255, 0.15)",
                border: "1px solid rgba(0, 212, 255, 0.4)",
                color: "#00D4FF",
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              Peer-Reviewed Foundation · Taylor &amp; Francis
            </div>

            <h2 style={{ fontSize: 36, fontWeight: 900, color: "#ffffff", lineHeight: 1.25, margin: "16px 0 14px 0" }}>
              Published Academic Research
            </h2>

            <p style={{ color: "#8A96A8", fontSize: 14, lineHeight: 1.6, margin: "0 0 20px 0" }}>
              "Fraud Detection with DistilBERT: A Transformer-Based Approach to Behavioral Banking Sequences"
            </p>

            <div
              style={{
                backgroundColor: "rgba(8, 15, 30, 0.9)",
                border: "1px solid rgba(0, 212, 255, 0.25)",
                borderRadius: 16,
                padding: "18px 22px",
              }}
            >
              <div
                style={{
                  color: "#00D4FF",
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                }}
              >
                Official Academic Affiliation
              </div>
              <div style={{ color: "#ffffff", fontSize: 16, fontWeight: 800, marginTop: 4 }}>
                Dhaka International University (DIU CSE)
              </div>
              <div style={{ color: "#8A96A8", fontSize: 12, marginTop: 4 }}>
                Department of Computer Science &amp; Engineering · Dhaka, Bangladesh
              </div>
            </div>
          </div>

          {/* Right: 2.5D High-Res Page 1 Render with subtle floating parallax */}
          <div
            style={{
              width: 480,
              height: 560,
              borderRadius: 16,
              overflow: "hidden",
              border: "2px solid rgba(0, 212, 255, 0.4)",
              boxShadow: "0 25px 60px rgba(0,0,0,0.9), 0 0 40px rgba(0, 212, 255, 0.2)",
              transform: `perspective(1000px) rotateY(${interpolate(frame, [240, 480], [-8, -4])}deg) rotateX(4deg) translateY(${interpolate(
                frame,
                [240, 480],
                [6, -6]
              )}px)`,
            }}
          >
            <Img
              src={staticFile("assets/research/paper_page_1.png")}
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
            />
          </div>
        </AbsoluteFill>
      )}

      {/* ============================================================== */}
      {/* BEAT 3 (Frames 470 - 725): LIVE APPLICATION AUTHENTICATION VIDEO*/}
      {/* ============================================================== */}
      {frame >= 470 && frame < 730 && (
        <AbsoluteFill
          style={{
            opacity:
              frame < 490
                ? interpolate(frame, [470, 490], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
                : frame < 710
                ? 1
                : interpolate(frame, [710, 730], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 80px",
            background:
              "radial-gradient(circle at 40% 50%, rgba(18, 59, 105, 0.3) 0%, rgba(5, 5, 9, 0.98) 75%)",
          }}
        >
          {/* Left: Live Authentication Video Capture */}
          <div
            style={{
              width: 720,
              height: 480,
              borderRadius: 20,
              overflow: "hidden",
              border: "2px solid rgba(0, 212, 255, 0.4)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.85)",
              backgroundColor: "#080F1E",
            }}
          >
            <Video
              src={staticFile("assets/recordings/rec_module0_signin.mp4")}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              startFrom={0}
            />
          </div>

          {/* Right: Enterprise Security Details */}
          <div
            style={{
              maxWidth: 440,
              opacity: interpolate(frame, [480, 500], [0, 1], { extrapolateRight: "clamp" }),
              transform: `translateX(${interpolate(frame, [480, 500], [20, 0], {
                easing: Easing.bezier(0.16, 1, 0.3, 1),
                extrapolateRight: "clamp",
              })}px)`,
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: "6px 14px",
                borderRadius: 20,
                backgroundColor: "rgba(16, 185, 129, 0.15)",
                border: "1px solid rgba(16, 185, 129, 0.4)",
                color: "#10b981",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              Native Enterprise Perimeter
            </div>

            <h2 style={{ fontSize: 32, fontWeight: 900, color: "#ffffff", lineHeight: 1.25, margin: "14px 0 10px 0" }}>
              Multi-Tenant Auth &amp; 4-Tier RBAC
            </h2>

            <p style={{ color: "#8A96A8", fontSize: 13, lineHeight: 1.5, margin: "0 0 16px 0" }}>
              Complete identity isolation for financial institutions. Strict separation of duties across all four
              roles:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { role: "OWNER", desc: "Full Tenant Authority & Consortium Config", c: "#a855f7" },
                { role: "ADMINISTRATOR", desc: "System Policies & Simulation Sandboxes", c: "#00D4FF" },
                { role: "FRAUD ANALYST", desc: "Real-Time Monitoring & Threat Clearance", c: "#10b981" },
                { role: "INVESTIGATOR", desc: "Forensic Case Dossiers & SAR Reporting", c: "#f59e0b" },
              ].map((r, idx) => (
                <div
                  key={r.role}
                  style={{
                    backgroundColor: "rgba(8, 15, 30, 0.9)",
                    border: `1px solid ${r.c}44`,
                    borderRadius: 10,
                    padding: "8px 14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    opacity: interpolate(frame, [490 + idx * 12, 505 + idx * 12], [0, 1], {
                      extrapolateRight: "clamp",
                    }),
                    transform: `translateX(${interpolate(frame, [490 + idx * 12, 505 + idx * 12], [10, 0], {
                      easing: Easing.bezier(0.16, 1, 0.3, 1),
                      extrapolateRight: "clamp",
                    })}px)`,
                  }}
                >
                  <span style={{ color: r.c, fontSize: 11, fontWeight: 800, letterSpacing: 1 }}>{r.role}</span>
                  <span style={{ color: "#8A96A8", fontSize: 11 }}>{r.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* ============================================================== */}
      {/* BEAT 4 (Frames 710 - 900): RESEARCH BENCHMARK SUMMARY CARDS    */}
      {/* ============================================================== */}
      {frame >= 710 && (
        <AbsoluteFill
          style={{
            opacity: interpolate(frame, [710, 730], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 90px",
            background:
              "radial-gradient(circle at 50% 50%, rgba(18, 59, 105, 0.35) 0%, rgba(5, 5, 9, 0.98) 75%)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <span
              style={{
                color: "#00D4FF",
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: 3,
                textTransform: "uppercase",
              }}
            >
              Empirical Performance Validation
            </span>
            <h2 style={{ fontSize: 36, fontWeight: 900, color: "#ffffff", marginTop: 6 }}>
              Published Peer-Reviewed Results
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 18,
              width: "100%",
              maxWidth: 1100,
            }}
          >
            {researchMetrics.map((m, idx) => (
              <div
                key={m.label}
                style={{
                  backgroundColor: "rgba(8, 15, 30, 0.9)",
                  border: `1px solid ${m.color}55`,
                  borderRadius: 18,
                  padding: "24px 20px",
                  textAlign: "center",
                  boxShadow: `0 15px 35px rgba(0,0,0,0.6)`,
                  transform: `scale(${interpolate(frame, [720 + idx * 8, 745 + idx * 8], [0.94, 1.0], {
                    easing: Easing.bezier(0.16, 1, 0.3, 1),
                    extrapolateRight: "clamp",
                  })})`,
                  opacity: interpolate(frame, [720 + idx * 8, 740 + idx * 8], [0, 1], {
                    extrapolateRight: "clamp",
                  }),
                }}
              >
                <div style={{ fontSize: 44, fontWeight: 900, color: m.color, lineHeight: 1 }}>{m.val}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#ffffff", marginTop: 10 }}>{m.label}</div>
                <div style={{ fontSize: 11, color: "#8A96A8", marginTop: 4 }}>{m.sub}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24, color: "#64748b", fontSize: 12, letterSpacing: 1 }}>
            RESEARCH DATASET: 34,767 BANKING SEQUENCES · DIU CSE RESEARCH CHAPTER
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
