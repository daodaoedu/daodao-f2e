'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Image } from '@/shared/ui/image';
import { Button } from '@/shared/ui/button';
import { useAuth, useAuthDispatch } from '@/shared/lib/auth';
import ResponsiveModal from '@/shared/ui/responsive-modal';
import getEnv from '@/utils/env';

export function LoginModal() {
  const { isOpenLoginModal } = useAuth();
  const { closeLoginModal } = useAuthDispatch();
  const router = useRouter();
  const pathname = usePathname();

  const handleOpenLoginWindow = () => {
    const env = getEnv();

    const url =
      env.isPreview || env.isDevelopment
        ? `${env.stagingURL}/api/auth/google?origin=${window.location.origin}&rt=${pathname}`
        : `${env.apiUrl}/api/v1/auth/google?rt=${pathname}`;

    router.push(url);
  };

  return (
    <ResponsiveModal
      open={isOpenLoginModal}
      onClose={closeLoginModal}
      title="歡迎回來島島阿學！"
    >
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
          Google 登入 / 註冊
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
