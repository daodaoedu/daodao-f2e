"use client";

import { useLocale } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { Textarea } from "@daodao/ui/components/textarea";
import { Check, Star } from "lucide-react";
import { useState } from "react";

const ratingLabels = ["完全不符合", "不太符合", "部分符合", "大致符合", "非常符合"];

const prompts = [
  {
    question: "有哪些環節或互動，讓你印象最深？它對你有什麼影響？",
    hint: "可以分享最喜歡或覺得有幫助的地方，也可以分享困惑或不舒服的經驗；舉一個具體例子即可。",
  },
  {
    question: "有什麼你希望可以調整的地方？",
    hint: "可描述遇到的情況及希望有什麼不同，不需要提出完整解法。",
  },
  {
    question: "還有其他想讓我們知道的事嗎？",
    hint: "可分享前面未提到的感受、建議或想說的話。",
  },
];

/** Learner-facing static POC. Responses remain in the browser and are never sent to the API. */
export function LearnerFeedbackSurveyPoc() {
  const locale = useLocale();
  const [rating, setRating] = useState<number | null>(null);
  const [showRequiredError, setShowRequiredError] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function returnToManagementPreview() {
    const requestedReturnPath = new URLSearchParams(window.location.search).get("returnTo");
    const safeReturnPath = requestedReturnPath?.startsWith(`/${locale}/lighthouse/`)
      ? requestedReturnPath
      : `/${locale}/lighthouse/programs`;
    window.location.assign(safeReturnPath);
  }

  if (submitted) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <section className="rounded-3xl border border-[#CDEBE8] bg-white p-8 text-center sm:p-12">
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-[#EAF7F5] text-[#0D7773]">
            <Check className="size-6" aria-hidden="true" />
          </div>
          <h1 className="mt-4 text-xl font-semibold text-[#0D3036]">回饋已送出，謝謝你</h1>
          <p className="mt-2 text-sm leading-6 text-[#5A7B79]">
            這是提交完成頁示意；此 POC 不會更新填答進度或儲存回答。
          </p>
          <p className="mt-4 text-xs text-[#8AA09E]">POC 示意：不會真的送出或儲存資料</p>
          <Button
            type="button"
            variant="outline"
            className="mt-6"
            onClick={returnToManagementPreview}
          >
            返回管理員預覽
          </Button>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
      <section className="overflow-hidden rounded-3xl border border-[#CDEBE8] bg-white shadow-sm">
        <header className="border-b border-[#E8F3F2] px-5 py-5 sm:px-8 sm:py-7">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium tracking-wide text-[#78928F]">島島阿學 · 活動問卷</span>
            <span className="rounded-full border border-[#F1D7A8] bg-[#FFF9ED] px-2.5 py-1 text-[10px] font-semibold tracking-[0.08em] text-[#95671C]">
              POC 預覽
            </span>
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-[#0D3036]">活動回饋</h1>
          <p className="mt-2 text-sm leading-6 text-[#5A7B79]">
            謝謝你參與這次課程活動！歡迎分享你的感受與建議，讓我們知道哪些地方值得保留、哪些可以調整，作為之後規劃活動的參考。
          </p>
        </header>

        <form
          className="space-y-6 p-5 sm:p-8"
          onSubmit={(event) => {
            event.preventDefault();
            if (rating === null) {
              setShowRequiredError(true);
              document.getElementById("poc-rating-question")?.scrollIntoView({ behavior: "smooth", block: "center" });
              return;
            }
            setShowRequiredError(false);
            setSubmitted(true);
          }}
        >
          <div className="rounded-2xl border border-[#F1D7A8] bg-[#FFF9ED] p-4 text-sm leading-6 text-[#76551D]">
            <span className="font-semibold">填答與隱私說明：</span>
            請先登入填寫。系統會記錄你是否已完成，管理員可以查看完成狀態；你的回答不會連結到姓名或帳號。文字內容仍可能讓人推測作者。
          </div>

          <fieldset id="poc-rating-question" className="rounded-2xl border border-[#E3EFED] p-4 sm:p-5">
            <legend className="px-1 text-sm font-semibold text-[#0D3036]">
              整體來說，這個課程活動符合你的期待嗎？ <span className="text-[#B74C42]">*</span>
            </legend>
            <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="整體期待評分">
              {ratingLabels.map((label, index) => {
                const value = index + 1;
                const selected = rating === value;
                return (
                  <Button
                    key={value}
                    type="button"
                    variant="outline"
                    role="radio"
                    aria-checked={selected}
                    aria-label={`${value} 星：${label}`}
                    onClick={() => {
                      setRating(value);
                      setShowRequiredError(false);
                    }}
                    className={`h-auto min-w-20 flex-col gap-1 px-3 py-2 ${selected ? "border-[#0D7773] bg-[#EAF7F5] text-[#0D5B59]" : "border-[#DCEAE8] text-[#456B68]"}`}
                  >
                    <span className="flex items-center" aria-hidden="true">
                      {Array.from({ length: value }, (_, star) => (
                        <Star key={star} className="size-3.5 fill-[#E3AC45] text-[#E3AC45]" />
                      ))}
                    </span>
                    <span className="text-[11px]">{label}</span>
                  </Button>
                );
              })}
            </div>
            {showRequiredError && (
              <p role="alert" className="mt-3 text-sm text-[#B74C42]">請選擇一個星等。</p>
            )}
          </fieldset>

          {prompts.map((item, index) => (
            <div key={item.question} className="space-y-2">
              <label htmlFor={`poc-feedback-${index}`} className="text-sm font-semibold text-[#0D3036]">
                {item.question} <span className="font-normal text-[#78928F]">選填</span>
              </label>
              <Textarea
                id={`poc-feedback-${index}`}
                rows={3}
                placeholder="分享你的想法…"
                className="resize-y border-[#DCEAE8]"
              />
              <p className="text-xs leading-5 text-[#78928F]">{item.hint}</p>
            </div>
          ))}

          <div className="flex flex-wrap items-center gap-3 border-t border-[#E8F3F2] pt-5">
            <Button type="submit" className="bg-[#0D7773] text-white hover:bg-[#0B6663]">提交回饋</Button>
            <Button
              type="button"
              variant="outline"
              onClick={returnToManagementPreview}
            >
              返回管理員預覽
            </Button>
            <span className="text-xs text-[#8AA09E]">POC 示意，不會真的送出或儲存資料</span>
          </div>
        </form>
      </section>
    </main>
  );
}
