import { useState } from 'react';
import { useRouter } from 'next/router';
import { BASE_URL } from '@/constants/common';
import { useAuth, useAuthDispatch } from '@/contexts/Auth';

const useMutation = (url, {
  method, enabled = true, onSuccess, onError,
} = {}) => {
  const { token } = useAuth();
  const authDispatch = useAuthDispatch();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const mutate = (values) => {
    if (!enabled) return;

    const endpoint = url.startsWith('http') ? url : `${BASE_URL}${url}`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    const requestData = {
      method,
      body: JSON.stringify(values),
      headers,
    };

    setIsLoading(true);
    setIsError(false);

    fetch(endpoint, requestData)
      .then((res) => {
        if (res.status < 300) return res.json();
        if (res.status === 401) {
          authDispatch.logout();
          router.replace('/login');
        }
        throw res;
      })
      .then(onSuccess)
      .catch((e) => {
        onError?.(e);
        setIsError(true);
      })
      .finally(() => setIsLoading(false));
  };

  return { mutate, isLoading, isError };
};

export default useMutation;
