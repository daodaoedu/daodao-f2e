"use client";

import { ChevronLeftIcon } from "lucide-react";
import { Suspense } from "react";
import { SWRConfig } from "swr";
import SEOConfig, { type JsonLdType } from "@/components/SEOConfig";
import { ResourceExplorer } from "@/features/resources";
import type { ResourceListResponseSchema } from "@/services/resources";
import { Button } from "@/shared/ui/button";
import { CustomLink } from "@/shared/ui/custom-link";
import { Container } from "@/shared/ui/wrapper";
import { ResourceExploreClient } from "./resource-explore-client";

interface ResourceExplorePageWidgetProps {
  fallback?: Record<string, ResourceListResponseSchema[]>;
  jsonLd?: JsonLdType;
}

export const ResourceExplorePageWidget = ({ fallback, jsonLd }: ResourceExplorePageWidgetProps) => {
  return (
    <SWRConfig value={{ fallback }}>
      <SEOConfig title="探索所有資源｜島島阿學" jsonLd={jsonLd} />
      <Container className="pt-20">
        <Button variant="link" className="-mx-2 mb-3 px-2 text-basic-300" asChild>
          <CustomLink href="/resource">
            <ChevronLeftIcon className="h-4 w-4" />
            返回
          </CustomLink>
        </Button>
        <Suspense fallback={null}>
          <ResourceExploreClient />
        </Suspense>
      </Container>

      <Suspense fallback={null}>
        <ResourceExplorer />
      </Suspense>
    </SWRConfig>
  );
};
