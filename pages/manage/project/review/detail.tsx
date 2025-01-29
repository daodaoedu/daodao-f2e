import ProjectLayout from '@/layout/ProjectLayout';
import ReviewDetail from '@/components/Review/Detail';

const ReviewPage = () => {
  return <ReviewDetail />;
};

ReviewPage.getLayout = (page: React.ReactElement) =>
  ProjectLayout(page, 'review');

export default ReviewPage;
