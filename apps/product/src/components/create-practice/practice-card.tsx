"use client";

import { Badge } from "@daodao/ui/components/badge";

interface PracticeCardProps {
  category: string;
  title: string;
  description: string;
}

export const PracticeCard = ({
  category,
  title,
  description,
}: PracticeCardProps) => {
  return (
    <div className="p-6">
      <div className="relative rounded-xl p-4 pt-5 text-white shadow-[0_0_25px_var(--logo-cyan)]/20 bg-logo-cyan">
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
