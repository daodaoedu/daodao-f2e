"use client";

// ============================================================================
// UX Mockup — 人物誌問題詳細頁（含無限捲動）
// feat/learning-persona
// ============================================================================

import { cn } from "@daodao/ui/lib/utils";
import { CheckCircle2, ChevronDown, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BackgroundAnimation } from "@/components/layout";

function QuoteSvg({ className }: { className?: string }) {
  return (
    <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <title>引言符號</title>
      <path d="M51.4667 16.8C54.1333 19.7334 55.7333 22.9334 55.7333 28.2667C55.7333 37.6 49.0667 45.8667 39.7333 50.1334L37.3333 46.6667C46.1333 41.8667 48 35.7334 48.5333 31.7334C47.2 32.5334 45.3333 32.8 43.4667 32.5334C38.6667 32 34.9333 28.2667 34.9333 23.2C34.9333 20.8 36 18.4 37.6 16.5334C39.4667 14.6667 41.6 13.8667 44.2667 13.8667C47.2 13.8667 49.8667 15.2 51.4667 16.8ZM24.8 16.8C27.4667 19.7334 29.0667 22.9334 29.0667 28.2667C29.0667 37.6 22.4 45.8667 13.0667 50.1334L10.6667 46.6667C19.4667 41.8667 21.3333 35.7334 21.8667 31.7334C20.5333 32.5334 18.6667 32.8 16.8 32.5334C12 32 8.26666 28 8.26666 23.2C8.26666 20.8 9.33333 18.4 10.9333 16.5334C12.8 14.6667 14.9333 13.8667 17.6 13.8667C20.5333 13.8667 23.2 15.2 24.8 16.8Z" fill="#16B9B3"/>
    </svg>
  );
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const QUESTION_BANK = [
  { question: "最想瞬間「下載」的技能？", example: "例：流利說任何一種語言" },
  { question: "最怪的產出（生產力）習慣？", example: "例：只有戴耳機才能進入狀態" },
  { question: "聽過但「沒聽進去」的好建議？", example: "例：早一點開始存錢" },
  { question: "讓你忘掉時間的興趣？", example: "例：畫畫，一抬頭三小時過去了" },
  { question: "「學習」這件事，如何改變了你的性格？", example: "例：變得更願意承認自己不懂" },
  { question: "在課堂之外，你學過最重要的一課？", example: "例：失敗後如何重新站起來" },
  { question: "你最近最意想不到的靈感來源？", example: "例：排隊時聽到陌生人的對話" },
  { question: "最近一件讓你感到自豪「我學會了」的事？", example: "例：終於看懂財報了" },
  { question: "哪件事你純粹是「為了快樂」而學？", example: "例：學做甜點，不為別人只為自己" },
  { question: "哪一個童年時的好奇心，你到現在還有？", example: "例：星星到底有多遠" },
  { question: "哪一本書讓你印象深刻？", example: "例：《被討厭的勇氣》，讀完整個人放鬆了" },
  { question: "你有什麼特定的「學習儀式感」？", example: "例：泡一杯咖啡，把手機翻面放" },
  {
    question: "有沒有哪一次讓你當下覺得「完蛋了」，後來卻變成意外的轉折點？",
    example: "例：被退學後反而找到真正想做的事",
  },
  { question: "哪個主題你可以滔滔不絕聊三小時？", example: "例：城市設計與人的行為" },
  { question: "學習狀況不好時，你如何面對自己？", example: "例：先去走走，給自己一個小時的假" },
  { question: "有哪項技能，你曾以為自己絕對學不會？", example: "例：游泳，但後來真的會了" },
  {
    question: "對你來說，「哇，我好像跟以前不一樣了」，那個具體的瞬間發生了什麼事？",
    example: "例：某次開口說了以前不敢說的話",
  },
  { question: "哪句關於你能力的稱讚，曾讓你信心大增？", example: "例：老師說「你的問題問得很好」" },
  { question: "最近對哪件事「改觀」或「轉念」了？", example: "例：以前討厭運動，現在反而需要它" },
  { question: "你保持專注的「秘密武器」是什麼？", example: "例：番茄鐘＋白噪音" },
  {
    question: "哪部紀錄片或電影曾讓你深受感動？",
    example: "例：《徒手攀岩》，看完整個人都燃起來了",
  },
  { question: "你的社交圈如何影響了你的成長？", example: "例：朋友的一句話讓我鼓起勇氣換工作" },
  { question: "給過去的自己，你會想說哪句建議？", example: "例：不要那麼怕被拒絕" },
  { question: "你有一個「不為人知」的興趣嗎？", example: "例：研究各國地鐵路線圖" },
  { question: "你收過最深刻、最有意義的回饋？", example: "例：「你讓我覺得被理解了」" },
];

type ResponseEntry = { name: string; color: string; answer: string; isMe?: boolean };

const ALL_RESPONSES: Record<number, ResponseEntry[]> = {
  1: [
    {
      name: "我",
      color: "#16B9B3",
      answer: "流利地說日語。我學了三年還是卡在中級，如果能直接下載就好了。",
      isMe: true,
    },
    {
      name: "林小明",
      color: "#F5A93E",
      answer: "公開演講。我每次上台都心跳加速，如果能直接有那種從容感就太好了。",
    },
    {
      name: "Amy",
      color: "#9B8FE0",
      answer: "快速閱讀。現在書單越積越長，如果閱讀速度能直接翻倍就太好了。",
    },
    { name: "宇翔", color: "#F5A93E", answer: "彈鋼琴。小時候學過但沒認真，現在很後悔。" },
    {
      name: "Kevin",
      color: "#16B9B3",
      answer: "程式設計。我是非本科轉職，如果當初能直接下載那個思維模式就好了。",
    },
    {
      name: "小綠",
      color: "#5BA58C",
      answer: "換個答案，我想下載「不在意他人眼光」的能力，那根本不是技能但我最需要它。",
    },
    {
      name: "Mia",
      color: "#9B8FE0",
      answer: "廚藝。每次煮飯都踩雷，如果能直接召喚出一個廚神靈魂就太好了。",
    },
    {
      name: "阿哲",
      color: "#E07B7B",
      answer: "說故事的能力。有些人開口就能讓人專注，我說話常常讓人想睡。",
    },
    {
      name: "小瑜",
      color: "#5BA58C",
      answer: "繪畫。我腦袋裡有很多畫面，但就是沒辦法把它們畫出來，很挫敗。",
    },
    {
      name: "承翰",
      color: "#F5A93E",
      answer: "外語口音。我英文文法不差，但只要一開口就讓人聽出是台灣人，有時候會影響信心。",
    },
    {
      name: "雅婷",
      color: "#9B8FE0",
      answer: "情緒調節。我知道很多道理，但一遇到事情還是會爆，如果這個技能能直接下載就太好了。",
    },
    {
      name: "建豪",
      color: "#16B9B3",
      answer: "數學直覺。我工作上需要用到數字，但就是沒有那種「一眼看出問題」的感覺。",
    },
    {
      name: "珊珊",
      color: "#E07B7B",
      answer: "舞蹈。我身體協調很差，在派對上只能在角落假裝喝飲料。",
    },
    {
      name: "怡君",
      color: "#5BA58C",
      answer: "記憶力。我讀過的東西很快就忘，如果能像照相機一樣留住就好了。",
    },
    {
      name: "志偉",
      color: "#F5A93E",
      answer: "寫作。我常常有想法但寫出來就變了，如果下載了說不定能出書。",
    },
    {
      name: "欣儀",
      color: "#9B8FE0",
      answer:
        "時間感。我總是低估每件事要花多久，因此一直遲到或趕工。一個準確的時間直覺會讓我的生活大不同。",
    },
  ],
  2: [
    {
      name: "我",
      color: "#16B9B3",
      answer: "一定要先把桌面清空才能開工，不然腦子也會亂。別人覺得這很奇怪。",
      isMe: true,
    },
    {
      name: "Mia",
      color: "#9B8FE0",
      answer: "我習慣把所有 app 通知都關掉，連電話也靜音，朋友都說找不到我。",
    },
    {
      name: "林小明",
      color: "#F5A93E",
      answer: "專注前一定要先整理明天的待辦，哪怕只是移動幾個卡片，讓腦袋先「清空」一次。",
    },
    {
      name: "Kevin",
      color: "#16B9B3",
      answer: "我只能在完全黑暗的房間裡工作，光線太亮就分心。家人覺得很詭異。",
    },
    {
      name: "Amy",
      color: "#9B8FE0",
      answer: "邊聽同一首歌循環才能進狀態，換歌就會分心。現在某首歌已經被我聽了三千多次。",
    },
    {
      name: "阿哲",
      color: "#E07B7B",
      answer: "一定要穿特定的「工作拖鞋」，換了拖鞋就感覺切換了模式，很莫名其妙但很有用。",
    },
    {
      name: "小瑜",
      color: "#5BA58C",
      answer: "必須用紙筆先把要做的事情全部寫下來，才能開電腦。直接打開電腦就會亂飄。",
    },
    {
      name: "雅婷",
      color: "#9B8FE0",
      answer: "我需要喝一杯熱飲才能開始，不是因為咖啡因，純粹是某種啟動儀式。",
    },
    {
      name: "承翰",
      color: "#F5A93E",
      answer: "戴上降噪耳機但不播音樂，就是隔絕外界的感覺。周圍再安靜也一定要戴。",
    },
    {
      name: "珊珊",
      color: "#E07B7B",
      answer: "做重要的事之前先做最不重要的雜事，像是整理抽屜或回一封小信，暖機用的。",
    },
    {
      name: "怡君",
      color: "#5BA58C",
      answer: "一定要把手機放到另一個房間，放在旁邊就算靜音也會意識到它的存在。",
    },
    {
      name: "志偉",
      color: "#F5A93E",
      answer: "把要做的項目寫在便利貼上，貼在螢幕旁邊，完成一個撕一個，那個「撕」的動作很解壓。",
    },
  ],
  3: [
    {
      name: "我",
      color: "#16B9B3",
      answer: "「趁年輕多嘗試，失敗也沒關係。」大學時覺得是老生常談，出社會才懂有多珍貴。",
      isMe: true,
    },
    {
      name: "Amy",
      color: "#9B8FE0",
      answer: "「先完成再完美」。我老是想等準備好了再開始，拖了好多事。",
    },
    {
      name: "宇翔",
      color: "#F5A93E",
      answer: "「多花時間在人身上，少花在事情上。」以前工作狂，現在有點後悔。",
    },
    {
      name: "Kevin",
      color: "#16B9B3",
      answer: "「你不必每件事都親眼見過才相信。」我太依賴自己的親身驗證，錯失了很多機會。",
    },
    {
      name: "Mia",
      color: "#9B8FE0",
      answer: "「好好睡覺比加班更有生產力。」知道但還是熬了好幾年夜，現在在還債。",
    },
    {
      name: "林小明",
      color: "#F5A93E",
      answer: "「保持好奇心比累積知識更重要。」以前學習只想「學完」，忘了學習本身的樂趣。",
    },
    {
      name: "阿哲",
      color: "#E07B7B",
      answer: "「不要等靈感，坐下來先動筆，靈感自然會來。」我以前常常等靈感，等了很久什麼都沒做。",
    },
    {
      name: "小瑜",
      color: "#5BA58C",
      answer: "「說你做不到之前，先試三次。」父母很早就說過，我花了十年才真的做到。",
    },
    {
      name: "雅婷",
      color: "#9B8FE0",
      answer: "「你不需要每個人都喜歡你。」我一直努力讓所有人滿意，累壞了自己。",
    },
    {
      name: "承翰",
      color: "#F5A93E",
      answer: "「比較只是偷走快樂。」Social media 讓這個建議更難實踐，但也更珍貴。",
    },
    {
      name: "珊珊",
      color: "#E07B7B",
      answer: "「錢要存但也要花在值得的事上。」我以前把錢都省下來，結果錯過了很多想做的體驗。",
    },
    {
      name: "怡君",
      color: "#5BA58C",
      answer: "「你的直覺比你想的可靠。」我常常思考太多，分析到反而做錯決定。",
    },
    {
      name: "志偉",
      color: "#F5A93E",
      answer:
        "「感謝身邊的人，不要等到失去才說。」我有個朋友突然離開了，那之後才明白這句話的重量。",
    },
  ],
  4: [
    {
      name: "我",
      color: "#16B9B3",
      answer: "煮咖啡。進入心流之後根本忘記外面的世界，朋友說跟我約喝咖啡都要等我「回來」。",
      isMe: true,
    },
    {
      name: "Kevin",
      color: "#16B9B3",
      answer: "登山。踏上山徑之後腦袋就完全切換，工作的事情完全想不起來。",
    },
    { name: "Mia", color: "#9B8FE0", answer: "做陶。手在動的時候，思緒反而最安靜。" },
    {
      name: "小綠",
      color: "#5BA58C",
      answer: "打電動。我知道大家會說這個，但真的是唯一讓我完全在「當下」的事。",
    },
    {
      name: "林小明",
      color: "#F5A93E",
      answer: "閱讀小說。不是讀書，是真的讀故事，讀到好的情節會忘記吃飯。",
    },
    {
      name: "Amy",
      color: "#9B8FE0",
      answer: "健身。以前討厭運動，現在每次練完都有點悵然若失，因為那個狀態太好了。",
    },
    {
      name: "阿哲",
      color: "#E07B7B",
      answer: "拍照漫步。拿著相機在街上走，一走就是三四個小時，路線完全跟著直覺走。",
    },
    {
      name: "宇翔",
      color: "#F5A93E",
      answer: "編排 Playlist。一旦開始幫某個場景找歌，就停不下來，通常都從下午弄到深夜。",
    },
    {
      name: "雅婷",
      color: "#9B8FE0",
      answer: "烘焙。按照食譜一步步做，不需要思考，只需要跟著走，非常療癒。",
    },
    {
      name: "承翰",
      color: "#F5A93E",
      answer: "研究地圖和路線。我可以花好幾小時規劃一趟不一定會去的旅行，純粹享受那個過程。",
    },
    {
      name: "珊珊",
      color: "#E07B7B",
      answer: "素描。我不算會畫畫，但拿起鉛筆就什麼都不管了，連肚子餓了都不知道。",
    },
    {
      name: "怡君",
      color: "#5BA58C",
      answer: "拼拼圖。一片一片找，大腦在工作但又好像在休息，反差很奇妙。",
    },
    {
      name: "志偉",
      color: "#F5A93E",
      answer: "剪影片。把素材整理成一段影片，調色、配樂，一不小心天都亮了。",
    },
  ],
};

const PAGE_SIZE = 5;

// Generic responses shown after inline submission for questions without specific data
const GENERIC_RESPONSES: ResponseEntry[] = [
  { name: "林小明", color: "#F5A93E", answer: "我也想過這個問題，其實答案跟我自己的成長歷程很有關係，說不定跟你想的方向完全不同。" },
  { name: "Amy", color: "#9B8FE0", answer: "這個問題讓我想了一下才回答，因為答案好像一直在變。現在的我跟一年前的想法已經不太一樣了。" },
  { name: "Kevin", color: "#16B9B3", answer: "分享這種事情其實有點猶豫，但看到大家都這麼真誠，就說了。其實我想了很久才找到自己的答案。" },
  { name: "小綠", color: "#5BA58C", answer: "我以為只有我這樣想，看到這麼多人都有類似的感受，突然覺得輕鬆很多。" },
  { name: "Mia", color: "#9B8FE0", answer: "這個問題讓我重新思考了一些平常不會停下來想的事，謝謝有人提出來。" },
  { name: "阿哲", color: "#E07B7B", answer: "答案其實很簡單，但說出來才發現自己從來沒有認真跟人說過。這種感覺很奇妙。" },
  { name: "宇翔", color: "#F5A93E", answer: "我問過幾個朋友，大家的答案都不一樣，但都很有道理。我的答案是這樣的，但不一定適合所有人。" },
  { name: "雅婷", color: "#9B8FE0", answer: "說出來才發現這件事對我的影響比我以為的還要深。有時候回答別人的問題反而更了解自己。" },
];

// ─── Inline flip card (for unanswered questions) ──────────────────────────────

function InlineFlipCard({
  question,
  example,
  onSubmit,
  flipped: controlledFlipped,
  onFlippedChange,
}: {
  question: string;
  example: string;
  onSubmit: (answer: string) => void;
  flipped?: boolean;
  onFlippedChange?: (v: boolean) => void;
}) {
  const [internalFlipped, setInternalFlipped] = useState(false);
  const isFlipped = controlledFlipped !== undefined ? controlledFlipped : internalFlipped;
  const setIsFlipped = (v: boolean) => {
    setInternalFlipped(v);
    onFlippedChange?.(v);
  };
  const [answer, setAnswer] = useState("");
  const [extraMinHeight, setExtraMinHeight] = useState(0);

  const handleSubmit = () => {
    if (!answer.trim()) return;
    onSubmit(answer.trim());
  };

  return (
    <div style={{ perspective: "1000px" }} className="w-full mb-4">
      <div
        className="relative w-full transition-transform duration-500 ease-in-out"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front */}
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: card flip interaction */}
        {/* biome-ignore lint/a11y/noStaticElementInteractions: card flip interaction */}
        <div
          className="group w-full bg-white rounded-2xl px-5 pt-5 pb-5 shadow-sm hover:shadow-md hover:ring-2 hover:ring-logo-cyan transition-all duration-200 flex flex-col cursor-pointer select-none"
          style={{ backfaceVisibility: "hidden", minHeight: extraMinHeight || undefined }}
          onClick={() => setIsFlipped(true)}
        >
          <QuoteSvg className="mt-1 mb-3 self-center shrink-0" />
          <p className="text-[20px] font-semibold text-text-dark text-center leading-snug shrink-0">
            {question}
          </p>
          <div className="mt-8 flex items-center justify-end shrink-0">
            <div className="flex items-center gap-2 transition-transform duration-200 group-hover:translate-x-1">
              <span className="text-sm font-medium text-primary-darker">分享我的想法</span>
              <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-8 shrink-0">
                <title>繼續箭頭</title>
                <circle cx="30" cy="30" r="30" fill="#F0FAFA"/>
                <path d="M42.0735 30.0176L30.4666 30.0194M30.45 30.0194L17.85 30.0194M30.45 17.4L41.3791 28.3296C41.8221 28.7727 42.071 29.3735 42.071 30C42.071 30.6265 41.8221 31.2274 41.3791 31.6704L30.45 42.6" stroke="#5C7080" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Back */}
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: card flip interaction */}
        {/* biome-ignore lint/a11y/noStaticElementInteractions: card flip interaction */}
        <div
          className="absolute inset-0 bg-white rounded-2xl px-6 pt-5 pb-6 shadow-sm border border-[#E8F8FF] flex flex-col cursor-pointer"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          onClick={() => setIsFlipped(false)}
        >
          <p className="text-sm text-primary-darker leading-relaxed shrink-0 line-clamp-2">
            {question}
          </p>
          {/* biome-ignore lint/a11y/noStaticElementInteractions: stop propagation for textarea area */}
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: stop propagation for textarea area */}
          <div
            className="flex-1 flex items-center min-h-[80px]"
            onClick={(e) => e.stopPropagation()}
          >
            <textarea
              rows={1}
              value={answer}
              onChange={(e) => {
                setAnswer(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`;
                const newHeight = e.target.scrollHeight + 160;
                if (newHeight > 280) setExtraMinHeight(newHeight);
              }}
              placeholder={example}
              className="w-full border-0 border-b-2 border-logo-cyan text-base text-text-dark outline-none bg-transparent placeholder:text-text-dark/25 pb-1 resize-none overflow-hidden"
            />
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleSubmit(); }}
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

// ─── Components ───────────────────────────────────────────────────────────────

function ResponseItem({ name, color, answer, isMe }: ResponseEntry) {
  const [expanded, setExpanded] = useState(false);
  const isLong = answer.length > 70;

  return (
    <div
      className={cn(
        "rounded-2xl p-4 transition-all duration-200",
        isMe ? "bg-logo-cyan/[0.06] border border-logo-cyan/20" : "bg-white border border-[#EEF4F4]"
      )}
    >
      <div className="flex items-start gap-3">
        {/* TODO: 頭像點擊後導向該使用者的「我的小島」頁面 (e.g. /users/{userId}) */}
        <div
          className="size-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 mt-0.5"
          style={{ background: color }}
        >
          {name[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            {/* TODO: 名稱點擊後同樣導向該使用者的「我的小島」頁面 */}
            <span
              className={cn("text-sm font-semibold", isMe ? "text-logo-cyan" : "text-text-dark")}
            >
              {name}
            </span>
            {isMe && (
              <span className="text-[10px] text-logo-cyan bg-logo-cyan/10 rounded-full px-2 py-0.5 font-medium leading-none">
                我的回答
              </span>
            )}
          </div>
          <p
            className={cn(
              "text-sm text-text-dark/70 leading-relaxed",
              !expanded && isLong && "line-clamp-2"
            )}
          >
            {answer}
          </p>
          {isLong && (
            // biome-ignore lint/a11y/useKeyWithClickEvents: mockup interaction
            // biome-ignore lint/a11y/noStaticElementInteractions: mockup interaction
            <div
              className="mt-1.5 flex items-center gap-0.5 text-xs text-text-dark/35 hover:text-text-dark/60 transition-colors cursor-pointer w-fit"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? "收起" : "展開全文"}
              <ChevronDown
                className={cn("size-3 transition-transform duration-200", expanded && "rotate-180")}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingDots() {
  return (
    <div className="flex justify-center items-center gap-1.5 py-4">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="size-2 rounded-full bg-logo-cyan/40 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LearningPersonaDetailPage() {
  const router = useRouter();
  const params = useParams();
  const idParam = params?.id;
  const id = typeof idParam === "string" ? Number.parseInt(idParam, 10) : Number.NaN;

  const questionData =
    Number.isNaN(id) || id < 1 || id > QUESTION_BANK.length ? null : QUESTION_BANK[id - 1];
  const answeredByMeInitially = id >= 1 && id <= 4;

  // Inline answer state (for questions not yet answered)
  const [answeredInline, setAnsweredInline] = useState(false);
  const [myInlineAnswer, setMyInlineAnswer] = useState("");
  const [cardFlipped, setCardFlipped] = useState(false);

  const isAnswered = answeredByMeInitially || answeredInline;

  // Build displayed response list
  const storedResponses = ALL_RESPONSES[id] ?? [];
  const allResponses: ResponseEntry[] = answeredInline
    ? [
        { name: "我", color: "#16B9B3", answer: myInlineAnswer, isMe: true },
        ...GENERIC_RESPONSES.slice(0, 5),
      ]
    : storedResponses;

  const [visible, setVisible] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const hasMore = visible < allResponses.length;

  useEffect(() => {
    if (!hasMore) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !loading) {
          setLoading(true);
          // Simulate async load
          setTimeout(() => {
            setVisible((v) => Math.min(v + PAGE_SIZE, allResponses.length));
            setLoading(false);
          }, 600);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading, allResponses.length]);

  if (!questionData) {
    return (
      <div className="relative w-screen min-h-screen z-10 flex items-center justify-center bg-very-light-gray">
        <BackgroundAnimation />
        <p className="text-text-dark/50 text-sm">找不到這個問題</p>
      </div>
    );
  }


  return (
    <div className="relative w-screen min-h-screen z-10 overflow-x-hidden overflow-y-auto bg-very-light-gray">
      <BackgroundAnimation />

      {/* Close button */}
      <div className="sticky top-0 z-50 flex justify-end px-3 pt-3 pointer-events-none">
        <button
          type="button"
          onClick={() => router.push("/zh-TW/ux-mockup/learning-persona?tab=persona")}
          className="pointer-events-auto flex items-center justify-center size-10 rounded-full text-text-dark/40 bg-very-light-gray/70 backdrop-blur-sm hover:text-logo-cyan hover:bg-white/80 transition-all"
          aria-label="關閉"
        >
          <X className="size-5" />
        </button>
      </div>

      <main className="max-w-[640px] px-4 mx-auto pb-16 pt-4">
        <div className="flex flex-col gap-3">

          {/* Question card (shown when already answered) / Flip card (when not answered) */}
          {isAnswered ? (
            <div className="bg-white rounded-2xl shadow-sm px-5 py-4 mb-4">
              <p className="text-base font-bold text-text-dark leading-snug">
                {questionData.question}
              </p>
              <p className="text-xs text-text-dark/40 mt-1">{questionData.example}</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-logo-cyan font-medium bg-logo-cyan/10 rounded-full px-2.5 py-1">
                  已回答
                </span>
                {allResponses.length > 0 && (
                  <span className="text-xs text-text-dark/35">{allResponses.length} 則回應</span>
                )}
              </div>
            </div>
          ) : (
            <InlineFlipCard
              question={questionData.question}
              example={questionData.example}
              flipped={cardFlipped}
              onFlippedChange={setCardFlipped}
              onSubmit={(ans) => {
                setMyInlineAnswer(ans);
                setAnsweredInline(true);
              }}
            />
          )}

          {/* Responses section — always visible */}
          <div className="flex flex-col gap-3">
            {/* Section label */}
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-semibold text-text-dark/70">大家的回答</h2>
            </div>

            {isAnswered ? (
              <>
                {/* Inline submit success banner */}
                {answeredInline && (
                  <div className="bg-logo-cyan/[0.06] border border-logo-cyan/20 rounded-2xl px-4 py-3 flex items-center gap-3">
                    <CheckCircle2 className="size-5 text-logo-cyan shrink-0" />
                    <p className="text-sm text-text-dark/70 leading-relaxed">
                      感謝你的分享！你的回答已加入人物誌。
                    </p>
                  </div>
                )}

                {/* Response items */}
                {allResponses.slice(0, visible).map((r) => (
                  <ResponseItem
                    key={r.name}
                    name={r.name}
                    color={r.color}
                    answer={r.answer}
                    isMe={r.isMe}
                  />
                ))}

                {/* Loading / sentinel */}
                {hasMore && (
                  <>
                    {loading && <LoadingDots />}
                    <div ref={sentinelRef} className="h-4" />
                  </>
                )}

                {!hasMore && allResponses.length > 0 && (
                  <p className="text-center text-xs text-text-dark/30 py-4">
                    已顯示全部 {allResponses.length} 則回應
                  </p>
                )}
              </>
            ) : (
              /* Locked placeholder */
              <div className="bg-white rounded-2xl shadow-sm px-5 py-8 flex flex-col items-center gap-3 text-center">
                <p className="text-sm font-medium text-text-dark/70">回答後即可看到其他人怎麼說</p>
                <button
                  type="button"
                  onClick={() => {
                    setCardFlipped(true);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="mt-1 text-sm font-medium text-white bg-logo-cyan rounded-full px-5 py-2.5 hover:bg-logo-cyan/90 active:scale-95 transition-all"
                >
                  分享我的想法
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
