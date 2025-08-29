import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TermsIPR from '@/components/Terms/Ipr';
import TermsPrivacyPolicy from '@/components/Terms/Privacypolicy';
import TermsService from '@/components/Terms/Service';
import { locales } from '@/constants/i18n';

const termsMap = {
  ipr: {
    title: '智慧財產權',
    Component: TermsIPR,
  },
  privacy_policy: {
    title: '隱私政策',
    Component: TermsPrivacyPolicy,
  },
  service: {
    title: '使用者條款',
    Component: TermsService,
  },
};

const checkTerms = (type: string): type is keyof typeof termsMap => {
  return Object.keys(termsMap).includes(type);
};

export async function generateStaticParams() {
  return Object.keys(termsMap).flatMap((type) =>
    locales.map((language) => ({ language, type }))
  );
}

export async function generateMetadata({
  params,
}: PageProps<'/[language]/terms/[type]'>): Promise<Metadata> {
  const { type } = await params;

  if (!checkTerms(type)) notFound();

  const { title } = termsMap[type];

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

  if (!checkTerms(type)) notFound();

  const { Component } = termsMap[type];

  return <Component />;
}
