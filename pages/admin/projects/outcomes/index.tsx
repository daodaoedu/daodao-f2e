import { useSearchParams } from 'next/navigation';
import getPublicProjectLayout from '@/layout/PublicProjectLayout';
import ReviewCard from '@/components/Review/Card';
import {
  useProjectReviewList,
} from '@/hooks/api/project';
import marathonConfig from '@/constants/marathon';

const ReviewPage = () => {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('id') ?? undefined;
  const {
    data: reviews,
  } = useProjectReviewList(projectId);

  if (!projectId) {
    return <div>專案不存在</div>;
  }

  return (
    <>
      <div className="mb-6 flex items-end sm:items-center justify-between body-md">
        <div className="flex flex-col items-start sm:flex-row sm:items-center gap-1">
          <div className="text-basic-500">
            覆盤（{marathonConfig.getWeekNumber().toString().padStart(2, '0')} 週/22週）
          </div>
        </div>
      </div>

      <ul className="flex flex-col gap-6">
        {Array.isArray(reviews) &&
          reviews.map((review) => (
            <li key={review.id}>
              <ReviewCard
                data={review}
                detailLink={`/projects/review/detail?id=${projectId}&reviewId=${review.id}`}
              />
            </li>
          ))}
      </ul>
    </>
  );
};

ReviewPage.getLayout = getPublicProjectLayout;

export default ReviewPage;
