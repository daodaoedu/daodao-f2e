'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import lottie from 'lottie-web';
import { usePreloadImages } from '@/hooks/usePreloadImages';
import { useScrollLock } from '@/hooks/useScrollLock';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/Auth';
import { cn } from '@/utils/cn';

export function Loader({ children }: React.PropsWithChildren) {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const { progress, done } = usePreloadImages('img[data-preload]');
  const lottieContainerRef = useRef<HTMLDivElement>(null);
  const lottieAnimationRef = useRef<{ destroy: () => void } | null>(null);

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
      } catch (error) {
        console.error('Failed to load Lottie animation:', error);
      }
    };

    loadLottie();

    return () => {
      if (lottieAnimationRef.current) {
        lottieAnimationRef.current.destroy();
      }
    };
  }, []);

  if (!isLoading) return null;

  return (
    <>
      {!isLoggedIn && children}
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
            {Math.round(progress * 100)}%
          </div>
          <Progress value={Math.min(progress * 100, 100)} className="h-2" />
        </div>
      </div>
    </>
  );
}
