import { useRouter } from "next/router";

import SEOConfig from "@/components/SEOConfig";
import { ProtectedComponent } from "@/contexts/Auth";
import { ResourceReviewForm } from "@/features/resources";
import { parseToString } from "@/utils/helper";

export default function EditResourceReviewPage() {
  const router = useRouter();
  const resourceId = parseToString(router.query.resourceId);

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
