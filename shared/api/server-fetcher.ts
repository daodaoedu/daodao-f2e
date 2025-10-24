import { cookies } from 'next/headers';
import { API_BASE_URL } from './common';

interface ServerFetcherResponse {
  status: number;
  headers: Headers;
  data: unknown;
}

export const serverFetcher = async <T extends ServerFetcherResponse>(
  url: string,
  requestInit: RequestInit
): Promise<T> => {
  const fullUrl = new URL(url, API_BASE_URL).toString();

  // 從 Next.js cookies 中取得 cookies 並轉發
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  // 添加瀏覽器常見的 headers 來避免被 Cloudflare 阻擋
  const defaultHeaders = {
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    Accept: 'application/json, text/plain, */*',
    'Accept-Language': 'zh-TW,zh;q=0.9,en;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    ...(cookieHeader && { Cookie: cookieHeader }),
    ...requestInit.headers,
  };

  const response = await fetch(fullUrl, {
    ...requestInit,
    headers: defaultHeaders,
  });

  return {
    status: response.status,
    headers: response.headers,
    data: await response.json(),
  } as T;
};
