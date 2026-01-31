"use client";

import celebrateJson from "@daodao/assets/images/emotion/celebrate.json";
import Lottie from "lottie-react";

export const ConfettiAnimation = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-5">
      <Lottie
        animationData={celebrateJson}
        className="w-full h-full"
        loop={false}
        autoplay={true}
      />
    </div>
  );
};
