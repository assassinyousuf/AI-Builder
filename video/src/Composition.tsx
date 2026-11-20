import React from "react";
import { AbsoluteFill, Series, Audio, staticFile } from "remotion";
import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2Intro } from "./scenes/Scene2Intro";
import { Scene3Demo } from "./scenes/Scene3Demo";
import { Scene4Architecture } from "./scenes/Scene4Architecture";
import { Scene5Impact } from "./scenes/Scene5Impact";

export const FraudShieldPitch: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#050509" }}>
      {/* Synchronized 180s v3 Master Documentary Narration & SFX Audio */}
      <Audio src={staticFile("assets/audio/fraudshield_v3_master_audio.mp3")} />

      <Series>
        {/* Scene 1: The Problem / Cold Open (0:00 - 0:30, 900 frames) */}
        <Series.Sequence durationInFrames={900}>
          <Scene1Hook />
        </Series.Sequence>

        {/* Scene 2: The Solution + Native Auth (0:30 - 1:00, 900 frames) */}
        <Series.Sequence durationInFrames={900}>
          <Scene2Intro />
        </Series.Sequence>

        {/* Scene 3: Live Attack Simulation & Defense Demo (1:00 - 2:00, 1800 frames) */}
        <Series.Sequence durationInFrames={1800}>
          <Scene3Demo />
        </Series.Sequence>

        {/* Scene 4: System Architecture & ML Specs (2:00 - 2:30, 900 frames) */}
        <Series.Sequence durationInFrames={900}>
          <Scene4Architecture />
        </Series.Sequence>

        {/* Scene 5: Real-World Impact & Team (2:30 - 3:00, 900 frames) */}
        <Series.Sequence durationInFrames={900}>
          <Scene5Impact />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
