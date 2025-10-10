import { useRouter, useSearchParams } from "next/navigation";

import SEOConfig from "@/components/SEOConfig";
import { ProtectedComponent } from "@/features/auth";
import { ResourceReviewForm } from "@/features/resources";
import { parseToNumber, parseToString } from "@/utils/helper";

export default function EditResourceReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resourceId = parseToString(searchParams?.get('resourceId'));
  const reviewId = parseToNumber(searchParams?.get('reviewId'));

  return (
    <ProtectedComponent>
      <SEOConfig title="編輯心得分享 | 島島阿學" />
      <ResourceReviewForm
        resourceId={resourceId}
        reviewId={reviewId}
        onSuccess={() => {
          router.push(`/resource/${resourceId}`);
        }}
      />
    </ProtectedComponent>
  );
}
