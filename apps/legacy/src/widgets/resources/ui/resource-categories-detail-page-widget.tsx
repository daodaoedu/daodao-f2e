"use client";

import { Fragment, Suspense } from "react";
import { SWRConfig } from "swr";
import SEOConfig, { type JsonLdType } from "@/components/SEOConfig";
import { CategoriesContainer, ResourceBanner, ResourceExplorer } from "@/features/resources";
import type { ResourceListResponseSchema } from "@/services/resources";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/ui/breadcrumb";
import { Container } from "@/shared/ui/wrapper";
import type { ICategory } from "@/src/constants/category";

interface ResourceCategoriesDetailPageWidgetProps {
  fallback?: Record<string, ResourceListResponseSchema[]>;
  jsonLd?: JsonLdType;
  majorCategory: ICategory;
  subCategory: ICategory | null;
  title: string;
  totalEstimate: number;
  parentTotalEstimate: number;
}

export const ResourceCategoriesDetailPageWidget = ({
  fallback,
  jsonLd,
  majorCategory,
  subCategory,
  title,
  totalEstimate,
  parentTotalEstimate,
}: ResourceCategoriesDetailPageWidgetProps) => {
  const selectedCategories = [majorCategory, subCategory].filter((value) => value !== null);

  return (
    <SWRConfig value={{ fallback }}>
      <SEOConfig title={`${title}學習資源列表｜島島阿學`} jsonLd={jsonLd} />
      <Container className="mb-3 pt-20">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/resource">找資源</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/resource/categories">所有分類</BreadcrumbLink>
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
        <CategoriesContainer size="sm" selectedCategories={selectedCategories} />
      </Container>

      <Suspense fallback={null}>
        <ResourceExplorer categories={selectedCategories} parentDataCount={parentTotalEstimate} />
      </Suspense>
    </SWRConfig>
  );
};
