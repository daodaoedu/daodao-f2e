"use client";

import { cn } from "@daodao/ui/lib/utils";

interface ViewAllCommentsButtonProps {
  commentCount?: number;
  onClick?: () => void;
  className?: string;
}

export function ViewAllCommentsButton({
  commentCount,
  onClick,
  className,
}: ViewAllCommentsButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-center gap-1 py-3 rounded-full",
        "bg-[#99ECFF] text-[#0D3036] text-base leading-6 font-normal",
        "hover:bg-[#7FE4FF] transition-colors",
        className
      )}
    >
      全部留言
      {commentCount != null && commentCount > 0 && <span>({commentCount})</span>}
    </button>
  );
}
