"use client";

import { Badge } from "@daodao/ui/components/badge";
import { Button } from "@daodao/ui/components/button";
import { motion } from "motion/react";
import { useState } from "react";
import { MOCK_PROGRAM, MOCK_RECENT_CHECKINS } from "./mock-data";

/** 陪伴計畫・夥伴（學員）視角頁 */
export function CompanionProgramPage() {
  const program = MOCK_PROGRAM;
  const [joined, setJoined] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);

  return (
    <div className="flex flex-col gap-4 px-5 pt-4">
      <motion.section
        className="text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary-palest text-4xl">
          {program.coverEmoji}
        </div>
        <h1 className="mt-3 text-xl font-bold text-text-dark">{program.title}</h1>
        <p className="mt-1 text-sm text-text-secondary">
          由 {program.ownerName} 陪伴 · {program.partnerCount} 位夥伴
          {program.visibility === "private" && " · 邀請制"}
        </p>
        <p className="mt-3 text-sm text-text-secondary">{program.description}</p>
      </motion.section>

      {joined ? (
        <section className="rounded-2xl border border-[#E4EAE9] bg-white p-4 text-center">
          {checkedIn ? (
            <>
              <p className="text-sm font-medium text-text-dark">✅ 今天的紀錄已送出</p>
              <p className="mt-1 text-xs text-text-secondary">
                {program.ownerName} 會看見你的每一步
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-text-secondary">今天過得如何？寫下一點紀錄吧</p>
              <Button className="mt-3 w-full rounded-full" onClick={() => setCheckedIn(true)}>
                ✏️ 記錄今天
              </Button>
            </>
          )}
        </section>
      ) : (
        <section className="rounded-2xl border border-[#E4EAE9] bg-white p-4 text-center">
          <Button className="w-full rounded-full" onClick={() => setJoined(true)}>
            加入陪伴計畫
          </Button>
          <p className="mt-2 text-xs text-text-secondary">加入後，你的紀錄會被老師看見與回應</p>
        </section>
      )}

      <section>
        <h2 className="mb-2 text-base font-bold text-text-dark">夥伴們的足跡</h2>
        <div className="flex flex-col gap-3">
          {MOCK_RECENT_CHECKINS.map((checkin) => (
            <div key={checkin.id} className="rounded-2xl border border-[#E4EAE9] bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary-palest text-xl">
                  {checkin.avatarEmoji}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text-dark">{checkin.displayName}</p>
                  <p className="text-xs text-text-secondary">
                    {checkin.checkinDate} · 🔥 連續 {checkin.streak} 天
                  </p>
                </div>
                {checkin.responded && (
                  <Badge variant="secondary" className="shrink-0">
                    老師回應過 ❤️
                  </Badge>
                )}
              </div>
              <p className="mt-3 text-sm text-text-dark">{checkin.content}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
