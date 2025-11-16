'use client';

import { SWRConfig } from 'swr';
import Link from 'next/link';
import SEOConfig, { JsonLdType } from '@/components/SEOConfig';
import { ChevronLeftIcon } from 'lucide-react';
import { ResourceExplorer } from '@/features/resources';
import { Button } from '@/shared/ui/button';
import { ResourceListResponseSchema } from '@/services/resources';
import { Container } from '@/shared/ui/wrapper';
import { ResourceExploreClient } from './resource-explore-client';

interface ResourceExplorePageWidgetProps {
  fallback?: Record<string, ResourceListResponseSchema[]>;
  jsonLd?: JsonLdType;
}

export const ResourceExplorePageWidget = ({
  fallback,
  jsonLd,
}: ResourceExplorePageWidgetProps) => {
  return (
    <SWRConfig value={{ fallback }}>
      <SEOConfig title="探索所有資源｜島島阿學" jsonLd={jsonLd} />
      <Container className="pt-20">
        <Button
          variant="link"
          className="-mx-2 mb-3 px-2 text-basic-300"
          asChild
        >
          <Link href="/resource">
            <ChevronLeftIcon className="h-4 w-4" />
            返回
          </Link>
        </Button>
        <ResourceExploreClient />
      </Container>

      <ResourceExplorer />
    </SWRConfig>
  );
};
