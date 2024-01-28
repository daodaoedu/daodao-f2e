import { useEffect, useState } from 'react';

const useFetch = (url, { initialValue } = {}) => {
  const [data, setData] = useState(initialValue);
  const [isFetching, setIsFetching] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let pass = true;

    setIsFetching(true);
    setIsError(false);

    fetch(url)
      .then((res) => res.json())
      .then((json) => pass && setData(json))
      .catch(() => setIsError(true))
      .finally(() => setIsFetching(false));

    return () => pass = false;
  }, [url]);

  return { data, isFetching, isError };
};

export default useFetch;
