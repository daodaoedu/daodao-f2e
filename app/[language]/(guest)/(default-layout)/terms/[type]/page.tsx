import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { locales, getDictionary, getText } from '@/shared/config/i18n';
import MarkdownRenderer from '@/shared/ui/markdown-renderer';
import { Paper } from '@/shared/ui/wrapper';

const termsTypes = ['ipr', 'privacy-policy', 'service'] as const;

const checkTermsType = (type: string): type is (typeof termsTypes)[number] =>
  termsTypes.includes(type as (typeof termsTypes)[number]);

const getTermsData = async (
  params: PageProps<'/[language]/terms/[type]'>['params']
) => {
  const { language, type } = await params;
  if (!checkTermsType(type)) {
    notFound();
  }
  const dictionary = await getDictionary(language);
  return {
    title: getText(dictionary, `terms.${type}_title`),
    content: getText(dictionary, `terms.${type}_content`),
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
  const { title } = await getTermsData(params);

  return {
    title,
  };
}

export default async function TermsPage({
  params,
}: PageProps<'/[language]/terms/[type]'>) {
  const { content } = await getTermsData(params);

  return (
    <div className="min-h-screen bg-primary-pale px-4 py-24">
      <Paper className="container prose max-w-5xl rounded py-8 shadow-lg">
        <MarkdownRenderer source={content} />
      </Paper>
    </div>
  );
}
