"use client";

import bgWebp from "@daodao/assets/images/action-maker/bg.webp";
import { amVarStyle } from "./styled";

export function StarryBackground({ children }: React.PropsWithChildren) {
  return (
    <div
      className="relative min-h-dvh overflow-hidden"
      style={{
        ...amVarStyle,
        backgroundImage: `url(${bgWebp.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "var(--am-bg)",
      }}
    >
      {/* Content – constrain width on desktop like quiz (max-w-[430px]) */}
      <div className="relative z-10 mx-auto max-w-[430px]">{children}</div>
    </div>
  );
}
