'use client';

import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';

interface CTASectionProps {
  className?: string;
}

export function CTASection({ className }: CTASectionProps) {
  return (
    <section 
      className={cn(
        'relative flex flex-col justify-center items-center min-h-[366px] my-20 px-6',
        'overflow-hidden',
        className
      )}
    >
      <img 
        src="/assets/landing-page/bg-island.svg" 
        alt="" 
        data-preload
        className="absolute inset-0 w-full h-full object-cover md:object-contain object-center z-0"
        aria-hidden="true"
      />
      <h2 className="relative z-10 text-[20px] md:text-[24px] font-semibold text-primary-darker text-center my-4 leading-tight">
        準備好重新打造<br />
        你喜歡的學習生活了嗎？
      </h2>
      <Button 
        variant="ctaOrange"
        size="huge"
      >
        立即加入
      </Button>
    </section>
  );
}
