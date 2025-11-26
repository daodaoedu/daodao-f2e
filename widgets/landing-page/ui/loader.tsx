'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from '@/shared/i18n/navigation';
import { useAssetsLoader } from '@/shared/lib/use-assets-loader';
import { useScrollLock } from '@/shared/lib/use-scroll-lock';
import { Progress } from '@/shared/ui/progress';
import { useAuth } from '@/entities/user';
import { cn } from '@/shared/lib/cn';

export function Loader({ children }: React.PropsWithChildren) {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [lottieIsLoading, setLottieIsLoading] = useState(true);
  const { progress, done } = useAssetsLoader(
    isLoggedIn ? '' : 'img[data-preload]'
  );
  const lottieContainerRef = useRef<HTMLDivElement>(null);
  const lottieAnimationRef = useRef<{ destroy: () => void } | null>(null);
  const percent = Math.max(Math.round(progress * 100), lottieIsLoading ? 0 : 5);

  // 使用滾動鎖定 hook
  const { unlockScroll } = useScrollLock();

  useEffect(() => {
    if (isLoggedIn) {
      router.prefetch('/explore');
    }
  }, [isLoggedIn, router]);

  // 當載入完成時，確保恢復滾動
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (done) {
      unlockScroll();
      timer = setTimeout(() => {
        setIsLoading(false);
      }, 300);
      if (isLoggedIn) {
        router.replace('/explore');
      }
    }
    return () => {
      clearTimeout(timer);
    };
  }, [done, unlockScroll, isLoggedIn, router]);

  useEffect(() => {
    // Load Lottie animation
    const loadLottie = async () => {
      try {
        if (lottieContainerRef.current) {
          const lottie = (await import('lottie-web')).default;
          lottieAnimationRef.current = lottie.loadAnimation({
            container: lottieContainerRef.current,
            path: '/assets/landing-page/logo-action.json',
            renderer: 'svg',
            loop: true,
            autoplay: true,
            name: 'Loader',
            rendererSettings: { preserveAspectRatio: 'xMidYMid meet' },
          });
        }
      } catch {
        setIsLoading(false);
      } finally {
        setLottieIsLoading(false);
      }
    };

    loadLottie();

    return () => {
      if (lottieAnimationRef.current) {
        lottieAnimationRef.current.destroy();
      }
    };
  }, []);

  return (
    <>
      {!isLoggedIn && children}
      {isLoading && (
        <div
          className={cn(
            'fixed inset-0 z-50 grid grid-rows-[1fr_auto] bg-primary-palest transition-opacity duration-300 ease-in-out',
            done ? 'opacity-0' : 'opacity-100'
          )}
        >
          <div className="grid place-items-center">
            <div ref={lottieContainerRef} className="size-[140px]" />
          </div>

          <div className="px-6 pb-6">
            <div className="mb-2 text-[50px] font-semibold text-primary-base">
              {percent}%
            </div>
            <Progress value={percent} className="h-2" />
          </div>
        </div>
      )}
    </>
  );
}
