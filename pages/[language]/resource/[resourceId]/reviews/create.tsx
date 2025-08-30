import { useRouter, useSearchParams } from 'next/navigation';

import SEOConfig from '@/components/SEOConfig';
import { ProtectedComponent } from '@/contexts/Auth';
import { ResourceReviewForm } from '@/features/resources';
import { parseToString } from '@/utils/helper';

export default function EditResourceReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resourceId = parseToString(searchParams?.get('resourceId'));

  return (
    <ProtectedComponent>
      <SEOConfig title="分享心得 | 島島阿學" />
      <ResourceReviewForm
        resourceId={resourceId}
        onSuccess={() => {
          router.push(`/resource/${resourceId}`);
        }}
      />
    </ProtectedComponent>
  );
}
