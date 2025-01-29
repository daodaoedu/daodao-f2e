import getProjectLayout from '@/layout/ProjectLayout';
import ReviewDetail from '@/components/Review/Detail';

const ReviewPage = () => {
  return <ReviewDetail />;
};

ReviewPage.getLayout = (page: React.ReactElement) =>
  getProjectLayout(page, 'review');

export default ReviewPage;
