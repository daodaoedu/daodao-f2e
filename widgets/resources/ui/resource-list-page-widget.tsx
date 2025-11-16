'use client';

import { useState } from 'react';
import { ChevronRightIcon } from 'lucide-react';
import SEOConfig, { JsonLdType } from '@/components/SEOConfig';
import resourceBannerWebp from '@/public/assets/resource/banner.webp';
import {
  CategoriesContainer,
  ResourceContainer,
  SectionTitle,
} from '@/features/resources';
import { HOT_TAGS } from '@/constants/category';
import { Button } from '@/shared/ui/button';
import { ResourceListResponseSchema } from '@/services/resources';
import { Container } from '@/shared/ui/wrapper';
import { CustomLink } from '@/shared/ui/custom-link';
import { ResourceBannerClient } from './resource-banner-client';
import { ResourceCreateForm } from './resource-create-form';

interface ResourceListPageWidgetProps {
  data?: ResourceListResponseSchema['data'];
  jsonLd?: JsonLdType;
}

export const ResourceListPageWidget = ({
  data,
  jsonLd,
}: ResourceListPageWidgetProps) => {
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateClick = () => {
    setIsCreating(true);
  };

  const handleCreateClose = () => {
    setIsCreating(false);
  };

  if (isCreating) {
    return <ResourceCreateForm onClose={handleCreateClose} />;
  }

  return (
    <div className="pt-20">
      <SEOConfig title="多元學習資源列表｜島島阿學" jsonLd={jsonLd} />
      {/* 找資源 banner */}
      <ResourceBannerClient
        title="找資源"
        content="藉由他人真實的資源使用經驗，找到真正適合自己的學習資源，透過個人化推薦系統，幫助每位學習者在龐大的學習資源中，快速找到最適合自己的內容！"
        image={resourceBannerWebp}
        hotTags={HOT_TAGS}
        onCreateClick={handleCreateClick}
      />

      {/* 熱門資源, 最新資源, 熱門分類 */}
      <Container className="space-y-11 py-12">
        <section>
          <SectionTitle title="熱門資源">
            <Button
              variant="link"
              className="-mx-2 px-2 body-md font-medium text-basic-300"
              size="lg"
              asChild
            >
              <CustomLink href="/resource/explore">
                探索 所有資源
                <ChevronRightIcon className="w-4 h-4" />
              </CustomLink>
            </Button>
          </SectionTitle>
          <ResourceContainer data={data?.resources.slice(2, 4) ?? []} />
        </section>

        <section>
          <SectionTitle title="最新資源">
            <Button
              variant="link"
              className="-mx-2 px-2 body-md font-medium text-basic-300"
              asChild
            >
              <CustomLink href="/resource/explore">
                探索 所有資源
                <ChevronRightIcon className="w-4 h-4" />
              </CustomLink>
            </Button>
          </SectionTitle>
          <ResourceContainer data={data?.resources.slice(0, 2) ?? []} />
        </section>

        <section>
          <SectionTitle title="熱門分類">
            <Button
              variant="link"
              className="-mx-2 px-2 body-md font-medium text-basic-300"
              asChild
            >
              <CustomLink href="/resource/categories">
                探索 所有分類
                <ChevronRightIcon className="w-4 h-4" />
              </CustomLink>
            </Button>
          </SectionTitle>
          <CategoriesContainer maxLength={8} disabledCollapse />
        </section>
      </Container>
    </div>
  );
};

