import OutcomeDetail from '@/components/Outcome/Detail';
import OutcomeLayout from '@/layout/OutcomeLayout';

const OutcomeDetailPage = () => {
  return (
    <div className="bg-basic-white rounded-2xl">
      <OutcomeDetail className="" />
    </div>
  );
};

OutcomeDetailPage.getLayout = OutcomeLayout;

export default OutcomeDetailPage;
