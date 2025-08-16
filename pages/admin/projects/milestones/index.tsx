import { getAdminProjectLayout } from '@/layout/features/getProjectLayout';
import { useRouter } from 'next/router';
import { Skeleton } from '@/components/ui/skeleton';
import { useProjectMilestones } from '@/features/projects/hooks/milestone';
import EmptyList from '@/components/Projects/ProjectList/EmptyList';
import MilestoneItemView from '@/components/Milestones/MilestoneItemView';
import { MilestonesProvider } from '@/contexts/Milestones';
import { parseToString } from '@/utils/helper';

const ProjectMilestonesPage = () => {
  const { query } = useRouter();
  const projectId = parseToString(query.id);
  const { data: milestones, isLoading } = useProjectMilestones(projectId);

  return (
    <div className="w-[750px] max-w-full mx-auto">
      {isLoading ? (
        <>
          <Skeleton className="w-full h-[120px] mb-3" />
          <Skeleton className="w-full h-[300px]" />
        </>
      ) : (
        <div>
          {projectId && Array.isArray(milestones) && milestones.length > 0 ? (
            milestones
              .sort((a, b) => {
                return a.position - b.position;
              })
              .map((milestone, index) => {
                return (
                  <MilestoneItemView
                    milestone={milestone}
                    key={milestone.id}
                    index={index}
                  />
                );
              })
          ) : (
            <EmptyList />
          )}
        </div>
      )}
    </div>
  );
};
ProjectMilestonesPage.getLayout = (page: React.ReactElement) =>
  getAdminProjectLayout(<MilestonesProvider>{page}</MilestonesProvider>);
export default ProjectMilestonesPage;
