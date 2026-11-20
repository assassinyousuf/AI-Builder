import { interpolate, useCurrentFrame } from "remotion";
import React from "react";

type Props = {
  label: string;
  value: string;
  delay?: number;
  accent?: string;
};

export const StatCard: React.FC<Props> = ({
  label,
  value,
  delay = 0,
  accent = "#a855f7",
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - delay, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = interpolate(frame - delay, [0, 20], [0.85, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        background: "rgba(255,255,255,0.05)",
        border: `1px solid ${accent}55`,
        borderRadius: 20,
        padding: "32px 48px",
        textAlign: "center",
        backdropFilter: "blur(12px)",
      }}
    >
      <div
        style={{
          color: accent,
          fontSize: 56,
          fontWeight: 800,
          fontFamily: "'Inter', system-ui, sans-serif",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          color: "#94a3b8",
          fontSize: 20,
          fontWeight: 500,
          marginTop: 12,
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
      >
        {label}
      </div>
    </div>
  );
};
