"use client";

import { Suspense } from "react";
import { SWRConfig } from "swr";
import SEOConfig, { type JsonLdType } from "@/components/SEOConfig";
import { CategoriesContainer, ResourceExplorer, SectionTitle } from "@/features/resources";
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

interface ResourceCategoriesPageWidgetProps {
  fallback?: Record<string, ResourceListResponseSchema[]>;
  jsonLd?: JsonLdType;
}

export const ResourceCategoriesPageWidget = ({
  fallback,
  jsonLd,
}: ResourceCategoriesPageWidgetProps) => {
  return (
    <SWRConfig value={{ fallback }}>
      <SEOConfig title="所有分類｜島島阿學" jsonLd={jsonLd} />
      <Container className="py-20">
        <Breadcrumb className="mb-3">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/resource">找資源</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>所有分類</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <SectionTitle as="h1" title="所有分類" />
      </Container>

      <Container className="pb-12">
        <CategoriesContainer size="sm" />
      </Container>

      <Container>
        <SectionTitle title="所有資源" />
      </Container>

      <Suspense fallback={null}>
        <ResourceExplorer />
      </Suspense>
    </SWRConfig>
  );
};
