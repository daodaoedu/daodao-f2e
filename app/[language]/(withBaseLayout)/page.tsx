import Home from '@/components/Home';
import { getDictionary, I18nParams } from '@/constants/i18n';

export default async function Page({ params }: I18nParams) {
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
