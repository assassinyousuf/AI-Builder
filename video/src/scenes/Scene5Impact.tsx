// Scene 5: The People and the Mission (02:30–03:00 → 900 frames @ 30fps)
// Real Family Remittance Footage, Premium DIU CSE Research Team Showcase, and Final Brand Climax
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

const teamMembers = [
  {
    name: "Md. Mehedi Hasan",
    role: "Lead AI Researcher",
    tag: "DistilBERT Sequence Modeling",
    initials: "MH",
    badgeColor: "#00D4FF",
  },
  {
    name: "Abdul Al Mahin",
    role: "MLOps & Graph Architect",
    tag: "Cytoscape Topology & ONNX",
    initials: "AM",
    badgeColor: "#3986DB",
  },
  {
    name: "Swadhin Chakraborty",
    role: "Full-Stack & Systems",
    tag: "Angular 21 Reactive Signal Store",
    initials: "SC",
    badgeColor: "#10b981",
  },
  {
    name: "Marjanah Afrose",
    role: "NLP & Data Science",
    tag: "Dataset Engineering & Tokenization",
    initials: "MA",
    badgeColor: "#a855f7",
  },
  {
    name: "Md. Ayon Mia",
    role: "Security & AML Specialist",
    tag: "Adversarial Simulation & RBAC",
    initials: "AM",
    badgeColor: "#f59e0b",
  },
  {
    name: "Md. Abdul Based",
    role: "Faculty Advisor & Research Head",
    tag: "Academic Supervision & Review",
    initials: "AB",
    badgeColor: "#FFD700",
  },
];

export const Scene5Impact: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 3 Connected Beats across 900 frames (30s):
  // Beat 1: 0 - 300 (02:30 - 02:40): Real Family Video Call Live Action + $30B Remittance Mission
  // Beat 2: 300 - 660 (02:40 - 02:52): Premium 6-Researcher Department Showcase (DIU CSE)
  // Beat 3: 660 - 900 (02:52 - 03:00): Final Brand Reveal & Confident Closing Resolve

  const brandSpring = spring({ frame: Math.max(0, frame - 680), fps, from: 0.8, to: 1, config: { damping: 14 } });

  const sceneExit = interpolate(frame, [870, 900], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

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
      {/* BEAT 1 (Frames 0 - 300): FAMILY VIDEO CALL FOOTAGE + $30B DATA */}
      {/* ============================================================== */}
      {frame >= 0 && frame < 305 && (
        <AbsoluteFill>
          <Video
            src={staticFile("assets/footage/remittance/act5_family_video_call.mp4")}
            style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.35 }}
            startFrom={5}
          />
          <div style={{ position: "absolute", inset: 0, background: "rgba(5, 5, 9, 0.8)" }} />

          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 100px", textAlign: "center" }}>
            <div style={{ color: "#00D4FF", fontSize: 13, fontWeight: 800, letterSpacing: 4, textTransform: "uppercase", marginBottom: 10 }}>
              Human Purpose · Protecting Families &amp; Livelihoods
            </div>
            <h2 style={{ fontSize: 40, fontWeight: 900, color: "#ffffff", maxWidth: 1100, lineHeight: 1.25 }}>
              Safeguarding Vital Cross-Border Remittance Lifelines
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, width: "100%", maxWidth: 1050, marginTop: 32 }}>
              <div style={{ backgroundColor: "rgba(8, 15, 30, 0.92)", border: "1px solid rgba(0, 212, 255, 0.4)", borderRadius: 20, padding: "26px 20px" }}>
                <div style={{ fontSize: 52, fontWeight: 900, color: "#00D4FF", lineHeight: 1 }}>$30B+</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#ffffff", marginTop: 10 }}>Annual Remittance Flow</div>
                <div style={{ fontSize: 12, color: "#8A96A8", marginTop: 4 }}>Contextual Market Scale</div>
              </div>

              <div style={{ backgroundColor: "rgba(8, 15, 30, 0.92)", border: "1px solid rgba(16, 185, 129, 0.4)", borderRadius: 20, padding: "26px 20px" }}>
                <div style={{ fontSize: 52, fontWeight: 900, color: "#10b981", lineHeight: 1 }}>34,767</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#ffffff", marginTop: 10 }}>Evaluated Sequences</div>
                <div style={{ fontSize: 12, color: "#8A96A8", marginTop: 4 }}>Published Research Dataset</div>
              </div>

              <div style={{ backgroundColor: "rgba(8, 15, 30, 0.92)", border: "1px solid rgba(57, 134, 219, 0.4)", borderRadius: 20, padding: "26px 20px" }}>
                <div style={{ fontSize: 52, fontWeight: 900, color: "#3986DB", lineHeight: 1 }}>92.5%</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#ffffff", marginTop: 10 }}>F0.5 Precision Score</div>
                <div style={{ fontSize: 12, color: "#8A96A8", marginTop: 4 }}>Eliminating False Friction</div>
              </div>
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* ============================================================== */}
      {/* BEAT 2 (Frames 300 - 660): PREMIUM 6-RESEARCHER TEAM SHOWCASE  */}
      {/* ============================================================== */}
      {frame >= 300 && frame < 665 && (
        <AbsoluteFill>
          <Video
            src={staticFile("assets/footage/remittance/act5_family_home.mp4")}
            style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.15 }}
            startFrom={0}
          />
          <div style={{ position: "absolute", inset: 0, background: "rgba(5, 5, 9, 0.88)" }} />

          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 80px" }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ color: "#00D4FF", fontSize: 12, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase" }}>
                Research &amp; Engineering Team
              </div>
              <h2 style={{ fontSize: 32, fontWeight: 900, color: "#ffffff", marginTop: 4 }}>
                Department of Computer Science &amp; Engineering · Dhaka International University
              </h2>
            </div>

            {/* Clean 6-Member Grid with Academic Portrait Insignia */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, width: "100%", maxWidth: 1100 }}>
              {teamMembers.map((m, idx) => {
                const cardSpring = spring({
                  frame: Math.max(0, frame - 300 - idx * 10),
                  fps,
                  from: 0.85,
                  to: 1,
                  config: { damping: 14 },
                });
                return (
                  <div
                    key={m.name}
                    style={{
                      transform: `scale(${cardSpring})`,
                      backgroundColor: "rgba(8, 15, 30, 0.94)",
                      border: `1.5px solid ${m.badgeColor}44`,
                      borderRadius: 16,
                      padding: "16px 18px",
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      boxShadow: "0 10px 25px rgba(0,0,0,0.6)",
                    }}
                  >
                    {/* Consistent Academic Portrait Insignia Frame */}
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        backgroundColor: `${m.badgeColor}18`,
                        border: `2px solid ${m.badgeColor}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#ffffff",
                        fontSize: 16,
                        fontWeight: 900,
                        flexShrink: 0,
                        boxShadow: `0 0 15px ${m.badgeColor}33`,
                      }}
                    >
                      {m.initials}
                    </div>
                    <div>
                      <div style={{ color: "#ffffff", fontSize: 15, fontWeight: 800 }}>{m.name}</div>
                      <div style={{ color: m.badgeColor, fontSize: 12, fontWeight: 700, marginTop: 2 }}>{m.role}</div>
                      <div style={{ color: "#8A96A8", fontSize: 11, marginTop: 2 }}>{m.tag}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 20, color: "#64748b", fontSize: 11, letterSpacing: 1, textTransform: "uppercase" }}>
              Taylor &amp; Francis Research Chapter · DistilBERT Transformer Behavioral Sequences
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* ============================================================== */}
      {/* BEAT 3 (Frames 660 - 900): FINAL BRAND REVEAL & RESOLVE        */}
      {/* ============================================================== */}
      {frame >= 660 && (
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "0 100px",
            background: "radial-gradient(circle at 50% 50%, rgba(18, 59, 105, 0.35) 0%, rgba(5, 5, 9, 0.98) 75%)",
          }}
        >
          <div style={{ transform: `scale(${brandSpring})`, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <svg width={120} height={135} viewBox="0 0 130 145" fill="none">
              <defs>
                <linearGradient id="s5Grad" x1="0" y1="0" x2="130" y2="145" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#00D4FF" />
                  <stop offset="0.5" stopColor="#3986DB" />
                  <stop offset="1" stopColor="#123B69" />
                </linearGradient>
              </defs>
              <path
                d="M65 8 L120 32 V78 C120 110 65 137 65 137 C65 137 10 110 10 78 V32 L65 8 Z"
                stroke="url(#s5Grad)"
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
            <div style={{ color: "#00D4FF", fontSize: 16, fontWeight: 800, letterSpacing: 4, textTransform: "uppercase", marginTop: 4 }}>
              Next-Generation Financial Defense
            </div>
            <div style={{ color: "#ffffff", fontSize: 18, fontWeight: 600, marginTop: 12 }}>
              Secure. Explainable. Buildable.
            </div>
            <div style={{ color: "#8A96A8", fontSize: 13, marginTop: 12 }}>
              Department of Computer Science &amp; Engineering · Dhaka International University
            </div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
