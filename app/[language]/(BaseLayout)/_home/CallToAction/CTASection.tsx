'use client';

import { cn } from '@/utils/cn';

interface CTASectionProps {
  className?: string;
}

export function CTASection({ className }: CTASectionProps) {
  return (
    <section 
      className={cn(
        'relative flex flex-col justify-center items-center h-[366px] my-20 px-6',
        'bg-cover bg-no-repeat bg-center overflow-hidden',
        'md:bg-contain',
        className
      )}
      style={{
        backgroundImage: 'url(/assets/landing-page/bg-island.svg)',
      }}
    >
      <h2 className="text-[20px] md:text-[24px] font-semibold text-primary-darker text-center my-4 leading-tight">
        準備好重新打造<br />
        你喜歡的學習生活了嗎？
      </h2>
      <button type="button" className="flex justify-center items-center rounded-[40px] border-2 border-tips bg-tips text-white px-5 py-3 h-14 w-[180px] text-xl font-semibold transition-all duration-300 ease-in-out hover:bg-white hover:text-tips shadow-[0_8px_10px_0_rgba(255,161,11,0.2)]">
        立即加入
      </button>
    </section>
  );
}
