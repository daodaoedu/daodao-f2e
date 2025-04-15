import { useRouter } from 'next/router';
import OutcomeDetail from '@/components/Outcome/Detail';
import getAdminProjectLayout from '@/layout/AdminProjectLayout';
import { useProject, useProjectOutcome } from '@/services/modules/projects';
import { parseToNumber, parseToString } from '@/services/core';

const OutcomeDetailPage = () => {
  const { query } = useRouter();
  const projectId = parseToString(query.id);
  const outcomeId = parseToNumber(query.outcomeId);
  const { data: project } = useProject(projectId);
  const { data: outcome } = useProjectOutcome({
    projectId,
    outcomeId,
  });

  if (!projectId || outcomeId == null) {
    return null;
  }

  return (
    <div className="bg-basic-white rounded-2xl">
      <OutcomeDetail data={outcome} authorUser={project?.user} />
    </div>
  );
};

OutcomeDetailPage.getLayout = getAdminProjectLayout;

export default OutcomeDetailPage;
