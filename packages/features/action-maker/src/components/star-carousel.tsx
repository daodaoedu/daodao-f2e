"use client";

import carouselAcademic from "@daodao/assets/images/action-maker/carousel-academic.png";
import carouselHealth from "@daodao/assets/images/action-maker/carousel-health.png";
import carouselInterest from "@daodao/assets/images/action-maker/carousel-interest.png";
import carouselSocial from "@daodao/assets/images/action-maker/carousel-social.png";
import carouselWork from "@daodao/assets/images/action-maker/carousel-work.png";
import { useEffect, useRef, useState } from "react";

const STARS = [
  { id: "social",   label: "人際", src: carouselSocial,   x: 8,  y: 25 },
  { id: "interest", label: "興趣", src: carouselInterest, x: 78, y: 8, leftCalc: "calc(50% + 60px)" },
  { id: "academic", label: "學業", src: carouselAcademic, x: 86, y: 50 },
  { id: "health",   label: "健康", src: carouselHealth,   x: 72, y: 80 },
  { id: "work",     label: "工作", src: carouselWork,     x: 6,  y: 68 },
] as const;

export function StarCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const starRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [positions, setPositions] = useState<{ x: number; y: number }[]>(
    STARS.map((s) => ({ x: s.x, y: s.y }))
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally runs once on mount and on resize
  useEffect(() => {
    const update = () => {
      const container = containerRef.current;
      if (!container) return;
      const { width, height } = container.getBoundingClientRect();
      const updated = starRefs.current.map((el, i) => {
        if (!el) return positions[i] ?? { x: 0, y: 0 };
        const rect = el.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        return {
          x: ((rect.left + rect.width / 2 - containerRect.left) / width) * 100,
          y: ((rect.top + rect.height / 2 - containerRect.top) / height) * 100,
        };
      });
      setPositions(updated);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % STARS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0 overflow-hidden">
      {STARS.map((star, index) => {
        const isActive = index === activeIndex;
        const leftStyle = "leftCalc" in star ? star.leftCalc : `${star.x}%`;
        return (
          <div
            key={star.id}
            ref={(el) => { starRefs.current[index] = el; }}
            className={`absolute flex flex-col items-center transition-all duration-1000 ease-out star-${star.id}`}
            style={{
              left: leftStyle,
              top: `${star.y}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            {/* Glow ring when active */}
            {isActive && (
              <div
                className="absolute inset-0 -m-6 animate-pulse rounded-full opacity-30 blur-2xl"
                style={{ background: "white" }}
              />
            )}

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={star.src.src}
              alt={star.label}
              width={isActive ? 96 : 56}
              height={isActive ? 96 : 56}
              className={`transition-all duration-1000 ${isActive ? "opacity-90" : "opacity-35"}`}
            />

            {/* Label badge */}
            {isActive && (
              <div className="mt-2 whitespace-nowrap animate-am-fade-in">
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm text-white/80 backdrop-blur-md">
                  {star.label}
                </span>
              </div>
            )}
          </div>
        );
      })}

      {/* Connection lines using actual DOM positions */}
      <svg aria-hidden="true" className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <linearGradient id="am-line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(188, 213, 238, 0)" />
            <stop offset="50%" stopColor="rgba(188, 213, 238, 0.4)" />
            <stop offset="100%" stopColor="rgba(188, 213, 238, 0)" />
          </linearGradient>
        </defs>
        {activeIndex > 0 && positions[activeIndex] && positions[activeIndex - 1] && (
          <line
            x1={`${positions[activeIndex]?.x}%`}
            y1={`${positions[activeIndex]?.y}%`}
            x2={`${positions[activeIndex - 1]?.x}%`}
            y2={`${positions[activeIndex - 1]?.y}%`}
            stroke="url(#am-line-gradient)"
            strokeWidth="1"
            opacity="1"
          />
        )}
        {activeIndex < STARS.length - 1 && positions[activeIndex] && positions[activeIndex + 1] && (
          <line
            x1={`${positions[activeIndex]?.x}%`}
            y1={`${positions[activeIndex]?.y}%`}
            x2={`${positions[activeIndex + 1]?.x}%`}
            y2={`${positions[activeIndex + 1]?.y}%`}
            stroke="url(#am-line-gradient)"
            strokeWidth="1"
            opacity="1"
          />
        )}
      </svg>

      <style>{`
        .star-interest { left: calc(50% + 60px) !important; }
        @media (max-width: 767px) {
          .star-social { top: 18% !important; }
          .star-health { top: 92% !important; }
        }
        @keyframes am-fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-am-fade-in {
          animation: am-fade-in 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
