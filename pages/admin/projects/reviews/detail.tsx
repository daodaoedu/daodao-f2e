import { useSearchParams } from 'next/navigation';
import { getAdminProjectLayout } from '@/layout/features/getProjectLayout';
import ReviewDetail from '@/features/projects/components/ReviewDetail';
import { useProjectReview } from '@/features/projects/hooks/review';
import { parseToNumber, parseToString } from '@/utils/helper';

const ReviewPage = () => {
  const searchParams = useSearchParams();
  const projectId = parseToString(searchParams?.get('id'));
  const reviewId = parseToNumber(searchParams?.get('reviewId'));
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
