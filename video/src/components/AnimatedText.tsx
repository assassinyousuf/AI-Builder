import { interpolate, useCurrentFrame } from "remotion";
import React from "react";

type Props = {
  text: string;
  delay?: number;
  color?: string;
  fontSize?: number;
  fontWeight?: number;
  align?: "left" | "center" | "right";
  style?: React.CSSProperties;
};

export const AnimatedText: React.FC<Props> = ({
  text,
  delay = 0,
  color = "#FFFFFF",
  fontSize = 36,
  fontWeight = 700,
  align = "center",
  style = {},
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - delay, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(frame - delay, [0, 15], [24, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        color,
        fontSize,
        fontWeight,
        textAlign: align,
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        lineHeight: 1.4,
        ...style,
      }}
    >
      {text}
    </div>
  );
};
