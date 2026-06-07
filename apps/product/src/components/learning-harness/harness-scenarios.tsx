"use client";

import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { cn } from "@daodao/ui/lib/utils";
import {
  AlertTriangle,
  CalendarCheck,
  Check,
  Eye,
  Flame,
  Heart,
  MessageCircle,
  Moon,
  Sparkles,
  Sunrise,
  Target,
  TrendingDown,
  Trophy,
  Users,
  Video,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { ComponentType, ReactNode } from "react";
import { useState } from "react";

interface Scenario {
  id: string;
  titleKey: string;
  subtitleKey: string;
  Icon: ComponentType<{ className?: string }>;
  subsystems: string[];
}

const SCENARIOS: Scenario[] = [
  {
    id: "active",
    titleKey: "s1_title",
    subtitleKey: "s1_subtitle",
    Icon: Target,
    subsystems: ["Tools", "Hooks", "Learning Loop", "Memory"],
  },
  {
    id: "absent",
    titleKey: "s2_title",
    subtitleKey: "s2_subtitle",
    Icon: Moon,
    subsystems: ["Drift Detection", "Multi-Agent", "Hooks"],
  },
  {
    id: "drift",
    titleKey: "s3_title",
    subtitleKey: "s3_subtitle",
    Icon: TrendingDown,
    subsystems: ["Drift Detection", "Observability", "Multi-Agent"],
  },
  {
    id: "comeback",
    titleKey: "s4_title",
    subtitleKey: "s4_subtitle",
    Icon: Sunrise,
    subsystems: ["Context Durability", "Multi-Agent", "Observability", "Learning Loop"],
  },
  {
    id: "social",
    titleKey: "s5_title",
    subtitleKey: "s5_subtitle",
    Icon: Users,
    subsystems: ["Multi-Agent", "Hooks", "Learning Loop"],
  },
];

function SubsystemTags({ subsystems }: { subsystems: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {subsystems.map((s) => (
        <span
          key={s}
          className="px-2 py-0.5 rounded-full bg-logo-cyan/10 text-logo-cyan text-[10px] font-medium"
        >
          {s}
        </span>
      ))}
    </div>
  );
}

function InfoCard({
  icon,
  children,
  className,
}: {
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("bg-white rounded-2xl p-5 border border-[#C1ECFF]", className)}>
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">{icon}</div>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}

function ScenarioActive({ t }: { t: (key: string, values?: Record<string, string>) => string }) {
  const [checked, setChecked] = useState(false);

  return (
    <div className="space-y-4">
      <InfoCard icon={<Eye className="size-4 text-logo-cyan" />}>
        <p className="text-sm font-medium text-text-dark mb-1">{t("s1_auto_method")}</p>
        <p className="text-xs text-light-gray mb-3">{t("s1_auto_method_desc")}</p>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#E6FBF8] border border-[#C1ECFF] w-fit">
          <Video className="size-4 text-logo-cyan" />
          <span className="text-sm font-medium text-logo-cyan">影片跟讀</span>
          <span className="text-[10px] text-light-gray ml-1">auto</span>
        </div>
        <p className="text-[10px] text-light-gray mt-2 italic">{t("s1_inferred_from")}</p>
      </InfoCard>

      <div className="bg-white rounded-2xl p-5 border border-[#C1ECFF]">
        <div className="text-center">
          <h3 className="font-medium text-text-dark mb-1">商務日語口說計畫</h3>
          <p className="text-xs text-light-gray mb-1">精通 N5-3 文法 + 跟讀法學職場日語</p>
          <p className="text-xs text-logo-cyan mb-4">本週 4/3-5 次 · 達成率 120%</p>

          {!checked ? (
            <Button
              type="button"
              variant="orange"
              className="w-full"
              onClick={() => setChecked(true)}
            >
              <Check className="size-4.5" />
              一鍵打卡（自動帶入上次方法）
            </Button>
          ) : (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-center gap-2">
                <CalendarCheck className="size-5 text-logo-cyan" />
                <p className="text-lg font-bold text-logo-cyan">{t("s1_checkin_done")}</p>
              </div>

              <div className="bg-[#E6FBF8] rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <Sparkles className="size-4 text-logo-cyan shrink-0 mt-0.5" />
                  <p className="text-sm text-text-dark">{t("s1_encouragement")}</p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-1.5">
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                  >
                    <Flame className="size-5 text-orange-500" />
                  </motion.div>
                  <span className="text-sm text-text-dark">{t("s1_ember_status")}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2">
                <Trophy className="size-4 text-logo-cyan" />
                <span className="text-sm font-bold text-text-dark">{t("s1_streak")}</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function ScenarioAbsent({ t }: { t: (key: string, values?: Record<string, string>) => string }) {
  return (
    <div className="space-y-4">
      <motion.div
        className="bg-white rounded-2xl p-5 border border-[#C1ECFF]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center mb-3">
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            className="inline-block"
          >
            <Flame className="size-12 text-light-gray" />
          </motion.div>
        </div>
        <p className="text-center text-sm font-medium text-text-dark">{t("s2_ember_dimming")}</p>
        <p className="text-center text-xs text-light-gray mt-1">{t("s2_ember_desc")}</p>
        <div className="text-center mt-2">
          <span className="inline-flex items-center gap-1 text-xs text-light-gray font-medium bg-very-light-gray px-2 py-1 rounded-full">
            <AlertTriangle className="size-3" />
            {t("s2_day_count")}
          </span>
        </div>
      </motion.div>

      <motion.div
        className="bg-white rounded-2xl p-5 border border-[#C1ECFF]"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="size-10 rounded-full bg-[#E6FBF8] flex items-center justify-center">
            <Heart className="size-5 text-logo-cyan" />
          </div>
          <div>
            <p className="font-medium text-text-dark">{t("s2_buddy_card")}</p>
            <p className="text-xs text-light-gray">Buddy · 小明</p>
          </div>
        </div>
        <p className="text-sm text-text-dark/80 leading-relaxed bg-[#E6FBF8] rounded-lg p-3">
          {t("s2_buddy_msg")}
        </p>
        <p className="text-xs text-logo-cyan mt-3 text-center italic">{t("s2_not_guilt")}</p>
      </motion.div>

      <motion.div
        className="rounded-2xl overflow-hidden border border-[#C1ECFF]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className="bg-very-light-gray px-4 py-2">
          <p className="text-xs font-medium text-text-dark">{t("s2_system_contrast_title")}</p>
        </div>
        <div className="grid grid-cols-2 divide-x divide-[#C1ECFF]">
          <div className="p-3 bg-white">
            <p className="text-[10px] font-medium text-light-gray mb-1">{t("s2_traditional")}</p>
            <p className="text-xs text-text-dark">{t("s2_traditional_msg")}</p>
          </div>
          <div className="p-3 bg-[#E6FBF8]">
            <p className="text-[10px] font-medium text-logo-cyan mb-1">{t("s2_daodao")}</p>
            <p className="text-xs text-text-dark">{t("s2_daodao_msg")}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ScenarioDrift({ t }: { t: (key: string, values?: Record<string, string>) => string }) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-5 border border-[#C1ECFF]">
        <div className="flex items-center gap-2 mb-3">
          <TrendingDown className="size-4 text-logo-cyan" />
          <span className="text-sm font-medium text-text-dark">{t("s3_pattern_title")}</span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-[#E6FBF8] rounded-lg p-3">
            <p className="text-[10px] font-medium text-logo-cyan mb-1">W1-W2</p>
            <p className="text-xs text-text-dark">{t("s3_pattern_before")}</p>
            <p className="text-[10px] text-logo-cyan mt-1">5-6 次/週（目標 3-5）</p>
          </div>
          <div className="bg-very-light-gray rounded-lg p-3">
            <p className="text-[10px] font-medium text-light-gray mb-1">W3-W4</p>
            <p className="text-xs text-text-dark">{t("s3_pattern_after")}</p>
            <p className="text-[10px] text-light-gray mt-1">2-3 次/週（低於目標）</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-text-dark">{t("s3_signal_title")}</p>
          {["s3_signal_checkin_gap", "s3_signal_note_decline", "s3_signal_mood_shift"].map(
            (key) => (
              <motion.div
                key={key}
                className="flex items-center gap-2 px-3 py-1.5 bg-very-light-gray rounded-lg"
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <span className="size-1.5 rounded-full bg-logo-cyan" />
                <span className="text-xs text-text-dark">{t(key)}</span>
              </motion.div>
            )
          )}
        </div>
      </div>

      <motion.div
        className="bg-white rounded-2xl p-5 border border-[#C1ECFF]"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Users className="size-4 text-logo-cyan" />
          <p className="text-xs font-medium text-logo-cyan">{t("s3_buddy_intervene")}</p>
        </div>
        <div className="flex items-start gap-3">
          <div className="size-8 rounded-full bg-[#E6FBF8] flex items-center justify-center shrink-0">
            <MessageCircle className="size-4 text-logo-cyan" />
          </div>
          <div className="bg-[#E6FBF8] rounded-xl rounded-tl-none p-3 flex-1">
            <p className="text-sm text-text-dark/80 leading-relaxed">{t("s3_buddy_suggest")}</p>
            <p className="text-[10px] text-light-gray mt-1">小明 · Buddy</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ScenarioComeback({ t }: { t: (key: string, values?: Record<string, string>) => string }) {
  return (
    <div className="space-y-4">
      <motion.div
        className="bg-gradient-to-br from-[#E6FBF8] to-white rounded-2xl p-5 border border-[#C1ECFF] text-center"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <Sunrise className="size-8 text-logo-cyan mx-auto mb-2" />
        <h3 className="text-lg font-bold text-text-dark">{t("s4_welcome_back")}</h3>
        <p className="text-sm text-logo-cyan mt-1">{t("s4_buddy_waited")}</p>
        <motion.div
          className="flex items-center justify-center gap-1.5 mt-3"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
        >
          <Flame className="size-5 text-orange-500" />
          <span className="text-sm font-medium text-text-dark">{t("s4_ember_reignite")}</span>
        </motion.div>
      </motion.div>

      <motion.div
        className="bg-white rounded-2xl p-5 border border-[#C1ECFF]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-sm font-medium text-text-dark mb-3">{t("s4_gap_shown")}</p>
        <div className="space-y-2">
          {[
            { w: "W1", rate: 6, target: 5, comeback: false },
            { w: "W2", rate: 5, target: 5, comeback: false },
            { w: "W3", rate: 3, target: 5, comeback: false },
            { w: "W4", rate: 0, target: 5, comeback: false },
            { w: "W5", rate: 1, target: 5, comeback: true },
          ].map((week) => (
            <div key={week.w} className="flex items-center gap-3">
              <span className="text-xs text-light-gray w-6">{week.w}</span>
              <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                {week.rate > 0 ? (
                  <motion.div
                    className={cn(
                      "h-full rounded-full bg-gradient-to-r",
                      week.comeback ? "from-[#C1ECFF] to-logo-cyan" : "from-[#C1ECFF] to-logo-cyan"
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${(week.rate / 7) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                ) : (
                  <div className="h-full w-full bg-very-light-gray flex items-center justify-center">
                    <span className="text-[8px] text-light-gray">—</span>
                  </div>
                )}
              </div>
              <span className="text-xs text-light-gray w-10 text-right">
                {week.rate}/{week.target}
              </span>
              {week.comeback && (
                <span className="text-[10px] text-logo-cyan font-medium flex items-center gap-0.5">
                  <Check className="size-3" />
                  回歸
                </span>
              )}
            </div>
          ))}
        </div>
        <p className="text-[10px] text-light-gray mt-2 italic">{t("s4_gap_desc")}</p>
      </motion.div>

      <motion.div
        className="bg-gradient-to-br from-white to-[#E6FBF8] rounded-2xl p-5 border border-[#C1ECFF]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="size-4 text-logo-cyan" />
          <p className="text-sm font-medium text-text-dark">{t("s4_day1_recall")}</p>
        </div>
        <blockquote className="text-sm text-text-dark/80 italic border-l-2 border-logo-cyan pl-3">
          {t("s4_day1_message")}
        </blockquote>
        <p className="text-xs text-logo-cyan mt-3 text-center font-medium">
          {t("s4_day1_distance")}
        </p>
      </motion.div>
    </div>
  );
}

function ScenarioSocial({ t }: { t: (key: string, values?: Record<string, string>) => string }) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-5 border border-[#C1ECFF]">
        <div className="flex items-center gap-2 mb-3">
          <Users className="size-4 text-logo-cyan" />
          <span className="text-sm font-medium text-text-dark">{t("s5_buddy_pair")}</span>
        </div>
        <p className="text-xs text-light-gray mb-3">{t("s5_buddy_pair_desc")}</p>

        <div className="flex items-center justify-center gap-4 py-3">
          <div className="text-center">
            <div className="size-12 rounded-full bg-[#E6FBF8] flex items-center justify-center mx-auto mb-1">
              <Users className="size-5 text-logo-cyan" />
            </div>
            <span className="text-xs text-text-dark">你</span>
          </div>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
          >
            <Flame className="size-8 text-orange-500" />
          </motion.div>
          <div className="text-center">
            <div className="size-12 rounded-full bg-[#E6FBF8] flex items-center justify-center mx-auto mb-1">
              <Users className="size-5 text-logo-cyan" />
            </div>
            <span className="text-xs text-text-dark">小明</span>
          </div>
        </div>
      </div>

      {[
        {
          icon: <Flame className="size-4 text-orange-500" />,
          title: t("s5_ember_mutual"),
          desc: t("s5_ember_mutual_desc"),
        },
        {
          icon: <Sparkles className="size-4 text-logo-cyan" />,
          title: t("s5_resonance"),
          desc: t("s5_resonance_desc"),
        },
        {
          icon: <Heart className="size-4 text-logo-cyan" />,
          title: t("s5_card_send"),
          desc: t("s5_card_send_desc"),
        },
      ].map((item) => (
        <motion.div
          key={item.title}
          className="bg-white rounded-2xl p-4 border border-[#C1ECFF]"
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5">{item.icon}</div>
            <div>
              <p className="text-sm font-medium text-text-dark">{item.title}</p>
              <p className="text-xs text-light-gray mt-0.5">{item.desc}</p>
            </div>
          </div>
        </motion.div>
      ))}

      <div className="bg-very-light-gray rounded-2xl p-4 border border-dashed border-light-gray">
        <p className="text-xs font-medium text-light-gray mb-2">{t("s5_missing")}</p>
        <div className="space-y-1.5">
          <p className="text-xs text-light-gray">{t("s5_missing_group")}</p>
          <p className="text-xs text-light-gray">{t("s5_missing_mentor")}</p>
        </div>
      </div>
    </div>
  );
}

export function HarnessScenarios() {
  const t = useTranslations("learning_harness");
  const [activeScenario, setActiveScenario] = useState("active");

  const current = SCENARIOS.find((s) => s.id === activeScenario) ??
    SCENARIOS[0] ?? { subsystems: [] as string[] };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-medium text-light-gray mb-2">{t("scenario_pick")}</p>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {SCENARIOS.map((s) => {
            const SIcon = s.Icon;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveScenario(s.id)}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-xl border-2 transition-all shrink-0 min-w-[72px]",
                  activeScenario === s.id
                    ? "border-logo-cyan bg-[#E6FBF8]"
                    : "border-gray-100 bg-white hover:border-gray-200"
                )}
              >
                <SIcon
                  className={cn(
                    "size-5",
                    activeScenario === s.id ? "text-logo-cyan" : "text-light-gray"
                  )}
                />
                <span className="text-[10px] font-medium text-text-dark">{t(s.titleKey)}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-[10px] font-medium text-light-gray mb-1.5">
          {t("scenario_active_subsystems")}
        </p>
        <SubsystemTags subsystems={current.subsystems} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeScenario}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25 }}
        >
          {activeScenario === "active" && <ScenarioActive t={t} />}
          {activeScenario === "absent" && <ScenarioAbsent t={t} />}
          {activeScenario === "drift" && <ScenarioDrift t={t} />}
          {activeScenario === "comeback" && <ScenarioComeback t={t} />}
          {activeScenario === "social" && <ScenarioSocial t={t} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
