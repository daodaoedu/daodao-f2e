interface ExploreEmptyProps {
  title: string;
  hint?: string | null;
}

/** 探索頁空狀態：虛線框（daodao#567） */
export function ExploreEmpty({ title, hint }: ExploreEmptyProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-[20px] border border-dashed border-[#D4E5E4] bg-white px-6 py-12">
      <p className="m-0 text-sm font-medium text-text-dark/70">{title}</p>
      {hint && <p className="m-0 text-[13px] text-text-dark/50">{hint}</p>}
    </div>
  );
}
