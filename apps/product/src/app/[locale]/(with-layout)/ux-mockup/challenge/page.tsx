"use client";

// ============================================================================
// UX Mockup — 共同挑戰活動頁
// 路徑：/ux-mockup/challenge
// 說明：使用 mock data，不需登入即可瀏覽。互動（報名）為純 UI mock。
// ============================================================================

import { Badge } from "@daodao/ui/components/badge";
import { Button } from "@daodao/ui/components/button";
import { cn } from "@daodao/ui/lib/utils";
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Users,
  Trophy,
  CheckCircle2,
  X,
  Sparkles,
  Clock,
  Info,
} from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/layout";

// ── Types ────────────────────────────────────────────────────────────────────

type ChallengeStatus = "active" | "upcoming";

interface Challenge {
  id: string;
  title: string;
  description: string;
  topic: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  participantCount: number;
  todayCheckInCount: number;
  avgProgress: number;
  status: ChallengeStatus;
  accentColor: string;
  emoji: string;
}

// ── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_CHALLENGES: Challenge[] = [
  {
    id: "challenge-reading-2026s2",
    title: "21 天每日閱讀挑戰",
    description: "每天至少閱讀 20 分鐘，並用一句話記錄今天的收穫。不需要完美的筆記，只要持續出現就算贏。",
    topic: "閱讀",
    startDate: "2026-05-20",
    endDate: "2026-06-09",
    durationDays: 21,
    participantCount: 312,
    todayCheckInCount: 87,
    avgProgress: 52,
    status: "active",
    accentColor: "#16B9B3",
    emoji: "📚",
  },
  {
    id: "challenge-writing-2026s2",
    title: "30 天寫作練習",
    description: "每天寫 200 字以上，主題不限。可以是日記、觀察、創作或心得。重點是讓文字流動起來。",
    topic: "寫作",
    startDate: "2026-05-15",
    endDate: "2026-06-13",
    durationDays: 30,
    participantCount: 198,
    todayCheckInCount: 63,
    avgProgress: 67,
    status: "active",
    accentColor: "#9B8FE0",
    emoji: "✍️",
  },
  {
    id: "challenge-english-2026s3",
    title: "14 天英文口說挑戰",
    description: "每天用英文說一段話（30 秒以上），可以錄音或直接打卡記錄。從此刻開始開口，不需要完美。",
    topic: "英文",
    startDate: "2026-06-16",
    endDate: "2026-06-29",
    durationDays: 14,
    participantCount: 142,
    todayCheckInCount: 0,
    avgProgress: 0,
    status: "upcoming",
    accentColor: "#F5A93E",
    emoji: "🗣️",
  },
  {
    id: "challenge-meditation-2026s3",
    title: "21 天晨間冥想",
    description: "每天早起 10 分鐘靜坐，記錄身心狀態。適合想建立晨型習慣的你，與夥伴一起從容開啟每一天。",
    topic: "身心健康",
    startDate: "2026-06-23",
    endDate: "2026-07-13",
    durationDays: 21,
    participantCount: 89,
    todayCheckInCount: 0,
    avgProgress: 0,
    status: "upcoming",
    accentColor: "#5BA58C",
    emoji: "🧘",
  },
];

const RULES = [
  {
    icon: "📋",
    title: "加入後即開始",
    desc: "報名後系統會在你的「我的」頁面建立一張挑戰卡，挑戰名稱與期間不可修改，其餘可依個人情況調整。",
  },
  {
    icon: "📅",
    title: "開始日才能打卡",
    desc: "活動開始日前無法打卡，開始日當天會收到 Email 與站內通知提醒你正式出發。",
  },
  {
    icon: "👥",
    title: "一起衝刺更有力",
    desc: "挑戰進行中可以看到所有夥伴的平均進度條，以及今日已打卡人數，感受大家一起前進的節奏。",
  },
  {
    icon: "🏅",
    title: "完成 80% 獲得徽章",
    desc: "完成進度達 80% 以上的挑戰者，將獲得共同挑戰專屬 badge，顯示在個人頁面上。",
  },
];

// ── Sub-components ───────────────────────────────────────────────────────────

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="w-full h-1.5 bg-black/[0.06] rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${value}%`, backgroundColor: color }}
      />
    </div>
  );
}

function ActiveChallengeCard({
  challenge,
  onJoin,
}: {
  challenge: Challenge;
  onJoin: (challenge: Challenge) => void;
}) {
  const daysLeft = Math.ceil(
    (new Date(challenge.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border-2 p-5 flex flex-col gap-4",
        "hover:shadow-md transition-all duration-200"
      )}
      style={{ borderColor: `${challenge.accentColor}40` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{challenge.emoji}</span>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <Badge
                size="sm"
                className="text-white text-[10px] px-2 py-0.5"
                style={{ backgroundColor: challenge.accentColor }}
              >
                {challenge.topic}
              </Badge>
              <span className="text-[11px] text-text-dark/40 flex items-center gap-1">
                <Clock className="size-3" />
                剩 {daysLeft} 天
              </span>
            </div>
            <h3 className="font-semibold text-text-dark leading-snug">{challenge.title}</h3>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-text-dark/65 leading-relaxed -mt-1">{challenge.description}</p>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm">
        <span className="flex items-center gap-1.5 text-text-dark/60">
          <Users className="size-4" />
          <span>
            <strong className="text-text-dark">{challenge.participantCount}</strong> 位夥伴加入
          </span>
        </span>
        <span className="flex items-center gap-1.5 text-text-dark/60">
          <CheckCircle2 className="size-4" />
          <span>
            今日已 <strong className="text-text-dark">{challenge.todayCheckInCount}</strong> 人打卡
          </span>
        </span>
      </div>

      {/* Shared progress bar */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs text-text-dark/50">
          <span>夥伴平均進度</span>
          <span>{challenge.avgProgress}%</span>
        </div>
        <ProgressBar value={challenge.avgProgress} color={challenge.accentColor} />
      </div>

      {/* CTA */}
      <Button
        className="w-full text-white"
        style={{ backgroundColor: challenge.accentColor }}
        onClick={() => onJoin(challenge)}
      >
        我也要參加
      </Button>
    </div>
  );
}

function UpcomingChallengeCard({
  challenge,
  onJoin,
}: {
  challenge: Challenge;
  onJoin: (challenge: Challenge) => void;
}) {
  const daysUntilStart = Math.ceil(
    (new Date(challenge.startDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div
      className={cn(
        "bg-white/80 rounded-2xl border border-dashed p-5 flex flex-col gap-4",
        "hover:shadow-md hover:bg-white transition-all duration-200"
      )}
      style={{ borderColor: `${challenge.accentColor}60` }}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <span className="text-2xl">{challenge.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <Badge
              size="sm"
              variant="outline-ghost"
              className="text-[10px] px-2 py-0.5"
              style={{ color: challenge.accentColor, borderColor: `${challenge.accentColor}60` }}
            >
              {challenge.topic}
            </Badge>
            <span className="text-[11px] text-text-dark/40 flex items-center gap-1">
              <CalendarDays className="size-3" />
              {daysUntilStart > 0 ? `${daysUntilStart} 天後開始` : "即將開始"}
            </span>
          </div>
          <h3 className="font-semibold text-text-dark leading-snug">{challenge.title}</h3>
        </div>
      </div>

      <p className="text-sm text-text-dark/65 leading-relaxed -mt-1">{challenge.description}</p>

      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 text-text-dark/60">
          <Users className="size-4" />
          <span>
            已有 <strong className="text-text-dark">{challenge.participantCount}</strong> 位夥伴預約
          </span>
        </span>
        <span className="text-xs text-text-dark/40">
          {challenge.startDate} 開始 · {challenge.durationDays} 天
        </span>
      </div>

      <Button
        variant="outline"
        className="w-full"
        style={{ color: challenge.accentColor, borderColor: `${challenge.accentColor}60` }}
        onClick={() => onJoin(challenge)}
      >
        預約報名
      </Button>
    </div>
  );
}

function RulesSection() {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      <button
        type="button"
        className="w-full px-5 py-4 flex items-center justify-between gap-2 hover:bg-very-light-gray transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-2 text-sm font-semibold text-text-dark">
          <Info className="size-4 text-logo-cyan" />
          活動說明與注意事項
        </div>
        {open ? (
          <ChevronUp className="size-4 text-text-dark/40 shrink-0" />
        ) : (
          <ChevronDown className="size-4 text-text-dark/40 shrink-0" />
        )}
      </button>

      {open && (
        <div className="px-5 pb-5 flex flex-col gap-4 border-t border-border pt-4">
          {RULES.map((rule) => (
            <div key={rule.title} className="flex gap-3">
              <span className="text-xl shrink-0 mt-0.5">{rule.icon}</span>
              <div>
                <p className="text-sm font-semibold text-text-dark mb-0.5">{rule.title}</p>
                <p className="text-xs text-text-dark/60 leading-relaxed">{rule.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Join Modal ───────────────────────────────────────────────────────────────

type ModalStep = "pledge" | "success";

function JoinModal({
  challenge,
  onClose,
}: {
  challenge: Challenge;
  onClose: () => void;
}) {
  const [step, setStep] = useState<ModalStep>("pledge");
  const [agreed, setAgreed] = useState(false);

  if (step === "success") {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <div className="w-full max-w-[420px] bg-white rounded-3xl p-8 flex flex-col items-center gap-5 text-center shadow-xl">
          <div
            className="size-20 rounded-full flex items-center justify-center text-4xl"
            style={{ backgroundColor: `${challenge.accentColor}18` }}
          >
            {challenge.emoji}
          </div>
          <div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle2 className="size-5" style={{ color: challenge.accentColor }} />
              <span className="font-bold text-lg text-text-dark">你已加入共同挑戰！</span>
            </div>
            <p className="text-sm text-text-dark/60 leading-relaxed">
              「{challenge.title}」已加入你的實踐清單。
              <br />
              名稱與期間不可修改，其他內容可依你的情況自行調整。
            </p>
          </div>

          <div className="w-full bg-very-light-gray rounded-xl p-4 text-sm text-left flex flex-col gap-1.5">
            <div className="flex justify-between text-text-dark/50 text-xs mb-1">
              <span>活動期間</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 shrink-0" style={{ color: challenge.accentColor }} />
              <span className="font-medium text-text-dark">
                {challenge.startDate} ～ {challenge.endDate}
              </span>
            </div>
            <p className="text-xs text-text-dark/45 mt-1">
              開始日前無法打卡，系統會在開始當天通知你。
            </p>
          </div>

          <Button className="w-full text-white" style={{ backgroundColor: challenge.accentColor }} onClick={onClose}>
            太好了，期待開始！
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Header */}
        <div
          className="px-6 pt-6 pb-5 relative"
          style={{ backgroundColor: `${challenge.accentColor}12` }}
        >
          <button
            type="button"
            className="absolute top-4 right-4 size-8 flex items-center justify-center rounded-full bg-black/[0.06] hover:bg-black/10 transition-colors"
            onClick={onClose}
            aria-label="關閉"
          >
            <X className="size-4 text-text-dark/60" />
          </button>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{challenge.emoji}</span>
            <div>
              <Badge
                size="sm"
                className="text-white text-[10px] mb-1"
                style={{ backgroundColor: challenge.accentColor }}
              >
                共同挑戰
              </Badge>
              <h2 className="font-bold text-text-dark leading-snug">{challenge.title}</h2>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-5">
          <div>
            <p className="text-sm font-semibold text-text-dark mb-1 flex items-center gap-1.5">
              <Sparkles className="size-4" style={{ color: challenge.accentColor }} />
              承諾宣言
            </p>
            <p className="text-sm text-text-dark/65 leading-relaxed">
              加入這場挑戰，代表你願意在 <strong>{challenge.durationDays} 天</strong> 內，每天完成一次打卡記錄，
              與 <strong>{challenge.participantCount} 位</strong> 夥伴一起前進。
              不需要完美，只要持續出現，就是最好的樣子。
            </p>
          </div>

          <div className="bg-very-light-gray rounded-xl p-4 text-sm flex flex-col gap-2">
            <div className="flex items-center gap-2 text-text-dark/60">
              <CalendarDays className="size-4 shrink-0" />
              <span>
                {challenge.startDate} ～ {challenge.endDate}（共 {challenge.durationDays} 天）
              </span>
            </div>
            <p className="text-xs text-text-dark/40">名稱與期間加入後不可修改，其他可自行調整。</p>
          </div>

          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 size-4 rounded accent-logo-cyan cursor-pointer"
            />
            <span className="text-sm text-text-dark/70 group-hover:text-text-dark transition-colors">
              我了解挑戰規則，準備好與夥伴一起出發！
            </span>
          </label>

          <Button
            className="w-full text-white disabled:opacity-40"
            style={{ backgroundColor: agreed ? challenge.accentColor : undefined }}
            disabled={!agreed}
            onClick={() => setStep("success")}
          >
            確認加入挑戰
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ChallengeUxMockupPage() {
  const [joiningChallenge, setJoiningChallenge] = useState<Challenge | null>(null);

  const activeChallenges = MOCK_CHALLENGES.filter((c) => c.status === "active");
  const upcomingChallenges = MOCK_CHALLENGES.filter((c) => c.status === "upcoming");

  return (
    <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto bg-white">
      <PageHeader rightActionTo="/" />

      <main className="relative px-4 max-w-[600px] mx-auto pb-12">
        {/* Hero */}
        <div className="text-center pt-5 md:pt-12 mb-8">
          <Badge size="sm" variant="secondary" className="text-xs md:text-sm text-text-dark mb-3">
            共同挑戰
          </Badge>
          <h1 className="text-2xl md:text-4xl font-semibold text-text-dark mb-3">
            與夥伴一起衝刺
          </h1>
          <p className="md:text-lg text-text-dark/70 text-center">
            公開學習，互相鼓勵
            <br />
            一個人走得快，一群人走得遠
          </p>
        </div>

        {/* 活動說明 */}
        <div className="mb-8">
          <RulesSection />
        </div>

        {/* 進行中的挑戰 */}
        {activeChallenges.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="size-5 text-logo-cyan" />
              <h2 className="text-base font-bold text-text-dark">進行中的挑戰</h2>
              <span className="text-xs text-text-dark/40 ml-1">現在加入，立刻出發</span>
            </div>
            <div className="flex flex-col gap-4">
              {activeChallenges.map((challenge) => (
                <ActiveChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  onJoin={setJoiningChallenge}
                />
              ))}
            </div>
          </section>
        )}

        {/* 開放報名（未開始） */}
        {upcomingChallenges.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <CalendarDays className="size-5 text-text-dark/50" />
              <h2 className="text-base font-bold text-text-dark">即將開始</h2>
              <span className="text-xs text-text-dark/40 ml-1">搶先預約，開始日自動通知</span>
            </div>
            <div className="flex flex-col gap-4">
              {upcomingChallenges.map((challenge) => (
                <UpcomingChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  onJoin={setJoiningChallenge}
                />
              ))}
            </div>
          </section>
        )}

        {/* Footer note */}
        <p className="text-center text-xs text-text-dark/35 leading-relaxed">
          挑戰由 Dao Dao 官方發起 · 內容均為示意資料
          <br />
          正式上線後將以真實資料呈現
        </p>
      </main>

      {/* Join Modal */}
      {joiningChallenge && (
        <JoinModal
          challenge={joiningChallenge}
          onClose={() => setJoiningChallenge(null)}
        />
      )}
    </div>
  );
}
