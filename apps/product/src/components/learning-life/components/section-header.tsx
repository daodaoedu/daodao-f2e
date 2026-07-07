interface SectionHeaderProps {
  title: string;
  action?: React.ReactNode;
}

export function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-base font-semibold text-[#2D3436]">{title}</h3>
      {action}
    </div>
  );
}
