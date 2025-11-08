import { useSearchParams } from "next/navigation";
import OutcomeDetail from "@/features/projects/components/OutcomeDetail";
import { getAdminProjectLayout } from "@/layout/features/getProjectLayout";
import { useProject } from "@/services/projects";
import { useProjectOutcome } from "@/features/projects/hooks/outcome";
import { parseToNumber, parseToString } from "@/shared/lib/helper";
import { LazyCommentSection } from "@/features/comment";
import { CommentType } from "@/services/comments";

const OutcomeDetailPage = () => {
  const searchParams = useSearchParams();
  const projectId = parseToString(searchParams?.get('id'));
  const outcomeId = parseToNumber(searchParams?.get('outcomeId'));
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
      <OutcomeDetail data={outcome} authorUser={project?.user} commentSection={<LazyCommentSection targetId={outcomeId} targetType={CommentType.Outcome} />} />
    </div>
  );
};

OutcomeDetailPage.getLayout = getAdminProjectLayout;

export default OutcomeDetailPage;
