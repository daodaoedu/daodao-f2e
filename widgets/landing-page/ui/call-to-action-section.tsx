import { cn } from '@/shared/lib/cn';
import { AuthButton } from '@/features/auth';
import Image from 'next/image';

interface CTASectionProps {
  className?: string;
}

export function CallToActionSection({ className }: CTASectionProps) {
  return (
    <section
      className={cn(
        'relative my-20 flex min-h-[366px] flex-col items-center justify-center px-6',
        'overflow-hidden',
        className
      )}
    >
      <Image
        src="/assets/landing-page/bg-island.svg"
        alt=""
        fill
        className="z-0 object-cover object-center md:object-contain"
        aria-hidden="true"
      />
      <h2 className="relative z-10 my-4 text-center text-[20px] font-semibold leading-tight text-primary-darker md:text-[24px]">
        準備好重新打造
        <br />
        你喜歡的學習生活了嗎？
      </h2>
      <div className="relative z-10">
        <AuthButton variant="ctaOrange" size="huge">
          立即加入
        </AuthButton>
      </div>
    </section>
  );
}
