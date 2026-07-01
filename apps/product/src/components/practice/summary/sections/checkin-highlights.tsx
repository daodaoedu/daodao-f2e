interface CheckinHighlightsProps {
  /** 精選打卡筆記（文字最多的最多 3 則，來自 summary.topNotes） */
  topNotes: string[];
}

/**
 * 打卡精選區塊
 * @description 唯讀顯示最多 3 則精選打卡筆記；PracticeSummary 目前僅提供筆記文字，
 * 沒有各則對應的日期資料，因此以「精選 N」取代設計稿中的日期標籤。
 */
export function CheckinHighlights({ topNotes }: CheckinHighlightsProps) {
  const notes = topNotes.slice(0, 3);

  if (notes.length === 0) {
    return null;
  }

  return (
    <section className="mt-4">
      <h2 className="text-[15px] font-semibold text-text-dark">打卡精選</h2>
      <div className="mt-3 space-y-2">
        {notes.map((note, index) => (
          <div
            key={`checkin-highlight-${index}-${note.slice(0, 8)}`}
            className="rounded-xl border border-basic-100 bg-white p-3"
          >
            <p className="text-xs font-medium text-logo-cyan">精選 {index + 1}</p>
            <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-text-dark/80">{note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
