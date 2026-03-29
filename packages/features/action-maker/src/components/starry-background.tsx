"use client";

import bgWebp from "@daodao/assets/images/action-maker/bg.webp";
import LogoSvg from "@daodao/assets/images/action-maker/logo.svg";
import { amVarStyle } from "./styled";

export function StarryBackground({ children, fullWidthDesktop, showLogo }: React.PropsWithChildren<{ fullWidthDesktop?: boolean; showLogo?: boolean }>) {
  return (
    <div
      className="relative min-h-dvh overflow-hidden"
      style={{
        ...amVarStyle,
        backgroundImage: `url(${bgWebp.src})`,
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "var(--am-bg)",
      }}
    >
      {showLogo && (
        <a
          href="https://daodao.so/"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute left-4 top-4 z-20 md:left-8 md:top-6"
        >
          <LogoSvg aria-label="DaoDao" className="h-auto w-[180px]" />
        </a>
      )}
      {/* Content – constrain width on desktop like quiz (max-w-[430px]) */}
      <div className={`relative z-10 mx-auto max-w-[430px] ${fullWidthDesktop ? "md:max-w-none" : "md:max-w-[640px]"}`}>{children}</div>
    </div>
  );
}
