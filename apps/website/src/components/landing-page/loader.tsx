"use client";

import { useAssetsLoader, useScrollLock } from "@daodao/shared";
import { Progress } from "@daodao/ui/components/progress";
import { cn } from "@daodao/ui/lib/utils";
import Lottie from "lottie-react";
import { useEffect, useState } from "react";

export function Loader({ children }: React.PropsWithChildren) {
  const [isLoading, setIsLoading] = useState(true);
  const [animationData, setAnimationData] = useState<object | null>(null);
  const { progress, done } = useAssetsLoader("img[data-preload]");
  const percent = Math.max(Math.round(progress * 100), animationData ? 0 : 5);

  // 使用滾動鎖定 hook
  const { unlockScroll } = useScrollLock();

  // 當載入完成時，確保恢復滾動
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (done) {
      unlockScroll();
      timer = setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }
    return () => {
      clearTimeout(timer);
    };
  }, [done, unlockScroll]);

  // Load Lottie animation data
  useEffect(() => {
    const loadLottie = async () => {
      try {
        const response = await fetch("/assets/landing-page/logo-action.json");
        const data = await response.json();
        setAnimationData(data);
      } catch {
        setIsLoading(false);
      }
    };

    loadLottie();
  }, []);

  return (
    <>
      {children}
      {isLoading && (
        <div
          className={cn(
            "fixed inset-0 z-50 grid grid-rows-[1fr_auto] bg-primary-palest transition-opacity duration-300 ease-in-out",
            done ? "opacity-0" : "opacity-100"
          )}
        >
          <div className="grid place-items-center">
            {animationData && (
              <div className="size-[140px]">
                <Lottie
                  animationData={animationData}
                  loop
                  autoplay
                  style={{ width: "100%", height: "100%" }}
                  rendererSettings={{ preserveAspectRatio: "xMidYMid meet" }}
                />
              </div>
            )}
          </div>

          <div className="px-6 pb-6">
            <div className="mb-2 text-[50px] font-semibold text-primary-base">{percent}%</div>
            <Progress value={percent} className="h-2 [--active-color:var(--logo-cyan)]" />
          </div>
        </div>
      )}
    </>
  );
}
