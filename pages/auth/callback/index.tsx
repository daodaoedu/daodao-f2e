import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { sendLoginEvent, useAuthDispatch } from '@/contexts/Auth';
import { getRedirectionStorage } from '@/utils/storage';
import Image from '@/shared/components/Image';
import { parseToString } from '@/utils/helper';

export default function AuthCallbackPage() {
  const { setToken } = useAuthDispatch();
  const router = useRouter();
  const { query } = router;
  const token = parseToString(query.token);
  const isVerified = parseToString(query.isVerified);

  useEffect(() => {
    if (!token) return;

    sendLoginEvent(token).then((isSendOpener) => {
      if (isSendOpener) return;
      setToken(token);
      router.replace(getRedirectionStorage().get() || '/');
    });
  }, [token, isVerified, setToken, router.replace]);

  return (
    <div className="w-11/12 mx-auto my-5 p-5 min-h-[60vh] shadow-lg rounded-lg border border-solid border-basic-100">
      <h2 className="text-center text-3xl font-bold tracking-[0.08em] text-basic-400">
        正在前往新的島嶼
      </h2>
      <div className="flex justify-center items-center">
        <Image
          src="/assets/nobody-land.gif"
          alt="nobody-land"
          width="300"
          height="300"
        />
      </div>
    </div>
  );
}
