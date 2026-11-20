// Scene 4: The Science and Engineering (02:00–02:30 → 900 frames @ 30fps)
// Developer Footage, Optical Server Infrastructure, Transformer Pipeline & Baseline Comparisons
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Easing,
  useCurrentFrame,
  Video,
  staticFile,
} from "remotion";

export const Scene4Architecture: React.FC = () => {
  const frame = useCurrentFrame();

  // 3 Connected Beats across 900 frames (30s) with smooth cross-dissolves:
  // Beat 1: 0 - 305 (02:00 - 02:10): Developer Coding + Behavioral Sequence NLP vs Static Rules
  // Cross-dissolve: 290 - 310 (20 frames)
  // Beat 2: 290 - 605 (02:10 - 02:20): Server Optics + Figure 1.2 Pipeline & Table 1.4 Baseline Chart
  // Cross-dissolve: 590 - 610 (20 frames)
  // Beat 3: 590 - 900 (02:20 - 02:30): Platform Architecture (Verified Prototype vs Production Roadmap)

  // Head entrance (0 - 20): Smooth continuity from Scene 3
  const headScale = interpolate(frame, [0, 20], [1.03, 1.0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateRight: "clamp",
  });
  const headOpacity = interpolate(frame, [0, 15], [0.85, 1.0], {
    extrapolateRight: "clamp",
  });

  // Tail exit (885 - 900): Seamless warm ambient transition into Scene 5
  const tailScale = interpolate(frame, [885, 900], [1.0, 0.98], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const baselineModels = [
    { name: "Logistic Regression", f05: 52.1, f1: 57.3, c: "#64748b" },
    { name: "Decision Tree", f05: 58.9, f1: 62.1, c: "#94a3b8" },
    { name: "Random Forest", f05: 61.2, f1: 68.4, c: "#3986DB" },
    { name: "FraudShield DistilBERT", f05: 92.5, f1: 92.1, c: "#00D4FF", highlight: true },
  ];

  const pipelineStages = [
    { layer: "LAYER 01", name: "Anonymized Action Sequences", desc: "API Endpoint Tokens (/login, /pwd, /wire)", c: "#8A96A8" },
    { layer: "LAYER 02", name: "Subword BPE Tokenizer", desc: "256 Max Window · 30,522 Vocabulary", c: "#3986DB" },
    { layer: "LAYER 03", name: "6-Layer DistilBERT Core", desc: "66M Params · 768-dim Embeddings · 250MB RAM", c: "#00D4FF" },
    { layer: "LAYER 04", name: "Contextual Pooling Head", desc: "Self-Attention Multi-Head Vectors", c: "#6366f1" },
    { layer: "LAYER 05", name: "Classification Cutoff", desc: "Decision Threshold (τ = 0.4375) · 35-50ms CPU", c: "#FF394F" },
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
      {/* BEAT 1 (Frames 0 - 305): BEHAVIORAL SEQUENCE VS STATIC RULES   */}
      {/* ============================================================== */}
      {frame < 310 && (
        <AbsoluteFill
          style={{
            opacity:
              frame < 290
                ? 1
                : interpolate(frame, [290, 310], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        >
          <Video
            src={staticFile("assets/footage/technology/act4_developer_coding.mp4")}
            style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.25 }}
            startFrom={10}
          />
          <div style={{ position: "absolute", inset: 0, background: "rgba(5, 5, 9, 0.85)" }} />

          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 80px",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div
                style={{
                  color: "#00D4FF",
                  fontSize: 13,
                  fontWeight: 800,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                }}
              >
                Scientific Paradigm Shift
              </div>
              <h2 style={{ fontSize: 36, fontWeight: 900, color: "#ffffff", marginTop: 6 }}>
                Modeling Banking Actions as a Language Sequence
              </h2>
            </div>

            {/* Side-by-side conceptual comparison */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 24,
                width: "100%",
                maxWidth: 1050,
              }}
            >
              {/* Traditional */}
              <div
                style={{
                  backgroundColor: "rgba(18, 6, 8, 0.85)",
                  border: "1px solid rgba(255, 57, 79, 0.4)",
                  borderRadius: 18,
                  padding: "24px 28px",
                  opacity: interpolate(frame, [10, 25], [0, 1], { extrapolateRight: "clamp" }),
                  transform: `translateX(${interpolate(frame, [10, 25], [-15, 0], {
                    easing: Easing.bezier(0.16, 1, 0.3, 1),
                    extrapolateRight: "clamp",
                  })}px)`,
                }}
              >
                <div
                  style={{
                    color: "#FF394F",
                    fontSize: 13,
                    fontWeight: 800,
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                  }}
                >
                  Traditional Static Detection
                </div>
                <div style={{ color: "#ffffff", fontSize: 18, fontWeight: 800, marginTop: 8 }}>
                  Isolated Transaction Features
                </div>
                <div style={{ color: "#8A96A8", fontSize: 13, marginTop: 8, lineHeight: 1.6 }}>
                  Examines static fields in isolation: <code style={{ color: "#FF394F" }}>Amount &lt; $5000</code>,{" "}
                  <code style={{ color: "#FF394F" }}>Valid Password</code>. Cannot perceive temporal velocity or
                  session context.
                </div>
                <div
                  style={{
                    marginTop: 16,
                    padding: "8px 14px",
                    borderRadius: 8,
                    backgroundColor: "rgba(255,57,79,0.15)",
                    color: "#FF394F",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  CRITICAL FLAW: Blind to credential-stuffing &amp; automated takeovers
                </div>
              </div>

              {/* FraudShield NLP */}
              <div
                style={{
                  backgroundColor: "rgba(8, 20, 40, 0.9)",
                  border: "1px solid rgba(0, 212, 255, 0.4)",
                  borderRadius: 18,
                  padding: "24px 28px",
                  opacity: interpolate(frame, [15, 30], [0, 1], { extrapolateRight: "clamp" }),
                  transform: `translateX(${interpolate(frame, [15, 30], [15, 0], {
                    easing: Easing.bezier(0.16, 1, 0.3, 1),
                    extrapolateRight: "clamp",
                  })}px)`,
                }}
              >
                <div
                  style={{
                    color: "#00D4FF",
                    fontSize: 13,
                    fontWeight: 800,
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                  }}
                >
                  FraudShield Behavioral Sequence NLP
                </div>
                <div style={{ color: "#ffffff", fontSize: 18, fontWeight: 800, marginTop: 8 }}>
                  Contextual Pseudo-Sentence Modeling
                </div>
                <div style={{ color: "#8A96A8", fontSize: 13, marginTop: 8, lineHeight: 1.6 }}>
                  Treats user actions as words:{" "}
                  <code style={{ color: "#00D4FF" }}>/login → /pwd → /mule_payee → /wire</code>. Recognizes the
                  anomaly of a 45-second high-velocity cashout sequence.
                </div>
                <div
                  style={{
                    marginTop: 16,
                    padding: "8px 14px",
                    borderRadius: 8,
                    backgroundColor: "rgba(0,212,255,0.15)",
                    color: "#00D4FF",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  RESULT: 92.5% F0.5 Score · Sub-15ms real-time interception
                </div>
              </div>
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* ============================================================== */}
      {/* BEAT 2 (Frames 290 - 605): FIGURE 1.2 PIPELINE & BASELINES     */}
      {/* ============================================================== */}
      {frame >= 290 && frame < 610 && (
        <AbsoluteFill
          style={{
            opacity:
              frame < 310
                ? interpolate(frame, [290, 310], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
                : frame < 590
                ? 1
                : interpolate(frame, [590, 610], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        >
          <Video
            src={staticFile("assets/footage/technology/act4_server_lights.mp4")}
            style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.2 }}
            startFrom={5}
          />
          <div style={{ position: "absolute", inset: 0, background: "rgba(5, 5, 9, 0.85)" }} />

          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 80px",
            }}
          >
            {/* Left: Transformer Pipeline Layers (Figure 1.2) */}
            <div style={{ width: 480 }}>
              <div
                style={{
                  color: "#00D4FF",
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                Figure 1.2 Research Architecture
              </div>
              <h2 style={{ fontSize: 28, fontWeight: 900, color: "#ffffff", margin: "0 0 16px 0" }}>
                66M-Parameter DistilBERT
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {pipelineStages.map((st, i) => (
                  <div
                    key={st.layer}
                    style={{
                      backgroundColor: "rgba(8, 15, 30, 0.9)",
                      border: `1px solid ${st.c}44`,
                      borderRadius: 10,
                      padding: "10px 14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      opacity: interpolate(frame, [305 + i * 12, 320 + i * 12], [0, 1], {
                        extrapolateRight: "clamp",
                      }),
                      transform: `translateX(${interpolate(frame, [305 + i * 12, 320 + i * 12], [-15, 0], {
                        easing: Easing.bezier(0.16, 1, 0.3, 1),
                        extrapolateRight: "clamp",
                      })}px)`,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontFamily: "monospace", fontSize: 11, color: st.c, fontWeight: 800 }}>
                        {st.layer}
                      </span>
                      <span style={{ color: "#ffffff", fontSize: 13, fontWeight: 700 }}>{st.name}</span>
                    </div>
                    <span style={{ color: "#8A96A8", fontSize: 11 }}>{st.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Empirical Baseline Comparison Chart (Table 1.4) with animated filling bars */}
            <div
              style={{
                width: 480,
                backgroundColor: "rgba(8, 15, 30, 0.92)",
                border: "1px solid rgba(0, 212, 255, 0.35)",
                borderRadius: 20,
                padding: "24px 28px",
                boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <div>
                  <span
                    style={{
                      color: "#00D4FF",
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: 2,
                      textTransform: "uppercase",
                    }}
                  >
                    Table 1.4 Published Baseline Results
                  </span>
                  <h3 style={{ color: "#ffffff", fontSize: 18, fontWeight: 800, margin: "2px 0 0 0" }}>
                    F0.5 Precision-Oriented Score
                  </h3>
                </div>
                <div style={{ color: "#10b981", fontSize: 12, fontWeight: 800 }}>+31.3% GAIN</div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {baselineModels.map((bm, i) => {
                  const targetWidth = (bm.f05 / 100) * 100;
                  const animatedWidth = interpolate(frame, [330 + i * 14, 375 + i * 14], [0, targetWidth], {
                    easing: Easing.bezier(0.16, 1, 0.3, 1),
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  });
                  return (
                    <div key={bm.name}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 12,
                          marginBottom: 4,
                        }}
                      >
                        <span
                          style={{
                            color: bm.highlight ? "#ffffff" : "#8A96A8",
                            fontWeight: bm.highlight ? 800 : 500,
                          }}
                        >
                          {bm.name}
                        </span>
                        <span style={{ color: bm.c, fontWeight: 800, fontFamily: "monospace" }}>
                          {bm.f05.toFixed(1)}%
                        </span>
                      </div>
                      <div
                        style={{
                          height: 10,
                          width: "100%",
                          backgroundColor: "rgba(255,255,255,0.08)",
                          borderRadius: 5,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${animatedWidth}%`,
                            backgroundColor: bm.c,
                            borderRadius: 5,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div
                style={{
                  marginTop: 20,
                  paddingTop: 14,
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                  display: "flex",
                  justifyContent: "space-between",
                  color: "#8A96A8",
                  fontSize: 11,
                }}
              >
                <span>34,767 Sequences Evaluated</span>
                <span style={{ color: "#00D4FF" }}>35–50 ms CPU Latency</span>
              </div>
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* ============================================================== */}
      {/* BEAT 3 (Frames 590 - 900): PLATFORM ARCHITECTURE BLUEPRINT     */}
      {/* ============================================================== */}
      {frame >= 590 && (
        <AbsoluteFill
          style={{
            opacity: interpolate(frame, [590, 610], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 80px",
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
              Enterprise Architecture Blueprint
            </span>
            <h2 style={{ fontSize: 36, fontWeight: 900, color: "#ffffff", marginTop: 6 }}>
              Verified Prototype vs. Production Roadmap
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 20,
              width: "100%",
              maxWidth: 1100,
            }}
          >
            {/* Verified Prototype */}
            <div
              style={{
                backgroundColor: "rgba(8, 15, 30, 0.9)",
                border: "1px solid rgba(16, 185, 129, 0.4)",
                borderRadius: 18,
                padding: "24px 22px",
                opacity: interpolate(frame, [600, 620], [0, 1], { extrapolateRight: "clamp" }),
                transform: `scale(${interpolate(frame, [600, 620], [0.95, 1.0], {
                  easing: Easing.bezier(0.16, 1, 0.3, 1),
                  extrapolateRight: "clamp",
                })})`,
              }}
            >
              <div
                style={{
                  color: "#10b981",
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                }}
              >
                Implemented &amp; Verified
              </div>
              <div style={{ color: "#ffffff", fontSize: 17, fontWeight: 800, marginTop: 6 }}>
                Angular 18 Client Sandbox
              </div>
              <p style={{ color: "#8A96A8", fontSize: 12, marginTop: 8, lineHeight: 1.5 }}>
                Reactive Signal Store, live Cytoscape.js network engine, in-browser adversarial simulator, and ECharts
                SHAP waterfall.
              </p>
              <div style={{ marginTop: 14, color: "#10b981", fontSize: 11, fontWeight: 700 }}>
                100% End-to-End Operational
              </div>
            </div>

            {/* Production Backend Roadmap */}
            <div
              style={{
                backgroundColor: "rgba(8, 15, 30, 0.9)",
                border: "1px solid rgba(0, 212, 255, 0.4)",
                borderRadius: 18,
                padding: "24px 22px",
                opacity: interpolate(frame, [612, 632], [0, 1], { extrapolateRight: "clamp" }),
                transform: `scale(${interpolate(frame, [612, 632], [0.95, 1.0], {
                  easing: Easing.bezier(0.16, 1, 0.3, 1),
                  extrapolateRight: "clamp",
                })})`,
              }}
            >
              <div
                style={{
                  color: "#00D4FF",
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                }}
              >
                Production Deployment
              </div>
              <div style={{ color: "#ffffff", fontSize: 17, fontWeight: 800, marginTop: 6 }}>
                FastAPI + ONNX Runtime
              </div>
              <p style={{ color: "#8A96A8", fontSize: 12, marginTop: 8, lineHeight: 1.5 }}>
                Containerized microservice architecture, ONNX FP16 quantization, Redis low-latency feature cache, and
                distributed Kafka streams.
              </p>
              <div style={{ marginTop: 14, color: "#00D4FF", fontSize: 11, fontWeight: 700 }}>
                &lt;15ms Scaled Microservice
              </div>
            </div>

            {/* Consortium & Localization */}
            <div
              style={{
                backgroundColor: "rgba(8, 15, 30, 0.9)",
                border: "1px solid rgba(168, 85, 247, 0.4)",
                borderRadius: 18,
                padding: "24px 22px",
                opacity: interpolate(frame, [624, 644], [0, 1], { extrapolateRight: "clamp" }),
                transform: `scale(${interpolate(frame, [624, 644], [0.95, 1.0], {
                  easing: Easing.bezier(0.16, 1, 0.3, 1),
                  extrapolateRight: "clamp",
                })})`,
              }}
            >
              <div
                style={{
                  color: "#a855f7",
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                }}
              >
                Privacy &amp; Compliance
              </div>
              <div style={{ color: "#ffffff", fontSize: 17, fontWeight: 800, marginTop: 6 }}>
                Federated Learning &amp; Bangla
              </div>
              <p style={{ color: "#8A96A8", fontSize: 12, marginTop: 8, lineHeight: 1.5 }}>
                Cross-institutional federated model training preserving banking secrecy, with native Bengali reason codes
                for regional analysts.
              </p>
              <div style={{ marginTop: 14, color: "#a855f7", fontSize: 11, fontWeight: 700 }}>
                Regulatory Compliance Ready
              </div>
            </div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
