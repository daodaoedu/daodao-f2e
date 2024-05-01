import { useEffect, useReducer, useState } from 'react';

const useFetch = (url, { initialValue, onSuccess } = {}) => {
  const [render, refetch] = useReducer((pre) => !pre, true);
  const [data, setData] = useState(initialValue);
  const [isFetching, setIsFetching] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let pass = true;

    if (url.includes('undefined')) return undefined;

    setIsFetching(true);
    setIsError(false);

    fetch(url)
      .then((res) => res.json())
      .then((json) => pass && setData(json))
      .catch(() => setIsError(true))
      .finally(() => setIsFetching(false));

    return () => {
      pass = false;
    };
  }, [url, render]);

  useEffect(() => {
    if (onSuccess) onSuccess(data);
  }, [onSuccess, data]);

  return { data, isFetching, isError, refetch };
};

export default useFetch;
