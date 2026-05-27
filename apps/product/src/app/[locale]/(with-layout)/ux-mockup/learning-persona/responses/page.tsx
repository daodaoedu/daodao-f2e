"use client";

// ============================================================================
// UX Mockup — 人物誌 (Learning Persona) 題目回應總覽頁
// feat/learning-persona
// ============================================================================

import { cn } from "@daodao/ui/lib/utils";
import { ArrowLeft, ChevronDown, Maximize2 } from "lucide-react";
import { useState } from "react";
import { BackgroundAnimation, Banner } from "@/components/layout";
import { DesktopSidebar } from "@/components/layout/sidebar/desktop";
import { MobileSidebar } from "@/components/layout/sidebar/mobile";
import { useIsMobile } from "@daodao/shared";

// ─── Mock data ────────────────────────────────────────────────────────────────

const QUESTIONS = [
  {
    id: 1,
    question: "當你對某件事失去動力時，什麼能幫助你重新找回熱情？",
    answeredByMe: true,
    myAnswer: "我會去散步，讓自己暫時脫離那件事。有時候距離感反而讓我重新看見它的意義。",
  },
  {
    id: 2,
    question: "對我來說，學習最有價值的部分是⋯⋯",
    answeredByMe: false,
    myAnswer: null,
  },
  {
    id: 3,
    question: "哪種學習方式最適合你？為什麼？",
    answeredByMe: true,
    myAnswer: "邊做邊學。光是看或聽讓我很難留住，但實際動手之後就會記得了。",
  },
  {
    id: 4,
    question: "你目前正在培養或戒掉的習慣是什麼？",
    answeredByMe: false,
    myAnswer: null,
  },
];

const RESPONSES: Record<number, { name: string; color: string; answer: string; isMe?: boolean }[]> = {
  1: [
    { name: "我", color: "#16B9B3", answer: "我會去散步，讓自己暫時脫離那件事。有時候距離感反而讓我重新看見它的意義。", isMe: true },
    { name: "林小明", color: "#F5A93E", answer: "對我來說，找回熱情最有效的方式是去看看已經做到這件事的人的故事。看到別人做到，自己也會被點燃。" },
    { name: "Amy", color: "#9B8FE0", answer: "我會重新問自己「我當初為什麼要開始這件事」。答案往往就在那個最初的動機裡。" },
    { name: "宇翔", color: "#F5A93E", answer: "休息。我以前覺得失去動力是弱點，後來發現強迫自己撐下去反而更難回來。好好睡一覺比什麼都有效。" },
    { name: "Kevin", color: "#16B9B3", answer: "找一個很小的行動，做完就好。不設目標，只是動起來。通常一旦開始，動力就回來了。" },
    { name: "小綠", color: "#5BA58C", answer: "聽音樂或整理空間。對我來說，外在環境的改變會帶動內在狀態。" },
  ],
  3: [
    { name: "我", color: "#16B9B3", answer: "邊做邊學。光是看或聽讓我很難留住，但實際動手之後就會記得了。", isMe: true },
    { name: "Mia", color: "#9B8FE0", answer: "我喜歡有結構的課程，配合自己的步調進行。太自由反而讓我不知道從哪裡入手。" },
    { name: "林小明", color: "#F5A93E", answer: "討論和交流對我幫助最大。把想法說出口、跟人辯論，往往能讓我理解得更深。" },
  ],
};

// ─── Components ───────────────────────────────────────────────────────────────

function ResponseItem({
  name,
  color,
  answer,
  isMe,
  expanded,
  onToggle,
}: {
  name: string;
  color: string;
  answer: string;
  isMe?: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  const isLong = answer.length > 60;

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: mockup interaction
    // biome-ignore lint/a11y/noStaticElementInteractions: mockup interaction
    <div
      className={cn(
        "rounded-2xl p-4 cursor-pointer transition-all duration-200",
        isMe
          ? "bg-logo-cyan/8 border border-logo-cyan/20 hover:border-logo-cyan/40"
          : "bg-white border border-[#EEF4F4] hover:border-[#D0E8E8] hover:shadow-sm"
      )}
      onClick={onToggle}
    >
      <div className="flex items-start gap-3">
        <div
          className="size-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
          style={{ background: color }}
        >
          {name[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn("text-sm font-medium", isMe ? "text-logo-cyan" : "text-text-dark")}>
              {name}
            </span>
            {isMe && (
              <span className="text-[10px] text-logo-cyan bg-logo-cyan/10 rounded-full px-2 py-0.5 font-medium">
                我的回答
              </span>
            )}
          </div>
          <p className={cn("text-sm text-text-dark/70 leading-relaxed", !expanded && isLong && "line-clamp-2")}>
            {answer}
          </p>
          {isLong && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onToggle(); }}
              className="mt-1 flex items-center gap-0.5 text-xs text-text-dark/35 hover:text-text-dark/60 transition-colors"
            >
              {expanded ? "收起" : "展開全文"}
              <ChevronDown className={cn("size-3 transition-transform duration-200", expanded && "rotate-180")} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function QuestionBlock({
  question,
  answeredByMe,
  myAnswer,
  responses,
}: {
  question: string;
  answeredByMe: boolean;
  myAnswer: string | null;
  responses?: { name: string; color: string; answer: string; isMe?: boolean }[];
}) {
  const [expanded, setExpanded] = useState(answeredByMe);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set([0]));

  const toggleItem = (i: number) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Question header */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: mockup interaction */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: mockup interaction */}
      <div
        className="px-5 py-4 flex items-start gap-3 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-text-dark leading-snug">{question}</p>
          <div className="mt-1.5 flex items-center gap-2">
            {answeredByMe ? (
              <span className="text-xs text-logo-cyan font-medium">已回答</span>
            ) : (
              <span className="text-xs text-text-dark/35">尚未回答</span>
            )}
            {responses && (
              <span className="text-xs text-text-dark/35">· {responses.length} 則回應</span>
            )}
          </div>
        </div>
        <ChevronDown
          className={cn(
            "size-5 text-text-dark/30 shrink-0 mt-0.5 transition-transform duration-200",
            expanded && "rotate-180"
          )}
        />
      </div>

      {/* Responses */}
      {expanded && (
        <div className="px-4 pb-4 flex flex-col gap-2 border-t border-[#F0F5F5] pt-3">
          {answeredByMe && responses ? (
            responses.map((r, i) => (
              <ResponseItem
                key={r.name}
                name={r.name}
                color={r.color}
                answer={r.answer}
                isMe={r.isMe}
                expanded={expandedItems.has(i)}
                onToggle={() => toggleItem(i)}
              />
            ))
          ) : (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <p className="text-sm text-text-dark/45 leading-relaxed">
                回答這題後，就能看到大家怎麼說。
              </p>
              <a
                href="/zh-TW/ux-mockup/learning-persona"
                className="text-sm font-medium text-logo-cyan border border-logo-cyan/30 rounded-full px-4 py-2 hover:bg-logo-cyan/5 transition-colors"
              >
                去回答這題
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LearningPersonaResponsesPage() {
  const isMobile = useIsMobile();

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

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <a
              href="/zh-TW/ux-mockup/learning-persona"
              className="size-9 rounded-full bg-white shadow-sm flex items-center justify-center hover:shadow-md transition-shadow shrink-0"
            >
              <ArrowLeft className="size-4 text-text-dark/60" />
            </a>
            <div>
              <h1 className="text-xl font-bold text-text-dark">人物誌</h1>
              <p className="text-xs text-text-dark/45 mt-0.5">看看大家對學習的想法</p>
            </div>
          </div>

          {/* Stats bar */}
          <div className="bg-white rounded-2xl px-5 py-4 shadow-sm mb-4 flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-logo-cyan">2</p>
              <p className="text-xs text-text-dark/45 mt-0.5">已回答</p>
            </div>
            <div className="w-px h-8 bg-[#EEF4F4]" />
            <div className="text-center">
              <p className="text-2xl font-bold text-text-dark/40">2</p>
              <p className="text-xs text-text-dark/45 mt-0.5">待回答</p>
            </div>
            <div className="w-px h-8 bg-[#EEF4F4]" />
            <div className="text-center flex-1">
              <p className="text-2xl font-bold text-text-dark/40">9</p>
              <p className="text-xs text-text-dark/45 mt-0.5">社群回應數</p>
            </div>
          </div>

          {/* Question list */}
          <div className="flex flex-col gap-3">
            {QUESTIONS.map((q) => (
              <QuestionBlock
                key={q.id}
                question={q.question}
                answeredByMe={q.answeredByMe}
                myAnswer={q.myAnswer}
                responses={RESPONSES[q.id]}
              />
            ))}
          </div>

          <div className="h-4" />
        </div>
      </main>
    </div>
  );
}
