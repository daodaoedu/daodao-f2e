import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
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
import { SEARCH_TAGS } from "@/constants/category";
import { parseToArray } from "@/utils/helper";
import { CategoriesType } from "@/features/resources/utils/getCategories";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { resourceAPI, ResourceListResponseSchema } from "@/services/resources";
import { Container } from "@/components/ui/wrapper";

export const runtime = "experimental-edge";

export const getServerSideProps = (async (context) => {
  const categories = getCategories(
    parseToArray<keyof typeof SEARCH_TAGS>(context.params?.categories)
  );

  const title = categories?.[1]?.label ?? categories?.[0]?.label ?? "暫無分類";

  const { data } = await resourceAPI.readList();

  const coursesJsonLd = data.resources.slice(0, 4).map(createResourceJsonLd);

  const jsonLd = JsonLdFactory.createGraph([
    JsonLdFactory.createItemListBuilder()
      .setName(`${title}學習資源列表`)
      .setItems(coursesJsonLd),
  ]);

  return {
    props: {
      fallback: {
        [`/resource/categories/${categories?.join("/")}`]: data,
      },
      jsonLd,
      categories,
      title,
      totalEstimate: data.pagination.totalEstimate,
    },
  };
}) satisfies GetServerSideProps<{
  fallback: Record<string, ResourceListResponseSchema> | null;
  jsonLd: JsonLdType | null;
  categories: CategoriesType;
  title: string;
  totalEstimate: number;
}>;

export default function ResourceCategoriesPage({
  fallback,
  jsonLd,
  categories,
  title,
  totalEstimate,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  if (!categories) return null;

  return (
    <SWRConfig value={{ fallback }}>
      <SEOConfig title={`${title}學習資源列表｜島島阿學`} jsonLd={jsonLd} />
      <Container className="pt-8 mb-3 md:pt-12 md:mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/resource">找資源</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/resource/categories">
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
                        href={`/resource/categories/${categories
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
      </Container>

      <Container className="pb-10">
        <ResourceBanner
          size="md"
          title={categories[0].label}
          content="測試資料"
          image=""
          length={totalEstimate}
        />
      </Container>

      <Container>
        <CategoriesContainer
          size="sm"
          selectedCategories={categories.map((c) => c.value)}
        />
      </Container>

      <Container className="px-0 md:px-0">
        <ResourceExplorer categories={categories} parentDataCount={32} />
      </Container>
    </SWRConfig>
  );
}
