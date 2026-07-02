"use client";

import { motion } from "motion/react";
import { IslandMap } from "../components/island-map";
import type { QuarterlyReportData } from "../types";

interface FriendsTabProps {
  data: QuarterlyReportData;
}

export function FriendsTab({ data }: FriendsTabProps) {
  const coreFriends = data.friends.filter((f) => f.isCore);

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h3 className="mb-3 text-sm font-bold text-[#2D3436]">
          你的群島 · {coreFriends.length} 位核心學伴 + {data.friends.length - coreFriends.length} 位島友
        </h3>
        <IslandMap userName={data.user.name} friends={data.friends} />
      </div>

      <div className="rounded-xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h3 className="mb-3 text-sm font-bold text-[#2D3436]">核心學伴</h3>
        <div className="flex flex-wrap gap-2">
          {coreFriends.map((f, i) => (
            <motion.div
              key={f.name}
              className="flex items-center gap-2 rounded-full bg-[#E8F8F7] px-3 py-1.5"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
            >
              <div className="flex size-5 items-center justify-center rounded-full bg-[#16B9B3]">
                <span className="text-[10px] font-bold text-white">{f.name.slice(0, 1)}</span>
              </div>
              <span className="text-sm text-[#2D3436]">{f.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
