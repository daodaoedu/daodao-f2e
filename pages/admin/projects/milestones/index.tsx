import getAdminProjectLayout from '@/layout/AdminProjectLayout';
import { useRouter } from 'next/router';
import { Skeleton } from '@mui/material';
import { useProjectMilestones } from '@/services/modules/projects';
import EmptyList from '@/components/Projects/ProjectList/EmptyList';
import MilestoneItemView from '@/components/Milestones/MilestoneItemView';
import { MilestonesProvider } from '@/contexts/Milestones';
import { parseToString } from '@/services/core';

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
