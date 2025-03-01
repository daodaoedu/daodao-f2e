import { useSearchParams } from 'next/navigation';
import OutcomeDetail from '@/components/Outcome/Detail';
import getAdminProjectLayout from '@/layout/AdminProjectLayout';
import { useProject, useProjectOutcome } from '@/hooks/api/project';

const OutcomeDetailPage = () => {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('id') ?? undefined;
  const outcomeId = parseInt(searchParams.get('outcomeId') ?? '0', 10);
  const { data: project } = useProject({ id: projectId });
  const {
    data: outcome,
  } = useProjectOutcome({
    projectId,
    outcomeId,
  });

  if (!projectId || !outcomeId) {
    return null;
  }

  return (
    <div className="bg-basic-white rounded-2xl">
      <OutcomeDetail
        data={outcome}
        authorUser={project?.user}
      />
    </div>
  );
};

OutcomeDetailPage.getLayout = getAdminProjectLayout;

export default OutcomeDetailPage;
