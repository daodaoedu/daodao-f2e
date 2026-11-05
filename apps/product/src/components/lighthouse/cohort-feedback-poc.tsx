"use client";

import { Button } from "@daodao/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@daodao/ui/components/select";
import { Textarea } from "@daodao/ui/components/textarea";
import { useLocale } from "@daodao/i18n";
import { Check, ChevronLeft, ChevronRight, Info, MessageSquareText, Star, Users } from "lucide-react";
import { useState } from "react";

const PAGE_SIZE = 5;
const ALL_PARTICIPANTS = "all";

const participants = [
  { name: "測試學員 01", completed: true },
  { name: "測試學員 02", completed: true },
  { name: "測試學員 03", completed: false },
  { name: "測試學員 04", completed: true },
  { name: "測試學員 05", completed: true },
  { name: "測試學員 06", completed: false },
  { name: "測試學員 07", completed: true },
  { name: "測試學員 08", completed: true },
];

const ratings = [
  { score: 1, label: "完全不符合", count: 1 },
  { score: 2, label: "不太符合", count: 0 },
  { score: 3, label: "部分符合", count: 1 },
  { score: 4, label: "大致符合", count: 2 },
  { score: 5, label: "非常符合", count: 2 },
];

const feedbackGroups = [
  {
    title: "有哪些環節或互動，讓你印象最深？它對你有什麼影響？",
    answers: [
      "每週回顧的分享讓我整理出卡住的原因，後來敢把目標調小，終於開始行動。",
      "和其他人互相回應的環節，讓我發現困難不是只有我遇到。",
    ],
  },
  {
    title: "有什麼你希望可以調整的地方？",
    answers: [
      "每週打卡提醒可以多一點彈性，遇到忙碌週時比較容易維持參與。",
      "希望活動開始時先示範一次如何設定可完成的小目標。",
    ],
  },
  {
    title: "還有其他想讓我們知道的事嗎？",
    answers: ["謝謝帶領者有接住我沒有完成的時候，這讓我願意繼續回來。"],
  },
];

/** POC-only presentation using clearly labelled sample data; it does not call survey APIs. */
export function CohortFeedbackPoc() {
  const locale = useLocale();
  const [completionFilter, setCompletionFilter] = useState(ALL_PARTICIPANTS);
  const [currentPage, setCurrentPage] = useState(1);
  const completedCount = participants.filter((participant) => participant.completed).length;
  const maxRatingCount = Math.max(...ratings.map((rating) => rating.count), 1);
  const filteredParticipants = participants.filter((participant) => {
    if (completionFilter === "completed") return participant.completed;
    if (completionFilter === "not-completed") return !participant.completed;
    return true;
  });
  const pageCount = Math.max(1, Math.ceil(filteredParticipants.length / PAGE_SIZE));
  const visibleParticipants = filteredParticipants.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <section
      aria-labelledby="cohort-feedback-poc-title"
      className="overflow-hidden rounded-3xl border border-[#CDEBE8] bg-white"
    >
      <div className="border-b border-[#E8F3F2] px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[#F1D7A8] bg-[#FFF9ED] px-2.5 py-1 text-[10px] font-semibold tracking-[0.08em] text-[#95671C]">
                POC · 測試資料
              </span>
            </div>
            <h2
              id="cohort-feedback-poc-title"
              className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[#0D3036]"
            >
              學員回饋
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-[#5A7B79]">
              完成狀態與回答分開呈現。只有本場次管理員可以查看；回答不連結到學員姓名或帳號。
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const returnTo = encodeURIComponent(window.location.pathname);
                window.location.assign(`/${locale}/survey/r/lighthouse-feedback-poc?returnTo=${returnTo}`);
              }}
              className="border-[#CDEBE8] text-[#0D5B59] hover:bg-[#F2F8F7]"
            >
              預覽學員填答頁
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <div className="flex items-center gap-2 rounded-2xl border border-[#CDEBE8] bg-[#F2F8F7] px-4 py-3 text-sm text-[#456B68]">
          <Info className="size-4 shrink-0 text-[#0D7773]" aria-hidden="true" />
          <span>客製化問卷 coming soon</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <MetricCard
            label="應填答人數"
            value={participants.length}
            icon={<Users className="size-4" aria-hidden="true" />}
          />
          <MetricCard
            label="已完成"
            value={`${completedCount} / ${participants.length}`}
            icon={<Check className="size-4" aria-hidden="true" />}
          />
        </div>

        <div className="grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
          <section
            aria-labelledby="feedback-completion-title"
            className="overflow-hidden rounded-2xl border border-[#E3EFED]"
          >
            <div className="flex items-start justify-between gap-3 border-b border-[#E8F3F2] px-4 py-4 sm:px-5">
              <div>
                <h3 id="feedback-completion-title" className="font-semibold text-[#0D3036]">
                  填答進度
                </h3>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <span className="rounded-full bg-[#EAF7F5] px-3 py-1 text-xs font-semibold text-[#0D7773]">
                  {completedCount} / {participants.length}
                </span>
                <Select
                  value={completionFilter}
                  onValueChange={(value) => {
                    setCompletionFilter(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger
                    aria-label="篩選填答狀態"
                    className="h-9 w-[138px] border-[#DCEAE8] text-xs"
                  >
                    <SelectValue placeholder="填答狀態" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_PARTICIPANTS}>全部</SelectItem>
                    <SelectItem value="completed">已完成</SelectItem>
                    <SelectItem value="not-completed">未完成</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <ul className="divide-y divide-[#EEF5F4]">
              {visibleParticipants.map((participant) => (
                <li
                  key={participant.name}
                  className="flex items-center justify-between gap-3 px-4 py-3 text-sm sm:px-5"
                >
                  <span className="font-medium text-[#345E5B]">{participant.name}</span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                      participant.completed
                        ? "bg-[#EAF7F0] text-[#28744E]"
                        : "bg-[#F3F5F5] text-[#6D8583]"
                    }`}
                  >
                    {participant.completed ? "已完成" : "未完成"}
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between gap-2 border-t border-[#EEF5F4] px-4 py-3 sm:px-5">
              <p className="text-xs text-[#78928F]">
                第 {currentPage} / {pageCount} 頁 · 共 {filteredParticipants.length} 人
              </p>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="上一頁"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  className="size-8 border-[#DCEAE8]"
                >
                  <ChevronLeft className="size-4" aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="下一頁"
                  disabled={currentPage >= pageCount}
                  onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
                  className="size-8 border-[#DCEAE8]"
                >
                  <ChevronRight className="size-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </section>

          <div className="space-y-5">
            <section
              aria-labelledby="feedback-rating-title"
              className="rounded-2xl border border-[#E3EFED] p-4 sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Star className="size-4 fill-[#E3AC45] text-[#E3AC45]" aria-hidden="true" />
                    <h3 id="feedback-rating-title" className="font-semibold text-[#0D3036]">
                      整體來說，這個課程活動符合你的期待嗎？
                    </h3>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-[#F2F8F7] px-2.5 py-1 text-[11px] font-medium text-[#456B68]">
                  匿名彙整
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {ratings.map((rating) => (
                  <div
                    key={rating.score}
                    className="grid grid-cols-[minmax(90px,auto)_1fr_28px] items-center gap-3 text-xs"
                  >
                    <div className="flex items-center gap-1.5 text-[#456B68]">
                      <span className="inline-flex min-w-9 items-center font-semibold">
                        {rating.score}
                        <Star className="ml-0.5 size-3 fill-[#E3AC45] text-[#E3AC45]" aria-hidden="true" />
                      </span>
                      <span className="truncate text-[#78928F]">{rating.label}</span>
                    </div>
                    <div
                      className="h-2 overflow-hidden rounded-full bg-[#EDF4F3]"
                      role="img"
                      aria-label={`${rating.label}：${rating.count} 份回答`}
                    >
                      <div
                        className="h-full rounded-full bg-[#16B9B3] transition-[width]"
                        style={{ width: `${(rating.count / maxRatingCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-right font-semibold tabular-nums text-[#345E5B]">
                      {rating.count}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section aria-labelledby="feedback-comments-title" className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <MessageSquareText className="size-4 text-[#0D7773]" aria-hidden="true" />
                <h3 id="feedback-comments-title" className="font-semibold text-[#0D3036]">
                  學員文字回饋
                </h3>
              </div>

              {feedbackGroups.map((group) => (
                <div key={group.title} className="rounded-2xl border border-[#E3EFED] bg-white p-4 sm:p-5">
                  <h4 className="text-sm font-semibold leading-5 text-[#345E5B]">{group.title}</h4>
                  <div className="mt-3 space-y-2">
                    {group.answers.map((answer, index) => (
                      <blockquote
                        key={`${group.title}-${index}`}
                        className="rounded-xl bg-[#F7FCFB] px-3.5 py-3 text-sm leading-6 text-[#456B68]"
                      >
                        {answer}
                      </blockquote>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          </div>
        </div>

      </div>
    </section>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string | number;
  detail?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#E3EFED] bg-white p-4">
      <div className="flex items-center justify-between gap-2 text-xs font-medium text-[#78928F]">
        <span>{label}</span>
        <span className="text-[#0D7773]">{icon}</span>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#0D3036]">{value}</p>
      {detail && <p className="mt-1 text-[11px] text-[#78928F]">{detail}</p>}
    </div>
  );
}
