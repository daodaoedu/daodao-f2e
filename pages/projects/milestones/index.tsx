import dayjs from 'dayjs';
import getPublicProjectLayout from '@/layout/PublicProjectLayout';
import { useSearchParams } from 'next/navigation';
import { Skeleton } from '@mui/material';
import useProjectMilestoneList from '@/hooks/api/project/useProjectMilestoneList';
import EmptyList from '@/components/Projects/ProjectList/EmptyList';
import MilestoneItemView from '@/components/Milestones/MilestoneItemView';
import { MilestonesProvider } from '@/contexts/Milestones';

const ProjectMilestonesPage = () => {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId') ?? undefined;
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
                return dayjs(a.startDate).diff(dayjs(b.startDate));
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
      )
    }
    </div>
  );
};
ProjectMilestonesPage.getLayout = (page: React.ReactElement) =>
  getPublicProjectLayout(
    <MilestonesProvider>{page}</MilestonesProvider>
  );
export default ProjectMilestonesPage;
