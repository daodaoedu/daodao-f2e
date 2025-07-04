import { useRouter } from "next/router";
import OutcomeDetail from "@/features/projects/components/OutcomeDetail";
import { getAdminProjectLayout } from "@/layout/features/getProjectLayout";
import { useProject } from "@/services/projects";
import { useProjectOutcome } from "@/features/projects/hooks/outcome";
import { parseToNumber, parseToString } from "@/utils/helper";

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
