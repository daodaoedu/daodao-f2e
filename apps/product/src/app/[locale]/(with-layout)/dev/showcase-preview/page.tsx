"use client";

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
import { CalendarCheck, Rss, Search, ThumbsUp } from "lucide-react";
import { useState } from "react";
import type { ElementType } from "react";
import { BackgroundAnimation, Banner } from "@/components/layout";
import { DesktopSidebar } from "@/components/layout/sidebar/desktop";
import { MobileSidebar } from "@/components/layout/sidebar/mobile";
import { ReactionPickerButton } from "@/components/check-in/reactions";
import type { ReactionTypeType } from "@/constants/reaction-type";

// ─── Mood lookup ──────────────────────────────────────────────────────────────

const MOOD_MAP: Record<string, { label: string; Emoji: ElementType }> = {
  happy: { label: "開心", Emoji: HappySvg },
  fine: { label: "還不錯", Emoji: FineSvg },
  neutral: { label: "普通", Emoji: NeutralSvg },
  bored: { label: "無聊", Emoji: BoredSvg },
  frustrated: { label: "受挫", Emoji: FrustratedSvg },
  hopeless: { label: "想放棄", Emoji: HopelessSvg },
};

// ─── Date stamp helper ────────────────────────────────────────────────────────

function parseStampDate(date: string): { year: string; monthDay: string } {
  const parts = date.replace(/\./g, "-").split("-");
  return { year: parts[0] ?? "", monthDay: parts.slice(1).join("/") };
}

// ─── Avatar color ─────────────────────────────────────────────────────────────

const AVATAR_PALETTE = ["#FCDD84", "#A8D8C8", "#FFB3BA", "#BAD4F5", "#D4B8F0", "#FFD0A0", "#B8ECD8"];

function getAvatarColor(name: string): string {
  const code = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_PALETTE[code % AVATAR_PALETTE.length] ?? "#FCDD84";
}

// ─── Mock card: CheckIn ───────────────────────────────────────────────────────

interface MockReactions {
  types: ReactionTypeType[];
  count: number;
  firstName?: string;
}

interface MockCheckInCardProps {
  mood: keyof typeof MOOD_MAP;
  note?: string;
  tags?: string[];
  date: string;
  practiceTitle: string;
  userName: string;
  reactions?: MockReactions;
  commentCount?: number;
  commentPreview?: { name: string; text: string }[];
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
}: MockCheckInCardProps) {
  const moodInfo = MOOD_MAP[mood];
  const MoodEmoji = moodInfo?.Emoji;
  const hasContent = !!(note || tags.length);
  const { year: stampYear, monthDay: stampMonthDay } = parseStampDate(date);

  return (
    <div className="rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md hover:ring-2 hover:ring-logo-cyan transition-all duration-200">
      {/* Cover */}
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
                    <span key={t} className="text-xs text-logo-cyan font-medium">#{t}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="relative flex flex-col items-center justify-center gap-3 py-8 pointer-events-none select-none">
            <p className="text-white font-semibold text-base px-6 text-center line-clamp-2">{practiceTitle}</p>
            {MoodEmoji ? <MoodEmoji className="size-16" /> : <div className="size-16" />}
            {moodInfo && <p className="text-white/70 text-xs">{moodInfo.label}</p>}
            <div className="absolute right-3 bottom-3 anonymous-pro animate-stamp opacity-80" style={{ filter: "brightness(0) invert(1)" }}>
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

      {/* Bottom */}
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
                    <span className="text-[10px] font-semibold text-gray-700">{c.name.slice(0, 1)}</span>
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

// ─── Mock card: Practice ──────────────────────────────────────────────────────

interface MockPracticeCardProps {
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
}

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
}: MockPracticeCardProps) {
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

// ─── Static feed label ────────────────────────────────────────────────────────

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
        <span>{userName ?? "某人"} 在 {practiceTitle ?? "實踐"} 打卡</span>
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

// ─── Static activity card ─────────────────────────────────────────────────────

function ActivityCardStatic({ label, text }: { label: string; text: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-[#E8F8FF] flex items-start gap-3">
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-logo-cyan/10 flex items-center justify-center">
        <ThumbsUp className="w-4 h-4 text-logo-cyan" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="inline-block text-xs font-medium text-logo-cyan bg-logo-cyan/10 rounded-full px-2 py-0.5 mb-1">
          {label}
        </span>
        <p className="text-sm text-text-dark leading-snug">{text}</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ShowcasePreviewPage() {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<"inspire" | "mine">("inspire");
  const [searchValue, setSearchValue] = useState("");

  return (
    <div className="relative min-h-screen">
      <Banner />
      <BackgroundAnimation />
      {isMobile
        ? <MobileSidebar identifier="dev-preview" />
        : <DesktopSidebar identifier="dev-preview" />
      }

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
                {tab === "inspire" ? "靈感" : "我的"}
              </button>
            ))}
          </div>

          {activeTab === "inspire" && (
            <>
              {/* Search bar */}
              <div className="mt-[60px] mb-[48px]">
                <div className="flex items-center gap-2 bg-white border border-[#e4eae9] rounded-[8px] px-4 h-10">
                  <Search className="size-4 text-text-dark/40 shrink-0" />
                  <input
                    type="text"
                    value={searchValue}
                    placeholder="搜尋靈感"
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="flex-1 text-sm text-text-dark outline-none bg-transparent placeholder:text-text-dark/40"
                  />
                </div>
              </div>

              {/* Feed */}
              <div className="flex flex-col gap-3">

                {/* 1. 打卡：小綠 - 有筆記 */}
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

                {/* 2. 互動 */}
                <ActivityCardStatic
                  label="社群動態"
                  text="Kevin 開始了新的跑步計畫，已完成第一次打卡 🏃"
                />

                {/* 3. 實踐 x3 (new_release) */}
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

                {/* 4. 打卡：Sherry - 無筆記 */}
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

                {/* 5. cheered + 實踐 x3 */}
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

                <MockPracticeCard
                  title="寫作練習：每天 500 字"
                  status="active"
                  startDate="2026-04-15"
                  endDate="2026-07-15"
                  userName="怡君"
                  actionDescription="不限主題，可以是日記、散文、故事或觀後感。重點是每天動筆，培養文字表達的流暢度。"
                  frequencyMinDays={5}
                  frequencyMaxDays={7}
                  sessionDurationMinutes={20}
                  reactions={{ types: ["touched", "useful"], count: 9, firstName: "Mia" }}
                  commentCount={0}
                />

                <MockPracticeCard
                  title="養成早起習慣，六點起床"
                  status="completed"
                  startDate="2026-01-01"
                  endDate="2026-03-31"
                  userName="阿偉"
                  actionDescription="把鬧鐘設到對面，強迫自己起床。起床後喝一杯水、做 5 分鐘伸展，再開始一天的工作。"
                  frequencyMinDays={7}
                  frequencyMaxDays={7}
                  reactions={{ types: ["useful", "fire", "touched", "curious"], count: 34, firstName: "怡君" }}
                  commentCount={7}
                />

                {/* 6. 打卡：宇翔 - 有筆記無標籤 */}
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
                    commentPreview={[
                      { name: "Mia", text: "建前本音超有意思的，加油！" },
                    ]}
                  />
                </div>

                {/* 7. new_practice */}
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

                {/* 8. 打卡：Mia - 受挫心情 */}
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
                    commentPreview={[
                      { name: "小綠", text: "有做就是贏！" },
                    ]}
                  />
                </div>

                <div className="h-4" />
              </div>
            </>
          )}

          {activeTab === "mine" && (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
              <p className="text-text-dark/40 text-sm">「我的」分頁為真實資料，需要登入才能查看。</p>
              <p className="text-text-dark/30 text-xs">這是 Dev Prototype 頁面</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
