import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { sendLoginEvent, useAuthDispatch } from '@/contexts/Auth';
import { getRedirectionStorage } from '@/utils/storage';
import { fetchUserByToken } from '@/redux/actions/user';
import Image from '@/shared/components/Image';

export default function AuthCallbackPage() {
  // TODO: 待移除 redux，為了同步資訊
  const reduxDispatch = useDispatch();
  const { setToken } = useAuthDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const isVerified = searchParams.get('isVerified');

  useEffect(() => {
    if (!token) return;

    sendLoginEvent(token).then((isSendOpener) => {
      if (isSendOpener) return;
      reduxDispatch(fetchUserByToken(token));
      setToken(token);
      router.replace(getRedirectionStorage().get() || '/');
    });
  }, [token, isVerified, reduxDispatch, setToken, router.replace]);

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
