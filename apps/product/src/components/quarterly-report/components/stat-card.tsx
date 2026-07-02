"use client";

import { cn } from "@daodao/ui/lib/utils";
import { type MotionValue, animate, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect } from "react";

interface ReportStatCardProps {
  label: string;
  value: number;
  color?: string;
}

function CountUp({ target }: { target: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v: number) => Math.round(v));

  useEffect(() => {
    const controls = animate(count, target, { duration: 1.2, ease: "easeOut" });
    return controls.stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return <motion.span>{rounded}</motion.span>;
}

export function ReportStatCard({ label, value, color = "#16B9B3" }: ReportStatCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl bg-white p-4",
        "shadow-[0_1px_3px_rgba(0,0,0,0.06)]",
      )}
    >
      <span className="text-3xl font-bold" style={{ color }}>
        <CountUp target={value} />
      </span>
      <span className="mt-1 text-xs text-[#536166]">{label}</span>
    </div>
  );
}
