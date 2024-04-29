import { select } from 'redux-saga/effects';

const request = function* (url, options = {}) {
  // retrieve the token from the user persist
  const { token } = yield select((state) => state.user);

  // default headers for JSON content type
  const defaultHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // merge default headers with options.headers
  const headers = { ...defaultHeaders, ...options.headers };

  // create a new options object with the merged headers
  const fetchOptions = { ...options, headers };

  const response = yield fetch(url, fetchOptions);
  const data = yield response.json();

  // Check for non-200 status and throw an error
  if (response.status !== 200) {
    throw new Error(data);
  }

  return data;
};

export default request;
