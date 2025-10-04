import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { locales, getDictionary } from '@/shared/config/i18n';
import MarkdownRenderer from '@/shared/ui/markdown-renderer';
import { Paper } from '@/shared/ui/wrapper';

const termsTypes = ['ipr', 'privacy-policy', 'service'] as const;

const checkTermsType = (type: string): type is (typeof termsTypes)[number] =>
  termsTypes.includes(type as (typeof termsTypes)[number]);

const getTermsData = async (type: string, language: string) => {
  if (!checkTermsType(type)) {
    notFound();
  }
  const dictionary = await getDictionary(language);
  return {
    title: dictionary.terms?.[`${type}-title`],
    content: dictionary.terms?.[`${type}-content`],
  };
};

export async function generateStaticParams() {
  return locales.flatMap((language) =>
    termsTypes.map((type) => ({ language, type }))
  );
}

export async function generateMetadata({
  params,
}: PageProps<'/[language]/terms/[type]'>): Promise<Metadata> {
  const { language, type } = await params;
  const { title } = await getTermsData(type, language);

  return {
    title,
  };
}

export default async function TermsPage({
  params,
}: PageProps<'/[language]/terms/[type]'>) {
  const { language, type } = await params;
  const { content } = await getTermsData(type, language);

  return (
    <div className="px-4">
      <Paper className="container prose my-12 max-w-5xl rounded py-8 shadow-lg">
        <MarkdownRenderer source={content} />
      </Paper>
    </div>
  );
}
