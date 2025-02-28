import { useSearchParams } from 'next/navigation';
import getAdminProjectLayout from '@/layout/AdminProjectLayout';
import ReviewDetail from '@/components/Review/Detail';
import { useProjectReview } from '@/hooks/api/project';

const ReviewPage = () => {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('id') ?? undefined;
  const reviewId = parseInt(searchParams.get('reviewId') ?? '0', 10);
  const {
    data: review,
  } = useProjectReview({
    projectId,
    reviewId,
  });

  if (!projectId || !reviewId) {
    return null;
  }

  return (
    <>
      <ReviewDetail
        data={review}
      />
    </>
  );
};

ReviewPage.getLayout = getAdminProjectLayout;

export default ReviewPage;
