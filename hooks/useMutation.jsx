import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { BASE_URL } from '@/constants/common';
import { userLogout } from '@/redux/actions/user';

const useMutation = (url, { method, onSuccess, onError } = {}) => {
  const { token } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const mutate = (values) => {
    const endpoint = url.startsWith('http') ? url : `${BASE_URL}${url}`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    const requestData = {
      method,
      body: JSON.stringify(values),
      headers,
    }

    setIsLoading(true);
    setIsError(false);

    fetch(endpoint, requestData)
      .then((res) => {
        if (res.status < 300) return res.json();
        if (res.status === 401) {
          dispatch(userLogout());
          router.replace('/login')
        }
        throw res;
      })
      .then(onSuccess)
      .catch((e) => {
        onError(e);
        setIsError(true);
      })
      .finally(() => setIsLoading(false));
  };

  return { mutate, isLoading, isError };
};

export default useMutation;
