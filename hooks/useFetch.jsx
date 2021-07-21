import { useEffect, useState } from 'react';

const useFetch = (url, initialValue) => {
  const [result, setResult] = useState(initialValue);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        setResult(json);
        setLoading(false);
      });
  }, []);
  return { result, loading };
};

export default useFetch;
