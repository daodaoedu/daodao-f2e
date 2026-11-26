import type { ReactNode } from "react";

interface ExploreEmptyProps {
  title: string;
  hint?: string | null;
  /** 空狀態下方的動作（例：登入按鈕） */
  action?: ReactNode;
  /** 載入失敗時用 alert 讓輔助科技朗讀 */
  role?: "alert";
}

/** 清單空狀態：虛線框（探索頁 daodao#567、空間頁 daodao#572 共用） */
export function ExploreEmpty({ title, hint, action, role }: ExploreEmptyProps) {
  return (
    <div
      role={role}
      className="flex flex-col items-center gap-2 rounded-[20px] border border-dashed border-[#D4E5E4] bg-white px-6 py-12 text-center"
    >
      <p className="m-0 text-sm font-medium text-text-dark/70">{title}</p>
      {hint && <p className="m-0 text-[13px] text-text-dark/50">{hint}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
