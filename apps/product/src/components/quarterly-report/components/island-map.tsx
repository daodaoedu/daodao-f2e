"use client";

import type { QuarterlyReportFriend } from "../types";

interface IslandMapProps {
  userName: string;
  friends: QuarterlyReportFriend[];
}

const CORE_COLORS = ["#FFA10B", "#F9DA4C", "#AFD24B", "#FFDACE", "#98E4F1"];
const OUTER_COLOR = "#DEDBFF";

export function IslandMap({ userName, friends }: IslandMapProps) {
  const coreFriends = friends.filter((f) => f.isCore);
  const outerFriends = friends.filter((f) => !f.isCore);
  const cx = 200;
  const cy = 130;

  return (
    <svg viewBox="0 0 400 260" className="w-full" role="img" aria-label="群島地圖">
      <title>群島地圖</title>
      <rect width="400" height="260" rx="8" fill="#E8F8F7" />

      {coreFriends.map((_, i) => {
        const pos = ringPosition(cx, cy, 80, i, coreFriends.length);
        return (
          <line
            key={`cl-${i}`}
            x1={cx}
            y1={cy}
            x2={pos.x}
            y2={pos.y}
            stroke="#16B9B3"
            strokeWidth="1"
            opacity="0.2"
          />
        );
      })}

      {outerFriends.slice(0, 8).map((f, i) => {
        const pos = ringPosition(cx, cy, 115, i, Math.min(outerFriends.length, 8));
        return (
          <g key={`o-${i}`}>
            <circle cx={pos.x} cy={pos.y} r="8" fill={OUTER_COLOR} opacity="0.6" />
            <text
              x={pos.x}
              y={pos.y + 3}
              textAnchor="middle"
              fill="#536166"
              fontSize="6"
              fontWeight="500"
            >
              {f.name.slice(0, 1)}
            </text>
          </g>
        );
      })}

      {coreFriends.map((f, i) => {
        const pos = ringPosition(cx, cy, 80, i, coreFriends.length);
        const color = CORE_COLORS[i % CORE_COLORS.length];
        return (
          <g key={`c-${i}`}>
            <circle cx={pos.x} cy={pos.y} r="16" fill={color} />
            <text
              x={pos.x}
              y={pos.y + 4}
              textAnchor="middle"
              fill="#fff"
              fontSize="9"
              fontWeight="700"
            >
              {f.name}
            </text>
          </g>
        );
      })}

      <circle cx={cx} cy={cy} r="24" fill="#16B9B3" stroke="#fff" strokeWidth="3" />
      <text x={cx} y={cy + 4} textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">
        {userName}
      </text>
    </svg>
  );
}

function ringPosition(cx: number, cy: number, radius: number, index: number, total: number) {
  if (total === 0) return { x: cx, y: cy };
  const angle = (2 * Math.PI * index) / total - Math.PI / 2;
  return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
}
