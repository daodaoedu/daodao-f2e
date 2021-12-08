/* eslint-disable no-console */
// https://github.com/LogRocket/redux-logger/blob/master/src/diff.js
// https://github.com/flitbit/diff#differences

const dictionary = {
  REQUEST: {
    color: "#2196F3",
  },
  SUCCESS: {
    color: "#4CAF50",
  },
  FAILURE: {
    color: "#F44336",
  },
};

const style = (kind) => `color: ${dictionary[kind].color}; font-weight: bold`;

const logger = (useSWRNext) => (key, fetcher, config) => {
  // Add logger to the original fetcher.
  const extendedFetcher = (...args) => {
    const { fallback } = config;
    const isFallbackRequest = Object.keys(fallback).some((fallbackKey) =>
      key.includes(fallbackKey)
    );
    if (isFallbackRequest) {
      console.log(
        `%c🚀 Fallback Request ${key}`,
        `${style("REQUEST")}`,
        fallback
      );
    } else {
      console.log(`%c🚗 Request ${key}`, `${style("REQUEST")}`);
    }
    return fetcher(...args)
      .then((res) => {
        console.log(`%c✅ Success ${key}`, `${style("SUCCESS")}`, res);
        return res;
      })
      .catch(({ stack }) =>
        console.log(`%c❗ Failure ${key}`, `${style("FAILURE")}`, stack)
      );
  };

  // Execute the hook with the new fetcher.
  return useSWRNext(key, extendedFetcher, config);
};

// Example:
// ... used from inside your component
// useSWR(key, fetcher, { use: [logger] })
// SWR Request: /api/user1
// SWR Request: /api/user2
// https://blog.logrocket.com/whats-new-swr-v1/

export default logger;
