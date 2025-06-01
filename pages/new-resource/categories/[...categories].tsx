import type { InferGetStaticPropsType, GetStaticProps } from "next";
import Link from "next/link";
import SEOConfig, { JsonLdType } from "@/shared/components/SEO";
import {
  CategoriesContainer,
  ResourceContainer,
  ResourceBanner,
  SearchForm,
  getCategories,
  createResourceJsonLd,
} from "@/features/resources";
import {
  getNotionDatabase,
  NotionDatabaseResultSchema,
} from "@/services/modules/notion";
import JsonLdFactory from "@/utils/jsonLd";
import { cn } from "@/utils/cn";
import ArrowIcon from "@/public/assets/icons/arrow.svg";
import { CATEGORIES, SEARCH_TAGS } from "@/constants/category";
import { parseToArray } from "@/services/core";
import { Categories } from "@/features/resources/utils/getCategories";
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
  return (
    <Component className={cn("px-5 md:px-24", className)}>{children}</Component>
  );
};

export const getStaticPaths = async () => {
  const paths = CATEGORIES.flatMap((category) => [
    {
      params: {
        categories: [category.value],
      },
    },
    ...(SEARCH_TAGS[category.value] ?? []).map((tag) => ({
      params: {
        categories: [category.value, tag.value],
      },
    })),
  ]);

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps = (async (context) => {
  const categories = getCategories(
    parseToArray<keyof typeof SEARCH_TAGS>(context.params?.categories)
  );

  const title = categories?.[1]?.label ?? categories?.[0]?.label ?? "暫無分類";

  const data = await getNotionDatabase({
    page_size: 16,
  });

  const coursesJsonLd = data.results?.slice(0, 4).map(createResourceJsonLd);

  const jsonLd = JsonLdFactory.createGraph([
    JsonLdFactory.createItemListBuilder()
      .setName(`${title}學習資源列表`)
      .setItems(coursesJsonLd),
  ]);

  return { props: { data, jsonLd, categories, title } };
}) satisfies GetStaticProps<{
  data: NotionDatabaseResultSchema;
  jsonLd: JsonLdType;
  categories: Categories;
  title: string;
}>;

export default function ResourceCategoriesPage({
  data,
  jsonLd,
  categories,
  title,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  if (!categories) return null;

  return (
    <>
      <SEOConfig title={`${title}學習資源列表｜島島阿學`} jsonLd={jsonLd} />
      <Section as="div" className="pt-8 mb-3 md:pt-12 md:mb-6">
        <div className="flex items-center gap-2 text-basic-400">
          <Button variant="link" className="px-2 -mx-2" asChild>
            <Link href="/new-resource">找資源</Link>
          </Button>
          <ArrowIcon />
          <Button variant="link" className="px-2 -mx-2" asChild>
            <Link href="/new-resource/categories">所有分類</Link>
          </Button>
          <ArrowIcon />
          {categories?.length === 1 && <span>{categories[0].label}</span>}
          {categories?.length === 2 && (
            <>
              <Button variant="link" className="px-2 -mx-2" asChild>
                <Link href={`/new-resource/categories/${categories[0].value}`}>
                  {categories[0].label}
                </Link>
              </Button>
              <ArrowIcon />
              <span>{categories[1].label}</span>
            </>
          )}
        </div>
      </Section>

      <Section className="pb-10">
        <ResourceBanner
          size="md"
          title={categories[0].label}
          content="測試資料"
          image=""
          length={data.results?.length}
        />
      </Section>

      <Section>
        <CategoriesContainer
          size="sm"
          selectedCategories={categories.map((c) => c.value)}
        />
      </Section>

      <Section className="px-0 md:px-0">
        <SearchForm />

        <ResourceContainer data={data.results} className="px-5 md:px-24" />

        <div className="flex justify-center px-5 py-6 md:px-24">
          <Button size="sm">查看更多</Button>
        </div>
      </Section>
    </>
  );
}
