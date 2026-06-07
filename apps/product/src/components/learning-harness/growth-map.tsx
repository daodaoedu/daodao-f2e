"use client";

import { useTranslations } from "@daodao/i18n";
import { cn } from "@daodao/ui/lib/utils";
import {
  BookOpen,
  Brain,
  Flame,
  Gamepad2,
  Hammer,
  MessageCircle,
  Trophy,
  Users,
  Video,
} from "lucide-react";
import { motion } from "motion/react";
import type { ComponentType } from "react";
import type { LearningTool } from "@/constants/learning-tool";

const TOOL_ICON_MAP: Record<LearningTool, ComponentType<{ className?: string }>> = {
  video: Video,
  reading: BookOpen,
  project: Hammer,
  community: Users,
  oneOnOne: MessageCircle,
  gamification: Gamepad2,
};

const TOOL_COLOR_MAP: Record<LearningTool, string> = {
  video: "bg-blue-100 text-blue-600",
  reading: "bg-amber-100 text-amber-600",
  project: "bg-green-100 text-green-600",
  community: "bg-purple-100 text-purple-600",
  oneOnOne: "bg-pink-100 text-pink-600",
  gamification: "bg-orange-100 text-orange-600",
};

type MoodType = "happy" | "good" | "neutral" | "frustrated" | "bored" | "give_up";

interface WeekData {
  week: number;
  tools: LearningTool[];
  checkInRate: number;
  dominantMood: MoodType;
  hasNotes: boolean;
}

interface GrowthMapData {
  practiceName: string;
  practiceAction: string;
  durationDays: number;
  level: number;
  weeklyRate: number;
  totalCheckIns: number;
  mostEffectiveTool: LearningTool;
  weeks: WeekData[];
  day1Message: string;
  aiInsight: string;
  driftDetected: boolean;
}

// Based on real practice #40: 商務日語口說計畫 (18 check-ins / 30 days)
// Pattern: W1-W2 dense daily check-ins, W3 gaps appear, W4 widening gaps
const MOCK_DATA: GrowthMapData = {
  practiceName: "商務日語口說計畫",
  practiceAction: "精通 N5-3 文法 + 跟讀法學職場日語",
  durationDays: 30,
  level: 2,
  weeklyRate: 18,
  totalCheckIns: 18,
  mostEffectiveTool: "video",
  weeks: [
    {
      week: 1,
      tools: ["video", "reading"],
      checkInRate: 6,
      dominantMood: "neutral",
      hasNotes: true,
    },
    { week: 2, tools: ["video", "reading"], checkInRate: 5, dominantMood: "good", hasNotes: true },
    { week: 3, tools: ["video"], checkInRate: 3, dominantMood: "neutral", hasNotes: false },
    { week: 4, tools: ["reading"], checkInRate: 2, dominantMood: "neutral", hasNotes: false },
  ],
  day1Message: "希望在職場上能用日語溝通，不再依賴翻譯",
  aiInsight:
    "W1-W2 使用「影片跟讀」時打卡最密集（每週 5-6 天），W3 開始只用「文字閱讀」後間距拉大。建議切回影片跟讀搭配閱讀，這是你連續性最好的組合。",
  driftDetected: true,
};

function ToolBadge({ tool }: { tool: LearningTool }) {
  const t = useTranslations("learning_harness");
  const Icon = TOOL_ICON_MAP[tool];
  const colorClass = TOOL_COLOR_MAP[tool];
  const toolLabelKey = `learning_tool_${tool === "oneOnOne" ? "one_on_one" : tool}` as const;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
        colorClass
      )}
    >
      <Icon className="size-3" />
      {t(toolLabelKey)}
    </span>
  );
}

const MOOD_EMOJI: Record<MoodType, string> = {
  happy: "🤩",
  good: "😊",
  neutral: "😐",
  frustrated: "😫",
  bored: "😑",
  give_up: "😢",
};

const BAR_COLOR: Record<string, string> = {
  high: "from-[#C1ECFF] to-logo-cyan",
  mid: "from-amber-200 to-amber-400",
  low: "from-red-200 to-red-400",
};

function getBarColor(rate: number) {
  if (rate >= 5) return BAR_COLOR.high;
  if (rate >= 3) return BAR_COLOR.mid;
  return BAR_COLOR.low;
}

export function GrowthMap() {
  const t = useTranslations("learning_harness");
  const data = MOCK_DATA;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-xl font-bold text-text-dark mb-1">{data.practiceName}</h1>
        <p className="text-sm text-light-gray mb-2">{data.practiceAction}</p>
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#E6FBF8] text-logo-cyan text-sm font-medium">
          <Trophy className="size-4" />
          {t("growth_map_level", { level: String(data.level) })}
        </span>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        className="grid grid-cols-3 gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="flex flex-col items-center gap-1 px-3 py-3 rounded-xl bg-white border border-[#C1ECFF]">
          <Flame className="size-5 text-orange-500" />
          <p className="text-lg font-bold text-text-dark">{data.totalCheckIns}</p>
          <p className="text-[10px] text-light-gray">打卡次數</p>
        </div>
        <div className="flex flex-col items-center gap-1 px-3 py-3 rounded-xl bg-white border border-[#C1ECFF]">
          <Trophy className="size-5 text-logo-cyan" />
          <p className="text-lg font-bold text-text-dark">{data.durationDays}</p>
          <p className="text-[10px] text-light-gray">天旅程</p>
        </div>
        <div className="flex flex-col items-center gap-1 px-3 py-3 rounded-xl bg-white border border-[#C1ECFF]">
          <ToolBadge tool={data.mostEffectiveTool} />
          <p className="text-[10px] text-light-gray mt-1">{t("growth_map_most_effective")}</p>
        </div>
      </motion.div>

      {/* Drift Warning */}
      {data.driftDetected && (
        <motion.div
          className="flex items-start gap-3 bg-amber-50 rounded-xl p-4 border border-amber-200"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <span className="text-lg shrink-0">⚠️</span>
          <div>
            <p className="text-sm font-medium text-amber-700">方法偏離偵測</p>
            <p className="text-xs text-amber-600 mt-0.5">
              W3 起打卡頻率下降，可能與學習方法切換有關
            </p>
          </div>
        </motion.div>
      )}

      {/* Weekly Timeline */}
      <motion.section
        className="bg-white rounded-2xl p-5 border border-[#C1ECFF]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <h2 className="text-base font-medium text-text-dark mb-4">
          {t("growth_map_weekly_timeline")}
        </h2>
        <div className="space-y-4">
          {data.weeks.map((week) => (
            <div key={week.week} className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-light-gray w-8 shrink-0">
                  {t("growth_map_week_label", { week: String(week.week) })}
                </span>

                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className={cn(
                      "h-full bg-gradient-to-r rounded-full",
                      getBarColor(week.checkInRate)
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${(week.checkInRate / 7) * 100}%` }}
                    transition={{ duration: 0.6, delay: 0.3 + week.week * 0.1 }}
                  />
                </div>

                <span className="text-xs text-light-gray w-8 shrink-0 text-right">
                  {t("growth_map_checkin_rate", { rate: String(week.checkInRate) })}
                </span>

                <span className="text-sm shrink-0" title={week.dominantMood}>
                  {MOOD_EMOJI[week.dominantMood]}
                </span>

                <div className="flex gap-0.5 shrink-0">
                  {week.tools.map((tool) => {
                    const Icon = TOOL_ICON_MAP[tool];
                    const colorClass = TOOL_COLOR_MAP[tool];
                    return (
                      <span
                        key={tool}
                        className={cn(
                          "inline-flex items-center justify-center size-6 rounded-full",
                          colorClass
                        )}
                      >
                        <Icon className="size-3.5" />
                      </span>
                    );
                  })}
                </div>
              </div>
              {week.hasNotes && (
                <div className="ml-11 flex items-center gap-1">
                  <span className="text-[10px] text-logo-cyan">✍️ 有反思筆記</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.section>

      {/* Tool Effectiveness Comparison */}
      <motion.section
        className="bg-white rounded-2xl p-5 border border-[#C1ECFF]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <h2 className="text-base font-medium text-text-dark mb-4">{t("growth_map_tool_usage")}</h2>
        <div className="space-y-3">
          {Array.from(new Set(data.weeks.flatMap((w) => w.tools))).map((tool) => {
            const weeksUsed = data.weeks.filter((w) => w.tools.includes(tool));
            const avgRate = weeksUsed.reduce((s, w) => s + w.checkInRate, 0) / weeksUsed.length;
            return (
              <div key={tool} className="flex items-center gap-3">
                <ToolBadge tool={tool} />
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      avgRate >= 4 ? "bg-logo-cyan" : "bg-amber-400"
                    )}
                    style={{ width: `${(avgRate / 7) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-light-gray w-16 text-right">
                  avg {avgRate.toFixed(1)}/7
                </span>
              </div>
            );
          })}
        </div>
      </motion.section>

      {/* Day 1 Message — Context Durability */}
      <motion.section
        className="bg-gradient-to-br from-white to-[#E6FBF8] rounded-2xl p-5 border border-[#C1ECFF]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">📝</span>
          <h2 className="text-base font-medium text-text-dark">
            {t("growth_map_day1_message_title")}
          </h2>
        </div>
        <blockquote className="text-sm text-text-dark/80 leading-relaxed italic border-l-2 border-logo-cyan pl-3">
          「{data.day1Message}」
        </blockquote>
      </motion.section>

      {/* AI Insight */}
      <motion.section
        className="bg-white rounded-2xl p-5 border border-[#C1ECFF]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Brain className="size-5 text-logo-cyan" />
          <h2 className="text-base font-medium text-text-dark">
            {t("growth_map_ai_insight_title")}
          </h2>
        </div>
        <p className="text-sm text-text-dark/80 leading-relaxed">{data.aiInsight}</p>
      </motion.section>
    </div>
  );
}
