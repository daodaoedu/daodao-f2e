import { cn } from "@daodao/ui/lib/utils";

interface TagCloudProps {
  tags: Array<{ tag: string; count: number; percentage: number }>;
  maxItems?: number;
}

export function TagCloud({ tags, maxItems = 15 }: TagCloudProps) {
  const displayed = tags.slice(0, maxItems);
  const maxCount = Math.max(...displayed.map((t) => t.count), 1);

  return (
    <div className="flex flex-wrap gap-2">
      {displayed.map(({ tag, count, percentage }) => {
        const ratio = count / maxCount;
        return (
          <div
            key={tag}
            className={cn(
              "rounded-full border border-[#E0E4E8] px-3 py-1 text-sm transition-colors",
              ratio > 0.6
                ? "border-[#16B9B3] bg-[rgba(22,185,179,0.1)] font-medium text-[#16B9B3]"
                : "bg-white text-[#636E72]"
            )}
          >
            #{tag}
            <span className="ml-1 text-xs text-[#8A9BA0]">{percentage}%</span>
          </div>
        );
      })}
    </div>
  );
}
