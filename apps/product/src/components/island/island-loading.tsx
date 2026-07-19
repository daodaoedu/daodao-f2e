"use client";

/**
 * 島嶼頁載入畫面：海面漸層＋波紋動畫
 */
export function IslandLoading({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-[#F3FCFC] to-[#A9EDE8]">
      <div className="size-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
      <p className="text-text-dark font-medium">{message}</p>
    </div>
  );
}
