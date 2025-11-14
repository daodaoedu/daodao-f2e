'use client';

import { useState } from 'react';
import { SWRConfig } from 'swr';
import dynamic from 'next/dynamic';
import SEOConfig, { JsonLdType } from '@/components/SEOConfig';
import { Background, Container, Paper } from '@/shared/ui/wrapper';
import type { CircleListResponse } from '@/entities/circle';
import { CircleCreateForm } from './circle-create-form';
import { CircleBanner } from './circle-banner';

const CircleSearchForm = dynamic(
  () => import('./circle-search-form').then((mod) => mod.CircleSearchForm),
  {
    ssr: false,
  }
);

const CircleList = dynamic(
  () => import('./circle-list').then((mod) => mod.CircleList),
  {
    ssr: false,
  }
);

interface CircleListPageWidgetProps {
  fallback?: Record<string, CircleListResponse[]>;
  jsonLd?: JsonLdType;
}

export const CircleListPageWidget = ({
  fallback,
  jsonLd,
}: CircleListPageWidgetProps) => {
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateClick = () => {
    setIsCreating(true);
  };

  const handleCreateClose = () => {
    setIsCreating(false);
  };

  if (isCreating) {
    return <CircleCreateForm onClose={handleCreateClose} />;
  }

  return (
    <SWRConfig value={{ fallback }}>
      <SEOConfig title="揪團學習列表｜島島阿學" jsonLd={jsonLd} />
      <CircleBanner onCreateClick={handleCreateClick} />
      <Background className="-mt-12">
        <Container className="relative z-10 mt-[inherit] pb-10">
          <Paper className="mb-6 space-y-2">
            <CircleSearchForm />
          </Paper>
          <CircleList />
        </Container>
      </Background>
    </SWRConfig>
  );
};
