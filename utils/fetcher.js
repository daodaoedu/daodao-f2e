import axios from "axios";

const fetcher = async (url) => axios.get(url).then((res) => res.data);

export const postFetcher = async (url, body) =>
  axios.post(url, JSON.stringify(body)).then((res) => res.data);

export const multiFetcher = async (...urls) => {
  const f = async (u) => axios.get(u).then((res) => res.data);
  return Promise.all(urls.map(f));
};

export default fetcher;
