import getAdminProjectLayout from '@/layout/AdminProjectLayout';
import { useSearchParams } from 'next/navigation';
import { Skeleton } from '@mui/material';
import useProjectMilestoneList from '@/hooks/api/project/useProjectMilestoneList';
import EmptyList from '@/components/Projects/ProjectList/EmptyList';
import MilestoneItemView from '@/components/Milestones/MilestoneItemView';
import { MilestonesProvider } from '@/contexts/Milestones';

const ProjectMilestonesPage = () => {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('id') ?? undefined;
  const {
    data: milestones,
    isLoading,
  } = useProjectMilestoneList(projectId);

  return (
    <div className="w-[750px] max-w-full mx-auto">
      {isLoading ? (
        <>
          <Skeleton
            variant="rectangular"
            width="100%"
            height={120}
            animation="wave"
            className="mb-3"
          />
          <Skeleton
            variant="rectangular"
            width="100%"
            height={300}
            animation="wave"
          />
        </>
      ) : (
        <div>
          {projectId && Array.isArray(milestones) && milestones.length > 0 ? (
            milestones
              .sort((a, b) => {
                return a.week - b.week;
              })
              .map((milestone) => {
                return (
                  <MilestoneItemView
                    milestone={milestone}
                    key={milestone.id}
                  />
                );
              })
          ) : (
            <EmptyList />
          )}
        </div>
      )
    }
    </div>
  );
};
ProjectMilestonesPage.getLayout = (page: React.ReactElement) =>
  getAdminProjectLayout(
    <MilestonesProvider>{page}</MilestonesProvider>
  );
export default ProjectMilestonesPage;
