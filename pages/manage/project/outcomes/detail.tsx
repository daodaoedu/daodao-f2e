import OutcomeDetail from '@/components/Outcome/Detail';
import ProjectLayout from '@/layout/ProjectLayout';

const OutcomeDetailPage = () => {
  return (
    <div className="bg-basic-white rounded-2xl">
      <OutcomeDetail className="" />
    </div>
  );
};

OutcomeDetailPage.getLayout = (page: React.ReactElement) =>
  ProjectLayout(page, 'outcomes');

export default OutcomeDetailPage;
