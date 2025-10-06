import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import ResponsiveModal from '@/components/ui/responsive-modal';
import openWindowPopup from '@/utils/openWindowPopup';
import { cn } from '@/utils/cn';
import getEnv from '@/utils/env';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [isOpenWindow, setIsOpenWindow] = useState(false);
  const timer = useRef<NodeJS.Timeout | null>(null);

  const handleOpenLoginWindow = () => {
    const env = getEnv();
    const url = env.isDevHost
      ? `${env.frontendUrl}/auth/google?origin=${window.location.origin}`
      : `${env.apiUrl}/api/v1/auth/google`;
    const popup = openWindowPopup({
      url,
      title: 'login',
      width: 400,
      height: 632,
    });
    setIsOpenWindow(!!popup?.parent);

    if (timer.current !== null) {
      clearInterval(timer.current);
    }

    if (popup?.parent) {
      timer.current = setInterval(() => {
        setIsOpenWindow(!!popup.parent);
      }, 300);
    }
  };

  useEffect(() => {
    if (!isOpenWindow && timer.current !== null) {
      clearInterval(timer.current);
    }
  }, [isOpenWindow, timer.current]);

  return (
    <ResponsiveModal open={isOpen} onClose={onClose} title="歡迎回來島島阿學！">
      <div className="mx-auto w-max">
        <div className="relative overflow-hidden rounded-lg bg-gray-100">
          <Image
            src="https://imgur.com/EADd1UD.png"
            alt="login"
            width={300}
            height={233}
            className="object-cover"
          />
        </div>
      </div>
      <div className="p-4">
        <Button
          type="button"
          className="w-full"
          size="lg"
          onClick={handleOpenLoginWindow}
        >
          {isOpenWindow ? (
            <span className="flex items-center justify-center gap-2">
              <span
                className={cn(
                  'inline-block h-4 w-4 animate-spin rounded-full',
                  'border-2 border-solid border-white/50 border-t-transparent'
                )}
              />
              登入中...
            </span>
          ) : (
            <span>Google 登入 / 註冊</span>
          )}
        </Button>
        <div className="mt-4 text-balance text-center text-sm text-basic-400">
          註冊即代表您同意島島阿學的
          <Link
            href="/terms/privacy-policy"
            target="_blank"
            className="px-1 text-primary-base underline"
          >
            服務條款
          </Link>
          與
          <Link
            href="/terms/privacy-policy"
            target="_blank"
            className="px-1 text-primary-base underline"
          >
            隱私權政策
          </Link>
        </div>
      </div>
    </ResponsiveModal>
  );
}
