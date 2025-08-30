import { Metadata } from 'next';
import { locales } from '@/constants/i18n';
import About from '@/components/About';
import { getDynamicRoute } from '@/utils/getDynamicRoute';

const pageMap = {
  about: {
    title: '關於島島',
    description:
      '在島島阿學裡，每個人都是一座獨一無二的「島」，對於學習／生命擁有不同的渴望與資源，因為互相、互助學習，成為一片獨立又連結的群島。而島島阿學也希望能有台語「沓沓仔學Ta̍uh-ta̍uh-á o̍h」，「慢慢學不用急」之意涵，道出組織的教育價值觀是以人為本，尊重每人學習步調與方向。',
    Component: About,
  },
};

export async function generateStaticParams() {
  return Object.keys(pageMap).flatMap((page) =>
    locales.map((language) => ({ language, page }))
  );
}

export async function generateMetadata({
  params,
}: PageProps<'/[language]/[page]'>): Promise<Metadata> {
  const { page } = await params;

  const { title, description } = getDynamicRoute(page, pageMap);

  return {
    title,
    description,
  };
}

export default async function TermsPage({
  params,
}: PageProps<'/[language]/[page]'>) {
  const { page } = await params;

  const { Component } = getDynamicRoute(page, pageMap);

  return <Component />;
}
