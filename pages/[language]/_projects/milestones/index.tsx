
import { getPublicProjectLayout } from '@/layout/features/getProjectLayout';
import { useSearchParams } from 'next/navigation';
import { Skeleton } from '@/shared/ui/skeleton';
import { useProject } from '@/services/projects/core/hooks';
import EmptyList from '@/components/Projects/ProjectList/EmptyList';
import MilestoneItemView from '@/components/Milestones/MilestoneItemView';
import { MilestonesProvider } from '@/contexts/Milestones';
import { parseToString } from '@/utils/helper';

const ProjectMilestonesPage = () => {
  const searchParams = useSearchParams();
  const projectId = parseToString(searchParams?.get('id'));
  const { data: project, isLoading } = useProject(projectId);
  const milestones = project?.milestones;

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
                const aTime = a.startDate ? new Date(a.startDate).getTime() : 0;
                const bTime = b.startDate ? new Date(b.startDate).getTime() : 0;
                return aTime - bTime;
              })
              .map((milestone, index) => {
                return (
                  <MilestoneItemView
                    index={index}
                    milestone={milestone}
                    key={milestone.id}
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
  getPublicProjectLayout(<MilestonesProvider>{page}</MilestonesProvider>);
export default ProjectMilestonesPage;
