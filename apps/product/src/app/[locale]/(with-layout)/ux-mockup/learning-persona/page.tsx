"use client";

// ============================================================================
// UX Mockup — Learning Persona in Inspire Tab
// feat/learning-persona — v2 community responses
// ============================================================================

import {
  BoredSvg,
  DialogOutlineSvg,
  FineSvg,
  FrustratedSvg,
  HappySvg,
  HopelessSvg,
  NeutralSvg,
  StampSvg,
} from "@daodao/assets";
import { useIsMobile } from "@daodao/shared";
import { Avatar, AvatarFallback } from "@daodao/ui/components/avatar";
import { Badge } from "@daodao/ui/components/badge";
import { cn } from "@daodao/ui/lib/utils";
import { ArrowRight, CalendarCheck, CheckCircle2, Laugh, Lock, Maximize2, RefreshCw, Rss, Search, ThumbsUp, X } from "lucide-react";
import { useRef, useState } from "react";
import type { ElementType } from "react";
import { BackgroundAnimation, Banner } from "@/components/layout";
import { DesktopSidebar } from "@/components/layout/sidebar/desktop";
import { MobileSidebar } from "@/components/layout/sidebar/mobile";
import { ReactionPickerButton } from "@/components/check-in/reactions";
import type { ReactionTypeType } from "@/constants/reaction-type";

// ─── Custom SVG assets ────────────────────────────────────────────────────────

function QuoteSvg({ className }: { className?: string }) {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <title>引言符號</title>
      <path d="M51.4667 16.8C54.1333 19.7334 55.7333 22.9334 55.7333 28.2667C55.7333 37.6 49.0667 45.8667 39.7333 50.1334L37.3333 46.6667C46.1333 41.8667 48 35.7334 48.5333 31.7334C47.2 32.5334 45.3333 32.8 43.4667 32.5334C38.6667 32 34.9333 28.2667 34.9333 23.2C34.9333 20.8 36 18.4 37.6 16.5334C39.4667 14.6667 41.6 13.8667 44.2667 13.8667C47.2 13.8667 49.8667 15.2 51.4667 16.8ZM24.8 16.8C27.4667 19.7334 29.0667 22.9334 29.0667 28.2667C29.0667 37.6 22.4 45.8667 13.0667 50.1334L10.6667 46.6667C19.4667 41.8667 21.3333 35.7334 21.8667 31.7334C20.5333 32.5334 18.6667 32.8 16.8 32.5334C12 32 8.26666 28 8.26666 23.2C8.26666 20.8 9.33333 18.4 10.9333 16.5334C12.8 14.6667 14.9333 13.8667 17.6 13.8667C20.5333 13.8667 23.2 15.2 24.8 16.8Z" fill="#16B9B3"/>
    </svg>
  );
}

function ArrowCircleSvg({ className }: { className?: string }) {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <title>繼續箭頭</title>
      <circle cx="30" cy="30" r="30" fill="#F0FAFA"/>
      <path d="M42.0735 30.0176L30.4666 30.0194M30.45 30.0194L17.85 30.0194M30.45 17.4L41.3791 28.3296C41.8221 28.7727 42.071 29.3735 42.071 30C42.071 30.6265 41.8221 31.2274 41.3791 31.6704L30.45 42.6" stroke="#5C7080" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ─── Expandable search ────────────────────────────────────────────────────────

function ExpandableSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const expand = () => {
    setExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 30);
  };

  const handleBlur = () => {
    if (!value) setExpanded(false);
  };

  return (
    <div className="flex items-center justify-start">
      {/* biome-ignore lint/a11y/noStaticElementInteractions: expandable search toggle */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: expandable search toggle */}
      {/* biome-ignore lint/a11y/useAriaPropsSupportedByRole: aria-label on search container */}
      <div
        className={cn(
          "flex items-center bg-white border rounded-full h-10 overflow-hidden transition-all duration-300 ease-in-out",
          expanded
            ? "w-full border-[#9fb5b8] px-4"
            : "w-10 border-[#e4eae9] cursor-pointer justify-center"
        )}
        onClick={!expanded ? expand : undefined}
        role={!expanded ? "button" : undefined}
        aria-label={!expanded ? "搜尋" : undefined}
      >
        <Search
          className={cn(
            "shrink-0 transition-all duration-200",
            expanded ? "size-4 text-text-dark/40 mr-2" : "size-[18px] text-text-dark/60"
          )}
        />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleBlur}
          placeholder="搜尋靈感"
          tabIndex={expanded ? 0 : -1}
          className={cn(
            "text-sm text-text-dark bg-transparent placeholder:text-text-dark/40 outline-none transition-all duration-300",
            expanded ? "flex-1 opacity-100" : "w-0 opacity-0 pointer-events-none"
          )}
        />
        {expanded && value && (
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              onChange("");
            }}
            className="ml-1 text-text-dark/40 hover:text-text-dark/70 transition-colors"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Learning Persona ─────────────────────────────────────────────────────────

const QUESTION_BANK = [
  { question: "當你對某件事失去動力時，什麼能幫助你重新找回熱情？", example: "例：睡一覺讓自己好好休息" },
  { question: "對我來說，學習最有價值的部分是⋯⋯", example: "例：把知識應用在真實生活中" },
  { question: "哪種學習方式最適合你？為什麼？", example: "例：邊做邊學，從錯誤中進步" },
  { question: "說說一次讓你意外認識自己的學習經歷。", example: "例：學樂器時發現自己很沒耐心" },
  { question: "你目前正在培養或戒掉的習慣是什麼？", example: "例：每天早起讀 30 分鐘書" },
  { question: "如果明年能精通任何一項技能，你會選什麼？", example: "例：公開演講，因為很害怕但很重要" },
  { question: "你怎麼知道自己真的理解了一件新事物？", example: "例：能用自己的話解釋給別人聽" },
  { question: "你理想的學習環境是什麼樣子？", example: "例：安靜的咖啡廳，有輕音樂陪伴" },
];

const RESPONSE_PREVIEWS = [
  {
    name: "長文測試",
    color: "#F5A93E",
    text: "對我來說，持續不斷的實踐與反思最重要。剛開始接觸新領域時，一定會覺得很困難，但慢慢就會找到節奏。",
    locked: false,
  },
  {
    name: "林小明",
    color: "#16B9B3",
    text: "能夠立刻應用在實際工作中。如果只是純理論，我很容易就會失去動力，實作對我來說最重要。",
    locked: false,
  },
  {
    name: "??",
    color: "#B8D0CF",
    text: "這是被鎖起來的回應，先分享你的想法就能解鎖查看完整內容。這個人有很精彩的觀點。",
    locked: true,
  },
  {
    name: "??",
    color: "#B8D0CF",
    text: "另一個隱藏的回應，回答問題後即可查看所有人的分享內容，一起交流成長。",
    locked: true,
  },
];

function ResponseCard({
  name,
  color,
  text,
  locked,
  onUnlock,
}: {
  name: string;
  color: string;
  text: string;
  locked?: boolean;
  onUnlock?: () => void;
}) {
  return (
    <div className="flex-shrink-0 w-[172px] h-[148px] rounded-xl border border-[#EEF4F4] bg-white p-3 relative overflow-hidden flex flex-col">
      {locked ? (
        <>
          <div className="blur-sm select-none pointer-events-none flex flex-col flex-1">
            <div className="flex items-center gap-1.5 mb-2 shrink-0">
              <div className="size-6 rounded-full shrink-0" style={{ background: color }} />
              <div className="h-2.5 bg-text-dark/15 rounded-full w-14" />
            </div>
            <div className="space-y-1.5">
              <div className="h-2 bg-text-dark/10 rounded-full w-full" />
              <div className="h-2 bg-text-dark/10 rounded-full w-4/5" />
              <div className="h-2 bg-text-dark/10 rounded-full w-full" />
              <div className="h-2 bg-text-dark/10 rounded-full w-3/5" />
            </div>
          </div>
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: mockup lock card */}
          {/* biome-ignore lint/a11y/noStaticElementInteractions: mockup lock card */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 cursor-pointer"
            onClick={(e) => { e.stopPropagation(); onUnlock?.(); }}
          >
            <Lock className="size-4 text-logo-cyan" />
            <span className="text-[11px] text-text-dark/55 border border-[#D8ECEC] rounded-full px-3 py-1 bg-white whitespace-nowrap text-center leading-tight">
              用你的回答來解鎖吧！
            </span>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-1.5 mb-2 shrink-0">
            <div
              className="size-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
              style={{ background: color }}
            >
              {name[0]}
            </div>
            <span className="text-xs font-medium text-text-dark truncate">{name}</span>
          </div>
          <p className="text-xs text-text-dark/60 leading-relaxed flex-1 line-clamp-5">{text}</p>
          <div className="self-end shrink-0 mt-1">
            <Maximize2 className="size-3.5 text-text-dark/20" />
          </div>
        </>
      )}
    </div>
  );
}

function LearningPersonaCard({
  questionIndex,
  answer,
  onAnswerChange,
  onSubmit,
  submitted,
  onTryAnother,
}: {
  questionIndex: number;
  answer: string;
  onAnswerChange: (value: string) => void;
  onSubmit: () => void;
  submitted: boolean;
  onTryAnother: () => void;
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [extraMinHeight, setExtraMinHeight] = useState(0);
  const item = QUESTION_BANK[questionIndex] ?? QUESTION_BANK[0]!;

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-md hover:ring-2 hover:ring-logo-cyan transition-all duration-200 h-[280px] flex flex-col items-center justify-center gap-2 px-6">
        <CheckCircle2 className="size-10 text-logo-cyan mb-1" />
        <p className="text-base font-medium text-text-dark">感謝你的分享！</p>
        <p className="text-sm text-text-dark/50 text-center leading-relaxed">
          你可以隨時查看你的回答，並繼續探索更多問題。
        </p>
        <a
          href="/zh-TW/users/me"
          className="mt-2 flex items-center gap-1.5 text-sm font-medium text-primary-darker hover:opacity-80 transition-opacity"
        >
          前往我的小島查看
          <ArrowCircleSvg className="size-6 shrink-0" />
        </a>
      </div>
    );
  }

  return (
    <div style={{ perspective: "1000px" }} className="w-full">
      <div
        className="relative w-full transition-transform duration-500 ease-in-out"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front — 題目 */}
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: card flip interaction */}
        {/* biome-ignore lint/a11y/noStaticElementInteractions: card flip interaction */}
        <div
          className="group w-full bg-white rounded-2xl px-5 pt-5 pb-5 shadow-sm hover:shadow-md hover:ring-2 hover:ring-logo-cyan transition-all duration-200 flex flex-col cursor-pointer select-none"
          style={{ backfaceVisibility: "hidden", minHeight: extraMinHeight || undefined }}
          onClick={() => setIsFlipped(true)}
        >
          <QuoteSvg className="mt-2 mb-3 self-center shrink-0" />
          <p className="text-[22px] font-semibold text-text-dark text-center leading-snug shrink-0">
            {item.question}
          </p>

          {/* 大家的回答是... header */}
          <div className="mt-6 mb-2 flex items-center gap-1.5 shrink-0">
            <span className="text-sm font-medium text-text-dark/65">大家的回答是...</span>
            <span className="bg-logo-cyan/10 text-logo-cyan text-xs font-bold rounded-full px-2 py-0.5">5+</span>
          </div>

          {/* 橫向滑動回應 */}
          {/* biome-ignore lint/a11y/noStaticElementInteractions: stop propagation for scroll */}
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: stop propagation for scroll */}
          <div
            className="flex gap-3 overflow-x-auto -mx-5 px-5 pb-1 shrink-0"
            style={{ scrollbarWidth: "none" }}
            onClick={(e) => e.stopPropagation()}
          >
            {RESPONSE_PREVIEWS.map((r, i) => (
              <ResponseCard key={i} name={r.name} color={r.color} text={r.text} locked={r.locked} onUnlock={() => setIsFlipped(true)} />
            ))}
          </div>

          {/* Footer */}
          <div className="mt-[40px] flex items-center justify-end shrink-0">
            <div className="flex items-center gap-2 transition-transform duration-200 group-hover:translate-x-1">
              <span className="text-sm font-medium text-primary-darker">分享我的想法</span>
              <div className="size-9 rounded-full bg-logo-cyan flex items-center justify-center shrink-0">
                <ArrowRight className="size-4 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Back — 輸入 */}
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: card flip interaction */}
        {/* biome-ignore lint/a11y/noStaticElementInteractions: card flip interaction */}
        <div
          className="absolute inset-0 bg-white rounded-2xl px-6 pt-5 pb-6 shadow-sm border border-[#E8F8FF] flex flex-col cursor-pointer"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          onClick={() => setIsFlipped(false)}
        >
          <div className="flex items-start gap-2 shrink-0">
            <p className="text-sm text-primary-darker line-clamp-2 leading-relaxed flex-1">
              {item.question}
            </p>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onTryAnother(); }}
              className="shrink-0 -mt-0.5 -mr-1 flex items-center gap-1 px-2 py-1 rounded-full text-xs text-text-dark/30 hover:text-text-dark/55 hover:bg-black/5 transition-colors"
            >
              <RefreshCw className="size-3" />
              換一題
            </button>
          </div>
          {/* biome-ignore lint/a11y/noStaticElementInteractions: stop propagation for textarea area */}
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: stop propagation for textarea area */}
          <div
            className="flex-1 flex items-center min-h-0"
            onClick={(e) => e.stopPropagation()}
          >
            <textarea
              rows={1}
              value={answer}
              onChange={(e) => {
                onAnswerChange(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`;
                const newHeight = e.target.scrollHeight + 160;
                if (newHeight > 280) setExtraMinHeight(newHeight);
              }}
              placeholder={item.example}
              className="w-full border-0 border-b-2 border-logo-cyan text-base text-text-dark outline-none bg-transparent placeholder:text-text-dark/25 pb-1 resize-none overflow-hidden"
            />
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onSubmit(); }}
            disabled={!answer.trim()}
            className={cn(
              "shrink-0 w-full py-3 rounded-full font-medium text-base transition-all",
              answer.trim()
                ? "bg-[#F5A93E] text-white"
                : "bg-[#F5A93E]/30 text-white/70 cursor-not-allowed"
            )}
          >
            送出
          </button>
        </div>
      </div>
    </div>
  );
}

function LearningPersonaSection() {
  const [visible, setVisible] = useState(true);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!visible) return null;

  const handleTryAnother = () => {
    setQuestionIndex((i) => (i + 1) % QUESTION_BANK.length);
    setAnswer("");
    setSubmitted(false);
  };

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-xs text-text-dark/60">
          <Laugh className="size-3.5 shrink-0" />
          <span>讓我們更認識你！</span>
        </div>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="text-xs text-text-dark/40 hover:text-text-dark/60 transition-colors"
        >
          今天不顯示
        </button>
      </div>

      <LearningPersonaCard
        key={questionIndex}
        questionIndex={questionIndex}
        answer={answer}
        onAnswerChange={setAnswer}
        onSubmit={() => setSubmitted(true)}
        submitted={submitted}
        onTryAnother={handleTryAnother}
      />
    </div>
  );
}

// ─── Learning Persona — Multiple Choice ──────────────────────────────────────

const MC_QUESTION_BANK = [
  {
    question: "學習新技能時，你最大的挑戰是什麼？",
    options: ["找不到時間", "缺乏動力堅持", "不知從何開始", "害怕犯錯"],
  },
  {
    question: "完成一個目標後，你通常第一個反應是？",
    options: ["立刻設下一個目標", "好好慶祝放鬆", "先休息再說", "反思能改進的地方"],
  },
  {
    question: "你比較享受哪一種學習體驗？",
    options: ["有人帶著一步步學", "自己摸索沒有框架", "看別人做再跟著", "討論交流中學習"],
  },
  {
    question: "什麼最能讓你堅持一件事？",
    options: ["清晰的進度感", "同伴一起前進", "看到具體成果", "對自己的承諾"],
  },
];

function LearningPersonaMCCard({
  questionIndex,
  submitted,
  onSubmit,
  onTryAnother,
}: {
  questionIndex: number;
  submitted: boolean;
  onSubmit: () => void;
  onTryAnother: () => void;
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const item = MC_QUESTION_BANK[questionIndex] ?? MC_QUESTION_BANK[0]!;

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-md hover:ring-2 hover:ring-logo-cyan transition-all duration-200 h-[280px] flex flex-col items-center justify-center gap-3 px-6">
        <CheckCircle2 className="size-10 text-logo-cyan" />
        <p className="text-base font-medium text-text-dark">感謝你的分享！</p>
        <p className="text-sm text-text-dark/50 text-center leading-relaxed">
          你的回答幫助我們更了解你的學習方式。
        </p>
      </div>
    );
  }

  return (
    <div style={{ perspective: "1000px" }} className="w-full">
      <div
        className="relative w-full transition-transform duration-500 ease-in-out"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front — 題目 */}
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: card flip interaction */}
        {/* biome-ignore lint/a11y/noStaticElementInteractions: card flip interaction */}
        <div
          className="group w-full bg-white rounded-2xl px-6 pt-6 pb-5 shadow-sm hover:shadow-md hover:ring-2 hover:ring-logo-cyan transition-all duration-200 flex flex-col cursor-pointer select-none"
          style={{ backfaceVisibility: "hidden" }}
          onClick={() => setIsFlipped(true)}
        >
          <QuoteSvg className="mt-4 mb-4 self-center shrink-0" />
          <p className="text-[24px] font-semibold text-text-dark text-center leading-snug shrink-0">
            {item.question}
          </p>

          {/* 大家的回答是... header */}
          <div className="mt-6 mb-2 flex items-center gap-1.5 shrink-0">
            <span className="text-sm font-medium text-text-dark/65">大家的回答是...</span>
            <span className="bg-logo-cyan/10 text-logo-cyan text-xs font-bold rounded-full px-2 py-0.5">5+</span>
          </div>

          {/* 橫向滑動回應 */}
          {/* biome-ignore lint/a11y/noStaticElementInteractions: stop propagation for scroll */}
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: stop propagation for scroll */}
          <div
            className="flex gap-3 overflow-x-auto -mx-6 px-6 pb-1 shrink-0"
            style={{ scrollbarWidth: "none" }}
            onClick={(e) => e.stopPropagation()}
          >
            {RESPONSE_PREVIEWS.map((r, i) => (
              <ResponseCard key={i} name={r.name} color={r.color} text={r.text} locked={r.locked} onUnlock={() => setIsFlipped(true)} />
            ))}
          </div>

          <div className="mt-[40px] flex items-center gap-2 self-end shrink-0 transition-transform duration-200 group-hover:translate-x-1.5">
            <span className="text-sm text-primary-darker">選擇我的答案</span>
            <ArrowCircleSvg className="size-8 shrink-0" />
          </div>
        </div>

        {/* Back — 選項 */}
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: card flip interaction */}
        {/* biome-ignore lint/a11y/noStaticElementInteractions: card flip interaction */}
        <div
          className="absolute inset-0 bg-white rounded-2xl px-6 pt-5 pb-6 shadow-sm border border-[#E8F8FF] flex flex-col cursor-pointer"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          onClick={() => setIsFlipped(false)}
        >
          <div className="flex items-start gap-2 shrink-0">
            <p className="text-sm text-primary-darker line-clamp-2 leading-relaxed flex-1">
              {item.question}
            </p>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onTryAnother(); }}
              className="shrink-0 -mt-0.5 -mr-1 flex items-center gap-1 px-2 py-1 rounded-full text-xs text-text-dark/30 hover:text-text-dark/55 hover:bg-black/5 transition-colors"
            >
              <RefreshCw className="size-3" />
              換一題
            </button>
          </div>

          {/* biome-ignore lint/a11y/noStaticElementInteractions: stop propagation for option grid */}
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: stop propagation for option grid */}
          <div
            className="flex-1 grid grid-cols-2 gap-2 mt-4"
            onClick={(e) => e.stopPropagation()}
          >
            {item.options.map((option, i) => (
              <button
                key={option}
                type="button"
                onClick={(e) => { e.stopPropagation(); setSelectedOption(i); }}
                className={cn(
                  "rounded-xl border-2 text-sm py-3 px-3 transition-all text-left leading-snug",
                  selectedOption === i
                    ? "border-logo-cyan bg-logo-cyan/10 text-logo-cyan font-medium"
                    : "border-[#E8F8FF] text-text-dark/65 hover:border-logo-cyan/40"
                )}
              >
                {option}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); if (selectedOption !== null) onSubmit(); }}
            disabled={selectedOption === null}
            className={cn(
              "shrink-0 mt-4 w-full py-3 rounded-full font-medium text-base transition-all",
              selectedOption !== null
                ? "bg-[#F5A93E] text-white"
                : "bg-[#F5A93E]/30 text-white/70 cursor-not-allowed"
            )}
          >
            送出
          </button>
        </div>
      </div>
    </div>
  );
}

function LearningPersonaMCSection() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleTryAnother = () => {
    setQuestionIndex((i) => (i + 1) % MC_QUESTION_BANK.length);
    setSubmitted(false);
  };

  return (
    <div className="mb-4">
      <LearningPersonaMCCard
        key={questionIndex}
        questionIndex={questionIndex}
        submitted={submitted}
        onSubmit={() => setSubmitted(true)}
        onTryAnother={handleTryAnother}
      />
    </div>
  );
}

// ─── Mood map ─────────────────────────────────────────────────────────────────

const MOOD_MAP: Record<string, { label: string; Emoji: ElementType }> = {
  happy: { label: "開心", Emoji: HappySvg },
  fine: { label: "還不錯", Emoji: FineSvg },
  neutral: { label: "普通", Emoji: NeutralSvg },
  bored: { label: "無聊", Emoji: BoredSvg },
  frustrated: { label: "受挫", Emoji: FrustratedSvg },
  hopeless: { label: "想放棄", Emoji: HopelessSvg },
};

function parseStampDate(date: string): { year: string; monthDay: string } {
  const parts = date.replace(/\./g, "-").split("-");
  return { year: parts[0] ?? "", monthDay: parts.slice(1).join("/") };
}

const AVATAR_PALETTE = ["#FCDD84", "#A8D8C8", "#FFB3BA", "#BAD4F5", "#D4B8F0", "#FFD0A0", "#B8ECD8"];
function getAvatarColor(name: string): string {
  const code = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_PALETTE[code % AVATAR_PALETTE.length] ?? "#FCDD84";
}

// ─── Mock feed card: CheckIn ──────────────────────────────────────────────────

interface MockReactions {
  types: ReactionTypeType[];
  count: number;
  firstName?: string;
}

function MockCheckInCard({
  mood,
  note,
  tags = [],
  date,
  practiceTitle,
  userName,
  reactions,
  commentCount = 0,
  commentPreview = [],
}: {
  mood: keyof typeof MOOD_MAP;
  note?: string;
  tags?: string[];
  date: string;
  practiceTitle: string;
  userName: string;
  reactions?: MockReactions;
  commentCount?: number;
  commentPreview?: { name: string; text: string }[];
}) {
  const moodInfo = MOOD_MAP[mood];
  const MoodEmoji = moodInfo?.Emoji;
  const hasContent = !!(note || tags.length);
  const { year: stampYear, monthDay: stampMonthDay } = parseStampDate(date);

  return (
    <div className="rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md hover:ring-2 hover:ring-logo-cyan transition-all duration-200">
      <div className="relative bg-logo-cyan overflow-hidden">
        {hasContent ? (
          <div className="max-h-[240px] overflow-hidden pointer-events-none select-none pt-8">
            <div className="mx-6 bg-white rounded-t-xl shadow-md p-5 flex flex-col gap-3 min-h-[200px]">
              <p className="text-[11px] font-medium text-gray-400 truncate">{practiceTitle}</p>
              <div className="relative">
                <div className="float-right anonymous-pro animate-stamp">
                  <StampSvg width={90} height={90} />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-xs font-bold text-logo-gray rotate-15 size-9 flex flex-col items-center justify-center">
                    <div>{stampYear}</div>
                    <div>{stampMonthDay}</div>
                  </div>
                </div>
                {moodInfo && MoodEmoji && (
                  <div className="flex items-center gap-2 mb-2">
                    <MoodEmoji className="size-8" />
                    <span className="text-sm font-medium text-gray-700">{moodInfo.label}</span>
                  </div>
                )}
                {note && (
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{note}</p>
                )}
              </div>
              {tags.length > 0 && (
                <div className="flex gap-1.5 flex-wrap mt-auto">
                  {tags.map((t) => (
                    <span key={t} className="text-xs text-logo-cyan font-medium">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="relative flex flex-col items-center justify-center gap-3 py-8 pointer-events-none select-none">
            <p className="text-white font-semibold text-base px-6 text-center line-clamp-2">
              {practiceTitle}
            </p>
            {MoodEmoji ? <MoodEmoji className="size-16" /> : <div className="size-16" />}
            {moodInfo && <p className="text-white/70 text-xs">{moodInfo.label}</p>}
            <div
              className="absolute right-3 bottom-3 anonymous-pro animate-stamp opacity-80"
              style={{ filter: "brightness(0) invert(1)" }}
            >
              <StampSvg width={100} height={100} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-xs font-bold text-white rotate-15 size-10 flex flex-col items-center justify-center">
                <div>{stampYear}</div>
                <div>{stampMonthDay}</div>
              </div>
            </div>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-b from-transparent to-logo-cyan pointer-events-none" />
      </div>

      <div className="bg-white px-5 pt-4 pb-5 flex flex-col gap-4">
        <div className="relative flex gap-4 items-start">
          <div className="shrink-0 size-16">
            <Avatar className="size-16">
              <AvatarFallback style={{ backgroundColor: getAvatarColor(userName) }}>
                <span className="text-lg font-semibold text-gray-700">{userName.slice(0, 1)}</span>
              </AvatarFallback>
            </Avatar>
          </div>
          {MoodEmoji && (
            <div className="absolute left-[45px] top-[40px] size-6 z-10">
              <MoodEmoji className="size-6" />
            </div>
          )}
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            <p className="text-sm text-light-gray whitespace-nowrap">{date}</p>
            {note ? (
              <p className="text-base text-text-dark line-clamp-2">{note}</p>
            ) : (
              <p className="text-sm text-light-gray">完成了一次打卡</p>
            )}
          </div>
        </div>

        <div className="border-t border-basic-200" />

        <div className="flex items-center justify-between h-8">
          <ReactionPickerButton
            selectedReactions={[]}
            onToggle={() => {}}
            variant="summary"
            totalCount={reactions?.count}
            displayReactions={reactions?.types}
            firstReactorName={reactions?.firstName}
          />
          <div className="flex items-center gap-1.5 text-light-gray">
            <DialogOutlineSvg className="size-6" />
            {commentCount > 0 && <span className="text-sm font-medium">{commentCount}</span>}
          </div>
        </div>

        {commentPreview.length > 0 && (
          <div className="flex flex-col gap-2 border-t border-basic-200 pt-3">
            {commentPreview.map((c) => (
              <div key={c.name} className="flex items-start gap-2">
                <Avatar className="size-6 shrink-0 mt-0.5">
                  <AvatarFallback style={{ backgroundColor: getAvatarColor(c.name) }}>
                    <span className="text-[10px] font-semibold text-gray-700">
                      {c.name.slice(0, 1)}
                    </span>
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-primary-darker mr-1.5">{c.name}</span>
                  <span className="text-xs text-text-dark line-clamp-1">{c.text}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Mock feed card: Practice ─────────────────────────────────────────────────

function MockPracticeCard({
  title,
  status,
  startDate,
  endDate,
  userName,
  actionDescription,
  frequencyMinDays,
  frequencyMaxDays,
  sessionDurationMinutes,
  reactions,
  commentCount = 0,
}: {
  title: string;
  status: "active" | "completed";
  startDate?: string;
  endDate?: string;
  userName: string;
  actionDescription?: string;
  frequencyMinDays?: number;
  frequencyMaxDays?: number;
  sessionDurationMinutes?: number;
  reactions?: MockReactions;
  commentCount?: number;
}) {
  return (
    <div className="bg-white rounded-xl p-5 cursor-pointer shadow-sm hover:shadow-md hover:ring-2 hover:ring-logo-cyan transition-all duration-200">
      <div className="flex items-center gap-2 mb-2">
        <Badge
          variant={status === "active" ? "default" : "outline-logo"}
          size="sm"
          className="w-fit text-[10px]"
        >
          {status === "active" ? "進行中" : "已完成"}
        </Badge>
        {startDate && endDate && (
          <span className="text-xs text-text-dark/50">
            {startDate} ▶ {endDate}
          </span>
        )}
      </div>

      <h3 className="font-semibold text-text-dark text-base mb-2 line-clamp-2">{title}</h3>

      <div className="flex items-start gap-3 mb-3">
        <Avatar className="size-16 shrink-0">
          <AvatarFallback style={{ backgroundColor: getAvatarColor(userName) }}>
            <span className="text-lg font-semibold text-gray-700">{userName.slice(0, 1)}</span>
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          {actionDescription && (
            <p className="text-sm text-text-dark/80 mb-2 line-clamp-3">{actionDescription}</p>
          )}
          {(frequencyMinDays || frequencyMaxDays || sessionDurationMinutes) && (
            <div className="flex items-center gap-4">
              {(frequencyMinDays || frequencyMaxDays) && (
                <span className="text-sm">
                  <span className="font-semibold text-logo-cyan">
                    {frequencyMinDays === frequencyMaxDays
                      ? frequencyMinDays
                      : `${frequencyMinDays}-${frequencyMaxDays}`}
                  </span>
                  <span className="text-text-dark/60 ml-0.5">天/週</span>
                </span>
              )}
              {sessionDurationMinutes && (
                <span className="text-sm">
                  <span className="font-semibold text-logo-cyan">{sessionDurationMinutes}</span>
                  <span className="text-text-dark/60 ml-0.5">分鐘/次</span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[#E4EAE9] pt-3 mt-1">
        <ReactionPickerButton
          selectedReactions={[]}
          onToggle={() => {}}
          variant="summary"
          totalCount={reactions?.count}
          displayReactions={reactions?.types}
          firstReactorName={reactions?.firstName}
        />
        <div className="flex items-center gap-1.5 text-light-gray">
          <DialogOutlineSvg className="size-6" />
          {commentCount > 0 && <span className="text-sm font-medium">{commentCount}</span>}
        </div>
      </div>
    </div>
  );
}

// ─── Feed label ───────────────────────────────────────────────────────────────

function FeedLabelStatic({
  type,
  userName,
  practiceTitle,
  actorName,
}: {
  type: "checked_in" | "new_release" | "new_practice" | "cheered";
  userName?: string;
  practiceTitle?: string;
  actorName?: string;
}) {
  if (type === "checked_in") {
    return (
      <div className="flex items-center gap-1.5 text-xs text-text-dark/60 mt-4 mb-4 px-1">
        <CalendarCheck className="size-3.5 shrink-0" />
        <span>
          {userName ?? "某人"} 在 {practiceTitle ?? "實踐"} 打卡
        </span>
      </div>
    );
  }
  if (type === "new_release") {
    return (
      <div className="flex items-center gap-1.5 text-xs text-text-dark/60 mt-4 mb-4 px-1">
        <Rss className="size-3.5 shrink-0" />
        <span>最新發布</span>
      </div>
    );
  }
  if (type === "new_practice") {
    return (
      <div className="flex items-center gap-1.5 text-xs text-text-dark/60 mt-4 mb-4 px-1">
        <ThumbsUp className="size-3.5 shrink-0" />
        <span>{userName ?? "某人"} 發布了新實踐</span>
      </div>
    );
  }
  if (type === "cheered") {
    return (
      <div className="flex items-center gap-1.5 text-xs text-text-dark/60 mt-4 mb-4 px-1">
        <ThumbsUp className="size-3.5 shrink-0" />
        <span>{actorName ?? "某人"} 表達了加油</span>
      </div>
    );
  }
  return null;
}

// ─── Activity card ────────────────────────────────────────────────────────────

function ActivityCardStatic({ label, text }: { label: string; text: string }) {
  return (
    <div className="group bg-white rounded-2xl p-4 shadow-sm hover:shadow-md hover:ring-2 hover:ring-logo-cyan transition-all duration-200 flex items-center gap-3 cursor-pointer">
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-logo-cyan/10 flex items-center justify-center">
        <ThumbsUp className="w-4 h-4 text-logo-cyan" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="inline-block text-xs font-medium text-logo-cyan bg-logo-cyan/10 rounded-full px-2 py-0.5 mb-1">
          {label}
        </span>
        <p className="text-sm text-text-dark leading-snug">{text}</p>
      </div>
      <ArrowCircleSvg className="size-8 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LearningPersonaMockupPage() {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<"inspire" | "mine">("inspire");
  const [searchValue, setSearchValue] = useState("");

  return (
    <div className="relative min-h-screen">
      <Banner />
      <BackgroundAnimation />
      {isMobile ? (
        <MobileSidebar identifier="dev-preview" />
      ) : (
        <DesktopSidebar identifier="dev-preview" />
      )}

      <main className="relative z-[25] pb-[72px] bg-very-light-gray">
        <div className="max-w-[640px] px-4 mx-auto pt-4">

          {/* Tab switcher */}
          <div className="flex border-b border-[#E5E7EB] mb-4">
            {(["inspire", "mine"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex-1 py-2 text-sm font-medium transition-all",
                  activeTab === tab
                    ? "text-text-dark border-b-2 border-logo-cyan -mb-px"
                    : "text-text-dark/40"
                )}
              >
                {tab === "inspire" ? "Inspire" : "Mine"}
              </button>
            ))}
          </div>

          {/* ── Inspire Tab ── */}
          {activeTab === "inspire" && (
            <>
              {/* Search bar */}
              <div className="mt-[28px] mb-[20px]">
                <ExpandableSearch value={searchValue} onChange={setSearchValue} />
              </div>

              {/* ── Learning Persona Section ── */}
              <LearningPersonaSection />
              <LearningPersonaMCSection />

              {/* ── Feed ── */}
              <div className="flex flex-col gap-3">

                <div>
                  <FeedLabelStatic type="checked_in" userName="小綠" practiceTitle="每日手沖咖啡" />
                  <MockCheckInCard
                    mood="happy"
                    note="今天終於把水溫控制得比較穩，沖出來的咖啡有明顯的花香調，感覺有在進步！連續打卡第 14 天，慢慢養成習慣了。"
                    tags={["咖啡", "有進步", "堅持"]}
                    date="2026-05-06"
                    practiceTitle="每日手沖咖啡"
                    userName="小綠"
                    reactions={{ types: ["touched", "fire", "useful"], count: 12, firstName: "Amy" }}
                    commentCount={3}
                    commentPreview={[
                      { name: "Amy", text: "好厲害！花香調的咖啡最迷人了" },
                      { name: "宇翔", text: "連續 14 天超猛，繼續加油！" },
                    ]}
                  />
                </div>

                <ActivityCardStatic label="社群動態" text="Kevin 開始了新的跑步計畫，已完成第一次打卡 🏃" />

                <div>
                  <FeedLabelStatic type="new_release" />
                  <MockPracticeCard
                    title="每日閱讀 30 分鐘"
                    status="active"
                    startDate="2026-04-01"
                    endDate="2026-06-30"
                    userName="怡君"
                    actionDescription="每天睡前閱讀 30 分鐘，不限類型，從商業書、小說到漫畫都算，重點是建立閱讀習慣。"
                    frequencyMinDays={7}
                    frequencyMaxDays={7}
                    sessionDurationMinutes={30}
                    reactions={{ types: ["useful", "touched"], count: 8, firstName: "Kevin" }}
                    commentCount={2}
                  />
                </div>

                <MockPracticeCard
                  title="晨間冥想 10 分鐘"
                  status="completed"
                  startDate="2026-02-01"
                  endDate="2026-04-30"
                  userName="Mia"
                  actionDescription="早上起床後立刻進行 10 分鐘引導式冥想，搭配 Headspace App，專注在呼吸與當下感受。"
                  frequencyMinDays={5}
                  frequencyMaxDays={7}
                  sessionDurationMinutes={10}
                  reactions={{ types: ["useful", "fire", "touched", "curious"], count: 21, firstName: "小綠" }}
                  commentCount={5}
                />

                <MockPracticeCard
                  title="每週跑步 3 次，共 5km"
                  status="active"
                  startDate="2026-05-01"
                  endDate="2026-07-31"
                  userName="Kevin"
                  actionDescription="目標在三個月內建立跑步習慣，初期每次 5km，之後慢慢提升距離，搭配 Nike Run Club 紀錄。"
                  frequencyMinDays={3}
                  frequencyMaxDays={3}
                  sessionDurationMinutes={40}
                  reactions={{ types: ["useful", "fire"], count: 6, firstName: "宇翔" }}
                  commentCount={1}
                />

                <div>
                  <FeedLabelStatic type="checked_in" userName="Sherry" practiceTitle="素描練習" />
                  <MockCheckInCard
                    mood="neutral"
                    date="2026-05-05"
                    practiceTitle="素描練習"
                    userName="Sherry"
                    reactions={{ types: ["useful"], count: 2, firstName: "Mia" }}
                  />
                </div>

                <div>
                  <FeedLabelStatic type="cheered" actorName="Amy" />
                  <MockPracticeCard
                    title="學習日語 N3，每天一小時"
                    status="active"
                    startDate="2026-03-15"
                    endDate="2026-09-15"
                    userName="宇翔"
                    actionDescription="利用通勤時間與午休，透過 Anki 背單字、NHK Web Easy 練閱讀，目標年底通過 N3 檢定。"
                    frequencyMinDays={6}
                    frequencyMaxDays={7}
                    sessionDurationMinutes={60}
                    reactions={{ types: ["fire", "useful", "curious"], count: 15, firstName: "Amy" }}
                    commentCount={4}
                  />
                </div>

                <div>
                  <FeedLabelStatic type="checked_in" userName="宇翔" practiceTitle="學習日語 N3" />
                  <MockCheckInCard
                    mood="fine"
                    note="今天背了 30 個新單字，感覺記憶力還不錯。最難的是「建前」和「本音」這組詞，光是文化背景就花了半小時理解。"
                    date="2026-05-06"
                    practiceTitle="學習日語 N3，每天一小時"
                    userName="宇翔"
                    reactions={{ types: ["fire", "useful"], count: 5, firstName: "Mia" }}
                    commentCount={1}
                    commentPreview={[{ name: "Mia", text: "建前本音超有意思的，加油！" }]}
                  />
                </div>

                <div>
                  <FeedLabelStatic type="new_practice" userName="Amy" />
                  <MockPracticeCard
                    title="斷糖挑戰：30 天不吃精製糖"
                    status="active"
                    startDate="2026-05-01"
                    endDate="2026-05-31"
                    userName="Amy"
                    actionDescription="不喝含糖飲料、不吃甜點，可以吃水果。每天拍下三餐紀錄，感受身體變化。困難關卡是朋友聚會與下午茶文化。"
                    frequencyMinDays={7}
                    frequencyMaxDays={7}
                    reactions={{ types: ["useful", "fire", "touched"], count: 19, firstName: "宇翔" }}
                    commentCount={6}
                  />
                </div>

                <div>
                  <FeedLabelStatic type="checked_in" userName="Mia" practiceTitle="晨間冥想" />
                  <MockCheckInCard
                    mood="frustrated"
                    note="今天腦袋一直亂飄，靜不下來。冥想了 10 分鐘但大概有 8 分鐘都在想明天的會議...算了，至少有做。"
                    tags={["冥想", "靜心難"]}
                    date="2026-04-28"
                    practiceTitle="晨間冥想 10 分鐘"
                    userName="Mia"
                    reactions={{ types: ["useful", "touched"], count: 7, firstName: "小綠" }}
                    commentCount={2}
                    commentPreview={[{ name: "小綠", text: "有做就是贏！" }]}
                  />
                </div>

                <div className="h-4" />
              </div>
            </>
          )}

          {/* ── Mine Tab ── */}
          {activeTab === "mine" && (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
              <p className="text-text-dark/40 text-sm">「Mine」tab 為真實資料，需要登入才能查看。</p>
              <p className="text-text-dark/30 text-xs">這是 UX Mockup 頁面</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
