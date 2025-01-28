import OutcomeDetail from '@/components/Outcome/Detail';
import ProjectLayout from '@/layout/ProjectLayout';

const OutcomeDetailPage = () => {
  return (
    <div className="bg-basic-white rounded-2xl">
      <OutcomeDetail className="" />
    </div>
  );
};

OutcomeDetailPage.getLayout = ({ children }: React.PropsWithChildren) => (
  <ProjectLayout activeTabType="outcomes">{children}</ProjectLayout>
);

export default OutcomeDetailPage;
