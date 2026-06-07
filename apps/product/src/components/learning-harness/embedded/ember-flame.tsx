"use client";

import { EmberFlameSvg } from "@daodao/assets";
import emberFlameJson from "@daodao/assets/images/quiz/ember-flame.json";
import { cn } from "@daodao/ui/lib/utils";
import Lottie from "lottie-react";

interface EmberFlameProps {
  className?: string;
  animated?: boolean;
  muted?: boolean;
}

export function EmberFlame({ className, animated = false, muted = false }: EmberFlameProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
        muted && "grayscale",
        className
      )}
    >
      {animated ? (
        <Lottie
          animationData={emberFlameJson}
          autoplay
          loop
          className="size-full *:h-full *:w-full"
        />
      ) : (
        <EmberFlameSvg className="size-full" />
      )}
    </span>
  );
}
