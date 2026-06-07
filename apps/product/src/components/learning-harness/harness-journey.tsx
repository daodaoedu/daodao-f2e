"use client";

import type { MoodType, PracticeSummary as PracticeSummaryType } from "@daodao/api";
import { EmberFlameSvg, FineSvg, HappySvg, MascotBasicSvg, NeutralSvg } from "@daodao/assets";
import emberFlameJson from "@daodao/assets/images/quiz/ember-flame.json";
import { useTranslations } from "@daodao/i18n";
import { Avatar, AvatarFallback } from "@daodao/ui/components/avatar";
import { Badge } from "@daodao/ui/components/badge";
import { Button } from "@daodao/ui/components/button";
import { Switch } from "@daodao/ui/components/switch";
import { cn } from "@daodao/ui/lib/utils";
import Lottie from "lottie-react";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  BookOpen,
  Brain,
  Check,
  Heart,
  Lightbulb,
  Mail,
  RotateCcw,
  Share2,
  Sparkles,
  Sunrise,
  Trophy,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import type { ElementType } from "react";
import { useState } from "react";
import { PracticeSummaryCard } from "@/components/practice/summary";

interface DayStep {
  day: number;
  titleKey: string;
  subsystems: string[];
}

const JOURNEY_STEPS: DayStep[] = [
  {
    day: 1,
    titleKey: "j_d1_title",
    subsystems: ["Memory", "Tools", "Skills", "Multi-Agent", "Context Durability"],
  },
  { day: 4, titleKey: "j_d4_title", subsystems: ["Hooks", "Learning Loop"] },
  {
    day: 8,
    titleKey: "j_d8_title",
    subsystems: ["Observability", "Multi-Agent", "Context Durability"],
  },
  { day: 12, titleKey: "j_d12_title", subsystems: ["Drift Detection", "Multi-Agent"] },
  { day: 15, titleKey: "j_d15_title", subsystems: ["Context Durability", "Learning Loop"] },
  {
    day: 20,
    titleKey: "j_d20_title",
    subsystems: ["Drift Detection", "Observability", "Multi-Agent", "Skills"],
  },
  {
    day: 30,
    titleKey: "j_d30_title",
    subsystems: ["Observability", "Context Durability", "Hooks", "Bitter Lesson"],
  },
];

function UserAction({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative pl-4">
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-full bg-light-gray" />
      <p className="text-[10px] font-medium text-light-gray mb-1.5">{label}</p>
      {children}
    </div>
  );
}

function HarnessAction({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative pl-4">
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-full bg-logo-cyan" />
      <p className="text-[10px] font-medium text-logo-cyan mb-1.5">{label}</p>
      {children}
    </div>
  );
}

function BuddyMessage({ name, message }: { name: string; message: string }) {
  return (
    <div className="flex items-start gap-3">
      <Avatar className="size-8 shrink-0">
        <AvatarFallback className="bg-[#E6FBF8] text-logo-cyan text-xs">{name[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <p className="text-[10px] text-light-gray mb-1">{name} · Buddy</p>
        <div className="bg-[#E6FBF8] rounded-xl rounded-tl-none p-3">
          <p className="text-sm text-text-dark leading-relaxed">{message}</p>
        </div>
      </div>
    </div>
  );
}

function ReflectionCard({
  date,
  mood,
  content,
}: {
  date: string;
  mood: { Emoji: ElementType; label: string };
  content: string;
}) {
  return (
    <div className="bg-white rounded-xl p-4 border border-[#C1ECFF]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-light-gray">{date}</span>
        <div className="flex items-center gap-1.5">
          <mood.Emoji className="size-6" />
          <span className="text-xs text-text-dark">{mood.label}</span>
        </div>
      </div>
      <p className="text-sm text-text-dark leading-relaxed whitespace-pre-wrap">{content}</p>
    </div>
  );
}

function Narrative({ text }: { text: string }) {
  return (
    <div className="bg-very-light-gray rounded-xl px-4 py-3 mb-1">
      <p className="text-sm text-text-dark leading-relaxed">{text}</p>
    </div>
  );
}

function EmberFlame({
  className,
  animated = false,
  muted = false,
}: {
  className?: string;
  animated?: boolean;
  muted?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
        muted && "grayscale",
        className
      )}
    >
      {animated ? (
        <Lottie
          animationData={emberFlameJson}
          autoplay
          loop
          className="size-full *:h-full *:w-full"
        />
      ) : (
        <EmberFlameSvg className="size-full" />
      )}
    </span>
  );
}

// Day 1
function DayDay1({ t }: { t: (k: string) => string }) {
  return (
    <div className="space-y-4">
      <Narrative text={t("j_d1_narr")} />

      <UserAction label="你回答了 3 個問題">
        <div className="bg-white rounded-xl p-4 border border-[#C1ECFF]">
          <p className="text-sm font-medium text-text-dark mb-3">{t("persona_title")}</p>
          <div className="space-y-2">
            <div className="bg-very-light-gray rounded-lg p-3">
              <p className="text-xs text-light-gray">{t("persona_q1")}</p>
              <p className="text-sm text-text-dark mt-1 italic">{t("persona_q1_answer")}</p>
            </div>
            <div className="bg-very-light-gray rounded-lg p-3">
              <p className="text-xs text-light-gray">{t("persona_q2")}</p>
              <div className="flex gap-2 mt-1">
                {t("persona_q2_options")
                  .split(",")
                  .map((opt) => (
                    <Badge
                      key={opt}
                      variant={opt === t("persona_q2_answer") ? "default" : "very-light-blue"}
                      size="sm"
                      className={cn(
                        "text-xs",
                        opt === t("persona_q2_answer") && "bg-logo-cyan text-white"
                      )}
                    >
                      {opt}
                    </Badge>
                  ))}
              </div>
            </div>
            <div className="bg-very-light-gray rounded-lg p-3">
              <p className="text-xs text-light-gray">{t("persona_q3")}</p>
              <p className="text-sm text-text-dark mt-1 italic">{t("persona_q3_answer")}</p>
            </div>
          </div>
        </div>
      </UserAction>

      <UserAction label="你建立了實踐">
        <div className="bg-white rounded-xl p-4 border border-[#C1ECFF]">
          <h3 className="font-bold text-text-dark text-lg mb-1">更了解人跟學習的關係</h3>
          <p className="font-medium text-text-dark mb-3">
            看 People-Based Learning，從中找出更多以人為本的學習方式
          </p>
          <div className="flex pb-3 mb-3 border-b border-bg-gray">
            <div className="w-20">
              <div className="text-xs text-text-dark">每週</div>
              <div className="flex items-baseline gap-0.5">
                <div className="text-lg font-medium text-logo-cyan">3-5</div>
                <div className="text-xs text-text-dark">天</div>
              </div>
            </div>
            <div className="w-20">
              <div className="text-xs text-text-dark">每次</div>
              <div className="flex items-baseline gap-0.5">
                <div className="text-lg font-medium text-logo-cyan">30</div>
                <div className="text-xs text-text-dark">分鐘</div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="very-light-blue" size="sm" className="text-sm py-[3px] rounded gap-1">
              學習理論
            </Badge>
            <Badge variant="very-light-blue" size="sm" className="text-sm py-[3px] rounded gap-1">
              閱讀
            </Badge>
          </div>
        </div>
      </UserAction>

      <HarnessAction label="島島自動推斷你的學習方法">
        <div className="bg-[#E6FBF8] rounded-xl p-4 border border-[#C1ECFF]">
          <p className="text-xs text-text-dark mb-2">{t("j_d1_method_inferred")}</p>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-[#C1ECFF] w-fit">
            <BookOpen className="size-4 text-logo-cyan" />
            <span className="text-sm font-medium text-logo-cyan">文字閱讀</span>
            <span className="text-[10px] text-light-gray">auto</span>
          </div>
        </div>
      </HarnessAction>

      <HarnessAction label="島島推薦搭配的學習策略">
        <div className="bg-white rounded-xl p-4 border border-[#C1ECFF]">
          <p className="text-sm font-medium text-text-dark mb-1">{t("skill_cornell_title")}</p>
          <p className="text-xs text-text-dark leading-relaxed mb-2">{t("skill_cornell_desc")}</p>
          <div className="bg-[#E6FBF8] rounded-lg p-2 mb-2">
            <p className="text-xs text-logo-cyan">{t("skill_cornell_tip")}</p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" size="sm" className="text-xs">
              {t("skill_dismiss")}
            </Button>
            <Button type="button" variant="orange" size="sm" className="text-xs">
              {t("skill_try")}
            </Button>
          </div>
          <p className="text-[10px] text-light-gray mt-2 italic">{t("skill_source")}</p>
        </div>
      </HarnessAction>

      <HarnessAction label="島島幫你配對學伴">
        <div className="bg-white rounded-xl p-4 border border-[#C1ECFF]">
          <div className="flex items-center gap-3">
            <Avatar className="size-10">
              <AvatarFallback className="bg-[#E6FBF8] text-logo-cyan">明</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-text-dark">{t("j_d1_buddy_matched")}</p>
              <div className="flex items-center gap-1 mt-1">
                <EmberFlame className="size-3" />
                <span className="text-[10px] text-light-gray">{t("ember_level_1")}</span>
              </div>
            </div>
          </div>
        </div>
      </HarnessAction>

      <UserAction label="你寫下初心">
        <div className="bg-gradient-to-br from-white to-[#E6FBF8] rounded-xl p-4 border border-[#C1ECFF]">
          <p className="text-sm font-medium text-text-dark mb-2">{t("letter_title")}</p>
          <div className="bg-white rounded-lg p-3 border border-[#C1ECFF] mb-2">
            <p className="text-sm text-text-dark italic">
              「希望可以應用在島島阿學使用者的學習體驗。30 天後的我，你找到答案了嗎？」
            </p>
          </div>
          <p className="text-[10px] text-logo-cyan flex items-center gap-1">
            <Check className="size-3" />
            {t("letter_saved")}
          </p>
        </div>
      </UserAction>
    </div>
  );
}

// Day 4
function DayDay4({ t }: { t: (k: string) => string }) {
  return (
    <div className="space-y-4">
      <Narrative text={t("j_d4_narr")} />

      <HarnessAction label="島島帶出你上次的筆記">
        <div className="bg-white rounded-xl p-4 border border-[#C1ECFF]">
          <p className="text-sm font-medium text-text-dark mb-2">{t("hook_pre_checkin")}</p>
          <div className="bg-[#E6FBF8] rounded-lg p-3 mb-3">
            <p className="text-xs text-text-dark italic">{t("hook_pre_checkin_quote")}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-dark">{t("hook_pre_checkin_method")}</p>
            <Button type="button" variant="orange" size="sm" className="text-xs">
              <Check className="size-3" />
              {t("hook_pre_checkin_confirm")}
            </Button>
          </div>
        </div>
      </HarnessAction>

      <UserAction label="你的打卡反思">
        <ReflectionCard
          date="2026/04/09"
          mood={{ Emoji: FineSvg, label: "還不錯" }}
          content={
            '書中提到一個有趣的概念 "Human Library"，來自丹麥的一個計劃。就跟借書一樣，可以借一個人來進行對談。\n\n強調就像看書不能從封面評斷這本書，人也是。'
          }
        />
      </UserAction>

      <HarnessAction label="島島的反饋——兩種動力同時推動你">
        <div className="bg-white rounded-xl p-4 border border-[#C1ECFF]">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#E6FBF8] rounded-lg p-3">
              <p className="text-[10px] font-medium text-logo-cyan mb-1">內在動機</p>
              <p className="text-xs text-text-dark">
                「Human Library」的概念讓你興奮——好奇心被點燃了
              </p>
            </div>
            <div className="bg-[#E6FBF8] rounded-lg p-3">
              <p className="text-[10px] font-medium text-logo-cyan mb-1">外在動機</p>
              <div className="flex items-center gap-1">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                >
                  <EmberFlame className="size-4" animated />
                </motion.div>
                <span className="text-xs text-text-dark">{t("ember_level_2")}</span>
              </div>
            </div>
          </div>
        </div>
      </HarnessAction>

      <HarnessAction label="島島鼓勵">
        <div className="bg-[#E6FBF8] rounded-xl p-4 border border-[#C1ECFF]">
          <div className="flex items-start gap-2">
            <Sparkles className="size-4 text-logo-cyan shrink-0 mt-0.5" />
            <p className="text-sm text-text-dark">{t("j_d4_encouragement")}</p>
          </div>
        </div>
      </HarnessAction>
    </div>
  );
}

// Day 8
function DayDay8({ t }: { t: (k: string) => string }) {
  return (
    <div className="space-y-4">
      <Narrative text={t("j_d8_narr")} />

      <UserAction label="你的打卡反思">
        <ReflectionCard
          date="2026/04/13"
          mood={{ Emoji: FineSvg, label: "還不錯" }}
          content="作者提到在 AI 時代，人之間的互動對於學習是否還是那麼重要呢？\n\n之前有訪談一位使用者提到 AI 雖然很方便，但他還是覺得跟真人討論很重要，畢竟每個人有不同背景，可以對學習有不同啟發。"
        />
      </UserAction>

      <HarnessAction label="Buddy 對你的打卡按了「有啟發」">
        <div className="bg-white rounded-xl p-4 border border-[#C1ECFF]">
          <div className="flex items-center gap-3">
            <Avatar className="size-8">
              <AvatarFallback className="bg-[#E6FBF8] text-logo-cyan text-xs">明</AvatarFallback>
            </Avatar>
            <p className="text-sm text-text-dark flex-1">{t("j_d8_buddy_reaction")}</p>
            <Heart className="size-5 text-logo-cyan" />
          </div>
        </div>
      </HarnessAction>

      <HarnessAction label="島島慶祝你的里程碑">
        <motion.div
          className="bg-gradient-to-br from-[#E6FBF8] to-white rounded-xl p-4 border border-[#C1ECFF] text-center"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <Trophy className="size-8 text-logo-cyan mx-auto mb-2" />
          <p className="text-sm font-medium text-text-dark">{t("milestone_title")}</p>
          <p className="text-xs text-light-gray mt-1">{t("milestone_w2_desc")}</p>
        </motion.div>
      </HarnessAction>

      <HarnessAction label="島島連結你不同天的反思">
        <div className="bg-[#E6FBF8] rounded-xl p-4 border border-[#C1ECFF]">
          <div className="flex items-start gap-2">
            <Brain className="size-4 text-logo-cyan shrink-0 mt-0.5" />
            <p className="text-xs text-text-dark leading-relaxed">
              你在 Day 4 提到 Human
              Library——「借一個人來對談」。今天你又回到了人與人互動的主題。這本書似乎在強化你一直相信的事：真正的學習發生在對話中。
            </p>
          </div>
        </div>
      </HarnessAction>

      <HarnessAction label="島島的每日聚合通知">
        <div className="bg-white rounded-xl p-4 border border-[#C1ECFF]">
          <div className="flex items-start gap-2">
            <Bell className="size-4 text-logo-cyan shrink-0 mt-0.5" />
            <p className="text-xs text-text-dark">{t("hook_notification_content")}</p>
          </div>
        </div>
      </HarnessAction>
    </div>
  );
}

// Day 12
function DayDay12({ t }: { t: (k: string) => string }) {
  return (
    <div className="space-y-4">
      <Narrative text={t("j_d12_narr")} />

      <HarnessAction label="島島偵測到火苗衰退">
        <div className="bg-white rounded-xl p-5 border border-[#C1ECFF]">
          <div className="flex items-center justify-center gap-6 py-3">
            {[
              { label: t("ember_level_3"), opacity: 0.2, size: "size-8", animate: false },
              { label: t("ember_level_2"), opacity: 0.2, size: "size-8", animate: false },
              { label: t("ember_level_1"), opacity: 0.5, size: "size-8", animate: false },
              { label: t("ember_level_0"), opacity: 1, size: "size-10", animate: true },
            ].map((level) => (
              <div key={level.label} className="text-center">
                <motion.div
                  animate={level.animate ? { opacity: [1, 0.3, 1] } : {}}
                  transition={
                    level.animate ? { duration: 2, repeat: Number.POSITIVE_INFINITY } : {}
                  }
                  style={{ opacity: level.opacity }}
                >
                  <EmberFlame
                    className={level.size}
                    animated={level.animate}
                    muted={level.animate}
                  />
                </motion.div>
                <span className="text-[8px] text-light-gray mt-1 block">{level.label}</span>
              </div>
            ))}
          </div>
        </div>
      </HarnessAction>

      <HarnessAction label="Buddy 傳來一段話（不是系統通知）">
        <div className="bg-white rounded-xl p-4 border border-[#C1ECFF]">
          <BuddyMessage
            name="小明"
            message="我今天讀到一段話：「學習不會是線性的，也不會是單獨一人，而是混亂、有循環，也會像星際圖一樣發散。」讓我想到你之前分享的 Human Library 概念。"
          />
        </div>
      </HarnessAction>
    </div>
  );
}

// Day 15
function DayDay15({ t }: { t: (k: string) => string }) {
  return (
    <div className="space-y-4">
      <Narrative text={t("j_d15_narr")} />

      <HarnessAction label="島島歡迎你回來">
        <motion.div
          className="bg-gradient-to-br from-[#E6FBF8] to-white rounded-xl p-5 border border-[#C1ECFF] text-center"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <Sunrise className="size-8 text-logo-cyan mx-auto mb-2" />
          <p className="text-sm font-medium text-text-dark">{t("j_d15_title")}</p>
          <motion.div
            className="flex items-center justify-center gap-1.5 mt-2"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
          >
            <EmberFlame className="size-5" animated />
            <span className="text-sm text-text-dark">{t("j_d15_ember_back")}</span>
          </motion.div>
        </motion.div>
      </HarnessAction>

      <UserAction label="你回來寫了新的反思">
        <ReflectionCard
          date="2026/04/20"
          mood={{ Emoji: FineSvg, label: "還不錯" }}
          content="PeBL 跟 collaborative learning 其實是不同的。collaborative learning 比較目標導向；但 PeBL 會更廣更深。\n\n作者的形容是，collaborative learning 可以幫助你培養技能，而 PeBL 則是幫助你看見自己。"
        />
      </UserAction>

      <HarnessAction label="島島提醒你的初心">
        <div className="bg-gradient-to-br from-white to-[#E6FBF8] rounded-xl p-4 border border-[#C1ECFF]">
          <p className="text-sm font-medium text-text-dark mb-2">{t("j_d15_day1_recall_label")}</p>
          <blockquote className="text-sm text-text-dark/70 italic border-l-2 border-logo-cyan pl-3">
            希望可以應用在島島阿學使用者的學習體驗。30 天後的我，你找到答案了嗎？
          </blockquote>
          <p className="text-xs text-logo-cyan mt-3 text-center">
            你正在實踐這個初心——從書中找到了 PeBL 的核心差異
          </p>
        </div>
      </HarnessAction>

      <HarnessAction label="島島誠實展示你的旅程（含中斷）">
        <div className="bg-white rounded-xl p-4 border border-[#C1ECFF]">
          <div className="flex gap-1">
            {[5, 4, 2, 0, 1].map((rate, i) => (
              <div
                key={`w${i + 1}`}
                className={cn(
                  "flex-1 h-2 rounded-full",
                  rate === 0 ? "bg-very-light-gray" : "bg-logo-cyan",
                  rate > 0 && rate <= 2 && "opacity-40"
                )}
              />
            ))}
          </div>
          <div className="flex justify-between mt-1">
            {["W1", "W2", "W3", "—", "W5"].map((w) => (
              <span key={w} className="text-[8px] text-light-gray flex-1 text-center">
                {w}
              </span>
            ))}
          </div>
          <p className="text-[10px] text-light-gray mt-2 italic">{t("j_d15_gap_honest")}</p>
        </div>
      </HarnessAction>
    </div>
  );
}

// Day 20
function DayDay20({ t }: { t: (k: string) => string }) {
  return (
    <div className="space-y-4">
      <Narrative text={t("j_d20_narr")} />

      <HarnessAction label="島島察覺到變化（不需要你記錄）">
        <div className="bg-white rounded-xl p-4 border border-[#C1ECFF]">
          <div className="flex gap-3">
            <div className="flex-1 bg-[#E6FBF8] rounded-lg p-3">
              <p className="text-[10px] text-logo-cyan font-medium mb-1">之前</p>
              <p className="text-xs text-text-dark">每次打卡都寫下新發現和反思</p>
            </div>
            <div className="flex-1 bg-very-light-gray rounded-lg p-3">
              <p className="text-[10px] text-light-gray font-medium mb-1">最近</p>
              <p className="text-xs text-text-dark">打卡但沒有留下文字</p>
            </div>
          </div>
        </div>
      </HarnessAction>

      <HarnessAction label="透過 Buddy 自然地關心你">
        <div className="bg-white rounded-xl p-4 border border-[#C1ECFF]">
          <BuddyMessage
            name="小明"
            message="你之前分享的那段「互動本身就是思考」讓我想了很久。最近在讀什麼嗎？"
          />
        </div>
      </HarnessAction>

      <HarnessAction label="島島觀察到的關聯">
        <div className="bg-[#E6FBF8] rounded-xl p-4 border border-[#C1ECFF]">
          <div className="flex items-start gap-2">
            <Brain className="size-4 text-logo-cyan shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-text-dark leading-relaxed">{t("observe_mood_arc_desc")}</p>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1">
                  <FineSvg className="size-4" />
                  <span className="text-[10px] text-text-dark">有反思</span>
                </div>
                <div className="flex items-center gap-1">
                  <NeutralSvg className="size-4" />
                  <span className="text-[10px] text-text-dark">沒反思</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </HarnessAction>

      <HarnessAction label="島島建議更輕量的方式">
        <div className="bg-white rounded-xl p-4 border border-[#C1ECFF]">
          <div className="flex items-start gap-2">
            <Lightbulb className="size-4 text-logo-cyan shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-text-dark mb-2">
                既然「寫反思」和你的好心情有關聯，試試更輕量的反思法？
              </p>
              <div className="bg-[#E6FBF8] rounded-lg p-3">
                <p className="text-sm font-medium text-text-dark">一句話反思法</p>
                <p className="text-xs text-text-dark mt-1">
                  打卡時只寫一句：「今天最有印象的一個想法是___」
                </p>
              </div>
            </div>
          </div>
        </div>
      </HarnessAction>
    </div>
  );
}

// Day 30
function DayDay30({ t }: { t: (k: string) => string }) {
  const [switches, setSwitches] = useState({
    encouragement: true,
    ember: true,
    drift: true,
    day1: true,
    skills: false,
  });

  const mockSummary: PracticeSummaryType = {
    userName: "學習者",
    practiceId: "42",
    practiceName: "更了解人跟學習的關係",
    practiceDescription: "看 People-Based Learning，從中找出更多以人為本的學習方式",
    startDate: "2026-04-07",
    endDate: "2026-05-06",
    checkInCount: 14,
    topMoods: [
      { mood: "good" as MoodType, count: 9, lastOccurredAt: "2026-05-04" },
      { mood: "happy" as MoodType, count: 3, lastOccurredAt: "2026-04-27" },
    ],
    topNotes: [
      "互動本身就是思考。沒有了對話與激盪，那種層次的思考根本不會存在。",
      "PeBL 不只培養技能，而是幫助你看見自己。",
      "如何在線上空間讓人有自然的互動和交流？",
    ],
    encouragementText: "你用 30 天證明了一件事：學習不是獨自前行。",
    themeColor: "#C1ECFF",
  };

  return (
    <div className="space-y-4">
      <Narrative text={t("j_d30_narr")} />

      <HarnessAction label="島島慶祝你完成">
        <motion.div
          className="bg-gradient-to-br from-[#E6FBF8] to-white rounded-xl p-5 border border-[#C1ECFF] text-center"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <MascotBasicSvg className="w-16 h-16 mx-auto mb-2" />
          <h3 className="text-xl font-bold text-text-dark">{t("j_d30_celebration")}</h3>
          <p className="text-sm text-logo-cyan mt-1">{t("j_d30_total_checkins")}</p>
        </motion.div>
      </HarnessAction>

      <HarnessAction label="島島產生你的實踐總結卡">
        <div className="flex justify-center">
          <div className="scale-[0.65] origin-top">
            <PracticeSummaryCard summary={mockSummary} />
          </div>
        </div>
      </HarnessAction>

      <HarnessAction label="島島整理你的學習發現">
        <div className="bg-white rounded-xl p-4 border border-[#C1ECFF]">
          <p className="text-xs text-light-gray mb-2">{t("observe_reflection_theme")}</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {[
              t("observe_theme_connection"),
              t("observe_theme_ai_human"),
              t("observe_theme_reflection"),
            ].map((theme) => (
              <Badge key={theme} variant="very-light-blue" size="sm" className="text-xs">
                {theme}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-light-gray mb-2">{t("observe_mood_arc_title")}</p>
          <div className="flex items-center gap-1">
            {[
              NeutralSvg,
              NeutralSvg,
              FineSvg,
              FineSvg,
              FineSvg,
              HappySvg,
              NeutralSvg,
              FineSvg,
              FineSvg,
              HappySvg,
            ].map((Emoji, i) => (
              <Emoji key={`mood-${i + 1}`} className="size-4" />
            ))}
          </div>
        </div>
      </HarnessAction>

      <HarnessAction label="島島回顧你的旅程片段">
        <div className="bg-white rounded-xl p-4 border border-[#C1ECFF]">
          <div className="space-y-3">
            {[
              {
                day: "Day 4",
                Emoji: FineSvg,
                snippet: "「就跟借書一樣，可以借一個人來進行對談」",
              },
              {
                day: "Day 8",
                Emoji: FineSvg,
                snippet: "「AI 雖然方便，但真人的親身經驗更具參考價值」",
              },
              {
                day: "Day 15",
                Emoji: FineSvg,
                snippet: "「PeBL 不只培養技能，而是幫助你看見自己」",
              },
              {
                day: "Day 21",
                Emoji: HappySvg,
                snippet: "「互動本身就是思考。沒有對話，那層次的思考不會存在」",
              },
            ].map((moment) => (
              <div key={moment.day} className="flex items-start gap-3">
                <div className="shrink-0 text-center">
                  <moment.Emoji className="size-5 mx-auto" />
                  <span className="text-[10px] text-light-gray">{moment.day}</span>
                </div>
                <p className="text-xs text-text-dark leading-relaxed italic flex-1">
                  {moment.snippet}
                </p>
              </div>
            ))}
          </div>
        </div>
      </HarnessAction>

      <HarnessAction label="島島拆封你 Day 1 的信">
        <div className="bg-gradient-to-br from-white to-[#E6FBF8] rounded-xl p-4 border border-[#C1ECFF]">
          <div className="flex items-center gap-2 mb-3">
            <Mail className="size-4 text-logo-cyan" />
            <p className="text-sm font-medium text-text-dark">信已拆封</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-light-gray mb-1">Day 1 的你寫</p>
              <p className="text-xs text-text-dark italic">
                「希望可以應用在島島使用者的學習體驗。30 天後的我，你找到答案了嗎？」
              </p>
            </div>
            <div>
              <p className="text-[10px] text-logo-cyan mb-1">Day 30 的你發現</p>
              <p className="text-xs text-text-dark italic">
                「人之間的連結促使學習發生。如何在線上空間讓人有自然的互動和交流？」
              </p>
            </div>
          </div>
          <p className="text-xs text-logo-cyan mt-3 text-center font-medium">
            從「想應用」到「知道要解決什麼問題」——這就是成長
          </p>
        </div>
      </HarnessAction>

      <HarnessAction label="島島的洞察">
        <div className="bg-[#E6FBF8] rounded-xl p-4 border border-[#C1ECFF]">
          <div className="flex items-start gap-2">
            <Brain className="size-4 text-logo-cyan shrink-0 mt-0.5" />
            <p className="text-xs text-text-dark leading-relaxed">{t("j_d30_ai_insight")}</p>
          </div>
        </div>
      </HarnessAction>

      <HarnessAction label="島島讓你自訂 Harness（可開關）">
        <div className="bg-white rounded-xl p-4 border border-[#C1ECFF]">
          <p className="text-xs text-light-gray mb-3">{t("disassemble_desc")}</p>
          <div className="space-y-3">
            {[
              { key: "encouragement", label: t("disassemble_encouragement") },
              { key: "ember", label: t("disassemble_ember") },
              { key: "drift", label: t("disassemble_drift") },
              { key: "day1", label: t("disassemble_day1") },
              { key: "skills", label: t("disassemble_skills") },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <span className="text-sm text-text-dark">{item.label}</span>
                <Switch
                  checked={switches[item.key as keyof typeof switches]}
                  onCheckedChange={(v) => setSwitches((prev) => ({ ...prev, [item.key]: v }))}
                />
              </div>
            ))}
          </div>
        </div>
      </HarnessAction>

      <UserAction label="你分享成長">
        <Button type="button" variant="orange" className="w-full">
          <Share2 className="size-4.5" />
          {t("j_d30_share_prompt")}
        </Button>
      </UserAction>
    </div>
  );
}

// Controller
const DAY_COMPONENTS: Record<number, ({ t }: { t: (k: string) => string }) => React.JSX.Element> = {
  1: DayDay1,
  4: DayDay4,
  8: DayDay8,
  12: DayDay12,
  15: DayDay15,
  20: DayDay20,
  30: DayDay30,
};

export function HarnessJourney() {
  const t = useTranslations("learning_harness");
  const [stepIndex, setStepIndex] = useState(0);
  const step = JOURNEY_STEPS[stepIndex] ?? JOURNEY_STEPS[0];
  const DayComponent = step ? DAY_COMPONENTS[step.day] : null;
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === JOURNEY_STEPS.length - 1;

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-1 mb-2">
          {JOURNEY_STEPS.map((s, i) => (
            <button
              key={s.day}
              type="button"
              onClick={() => setStepIndex(i)}
              className={cn(
                "flex-1 h-1.5 rounded-full transition-all",
                i <= stepIndex ? "bg-logo-cyan" : "bg-very-light-gray"
              )}
            />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-logo-cyan">
            {step ? t("journey_day", { day: String(step.day) }) : ""}
          </span>
          <span className="text-sm font-medium text-text-dark">{step ? t(step.titleKey) : ""}</span>
        </div>
      </div>

      {step && (
        <div className="flex flex-wrap gap-1.5">
          {step.subsystems.map((s) => (
            <span
              key={s}
              className="px-2 py-0.5 rounded-full bg-logo-cyan/10 text-logo-cyan text-[10px] font-medium"
            >
              {s}
            </span>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={step?.day}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
        >
          {DayComponent && <DayComponent t={t} />}
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-3 pt-2">
        {!isFirst && (
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
          >
            <ArrowLeft className="size-4" />
            {t("journey_prev")}
          </Button>
        )}
        <Button
          type="button"
          variant="orange"
          className="flex-1"
          onClick={() => {
            if (isLast) {
              setStepIndex(0);
            } else {
              setStepIndex((i) => i + 1);
            }
          }}
        >
          {isLast ? (
            <>
              <RotateCcw className="size-4" />
              {t("journey_restart")}
            </>
          ) : (
            <>
              {t("journey_next")}
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
