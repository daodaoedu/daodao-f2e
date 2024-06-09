import { useState } from 'react';
import { useSelector } from 'react-redux';
import { BASE_URL } from '@/constants/common';

const useMutation = (url, { method, onSuccess, onError } = {}) => {
  const { token } = useSelector((state) => state.user);
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
      .then((res) => res.json())
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
