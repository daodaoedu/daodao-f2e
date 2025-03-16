import { useSearchParams } from 'next/navigation';
import getAdminProjectLayout from '@/layout/AdminProjectLayout';
import ReviewDetail from '@/components/Review/Detail';
import { useProjectReview } from '@/services/modules/projects';
import { parseParamsToNumber } from '@/services/core';

const ReviewPage = () => {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('id') ?? undefined;
  const reviewId = parseParamsToNumber(searchParams.get('reviewId'));
  const { data: review } = useProjectReview({
    projectId,
    reviewId,
  });

  if (!projectId || reviewId == null) {
    return null;
  }

  return <ReviewDetail data={review} />;
};

ReviewPage.getLayout = getAdminProjectLayout;

export default ReviewPage;
