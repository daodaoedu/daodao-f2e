import type { InferGetStaticPropsType, GetStaticProps } from "next";
import { SWRConfig } from "swr";
import { Fragment } from "react";
import SEOConfig, { JsonLdType } from "@/shared/components/SEO";
import {
  CategoriesContainer,
  ResourceBanner,
  getCategories,
  createResourceJsonLd,
  ResourceExplorer,
} from "@/features/resources";
import JsonLdFactory from "@/utils/jsonLd";
import { cn } from "@/utils/cn";
import { CATEGORIES, SEARCH_TAGS } from "@/constants/category";
import { parseToArray } from "@/utils/helper";
import { Categories } from "@/features/resources/utils/getCategories";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/atoms/breadcrumb";
import { resourceAPI, ResourceListResponseSchema } from "@/services/resources";

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

  try {
    const data = await resourceAPI.readList();

    const coursesJsonLd = data.resources
      .slice(0, 4)
      .map(createResourceJsonLd);

    const jsonLd = JsonLdFactory.createGraph([
      JsonLdFactory.createItemListBuilder()
        .setName(`${title}學習資源列表`)
        .setItems(coursesJsonLd),
    ]);

    return {
      props: {
        fallback: {
          [`/new-resource/categories/${categories?.join("/")}`]: data,
        },
        jsonLd,
        categories,
        title,
        totalEstimate: data.pagination.totalEstimate,
      },
    };
  } catch {
    return {
      props: {
        fallback: undefined,
        jsonLd: undefined,
        categories,
        title,
        totalEstimate: 0,
      },
    };
  }
}) satisfies GetStaticProps<{
  fallback: Record<string, ResourceListResponseSchema> | undefined;
  jsonLd: JsonLdType | undefined;
  categories: Categories;
  title: string;
  totalEstimate: number;
}>;

export default function ResourceCategoriesPage({
  fallback,
  jsonLd,
  categories,
  title,
  totalEstimate,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const basePath = "/new-resource";

  if (!categories) return null;

  return (
    <SWRConfig value={{ fallback }}>
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
          length={totalEstimate}
        />
      </Section>

      <Section>
        <CategoriesContainer
          size="sm"
          selectedCategories={categories.map((c) => c.value)}
        />
      </Section>

      <Section className="px-0 md:px-0">
        <ResourceExplorer />
      </Section>
    </SWRConfig>
  );
}
