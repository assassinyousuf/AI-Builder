import { interpolate, useCurrentFrame } from "remotion";
import React from "react";

export const GradientBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const hue = interpolate(frame, [0, 300], [260, 300], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(ellipse at 20% 30%, hsl(${hue}, 80%, 15%) 0%, #050509 50%, #0a0a1a 100%)`,
        overflow: "hidden",
      }}
    >
      {/* Ambient orb top-right */}
      <div
        style={{
          position: "absolute",
          top: -120,
          right: -120,
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "rgba(168,85,247,0.12)",
          filter: "blur(120px)",
        }}
      />
      {/* Ambient orb bottom-left */}
      <div
        style={{
          position: "absolute",
          bottom: -100,
          left: -100,
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "rgba(217,70,239,0.08)",
          filter: "blur(100px)",
        }}
      />
    </div>
  );
};
