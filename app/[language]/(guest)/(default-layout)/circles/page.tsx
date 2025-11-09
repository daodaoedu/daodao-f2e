import { Metadata } from 'next';
import { unstable_serialize } from 'swr';
import { CircleListPageWidget } from '@/widgets/circles';
import {
  getCircleListData,
  getCircleListDataKey,
} from '@/entities/circle';

// @TODO: 待串接真實 API, Json-LD 以及優化頁面

export const metadata: Metadata = {
  title: '揪團學習列表｜島島阿學',
};

export default async function CircleListPage() {
  // 預載第一頁資料以優化 SSR 和 SEO
  const initialParams = { page: 1, pageSize: 6 };
  const initialData = await getCircleListData(initialParams);
  const swrKey = getCircleListDataKey(initialParams);

  return (
    <CircleListPageWidget
      fallback={{
        [unstable_serialize(swrKey)]: [initialData], // infinite hook 需要陣列格式
      }}
    />
  );
}
