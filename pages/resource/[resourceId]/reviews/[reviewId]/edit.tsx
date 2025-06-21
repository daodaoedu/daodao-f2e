import { useRouter } from "next/router";

import SEOConfig from "@/shared/components/SEO";
import { ProtectedComponent } from "@/contexts/Auth";
import { ResourceReviewForm } from "@/features/resources";
import { parseToNumber, parseToString } from "@/utils/helper";

export default function EditResourceReviewPage() {
  const router = useRouter();
  const resourceId = parseToString(router.query.resourceId);
  const reviewId = parseToNumber(router.query.reviewId);

  return (
    <ProtectedComponent>
      <SEOConfig title="編輯心得分享" />
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
