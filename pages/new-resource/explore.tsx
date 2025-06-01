import type { InferGetStaticPropsType, GetStaticProps } from "next";
import Link from "next/link";
import SEOConfig, { JsonLdType } from "@/shared/components/SEO";
import { ChevronLeftIcon } from "lucide-react";
import {
  createResourceJsonLd,
  ResourceContainer,
  SearchForm,
  SectionTitle,
} from "@/features/resources";
import {
  getNotionDatabase,
  NotionDatabaseResultSchema,
} from "@/services/modules/notion";
import JsonLdFactory from "@/utils/jsonLd";
import { cn } from "@/utils/cn";
import useSearchParamsManager from "@/hooks/useSearchParamsManager";
import { Button } from "@/components/atoms/button";

type SectionProps = {
  as?: "section" | "div";
  className?: string;
  children: React.ReactNode;
};

const Section = ({
  as: Component = "section",
  className,
  children,
}: SectionProps) => {
  return <Component className={className}>{children}</Component>;
};

export const getStaticProps = (async () => {
  const data = await getNotionDatabase({
    page_size: 16,
  });

  const coursesJsonLd = data.results?.slice(0, 4).map(createResourceJsonLd);

  const jsonLd = JsonLdFactory.createGraph([
    JsonLdFactory.createItemListBuilder()
      .setName("探索所有資源")
      .setItems(coursesJsonLd),
  ]);

  return { props: { data, jsonLd } };
}) satisfies GetStaticProps<{
  data: NotionDatabaseResultSchema;
  jsonLd: JsonLdType;
}>;

export default function ResourceCategoriesPage({
  data,
  jsonLd,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const [getSearchParams] = useSearchParamsManager();
  const searchParams = getSearchParams();
  const keyword = searchParams?.q;

  return (
    <>
      <SEOConfig title="探索所有資源｜島島阿學" jsonLd={jsonLd} />
      <Section as="div" className="pt-12 px-5 md:px-24">
        <Button variant="link" className="mb-3 px-2 -mx-2" asChild>
          <Link href="/new-resource">
            <ChevronLeftIcon className="w-4 h-4" />
            返回
          </Link>
        </Button>
        <SectionTitle
          as="h1"
          title="所有資源"
          className={cn(keyword && "hidden")}
        />
      </Section>

      <Section className="pb-11 md:pb-12">
        <SearchForm />

        {keyword && (
          <div className="text-basic-500 body-sm px-5 pb-6 md:px-24">
            "{keyword}" 共搜尋到{" "}
            <span className="text-primary-base font-bold">
              {data.results?.length}
            </span>{" "}
            筆
          </div>
        )}

        <ResourceContainer data={data.results} className="px-5 md:px-24" />

        <div className="flex justify-center px-5 pt-6 md:px-24">
          <Button size="sm">查看更多</Button>
        </div>
      </Section>
    </>
  );
}
