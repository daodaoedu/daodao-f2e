import ProjectLayout from '@/layout/ProjectLayout';
import ReviewDetail from '@/components/Review/Detail';

const ReviewPage = () => {
  return <ReviewDetail />;
};

ReviewPage.getLayout = ({ children }: React.PropsWithChildren) => {
  return <ProjectLayout activeTabType="review">{children}</ProjectLayout>;
};

export default ReviewPage;
