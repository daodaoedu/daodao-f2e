import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { sendLoginEvent, useAuthDispatch } from '@/contexts/Auth';
import { getRedirectionStorage } from '@/utils/storage';
import { Image } from '@/components/ui/image';
import { parseToString } from '@/utils/helper';

export default function AuthCallbackPage() {
  const { setToken } = useAuthDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = parseToString(searchParams?.get('token'));
  const isVerified = parseToString(searchParams?.get('isVerified'));

  useEffect(() => {
    if (!token) return;

    sendLoginEvent(token).then((isSendOpener) => {
      const redirectPathname = getRedirectionStorage().get();
      getRedirectionStorage().remove();
      if (isSendOpener) return;
      setToken(token);
      router.replace(redirectPathname ?? '/');
    });
  }, [token, isVerified, setToken, router.replace]);

  return (
    <div className="w-11/12 mx-auto my-5 p-5 min-h-[60vh] shadow-lg rounded-lg border border-solid border-basic-100">
      <h2 className="text-center text-3xl font-bold tracking-[0.08em] text-basic-400">
        正在前往新的島嶼
      </h2>
      <div className="flex justify-center items-center">
        <Image
          src="/assets/images/nobody-island.gif"
          alt="nobody-land"
          width={300}
          height={300}
        />
      </div>
    </div>
  );
}
