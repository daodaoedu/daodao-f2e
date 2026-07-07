import type { ElementType } from "react";

interface SectionHeaderProps {
  title: string;
  icon?: ElementType;
  action?: React.ReactNode;
}

export function SectionHeader({ title, icon: Icon, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="flex items-center gap-1.5 text-base font-semibold text-[#2D3436]">
        {Icon && <Icon className="size-4" />}
        {title}
      </h3>
      {action}
    </div>
  );
}
