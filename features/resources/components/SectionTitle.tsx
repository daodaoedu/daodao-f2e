import { cn } from '@/utils/cn';
import { forwardRef } from 'react';

interface SectionTitleProps {
  title: string;
  as?: 'h1' | 'h2';
  className?: string;
  children?: React.ReactNode;
}

function SectionTitle(
  { as = 'h2', title, className, children }: SectionTitleProps,
  ref: React.Ref<HTMLHeadingElement>
) {
  if (as === 'h1') {
    return (
      <h1
        ref={ref}
        className={cn('heading-lg leading-relaxed text-basic-black', className)}
      >
        {title}
      </h1>
    );
  }

  return (
    <div
      className={cn(
        'flex justify-between items-center pb-5 md:pb-6',
        className
      )}
    >
      <h2
        ref={ref}
        className="leading-[2.4rem] text-[1.5rem] font-bold text-basic-500"
      >
        {title}
      </h2>
      {children}
    </div>
  );
}

export default forwardRef(SectionTitle);
