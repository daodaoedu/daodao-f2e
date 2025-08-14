
import { getPublicProjectLayout } from '@/layout/features/getProjectLayout';
import { useRouter } from 'next/router';
import { Skeleton } from '@mui/material';
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
