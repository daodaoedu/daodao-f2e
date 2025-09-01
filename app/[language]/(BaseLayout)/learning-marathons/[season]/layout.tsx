import { locales } from '@/constants/i18n';
import { getDynamicRoute } from '@/utils/getDynamicRoute';
import Banner2025S1 from './_2025S1/Banner2025S1';
import Nav from './_shared/Nav';
import Marathon2025S1 from './_2025S1/Marathon2025S1';

export const seasonMap = {
  '2025S1': {
    title: '島島盃 - 2025 春季學習馬拉松',
    Banner: Banner2025S1,
    Component: Marathon2025S1,
  },
};

export async function generateStaticParams() {
  return Object.keys(seasonMap).flatMap((season) =>
    locales.map((language) => ({ language, season }))
  );
}

export default async function LearningMarathonsLayout({
  children,
  params,
}: LayoutProps<'/[language]/learning-marathons/[season]'>) {
  const { season } = await params;
  const { Banner } = getDynamicRoute(season, seasonMap);

  return (
    <>
      <Banner />
      <Nav />
      {children}
    </>
  );
}
