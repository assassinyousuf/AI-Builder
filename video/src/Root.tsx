import React from "react";
import { Composition } from "remotion";
import { FraudShieldPitch } from "./Composition";
import { Scene1Hook } from "./scenes/Scene1Hook";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="FraudShieldPitch"
        component={FraudShieldPitch}
        durationInFrames={5400}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Test15sDemo"
        component={Scene1Hook}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
