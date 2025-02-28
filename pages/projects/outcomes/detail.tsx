import { useRouter, useSearchParams } from 'next/navigation';
import getPublicProjectLayout from '@/layout/PublicProjectLayout';
import ReviewDetail from '@/components/Review/Detail';
import { useProjectReview } from '@/hooks/api/project';

const ReviewPage = () => {
  const router = useRouter();
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
    router.replace(`/projects/review?id=${projectId}`);
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

ReviewPage.getLayout = getPublicProjectLayout;

export default ReviewPage;
