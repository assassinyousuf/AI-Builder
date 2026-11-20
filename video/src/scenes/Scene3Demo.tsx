// Scene 3: The Real FraudShield Demonstration (01:00–02:00 → 1800 frames @ 30fps)
// HERO 60-SECOND SEQUENCE: Genuine Live Application Screen Recordings with Real-Time Interception Proof
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

export const Scene3Demo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 5 Stages of 360 frames (12s) each:
  const stageIdx = Math.min(4, Math.floor(frame / 360));
  const stageFrame = frame % 360;

  // Editorial camera motion for each stage
  const s1Zoom = interpolate(stageFrame, [0, 360], [1.02, 1.10], { extrapolateRight: "clamp" });
  const s2Zoom = interpolate(stageFrame, [0, 360], [1.03, 1.14], { extrapolateRight: "clamp" });
  const s3Zoom = interpolate(stageFrame, [0, 360], [1.02, 1.12], { extrapolateRight: "clamp" });
  const s4Zoom = interpolate(stageFrame, [0, 360], [1.04, 1.16], { extrapolateRight: "clamp" });
  const s5Zoom = interpolate(stageFrame, [0, 360], [1.02, 1.10], { extrapolateRight: "clamp" });

  const blockSealScale = spring({ frame: Math.max(0, stageFrame - 50), fps, from: 0.3, to: 1, config: { damping: 10 } });

  const sceneExit = interpolate(frame, [1770, 1800], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const stages = [
    {
      num: "STAGE 1 OF 5",
      title: "Attack Simulator",
      badge: "LIVE ADVERSARIAL SANDBOX",
      badgeColor: "#FF394F",
      detail: "Configuring Account Takeover scenario · Ingesting impossible-travel proxy session",
      videoFile: "rec_module1_simulator.mp4",
      callout: "Adversarial Simulation: Hijacked Session + Headless Proxy",
    },
    {
      num: "STAGE 2 OF 5",
      title: "Live Monitoring Console",
      badge: "SUB-15MS AUTOMATED BLOCK",
      badgeColor: "#FF394F",
      detail: "TXN-4821 evaluated at 96/100 risk score and frozen before funds exit",
      videoFile: "rec_module2_monitoring.mp4",
      callout: "Instant Decision: Risk 96/100 · Automated Interception",
    },
    {
      num: "STAGE 3 OF 5",
      title: "Explainability Lab (SHAP)",
      badge: "FEATURE ATTRIBUTION WATERFALL",
      badgeColor: "#00D4FF",
      detail: "Decomposing drivers: Impossible Travel (+0.24) & Headless Fingerprint (+0.19)",
      videoFile: "rec_module3_explainability.mp4",
      callout: "Transparent Mathematical Attribution · Reason Codes Generated",
    },
    {
      num: "STAGE 4 OF 5",
      title: "Fraud Network Intelligence",
      badge: "CYTOSCAPE GRAPH TOPOLOGY",
      badgeColor: "#3986DB",
      detail: "Relational graph uncovers coordinated 5-account mule ring linked to device DEV-9921-X",
      videoFile: "rec_module4_fraud_network.mp4",
      callout: "Graph Topology: Shared Device Footprint Unmasked",
    },
    {
      num: "STAGE 5 OF 5",
      title: "AI Investigation Copilot",
      badge: "COMPLIANCE SAR DOSSIER",
      badgeColor: "#10b981",
      detail: "One-click audit brief synthesis cuts investigator triage time by 75%",
      videoFile: "rec_module5_copilot.mp4",
      callout: "Autonomous Evidence Brief: 75% Faster Case Resolution",
    },
  ];

  const cur = stages[stageIdx];

  // Brief cinematic cutaways between stages:
  // Frame 340 - 365: SOC Analyst Live Footage
  // Frame 1060 - 1085: Datacenter Server Racks Live Footage
  const showSocCutaway = frame >= 335 && frame < 365;
  const showServerCutaway = frame >= 1055 && frame < 1085;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#050509",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        overflow: "hidden",
        opacity: sceneExit,
      }}
    >
      {/* Background radial lighting */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 50%, rgba(18, 59, 105, 0.22) 0%, rgba(5, 5, 9, 0.95) 80%)" }} />

      {/* Top Breadcrumb & Live Stage Header */}
      <div
        style={{
          position: "absolute",
          top: 25,
          left: 60,
          right: 60,
          zIndex: 30,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "rgba(8, 15, 30, 0.92)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(0, 212, 255, 0.3)",
          borderRadius: 20,
          padding: "16px 28px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ padding: "4px 12px", borderRadius: 8, backgroundColor: "rgba(0, 212, 255, 0.15)", color: "#00D4FF", fontSize: 12, fontWeight: 800, letterSpacing: 1.5 }}>
            {cur.num}
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: "#ffffff", margin: 0 }}>
              {cur.title}
            </h2>
            <div style={{ fontSize: 13, color: "#8A96A8", marginTop: 2 }}>
              {cur.detail}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ padding: "8px 18px", borderRadius: 30, backgroundColor: `${cur.badgeColor}22`, border: `1px solid ${cur.badgeColor}66`, color: cur.badgeColor, fontSize: 12, fontWeight: 800, letterSpacing: 1 }}>
            {cur.badge}
          </div>
          <div style={{ color: "#10b981", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#10b981" }} />
            LIVE SCREEN CAPTURE
          </div>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div
        style={{
          position: "absolute",
          top: 110,
          left: 60,
          right: 60,
          bottom: 35,
          borderRadius: 24,
          overflow: "hidden",
          border: "2px solid rgba(0, 212, 255, 0.35)",
          boxShadow: "0 25px 70px rgba(0, 0, 0, 0.9)",
          backgroundColor: "#080F1E",
        }}
      >
        {/* Dynamic Zooming on Real Application Screen Video */}
        <div
          style={{
            width: "100%",
            height: "100%",
            transform:
              stageIdx === 0
                ? `scale(${s1Zoom}) translateX(-15px)`
                : stageIdx === 1
                ? `scale(${s2Zoom}) translateY(-25px)`
                : stageIdx === 2
                ? `scale(${s3Zoom}) translateY(-20px)`
                : stageIdx === 3
                ? `scale(${s4Zoom})`
                : `scale(${s5Zoom})`,
            transformOrigin:
              stageIdx === 1
                ? "40% 45%"
                : stageIdx === 2
                ? "45% 50%"
                : stageIdx === 3
                ? "50% 50%"
                : "center center",
            transition: "transform 0.1s linear",
          }}
        >
          {/* Continuous Screen Recording Video Playback */}
          {stageIdx === 0 && (
            <Video
              src={staticFile("assets/recordings/rec_module1_simulator.mp4")}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              startFrom={0}
            />
          )}
          {stageIdx === 1 && (
            <Video
              src={staticFile("assets/recordings/rec_module2_monitoring.mp4")}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              startFrom={0}
            />
          )}
          {stageIdx === 2 && (
            <Video
              src={staticFile("assets/recordings/rec_module3_explainability.mp4")}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              startFrom={0}
            />
          )}
          {stageIdx === 3 && (
            <Video
              src={staticFile("assets/recordings/rec_module4_fraud_network.mp4")}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              startFrom={0}
            />
          )}
          {stageIdx === 4 && (
            <Video
              src={staticFile("assets/recordings/rec_module5_copilot.mp4")}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              startFrom={0}
            />
          )}
        </div>

        {/* Floating Callout Lower-Third */}
        <div
          style={{
            position: "absolute",
            bottom: 24,
            left: 28,
            backgroundColor: "rgba(8, 15, 30, 0.94)",
            backdropFilter: "blur(16px)",
            border: `1px solid ${cur.badgeColor}55`,
            borderRadius: 14,
            padding: "10px 18px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            boxShadow: "0 10px 25px rgba(0,0,0,0.7)",
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: cur.badgeColor }} />
          <span style={{ color: "#ffffff", fontSize: 13, fontWeight: 800 }}>
            {cur.callout}
          </span>
        </div>

        {/* Stage 2 Automated Interception Seal Overlay */}
        {stageIdx === 1 && !showSocCutaway && (
          <div
            style={{
              position: "absolute",
              top: "38%",
              left: "48%",
              transform: `translate(-50%, -50%) scale(${blockSealScale})`,
              backgroundColor: "rgba(18, 6, 8, 0.95)",
              border: "3px solid #FF394F",
              borderRadius: 20,
              padding: "20px 32px",
              boxShadow: "0 20px 60px rgba(255, 57, 79, 0.5)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              zIndex: 20,
            }}
          >
            <div style={{ color: "#FF394F", fontSize: 12, fontWeight: 900, letterSpacing: 3, textTransform: "uppercase" }}>
              POLICY ENFORCEMENT
            </div>
            <div style={{ fontSize: 32, fontWeight: 900, color: "#ffffff", letterSpacing: 1 }}>
              AUTOMATED BLOCKED
            </div>
            <div style={{ color: "#00D4FF", fontSize: 14, fontWeight: 800 }}>
              Decision Latency: 11.2 ms · Score: 96/100
            </div>
          </div>
        )}

        {/* Cutaway Flashes */}
        {showSocCutaway && (
          <AbsoluteFill style={{ zIndex: 40 }}>
            <Video
              src={staticFile("assets/footage/technology/act3_soc_analyst.mp4")}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              startFrom={10}
            />
            <div style={{ position: "absolute", inset: 0, background: "rgba(5, 5, 9, 0.4)" }} />
            <div style={{ position: "absolute", bottom: 40, left: 40, color: "#00D4FF", fontSize: 14, fontWeight: 900, letterSpacing: 2 }}>
              SOC ANALYST DIRECT TELEMETRY STREAM
            </div>
          </AbsoluteFill>
        )}

        {showServerCutaway && (
          <AbsoluteFill style={{ zIndex: 40 }}>
            <Video
              src={staticFile("assets/footage/technology/act3_datacenter_servers.mp4")}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              startFrom={5}
            />
            <div style={{ position: "absolute", inset: 0, background: "rgba(5, 5, 9, 0.4)" }} />
            <div style={{ position: "absolute", bottom: 40, left: 40, color: "#00D4FF", fontSize: 14, fontWeight: 900, letterSpacing: 2 }}>
              HIGH-THROUGHPUT BANKING INFERENCE CLUSTER
            </div>
          </AbsoluteFill>
        )}
      </div>
    </AbsoluteFill>
  );
};
