import { ArrowCircleSvg } from "@daodao/assets";
import { cn } from "@daodao/ui/lib/utils";
import { ThumbsUp } from "lucide-react";

interface ActivityCardProps {
  event_text: string;
  label: string;
  onClick?: () => void;
  className?: string;
}

export function ActivityCard({ event_text, label, onClick, className }: ActivityCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "w-full text-left bg-white rounded-2xl p-4 border border-[#E8F8FF] flex items-center gap-3",
        onClick && "cursor-pointer transition hover:border-logo-cyan/40 hover:shadow-sm",
        className
      )}
    >
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-logo-cyan/10 flex items-center justify-center">
        <ThumbsUp className="w-4 h-4 text-logo-cyan" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="inline-block text-xs font-medium text-logo-cyan bg-logo-cyan/10 rounded-full px-2 py-0.5 mb-1">
          {label}
        </span>
        <p className="text-sm text-text-dark leading-snug">{event_text}</p>
      </div>
      {onClick && (
        <ArrowCircleSvg className="shrink-0 size-8 self-center" />
      )}
    </button>
  );
}
