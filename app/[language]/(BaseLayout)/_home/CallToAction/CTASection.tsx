'use client';

import { cn } from '@/utils/cn';
import { SectionHeader } from '@/app/[language]/(BaseLayout)/SectionHeader';
import './CTASection.css';

interface CTASectionProps {
  className?: string;
}

export function CTASection({ className }: CTASectionProps) {
  return (
    <section 
      className={cn(
        'section-block call-to-action flex flex-col justify-center h-[366px] mb-[74px] px-6',
        'bg-cover bg-no-repeat bg-center',
        'md:bg-contain',
        className
      )}
      style={{
        backgroundImage: 'url(/assets/landing-page/bg-island.svg)',
      }}
    >
      <SectionHeader
        title="準備好重新打造你喜歡的學習生活了嗎？"
        variant="light"
        size="lg"
        alignment="center"
        showSubtitle={false}
        className="text-white"
      />
      <div className="btn btn-orange btn-large">立即加入</div>
    </section>
  );
}
