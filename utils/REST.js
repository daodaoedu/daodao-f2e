export const get = async (url) => {
  return fetch(url, {
    method: 'GET',
  }).then((res) => res.json())
    .catch((error) => { throw error; });
};

export const post = async (url, body) => {
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  }).then((res) => res.json())
    .catch((error) => { throw error; });
};
