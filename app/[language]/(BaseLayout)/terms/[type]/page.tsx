import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TermsIPR from '@/components/Terms/Ipr';
import TermsPrivacyPolicy from '@/components/Terms/Privacypolicy';
import TermsService from '@/components/Terms/Service';
import { locales } from '@/constants/i18n';

export async function generateStaticParams() {
  return locales.map((language) => ({ language, type: 'ipr' }));
}

export async function generateMetadata({
  params,
}: PageProps<'/[language]/terms/[type]'>): Promise<Metadata> {
  const { type } = await params;

  const titleMap = {
    ipr: '智慧財產權',
    privacy_policy: '隱私政策',
    service: '使用者條款',
  };

  const title = titleMap[type as keyof typeof titleMap];

  if (!title) {
    notFound();
  }

  return {
    title,
    description:
      '感謝您有意願貢獻資料及相關內容（以下統稱「內容」）至島島阿學學習社群（https://www.daoedu.tw，以下簡稱「本網站」）。此使用者條款存在於您及本網站管理機關島島阿學學習社群（「管理者」）間，目的在釐清雙方相關智慧財產權利狀態及其他權利義務關係。請閱讀以下條款及條件並確認，當您上傳內容至本網站時，即表示您接受本協議內容。',
  };
}

export default async function TermsPage({
  params,
}: PageProps<'/[language]/terms/[type]'>) {
  const { type } = await params;

  const termsMap = {
    ipr: TermsIPR,
    privacy_policy: TermsPrivacyPolicy,
    service: TermsService,
  };

  const TermsComponent = termsMap[type as keyof typeof termsMap];

  if (!TermsComponent) {
    notFound();
  }

  return <TermsComponent />;
}
