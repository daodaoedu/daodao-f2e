import Home from '@/components/Home';
import { getDictionary } from '@/constants/i18n';

export default async function Page({ params }: PageProps<'/[language]'>) {
  const { language } = await params;
  const dict = await getDictionary(language);
  return (
    <>
      <Home />
      {/* 測試多語系用 */}
      <div className="text-white">{dict.common.title}</div>
    </>
  );
}
