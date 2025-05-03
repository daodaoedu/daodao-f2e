import { useRouter } from 'next/router';
import { getAdminProjectLayout } from '@/layout/features/getProjectLayout';
import ReviewDetail from '@/components/Review/Detail';
import { useProjectReview } from '@/services/modules/projects';
import { parseToNumber, parseToString } from '@/services/core';

const ReviewPage = () => {
  const { query } = useRouter();
  const projectId = parseToString(query.id);
  const reviewId = parseToNumber(query.reviewId);
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
