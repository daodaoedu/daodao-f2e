"use client";

import { useTranslations } from "@daodao/i18n";
import { Badge } from "@daodao/ui/components/badge";
import { Button } from "@daodao/ui/components/button";
import { cn } from "@daodao/ui/lib/utils";
import {
  BookOpen,
  Brain,
  CalendarDays,
  Check,
  Flame,
  Gamepad2,
  Hammer,
  MessageCircle,
  Share2,
  Trophy,
  Users,
  Video,
} from "lucide-react";
import { motion } from "motion/react";
import type { ComponentType } from "react";
import type { LearningTool } from "@/constants/learning-tool";
import { SkillGalaxy } from "./skill-galaxy";

const TOOL_ICON_MAP: Record<LearningTool, ComponentType<{ className?: string }>> = {
  video: Video,
  reading: BookOpen,
  project: Hammer,
  community: Users,
  oneOnOne: MessageCircle,
  gamification: Gamepad2,
};

const TOOL_COLOR_MAP: Record<LearningTool, string> = {
  video: "bg-light-blue text-logo-cyan",
  reading: "bg-light-blue text-logo-cyan",
  project: "bg-light-blue text-logo-cyan",
  community: "bg-light-blue text-logo-cyan",
  oneOnOne: "bg-light-blue text-logo-cyan",
  gamification: "bg-light-blue text-logo-cyan",
};

type MoodType = "happy" | "good" | "neutral" | "frustrated" | "bored" | "give_up";

type PracticeStatus = "active" | "completed" | "paused";

interface PracticeCardData {
  id: string;
  name: string;
  action: string;
  status: PracticeStatus;
  totalCheckIns: number;
  durationDays: number;
  tools: LearningTool[];
  emberLevel: number;
  lastCheckIn: string;
}

interface JourneyMoment {
  practiceName: string;
  day: number;
  mood: MoodType;
  snippet: string;
}

interface MoodArcPoint {
  id: string;
  mood: MoodType;
}

interface LearnerGrowthData {
  daysSinceJoined: number;
  totalCheckIns: number;
  activePractices: number;
  completedPractices: number;
  practices: PracticeCardData[];
  moodArc: MoodArcPoint[];
  toolUsage: { tool: LearningTool; count: number }[];
  reflectionThemes: string[];
  journeyMoments: JourneyMoment[];
  personaAnswer: string;
  currentDiscovery: string;
  aiInsight: string;
}

const MOCK_DATA: LearnerGrowthData = {
  daysSinceJoined: 68,
  totalCheckIns: 34,
  activePractices: 2,
  completedPractices: 1,
  practices: [
    {
      id: "1",
      name: "更了解人跟學習的關係",
      action: "看 People-Based Learning",
      status: "completed",
      totalCheckIns: 18,
      durationDays: 30,
      tools: ["reading"],
      emberLevel: 0,
      lastCheckIn: "30 天前",
    },
    {
      id: "2",
      name: "學習社群經營",
      action: "研究線上學習社群的運作模式",
      status: "active",
      totalCheckIns: 12,
      durationDays: 25,
      tools: ["community", "reading"],
      emberLevel: 2,
      lastCheckIn: "今天",
    },
    {
      id: "3",
      name: "UI/UX for Learning",
      action: "設計以學習者為中心的介面",
      status: "active",
      totalCheckIns: 4,
      durationDays: 7,
      tools: ["project", "video"],
      emberLevel: 3,
      lastCheckIn: "昨天",
    },
  ],
  moodArc: [
    { id: "mood-01", mood: "neutral" },
    { id: "mood-02", mood: "neutral" },
    { id: "mood-03", mood: "good" },
    { id: "mood-04", mood: "good" },
    { id: "mood-05", mood: "good" },
    { id: "mood-06", mood: "happy" },
    { id: "mood-07", mood: "neutral" },
    { id: "mood-08", mood: "good" },
    { id: "mood-09", mood: "good" },
    { id: "mood-10", mood: "happy" },
    { id: "mood-11", mood: "good" },
    { id: "mood-12", mood: "good" },
    { id: "mood-13", mood: "neutral" },
    { id: "mood-14", mood: "good" },
    { id: "mood-15", mood: "happy" },
  ],
  toolUsage: [
    { tool: "reading", count: 20 },
    { tool: "community", count: 8 },
    { tool: "project", count: 4 },
    { tool: "video", count: 2 },
  ],
  reflectionThemes: [
    "人的連結與學習",
    "AI vs 真人互動",
    "反思作為學習工具",
    "社群設計",
    "學習者中心",
  ],
  journeyMoments: [
    {
      practiceName: "更了解人跟學習的關係",
      day: 4,
      mood: "good",
      snippet: "「就跟借書一樣，可以借一個人來進行對談」",
    },
    {
      practiceName: "更了解人跟學習的關係",
      day: 21,
      mood: "happy",
      snippet: "「互動本身就是思考。沒有對話，那層次的思考不會存在」",
    },
    {
      practiceName: "學習社群經營",
      day: 8,
      mood: "good",
      snippet: "「最好的社群不是被管理的，是被滋養的」",
    },
    {
      practiceName: "UI/UX for Learning",
      day: 3,
      mood: "happy",
      snippet: "「降低摩擦力比增加功能重要一百倍」",
    },
  ],
  personaAnswer: "希望可以應用在島島阿學使用者的學習體驗",
  currentDiscovery: "人之間的連結促使學習發生。正在從理論走向實踐——設計讓人自然互動的學習空間。",
  aiInsight:
    "你的學習軌跡有明顯的演化：從理論閱讀（PeBL）→ 社群觀察 → 動手設計。三個實踐看似不同主題，但都圍繞同一個核心：「如何讓人與人的連結驅動學習」。你在社群型學習（community）的打卡連續性最好，閱讀時反思品質最高——結合兩者可能是你的最佳學習模式。",
};

const STATUS_STYLE: Record<PracticeStatus, { label: string; className: string }> = {
  active: { label: "進行中", className: "bg-light-blue text-logo-cyan" },
  completed: { label: "已完成", className: "bg-light-blue text-logo-cyan" },
  paused: { label: "暫停", className: "bg-very-light-gray text-light-gray" },
};

const EMBER_DISPLAY = [
  { flames: 0, label: "" },
  { flames: 1, label: "微弱" },
  { flames: 2, label: "穩定" },
  { flames: 3, label: "旺盛" },
];

function ToolBadge({ tool }: { tool: LearningTool }) {
  const t = useTranslations("learning_harness");
  const Icon = TOOL_ICON_MAP[tool];
  const colorClass = TOOL_COLOR_MAP[tool];
  const toolLabelKey = `learning_tool_${tool === "oneOnOne" ? "one_on_one" : tool}` as const;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium",
        colorClass
      )}
    >
      <Icon className="size-3" />
      {t(toolLabelKey)}
    </span>
  );
}

function PracticeCard({ practice }: { practice: PracticeCardData }) {
  const status = STATUS_STYLE[practice.status];
  const ember = EMBER_DISPLAY[practice.emberLevel] ?? { flames: 0, label: "" };

  return (
    <div className="bg-white rounded-xl p-4 border border-light-cyan">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-text-dark truncate">{practice.name}</h3>
          <p className="text-[10px] text-light-gray truncate">{practice.action}</p>
        </div>
        <span
          className={cn(
            "shrink-0 ml-2 px-2 py-0.5 rounded-full text-[10px] font-medium",
            status.className
          )}
        >
          {practice.status === "completed" && <Check className="inline size-3 mr-0.5" />}
          {status.label}
        </span>
      </div>

      <div className="flex items-center gap-4 mb-2">
        <span className="text-xs text-light-gray">
          {practice.totalCheckIns} 次打卡 · {practice.durationDays} 天
        </span>
        {ember.flames > 0 && (
          <span className="flex items-center gap-0.5 text-xs">
            {Array.from({ length: ember.flames }, (_, i) => `${practice.id}-flame-${i}`).map(
              (id) => (
                <Flame key={id} className="size-3 text-logo-cyan" />
              )
            )}
            <span className="text-[10px] text-light-gray">{ember.label}</span>
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {practice.tools.map((tool) => (
            <ToolBadge key={tool} tool={tool} />
          ))}
        </div>
        <span className="text-[10px] text-light-gray">{practice.lastCheckIn}</span>
      </div>
    </div>
  );
}

export function GrowthMap() {
  const t = useTranslations("learning_harness");
  const data = MOCK_DATA;
  const totalTools = data.toolUsage.reduce((s, u) => s + u.count, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-xl font-bold text-text-dark">{t("growth_map_title")}</h1>
      </motion.div>

      {/* Skill Galaxy — breaks out of container for full width */}
      <motion.div
        className="-mx-5"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <SkillGalaxy />
      </motion.div>

      {/* Learner Stats */}
      <motion.div
        className="grid grid-cols-3 gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="flex flex-col items-center gap-1 px-3 py-3 rounded-xl bg-white border border-light-cyan">
          <CalendarDays className="size-5 text-logo-cyan" />
          <p className="text-lg font-bold text-text-dark">{data.daysSinceJoined}</p>
          <p className="text-[10px] text-light-gray">天學習旅程</p>
        </div>
        <div className="flex flex-col items-center gap-1 px-3 py-3 rounded-xl bg-white border border-light-cyan">
          <Flame className="size-5 text-logo-cyan" />
          <p className="text-lg font-bold text-text-dark">{data.totalCheckIns}</p>
          <p className="text-[10px] text-light-gray">次打卡</p>
        </div>
        <div className="flex flex-col items-center gap-1 px-3 py-3 rounded-xl bg-white border border-light-cyan">
          <Trophy className="size-5 text-logo-cyan" />
          <p className="text-lg font-bold text-text-dark">
            {data.activePractices + data.completedPractices}
          </p>
          <p className="text-[10px] text-light-gray">
            {data.completedPractices} 完成 · {data.activePractices} 進行中
          </p>
        </div>
      </motion.div>

      {/* Practice Cards */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <h2 className="text-base font-medium text-text-dark mb-3">
          {t("growth_map_my_practices")}
        </h2>
        <div className="space-y-3">
          {data.practices.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 + i * 0.1 }}
            >
              <PracticeCard practice={p} />
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Cross-Practice Mood Arc */}
      <motion.section
        className="bg-white rounded-2xl p-5 border border-light-cyan"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <h2 className="text-base font-medium text-text-dark mb-3">{t("observe_mood_arc_title")}</h2>
        <div className="flex items-center justify-between gap-0.5">
          {data.moodArc.map((point, i) => {
            return (
              <motion.div
                key={point.id}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.5 + i * 0.03 }}
                className="flex flex-col items-center gap-1"
              >
                <span
                  className={cn(
                    "size-3 rounded-full",
                    point.mood === "happy" || point.mood === "good"
                      ? "bg-logo-cyan"
                      : "bg-light-blue border border-logo-cyan"
                  )}
                />
              </motion.div>
            );
          })}
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[8px] text-light-gray">加入島島</span>
          <span className="text-[8px] text-light-gray">現在</span>
        </div>
        <p className="text-[10px] text-light-gray mt-2 text-center">{t("observe_mood_arc_desc")}</p>
      </motion.section>

      {/* Tool Distribution */}
      <motion.section
        className="bg-white rounded-2xl p-5 border border-light-cyan"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <h2 className="text-base font-medium text-text-dark mb-4">{t("growth_map_tool_usage")}</h2>
        <div className="space-y-3">
          {data.toolUsage.map((usage) => {
            const pct = Math.round((usage.count / totalTools) * 100);
            return (
              <div key={usage.tool} className="flex items-center gap-3">
                <ToolBadge tool={usage.tool} />
                <div className="flex-1 h-2 bg-very-light-gray rounded-full overflow-hidden">
                  <motion.div
                    className={cn("h-full rounded-full bg-logo-cyan")}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                  />
                </div>
                <span className="text-xs text-light-gray w-14 text-right">
                  {usage.count} 次 ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      </motion.section>

      {/* Reflection Themes */}
      <motion.section
        className="bg-white rounded-2xl p-5 border border-light-cyan"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      >
        <h2 className="text-base font-medium text-text-dark mb-2">
          {t("observe_reflection_title")}
        </h2>
        <p className="text-[10px] text-light-gray mb-3">{t("observe_reflection_theme")}</p>
        <div className="flex flex-wrap gap-2">
          {data.reflectionThemes.map((theme) => (
            <Badge key={theme} variant="very-light-blue" size="sm" className="text-xs">
              {theme}
            </Badge>
          ))}
        </div>
      </motion.section>

      {/* Journey Scrapbook */}
      <motion.section
        className="bg-white rounded-2xl p-5 border border-light-cyan"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.7 }}
      >
        <h2 className="text-base font-medium text-text-dark mb-4">
          {t("growth_map_scrapbook_title")}
        </h2>
        <div className="space-y-4">
          {data.journeyMoments.map((moment) => {
            return (
              <motion.div
                key={`${moment.practiceName}-${moment.day}`}
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.8 }}
              >
                <div className="shrink-0 text-center w-10">
                  <span className="mx-auto block size-3 rounded-full bg-logo-cyan" />
                  <span className="text-[8px] text-light-gray">Day {moment.day}</span>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-logo-cyan mb-0.5">{moment.practiceName}</p>
                  <p className="text-xs text-text-dark leading-relaxed italic">{moment.snippet}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* Persona Recall — Day 1 vs Now */}
      <motion.section
        className="bg-light-blue rounded-2xl p-5 border border-light-cyan"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.8 }}
      >
        <h2 className="text-base font-medium text-text-dark mb-4">
          {t("growth_map_persona_title")}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] text-light-gray mb-1">{t("growth_map_persona_then")}</p>
            <p className="text-xs text-text-dark italic leading-relaxed">
              「{data.personaAnswer}」
            </p>
          </div>
          <div>
            <p className="text-[10px] text-logo-cyan mb-1">{t("growth_map_persona_now")}</p>
            <p className="text-xs text-text-dark italic leading-relaxed">
              「{data.currentDiscovery}」
            </p>
          </div>
        </div>
        <p className="text-xs text-logo-cyan mt-4 text-center font-medium">
          {t("growth_map_letter_insight")}
        </p>
      </motion.section>

      {/* AI Insight */}
      <motion.section
        className="bg-white rounded-2xl p-5 border border-light-cyan"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.9 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Brain className="size-5 text-logo-cyan" />
          <h2 className="text-base font-medium text-text-dark">
            {t("growth_map_ai_insight_title")}
          </h2>
        </div>
        <p className="text-sm text-text-dark/80 leading-relaxed">{data.aiInsight}</p>
      </motion.section>

      {/* Share */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 1.0 }}
      >
        <Button type="button" className="w-full bg-logo-cyan text-white hover:bg-logo-cyan/90">
          <Share2 className="size-4.5" />
          {t("growth_map_share")}
        </Button>
      </motion.div>
    </div>
  );
}
