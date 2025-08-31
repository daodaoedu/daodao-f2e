import { Metadata } from 'next';
import { locales } from '@/constants/i18n';
import { getDynamicRoute } from '@/utils/getDynamicRoute';
import { seasonMap } from './layout';

export async function generateStaticParams() {
  return Object.keys(seasonMap).flatMap((season) =>
    locales.map((language) => ({ language, season }))
  );
}

export async function generateMetadata({
  params,
}: PageProps<'/[language]/learning-marathons/[season]'>): Promise<Metadata> {
  const { season } = await params;

  const { title } = getDynamicRoute(season, seasonMap);

  return {
    title,
  };
}

export default async function TermsPage({
  params,
}: PageProps<'/[language]/learning-marathons/[season]'>) {
  const { season } = await params;

  const { Component } = getDynamicRoute(season, seasonMap);

  return <Component />;
}
