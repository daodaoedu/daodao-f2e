import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ResourceDetailPageWidget } from '@/widgets/resources';
import {
  getResourceData,
  parseResourceId,
  type ResourceDetail,
} from '@/entities/resource';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ resourceId: string }>;
}): Promise<Metadata> {
  const { resourceId } = await params;
  const resourceIdObject = parseResourceId(resourceId);

  if (!resourceIdObject.resourceId) {
    return {
      title: '資源詳情｜島島阿學',
    };
  }

  try {
    const [, response] = await getResourceData(resourceIdObject);
    const responseData = response?.data as { data?: ResourceDetail[] } | undefined;
    const data = Array.isArray(responseData?.data) ? responseData.data[0] : undefined;

    if (data) {
      return {
        title: `${data.name} - 分享資源 | 島島阿學`,
        description: data.description,
      };
    }
  } catch {
    // Error handling: return default metadata
  }

  return {
    title: '資源詳情｜島島阿學',
  };
}

export default async function ResourceDetailPage({
  params,
}: {
  params: Promise<{ resourceId: string }>;
}) {
  const { resourceId } = await params;
  const resourceIdObject = parseResourceId(resourceId);

  if (!resourceIdObject.resourceId) {
    notFound();
  }

  let data: ResourceDetail | null = null;

  try {
    const [, response] = await getResourceData(resourceIdObject);
    const responseData = response?.data as { data?: ResourceDetail[] } | undefined;
    data = Array.isArray(responseData?.data) ? responseData.data[0] ?? null : null;
  } catch {
    notFound();
  }

  if (!data) {
    notFound();
  }

  return <ResourceDetailPageWidget resource={data} />;
}

