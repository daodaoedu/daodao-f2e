import { useEffect, useReducer, useState } from 'react';
import { useSelector } from 'react-redux';
import { BASE_URL } from '@/constants/common';

const useFetch = (url, { enabled = true, initialValue, onSuccess } = {}) => {
  const { token } = useSelector((state) => state.user);
  const [render, refetch] = useReducer((pre) => !pre, true);
  const [data, setData] = useState(initialValue);
  const [isFetching, setIsFetching] = useState(enabled);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const endpoint = url.startsWith('http') ? url : `${BASE_URL}${url}`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    const requestData = { headers }
    let pass = true;

    setIsFetching(true);
    setIsError(false);

    fetch(endpoint, requestData)
      .then((res) => res.json())
      .then((json) => pass && setData(json))
      .catch(() => setIsError(true))
      .finally(() => setIsFetching(false));

    return () => {
      pass = false;
    };
  }, [enabled, token, url, render]);

  useEffect(() => {
    if (onSuccess) onSuccess(data);
  }, [onSuccess, data]);

  return { data, isFetching, isError, refetch };
};

export default useFetch;
