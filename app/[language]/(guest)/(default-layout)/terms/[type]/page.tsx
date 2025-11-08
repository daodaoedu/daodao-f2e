import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDictionary, getTranslation } from '@/shared/config/i18n';
import MarkdownRenderer from '@/shared/ui/markdown-renderer';
import { Paper } from '@/shared/ui/wrapper';

const termsMap = {
  ipr: 'ipr',
  service: 'service',
  'privacy-policy': 'privacy_policy',
} as const;

const getTermsI18nKey = (type: string) => {
  const value = termsMap[type as keyof typeof termsMap];
  if (!value) {
    notFound();
  }
  return value;
};

const getTermsData = async (
  params: PageProps<'/[language]/terms/[type]'>['params']
) => {
  const { language, type } = await params;
  const t = getTranslation(getDictionary(language));
  const snakeCaseType = getTermsI18nKey(type);
  return {
    title: t(`terms.${snakeCaseType}_title`),
    content: t(`terms.${snakeCaseType}_content`),
  };
};

export async function generateStaticParams() {
  return Object.keys(termsMap).map((type) => ({ type }));
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
