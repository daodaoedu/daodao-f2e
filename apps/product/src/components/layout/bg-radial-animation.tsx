"use client";

import {
  BgRadialSvg,
  CompassSvg,
  Deco1Svg,
  Deco2Svg,
  EarphoneSvg,
  NotebookSvg,
} from "@daodao/assets";
import { useIsMobile } from "@daodao/shared";
import { cn } from "@daodao/ui/lib/utils";
import { motion } from "motion/react";

interface BgRadialAnimationProps {
  className?: string;
  variant?: "deco" | "notebook";
}

export const BgRadialAnimation = ({
  className,
  variant,
}: BgRadialAnimationProps) => {
  const isMobile = useIsMobile();
  const absoluteClassName = "absolute left-1/2 top-1/2";
  const initial = { x: "-50%", y: "-50%", opacity: 0 };

  return (
    <>
      <div
        className={cn(
          "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 pointer-events-none",
          className
        )}
      >
        <BgRadialSvg className="w-[558px] h-[517px]" />
      </div>
      <div
        className={cn(
          "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[558px] h-[517px] z-10 pointer-events-none",
          className
        )}
      >
        {variant === "deco" && (
          <>
            <motion.div
              className={cn(absoluteClassName, "w-[80px] h-[81px]")}
              initial={initial}
              animate={{
                x: "calc(-50% + 272px)",
                y: "calc(-50% + 210px)",
                opacity: 1,
              }}
              transition={{
                x: {
                  duration: 0.7,
                  delay: 0.1,
                  ease: [0.32, 0.72, 0, 1],
                },
                y: {
                  duration: 0.7,
                  delay: 0.1,
                  ease: [0.32, 0.72, 0, 1],
                },
                opacity: {
                  duration: 0.35,
                  delay: 0.22,
                  ease: [0.32, 0.72, 0, 1],
                },
              }}
            >
              <Deco1Svg className="w-full h-full" />
            </motion.div>
            <motion.div
              className={cn(absoluteClassName, "w-[98px] h-[120px]")}
              initial={initial}
              animate={{
                x: "calc(-50% - 300px)",
                y: "calc(-50% - 46px)",
                opacity: 1,
              }}
              transition={{
                x: {
                  duration: 0.8,
                  ease: [0.32, 0.72, 0, 1],
                },
                y: {
                  duration: 0.8,
                  ease: [0.32, 0.72, 0, 1],
                },
                opacity: {
                  duration: 0.4,
                  delay: 0.15,
                  ease: [0.32, 0.72, 0, 1],
                },
              }}
            >
              <Deco2Svg className="w-full h-full" />
            </motion.div>
            <motion.div
              className={cn(absoluteClassName, "w-[108px] h-[122px]")}
              initial={initial}
              animate={{
                x: "calc(-50% + 280px)",
                y: "calc(-50% - 78px)",
                opacity: 1,
              }}
              transition={{
                x: {
                  duration: 0.8,
                  ease: [0.32, 0.72, 0, 1],
                },
                y: {
                  duration: 0.8,
                  ease: [0.32, 0.72, 0, 1],
                },
                opacity: {
                  duration: 0.4,
                  delay: 0.15,
                  ease: [0.32, 0.72, 0, 1],
                },
              }}
            >
              <EarphoneSvg className="w-full h-full" />
            </motion.div>
          </>
        )}
        {variant === "notebook" && (
          <>
            <motion.div
              className={cn(absoluteClassName, "w-[150px] h-[116px]")}
              initial={initial}
              animate={{
                x: isMobile ? "calc(-50% - 148px)" : "calc(-50% - 250px)",
                y: isMobile ? "calc(-50% - 140px)" : "calc(-50% - 156px)",
                opacity: 1,
              }}
              transition={{
                x: {
                  duration: 0.7,
                  delay: 0.1,
                  ease: [0.32, 0.72, 0, 1],
                },
                y: {
                  duration: 0.7,
                  delay: 0.1,
                  ease: [0.32, 0.72, 0, 1],
                },
              }}
            >
              <NotebookSvg className="w-full h-full" />
            </motion.div>
            <motion.div
              className={cn(absoluteClassName, "w-[109px] h-[114px]")}
              initial={initial}
              animate={{
                x: isMobile ? "calc(-50% + 140px)" : "calc(-50% + 154px)",
                y: "calc(-50% + 12px)",
                opacity: 1,
              }}
              transition={{
                x: {
                  duration: 0.8,
                  ease: [0.32, 0.72, 0, 1],
                },
                y: {
                  duration: 0.8,
                  ease: [0.32, 0.72, 0, 1],
                },
              }}
            >
              <CompassSvg className="w-full h-full" />
            </motion.div>
          </>
        )}
      </div>
    </>
  );
};
