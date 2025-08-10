import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from '@/shared/components/Image';
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
    const baseUrl = env.isDevHost ? env.frontendUrl : env.apiUrl;
    const popup = openWindowPopup({
      url: `${baseUrl}/auth/google?origin=${window.location.origin}`,
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
    <ResponsiveModal
      open={isOpen}
      onClose={onClose}
      title="歡迎回來島島阿學！"
    >
      <div className="mx-auto w-max">
        <Image
          src="https://imgur.com/EADd1UD.png"
          alt="login"
          background="rgba(240, 240, 240, .8)"
          height="233px"
          width="300px"
        />
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
                  'w-4 h-4 rounded-full inline-block animate-spin',
                  'border-solid border-2 border-white/50 border-t-transparent'
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
            href="/terms/privacypolicy"
            target="_blank"
            className="px-1 text-primary-base underline"
          >
            服務條款
          </Link>
          與
          <Link
            href="/terms/privacypolicy"
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
