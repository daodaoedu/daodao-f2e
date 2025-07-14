import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { SWRConfig } from "swr";
import { Fragment } from "react";
import SEOConfig, { JsonLdType } from "@/components/SEOConfig";
import {
  CategoriesContainer,
  ResourceBanner,
  parseCategoryHierarchy,
  createResourceJsonLd,
  ResourceExplorer,
} from "@/features/resources";
import JsonLdFactory from "@/utils/jsonLd";
import { ICategory } from "@/constants/category";
import { parseToArray } from "@/utils/helper";
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
  const [majorCategory, subCategory = null] = parseCategoryHierarchy(
    parseToArray(context.params?.categories)
  );

  if (!majorCategory) {
    return {
      notFound: true,
    };
  }

  const title = subCategory?.label ?? majorCategory.label;
  const fallbackUrl = subCategory?.value
    ? `/resource/categories/${majorCategory.value}/${subCategory.value}`
    : `/resource/categories/${majorCategory.value}`;

  try {
    const { data } = await resourceAPI.readList({
      majorCategory: majorCategory.value,
      subCategory: subCategory?.value,
    });

    const jsonLd = JsonLdFactory.createGraph([
      JsonLdFactory.createItemListBuilder()
        .setName(`${title}學習資源列表`)
        .setItems(data.resources.map(createResourceJsonLd)),
    ]);

    return {
      props: {
        fallback: {
          [fallbackUrl]: data,
        },
        jsonLd,
        majorCategory,
        subCategory,
        title,
        totalEstimate: data.pagination.totalEstimate ?? 0,
        parentTotalEstimate: data.pagination.parentTotalEstimate ?? 0,
      },
    };
  } catch {
    return {
      props: {
        title,
        totalEstimate: 0,
        parentTotalEstimate: 0,
        majorCategory,
        subCategory,
      },
    };
  }
}) satisfies GetServerSideProps<{
  fallback?: Record<string, ResourceListResponseSchema["data"]>;
  jsonLd?: JsonLdType;
  majorCategory: ICategory;
  subCategory: ICategory | null;
  title: string;
  totalEstimate: number;
  parentTotalEstimate: number;
}>;

export default function ResourceCategoriesPage({
  fallback,
  jsonLd,
  majorCategory,
  subCategory,
  title,
  totalEstimate,
  parentTotalEstimate,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const selectedCategories = [majorCategory, subCategory].filter(
    (value) => value !== null
  );

  return (
    <SWRConfig value={{ fallback }}>
      <SEOConfig title={`${title}學習資源列表｜島島阿學`} jsonLd={jsonLd} />
      <Container className="pt-12 mb-3">
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

            {selectedCategories.map((category, index) => {
              const isLast = index === selectedCategories.length - 1;

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
                      href={`/resource/categories/${selectedCategories
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
          title={subCategory?.label ?? majorCategory.label}
          content=""
          image=""
          length={totalEstimate}
        />
      </Container>

      <Container>
        <CategoriesContainer
          size="sm"
          selectedCategories={selectedCategories}
        />
      </Container>

      <ResourceExplorer
        categories={selectedCategories}
        parentDataCount={parentTotalEstimate}
      />
    </SWRConfig>
  );
}
