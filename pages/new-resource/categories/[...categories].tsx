import type { InferGetStaticPropsType, GetStaticProps } from "next";
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
} from "@/services/notion";
import JsonLdFactory from "@/utils/jsonLd";
import { cn } from "@/utils/cn";
import { CATEGORIES, SEARCH_TAGS } from "@/constants/category";
import { parseToArray } from "@/utils/helper";
import { Categories } from "@/features/resources/utils/getCategories";
import { Button } from "@/components/atoms/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/atoms/breadcrumb";
import { Fragment } from "react";

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
  const basePath = "/new-resource";

  if (!categories) return null;

  return (
    <>
      <SEOConfig title={`${title}學習資源列表｜島島阿學`} jsonLd={jsonLd} />
      <Section as="div" className="pt-8 mb-3 md:pt-12 md:mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={basePath}>找資源</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`${basePath}/categories`}>
                所有分類
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />

            {Array.isArray(categories) &&
              categories.map((category, index) => {
                const isLast = index === categories.length - 1;

                if (isLast) {
                  return (
                    <BreadcrumbItem key={category.value}>
                      <BreadcrumbPage>{category.label}</BreadcrumbPage>
                    </BreadcrumbItem>
                  );
                }

                return (
                  <Fragment key={category.value}>
                    <BreadcrumbItem>
                      <BreadcrumbLink
                        href={`${basePath}/categories/${categories
                          .slice(0, index + 1)
                          .map((c) => c.value)
                          .join("/")}`}
                      >
                        {category.label}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                  </Fragment>
                );
              })}
          </BreadcrumbList>
        </Breadcrumb>
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
