import { interpolate, useCurrentFrame } from "remotion";
import React from "react";

type Props = {
  value?: number;
  end?: number;
  decimals?: number;
  delay?: number;
  suffix?: string;
  prefix?: string;
  color?: string;
  fontSize?: number;
};

export const CountUp: React.FC<Props> = ({
  value,
  end,
  decimals = 0,
  delay = 0,
  suffix = "",
  prefix = "",
  color = "#a855f7",
  fontSize,
}) => {
  const frame = useCurrentFrame();
  const target = end ?? value ?? 0;
  const progress = interpolate(frame - delay, [0, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const current = progress * target;
  const formatted = decimals > 0 ? current.toFixed(decimals) : Math.round(current).toLocaleString();

  return (
    <span
      style={{
        color,
        fontSize,
        fontWeight: 800,
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};
