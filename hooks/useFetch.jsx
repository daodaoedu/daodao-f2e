import { useEffect, useState } from 'react';

const useFetch = (url, { initialValue } = {}) => {
  const [data, setData] = useState(initialValue);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const abortController = new AbortController();

    setIsFetching(true);

    fetch(url, { signal: abortController.signal })
      .then((res) => res.json())
      .then((json) => setData(json))
      .finally(() => setIsFetching(false));

    return () => abortController.abort();
  }, [url]);

  return { data, isFetching };
};

export default useFetch;
