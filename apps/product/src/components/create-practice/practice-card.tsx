"use client";

import { Badge } from "@daodao/ui/components/badge";
import { cn } from "@daodao/ui/lib/utils";

interface PracticeCardProps {
  category: string;
  title: string;
  description: string;
  templateId: string;
  onClick?: (templateId: string) => void;
}

export const PracticeCard = ({
  category,
  title,
  description,
  templateId,
  onClick,
}: PracticeCardProps) => {
  const handleClick = () => {
    onClick?.(templateId);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div className="p-6">
      <div
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label={onClick ? `選擇模板：${title}` : undefined}
        className={cn(
          "relative rounded-xl p-4 pt-5 text-white shadow-[0_0_25px_var(--logo-cyan)]/20 bg-logo-cyan",
          onClick &&
            "cursor-pointer transition-all hover:brightness-110 hover:-translate-y-1 hover:scale-[1.02] hover:outline-2 hover:outline-white hover:outline-offset-2 active:scale-[0.98] active:translate-y-0 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
        )}
      >
        {/* Category Badge */}
        <Badge
          variant="dark"
          size="sm"
          className="absolute top-0 left-4 -translate-y-1/2"
        >
          {category}
        </Badge>

        {/* Title */}
        <h3 className="text-xl md:text-2xl font-medium">{title}</h3>

        {/* Description */}
        <p className="text-sm md:text-base">{description}</p>
      </div>
    </div>
  );
};
