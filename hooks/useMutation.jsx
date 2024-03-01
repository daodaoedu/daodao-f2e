import { useState } from 'react';

const useMutation = (mutateFn, { onSuccess, onError } = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const mutate = (values) => {
    setIsLoading(true);
    setIsError(false);

    mutateFn(values)
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
