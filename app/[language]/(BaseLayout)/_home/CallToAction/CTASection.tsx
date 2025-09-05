'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import './CTASection.css';

interface CTASectionProps {
  className?: string;
}

export function CTASection({ className }: CTASectionProps) {
  return (
    <section className={cn('py-20 bg-gradient-to-r from-primary to-secondary', className)}>
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
          準備好重新打造<br />
          你喜歡的學習生活了嗎？
        </h2>
        
        <Button
          size="lg"
          className="px-8 py-4 text-lg bg-orange-500 hover:bg-orange-600"
        >
          立即加入
        </Button>
      </div>
    </section>
  );
}
