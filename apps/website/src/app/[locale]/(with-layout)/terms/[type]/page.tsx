import { getTranslations } from "@daodao/i18n/server";
import MarkdownRenderer from "@daodao/ui/components/markdown-renderer";
import { Paper } from "@daodao/ui/components/wrapper";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

const termsMap = {
  ipr: "ipr",
  service: "service",
  "privacy-policy": "privacy_policy",
} as const;

const getTermsI18nKey = (type: string) => {
  const value = termsMap[type as keyof typeof termsMap];
  if (!value) {
    notFound();
  }
  return value;
};

const getTermsData = async (params: PageProps<"/[locale]/terms/[type]">["params"]) => {
  const { type } = await params;
  const t = await getTranslations("terms");
  const snakeCaseType = getTermsI18nKey(type);
  return {
    title: t(`${snakeCaseType}_title`),
    content: t(`${snakeCaseType}_content`),
  };
};

export async function generateStaticParams() {
  return Object.keys(termsMap).map((type) => ({ type }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/terms/[type]">): Promise<Metadata> {
  const { title } = await getTermsData(params);

  return {
    title,
  };
}

export default async function TermsPage({ params }: PageProps<"/[locale]/terms/[type]">) {
  const { content } = await getTermsData(params);

  return (
    <div className="min-h-screen bg-primary-pale px-4 py-24">
      <Paper className="container prose max-w-5xl rounded py-8 shadow-lg">
        <MarkdownRenderer source={content} />
      </Paper>
    </div>
  );
}
