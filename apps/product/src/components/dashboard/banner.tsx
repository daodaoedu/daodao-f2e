"use client";

import {
  DesktopBannerSvg,
  desktopIntersectMaskDataUri,
  MobileBannerSvg,
  mobileIntersectMaskDataUri,
} from "@daodao/assets";
import activeShaper2Json from "@daodao/assets/images/quiz/active-shaper-2.json";
import { cn } from "@daodao/ui/lib/utils";
import Lottie from "lottie-react";

export function Banner() {
  return (
    <>
      <header
        className={cn(
          "fixed top-0 right-0 left-0 z-20 pointer-events-none mask-luminance mask-intersect"
        )}
        style={
          {
            "--mobile-intersect-mask": `url("${mobileIntersectMaskDataUri}")`,
            "--desktop-intersect-mask": `url("${desktopIntersectMaskDataUri}")`,
          } as React.CSSProperties
        }
      >
        <MobileBannerSvg className="md:hidden w-full" />
        <DesktopBannerSvg className="hidden md:block w-full" />
        <h1
          className={cn(
            "absolute left-1/2 -translate-x-1/2 text-text-dark font-medium pointer-events-auto",
            "top-[26px] text-[1.125rem] sm:text-[1.75rem]",
            "md:top-[calc(3/13*100%)] md:-translate-y-full md:text-[1.75rem]"
          )}
        >
          我的小島
        </h1>
        <h2
          className={cn(
            "absolute left-1/2 -translate-x-1/2 max-w-[540px] min-w-44 w-1/2",
            "flex items-center justify-center pointer-events-auto",
            "bg-white/70 rounded-full text-text-dark border border-white",
            "bottom-[70%] -translate-y-full h-7 text-sm",
            "md:top-[42%] md:-translate-y-full md:h-10 md:text-[1.125rem]"
          )}
        >
          先做再說，做中學最快！
          <div className="md:hidden absolute -bottom-8 left-full w-24 rotate-3">
            <Lottie
              animationData={activeShaper2Json}
              className="*:w-full *:h-full"
            />
          </div>
          <div className="hidden md:block absolute top-4 -right-[27px] size-4.5 rounded-full bg-white/70 border border-white">
            <div className="absolute -bottom-[11px] -right-3 w-3 h-[11px] rounded-full bg-white/70 border border-white">
              <div className="absolute -bottom-[30px] left-full w-32 lg:w-[168px] rotate-3">
                <Lottie
                  animationData={activeShaper2Json}
                  className="*:w-full *:h-full"
                />
              </div>
            </div>
          </div>
        </h2>
      </header>

      <div className="aspect-195/73 md:aspect-16/3" />
    </>
  );
}
