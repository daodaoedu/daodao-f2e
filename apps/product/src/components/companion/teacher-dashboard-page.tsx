"use client";

import { Badge } from "@daodao/ui/components/badge";
import { Button } from "@daodao/ui/components/button";
import { motion } from "motion/react";
import { useState } from "react";
import {
  getQuietPartners,
  getShiningPartners,
  MOCK_PROGRAM,
  MOCK_RECENT_CHECKINS,
} from "./mock-data";
import type { Partner, PartnerCheckin } from "./types";

function CheckinFeedCard({ checkin }: { checkin: PartnerCheckin }) {
  const [responded, setResponded] = useState(checkin.responded);

  return (
    <div className="rounded-2xl border border-[#E4EAE9] bg-white p-4">
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
        {responded && (
          <Badge variant="secondary" className="shrink-0">
            已回應
          </Badge>
        )}
      </div>
      <p className="mt-3 text-sm text-text-dark">{checkin.content}</p>
      {!responded && (
        <div className="mt-3 flex gap-2">
          <Button size="sm" variant="outline" className="rounded-full" onClick={() => setResponded(true)}>
            ❤️ 回應
          </Button>
          <Button size="sm" variant="outline" className="rounded-full" onClick={() => setResponded(true)}>
            💬 留言鼓勵
          </Button>
        </div>
      )}
    </div>
  );
}

function QuietPartnerRow({ partner }: { partner: Partner }) {
  const [handled, setHandled] = useState<"message" | "watch" | null>(null);

  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex size-9 items-center justify-center rounded-full bg-[#F0F9F8] text-lg">
        {partner.avatarEmoji}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-text-dark">{partner.displayName}</p>
        <p className="text-xs text-text-secondary">{partner.daysSinceLastCheckin} 天沒動靜</p>
      </div>
      {handled ? (
        <span className="shrink-0 text-xs text-text-secondary">
          {handled === "message" ? "已傳訊息 💌" : "先觀察中 👀"}
        </span>
      ) : (
        <div className="flex shrink-0 gap-1.5">
          <Button size="sm" variant="outline" className="rounded-full" onClick={() => setHandled("message")}>
            傳個訊息
          </Button>
          <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setHandled("watch")}>
            先觀察
          </Button>
        </div>
      )}
    </div>
  );
}

function ShiningPartnerRow({ partner }: { partner: Partner }) {
  const [invited, setInvited] = useState(false);

  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex size-9 items-center justify-center rounded-full bg-[#FFF8E5] text-lg">
        {partner.avatarEmoji}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-text-dark">{partner.displayName}</p>
        <p className="text-xs text-text-secondary">
          🌱 已連續 {partner.currentStreak} 天 · 共 {partner.totalCheckins} 次
        </p>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="shrink-0 rounded-full"
        disabled={invited}
        onClick={() => setInvited(true)}
      >
        {invited ? "已邀請 ✓" : "邀請分享"}
      </Button>
    </div>
  );
}

export function TeacherDashboardPage() {
  const program = MOCK_PROGRAM;
  const quietPartners = getQuietPartners();
  const shiningPartners = getShiningPartners();

  return (
    <div className="flex flex-col gap-4 px-5 pt-4">
      <motion.section
        className="text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary-palest text-3xl">
          {program.coverEmoji}
        </div>
        <h1 className="mt-2 text-xl font-bold text-text-dark">{program.title}</h1>
        <p className="mt-1 text-sm text-text-secondary">
          {program.partnerCount} 位夥伴 · 建立於 {program.createdAt.slice(0, 7).replace("-", "/")}
        </p>
      </motion.section>

      <section>
        <h2 className="mb-2 text-base font-bold text-text-dark">最近的動態</h2>
        <div className="flex flex-col gap-3">
          {MOCK_RECENT_CHECKINS.map((checkin) => (
            <CheckinFeedCard key={checkin.id} checkin={checkin} />
          ))}
        </div>
      </section>

      {quietPartners.length > 0 && (
        <section className="rounded-2xl border border-[#E4EAE9] bg-[#F8FBFB] p-4">
          <h2 className="text-base font-bold text-text-dark">可能需要關心</h2>
          <p className="mt-0.5 text-xs text-text-secondary">不是催促，是提醒你去看看他們</p>
          <div className="mt-2 flex flex-col divide-y divide-[#EEF4F3]">
            {quietPartners.map((partner) => (
              <QuietPartnerRow key={partner.id} partner={partner} />
            ))}
          </div>
        </section>
      )}

      {shiningPartners.length > 0 && (
        <section className="rounded-2xl border border-[#E4EAE9] bg-white p-4">
          <h2 className="text-base font-bold text-text-dark">值得被看見的歷程</h2>
          <div className="mt-2 flex flex-col divide-y divide-[#EEF4F3]">
            {shiningPartners.map((partner) => (
              <ShiningPartnerRow key={partner.id} partner={partner} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
