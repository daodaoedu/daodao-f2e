'use client';

import { useState } from 'react';
import SEOConfig from '@/components/SEOConfig';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/ui/breadcrumb';
import NotExist from '@/shared/components/NotExist';
import { Container } from '@/shared/ui/wrapper';
import { ResourceDetail, parseCategoryHierarchy } from '@/features/resources';
import { ResourceDetailResponseSchema } from '@/services/resources/core/schema';
import { useAuth } from '@/entities/user';
import type { ResourceDetail as ResourceDetailType } from '@/entities/resource';
import { ResourceDetailClient } from './resource-detail-client';
import { ResourceEditForm } from './resource-edit-form';

enum TabEnum {
  Introduction = 'introduction',
  Reviews = 'reviews',
  Contributor = 'contributor',
}

interface ResourceDetailPageWidgetProps {
  resource: ResourceDetailResponseSchema['data'];
}

export const ResourceDetailPageWidget = ({
  resource,
}: ResourceDetailPageWidgetProps) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  if (!resource) {
    return <NotExist />;
  }

  const isOwnResource = user?.id === resource.user?.id;

  if (isEditing && isOwnResource) {
    return (
      <ResourceEditForm
        data={resource as ResourceDetailType}
        onClose={() => setIsEditing(false)}
      />
    );
  }

  const [majorCategory, subCategory] = parseCategoryHierarchy([
    resource.majorCategory,
    resource.subCategory ?? '',
  ]);

  const baseCategoriesUrl = '/resource/categories';

  return (
    <div className="min-h-screen bg-primary-palest">
      <SEOConfig
        title={`${resource.name} - 分享資源 | 島島阿學`}
        description={resource.description}
      />
      <Container className="py-12">
        <Breadcrumb className="mb-5 md:mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/resource">找資源</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                href={`${baseCategoriesUrl}/${majorCategory?.value}`}
              >
                {majorCategory?.label}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                href={`${baseCategoriesUrl}/${majorCategory?.value}/${subCategory?.value}`}
              >
                {subCategory?.label}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{resource.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <ResourceDetail
          resource={resource}
          onEditClick={() => setIsEditing(true)}
          isOwnResource={isOwnResource}
        />

        <div className="rounded-xl bg-white shadow">
          <ResourceDetailClient
            resource={resource}
            defaultTab={TabEnum.Introduction}
          />
        </div>
      </Container>
    </div>
  );
};
