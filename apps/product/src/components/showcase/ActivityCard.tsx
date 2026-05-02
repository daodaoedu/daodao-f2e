import { cn } from "@daodao/ui/lib/utils";
import { BookOpen } from "lucide-react";

interface ActivityCardProps {
  activity_type: "community_event" | "follow_summary";
  event_text: string;
  label: string;
  className?: string;
}

export function ActivityCard({ event_text, label, className }: ActivityCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl p-4 border border-[#E8F8FF] flex items-start gap-3",
        className
      )}
    >
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-logo-cyan/10 flex items-center justify-center">
        <BookOpen className="w-4 h-4 text-logo-cyan" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="inline-block text-xs font-medium text-logo-cyan bg-logo-cyan/10 rounded-full px-2 py-0.5 mb-1">
          {label}
        </span>
        <p className="text-sm text-text-dark leading-snug">{event_text}</p>
      </div>
    </div>
  );
}
