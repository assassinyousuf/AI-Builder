// Scene 3: The Real FraudShield Demonstration (01:00–02:00 → 1800 frames @ 30fps)
// HERO 60-SECOND SEQUENCE: Genuine Live Application Screen Recordings with Real-Time Interception Proof
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Easing,
  useCurrentFrame,
  Video,
  staticFile,
} from "remotion";

export const Scene3Demo: React.FC = () => {
  const frame = useCurrentFrame();

  // 5 Stages of 360 frames (12s) each:
  // Stage 0: 0 - 360 (Attack Simulator)
  // Stage 1: 360 - 720 (Live Monitoring & 11.2ms Automated Block)
  // Stage 2: 720 - 1080 (Explainability Lab - SHAP Waterfall)
  // Stage 3: 1080 - 1440 (Fraud Network Topology - Coordinated Ring)
  // Stage 4: 1440 - 1800 (AI Investigation Copilot - SAR Dossier)

  const stageIdx = Math.min(4, Math.floor(frame / 360));
  const stageFrame = frame % 360;

  // Head entrance (0 - 20): Smooth expansion into application viewport
  const headScale = interpolate(frame, [0, 20], [0.97, 1.0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateRight: "clamp",
  });
  const headOpacity = interpolate(frame, [0, 15], [0.85, 1.0], {
    extrapolateRight: "clamp",
  });

  // Tail exit (1780 - 1800): Smooth transition into Scene 4
  const tailScale = interpolate(frame, [1780, 1800], [1.0, 0.98], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Continuous, gentle camera zoom per stage (from 1.02 to 1.06, zero snapping!)
  const stageZoom = interpolate(stageFrame, [0, 360], [1.02, 1.06], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateRight: "clamp",
  });

  // Automated Block Seal in Stage 1: critically damped, zero wobble
  const blockSealScale = interpolate(stageFrame, [48, 68], [0.85, 1.0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const blockSealOp = interpolate(stageFrame, [48, 58], [0, 1], {
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

  // Transition scanning line at stage boundaries (frames 348-372, 708-732, 1068-1092, 1428-1452)
  const isTransitioning =
    (frame >= 348 && frame <= 372) ||
    (frame >= 708 && frame <= 732) ||
    (frame >= 1068 && frame <= 1092) ||
    (frame >= 1428 && frame <= 1452);

  const transitionSweep = interpolate(stageFrame, [348, 372], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Cinematic Cutaways with smooth 8-frame cross-fades:
  // SOC Analyst Cutaway: frames 336 to 360 (fade in 336-344, fade out 352-360)
  const showSocCutaway = frame >= 336 && frame < 360;
  const socOp = showSocCutaway
    ? frame < 344
      ? interpolate(frame, [336, 344], [0, 0.9])
      : interpolate(frame, [352, 360], [0.9, 0])
    : 0;

  // Server Racks Cutaway: frames 1056 to 1080 (fade in 1056-1064, fade out 1072-1080)
  const showServerCutaway = frame >= 1056 && frame < 1080;
  const serverOp = showServerCutaway
    ? frame < 1064
      ? interpolate(frame, [1056, 1064], [0, 0.9])
      : interpolate(frame, [1072, 1080], [0.9, 0])
    : 0;

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
      {/* Background radial lighting */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at 50% 50%, rgba(18, 59, 105, 0.22) 0%, rgba(5, 5, 9, 0.95) 80%)",
        }}
      />

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
          <div
            style={{
              padding: "4px 12px",
              borderRadius: 8,
              backgroundColor: "rgba(0, 212, 255, 0.15)",
              color: "#00D4FF",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: 1.5,
            }}
          >
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
          <div
            style={{
              padding: "8px 18px",
              borderRadius: 30,
              backgroundColor: `${cur.badgeColor}22`,
              border: `1px solid ${cur.badgeColor}66`,
              color: cur.badgeColor,
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: 1,
            }}
          >
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
            transform: `scale(${stageZoom})`,
            transformOrigin: "center center",
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
            zIndex: 10,
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: cur.badgeColor }} />
          <span style={{ color: "#ffffff", fontSize: 13, fontWeight: 800 }}>
            {cur.callout}
          </span>
        </div>

        {/* Stage 2 Automated Interception Seal Overlay */}
        {stageIdx === 1 && (
          <div
            style={{
              position: "absolute",
              top: "38%",
              left: "48%",
              transform: `translate(-50%, -50%) scale(${blockSealScale})`,
              opacity: blockSealOp,
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

        {/* High-Tech Glowing Data Scanline on Module Transitions */}
        {isTransitioning && (
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `${transitionSweep}%`,
              width: 3,
              backgroundColor: "#00D4FF",
              boxShadow: "0 0 20px #00D4FF, 0 0 40px #00D4FF",
              zIndex: 25,
            }}
          />
        )}

        {/* Cinematic Cutaway: SOC Analyst Telemetry Stream with smooth cross-fade */}
        {showSocCutaway && (
          <AbsoluteFill style={{ zIndex: 40, opacity: socOp }}>
            <Video
              src={staticFile("assets/footage/technology/act3_soc_analyst.mp4")}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              startFrom={10}
            />
            <div style={{ position: "absolute", inset: 0, background: "rgba(5, 5, 9, 0.4)" }} />
            <div
              style={{
                position: "absolute",
                bottom: 40,
                left: 40,
                color: "#00D4FF",
                fontSize: 14,
                fontWeight: 900,
                letterSpacing: 2,
              }}
            >
              SOC ANALYST DIRECT TELEMETRY STREAM
            </div>
          </AbsoluteFill>
        )}

        {/* Cinematic Cutaway: Server Cluster with smooth cross-fade */}
        {showServerCutaway && (
          <AbsoluteFill style={{ zIndex: 40, opacity: serverOp }}>
            <Video
              src={staticFile("assets/footage/technology/act3_datacenter_servers.mp4")}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              startFrom={5}
            />
            <div style={{ position: "absolute", inset: 0, background: "rgba(5, 5, 9, 0.4)" }} />
            <div
              style={{
                position: "absolute",
                bottom: 40,
                left: 40,
                color: "#00D4FF",
                fontSize: 14,
                fontWeight: 900,
                letterSpacing: 2,
              }}
            >
              HIGH-THROUGHPUT BANKING INFERENCE CLUSTER
            </div>
          </AbsoluteFill>
        )}
      </div>
    </AbsoluteFill>
  );
};
