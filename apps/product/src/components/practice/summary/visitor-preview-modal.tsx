"use client";

// TODO: Replace hardcoded strings with useTranslations("practice") when i18n keys are added
import type { PracticeSummary } from "@daodao/api";
import { Button } from "@daodao/ui/components/button";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { Info, Sparkles, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { ShareCardPreview } from "./sections/share-card-preview";

interface VisitorPreviewCheckIn {
  day: number;
  date: string;
  note: string;
}

interface VisitorPreviewModalProps {
  summary: PracticeSummary;
  reflectionText: string;
  selectedCheckInIds: string[];
  selectedCheckIns?: VisitorPreviewCheckIn[];
  themeIndex: number;
  open: boolean;
  onClose: () => void;
}

/**
 * 訪客視角預覽 Modal
 * @description 全螢幕 overlay，模擬訪客在公開頁面會看到的畫面（FRD FR-3.6）
 */
export function VisitorPreviewModal({
  summary,
  reflectionText,
  selectedCheckInIds,
  selectedCheckIns = [],
  themeIndex,
  open,
  onClose,
}: VisitorPreviewModalProps) {
  const previewUrl = `app.daodao.so/practices/${summary.practiceId}/showcase`;
  // 優先使用 Surface 3 選定的實際打卡內容；若無資料則退回 topNotes 近似顯示
  const featuredNotes: string[] =
    selectedCheckIns.length > 0
      ? selectedCheckIns.map((checkIn) => checkIn.note)
      : summary.topNotes.slice(0, selectedCheckInIds.length || 3);
  const avatarChar = summary.userName.trim().charAt(0) || "島";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute inset-x-0 bottom-0 top-12 overflow-y-auto rounded-t-2xl bg-white"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Sticky header */}
            <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-basic-100 bg-white/95 px-5 py-4 backdrop-blur">
              <button
                type="button"
                onClick={onClose}
                aria-label="關閉訪客視角預覽"
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-very-light-gray text-logo-gray"
              >
                <X className="size-4" />
              </button>
              <div className="min-w-0 flex-1">
                <h2 className="text-[15px] font-semibold text-text-dark">訪客視角預覽</h2>
                <p className="truncate text-xs text-logo-gray">這是模擬訪客會看到的畫面</p>
              </div>
            </div>

            <div className="mx-auto max-w-[448px] px-5 pb-16 pt-5">
              {/* Mock URL bar */}
              <div className="mb-5 truncate rounded-full bg-very-light-gray px-4 py-2 text-center text-xs text-logo-gray">
                {previewUrl}
              </div>

              {/* 作者 profile header */}
              <div className="mb-5 flex items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-lightest text-base font-bold text-text-dark">
                  {avatarChar}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-text-dark">
                    {summary.userName}
                  </p>
                  <CustomLink
                    href={`/users/${summary.userName}`}
                    className="text-xs text-logo-cyan underline underline-offset-2"
                  >
                    我的小島
                  </CustomLink>
                </div>
              </div>

              {/* 實踐標題與時間 */}
              <div className="mb-5">
                <h3 className="text-lg font-bold leading-snug text-text-dark">
                  {summary.practiceName}
                </h3>
                <p className="mt-1 text-xs text-logo-gray">
                  {summary.startDate} — {summary.endDate}
                </p>
              </div>

              {/* 分享卡預覽 */}
              <div className="mb-6">
                <ShareCardPreview
                  summary={summary}
                  reflectionText={reflectionText}
                  themeIndex={themeIndex}
                />
              </div>

              {/* 打卡精選 */}
              {featuredNotes.length > 0 && (
                <section className="mb-6">
                  <h4 className="mb-2 text-[15px] font-semibold text-text-dark">打卡精選</h4>
                  <div className="space-y-2">
                    {featuredNotes.map((note, index) => (
                      <div
                        key={`visitor-preview-note-${index}-${note.slice(0, 8)}`}
                        className="rounded-xl border border-basic-100 bg-white p-3"
                      >
                        <p className="text-xs font-medium text-logo-cyan">精選 {index + 1}</p>
                        <p className="mt-1 text-sm leading-relaxed text-text-dark/80">{note}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 受到啟發了嗎 */}
              <section className="rounded-2xl bg-primary-palest p-5 text-center">
                <Sparkles className="mx-auto size-6 text-logo-cyan" />
                <h4 className="mt-2 text-base font-semibold text-text-dark">受到啟發了嗎？</h4>
                <Button type="button" variant="default" className="mt-4 w-full" disabled>
                  複製此實踐
                </Button>
                <p className="mt-3 flex items-start gap-1.5 text-left text-xs leading-relaxed text-logo-gray">
                  <Info className="mt-0.5 size-3.5 shrink-0 text-basic-300" />
                  只會複製實踐的結構，不會帶走作者的打卡與反思
                </p>
              </section>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
