import { useState } from 'react';
import dayjs from 'dayjs';
import { CreateProjectMilestoneRequest, ProjectMilestoneSchema, UpdateProjectMilestoneRequest } from '@/services/project/milestone';
import TaskList from '@/components/Tasks/TaskList';
import MilestoneCard from './MilestoneCard';
import TaskCreate from '../Tasks/Create';
import TaskAdd from '../Tasks/Add';

interface MilestoneItemProps {
  projectId: string;
  startDate?: dayjs.Dayjs;
  endDate?: dayjs.Dayjs;
  isEditable?: boolean;
  milestone: ProjectMilestoneSchema;
  milestones: ProjectMilestoneSchema[];
  onCreate?: (request: CreateProjectMilestoneRequest) => Promise<void>;
  onUpdate?: (request: UpdateProjectMilestoneRequest) => Promise<void>;
  onRefreshData?: () => void;
}

const MilestoneItem = ({
  projectId,
  startDate,
  endDate,
  isEditable,
  milestone,
  milestones,
  onCreate,
  onUpdate,
  onRefreshData,
}: MilestoneItemProps) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="p-2.5 bg-basic-100 rounded-xl flex flex-col gap-2">
      <MilestoneCard
        projectId={projectId}
        milestone={milestone}
        milestones={milestones}
        startDate={startDate}
        endDate={endDate}
        isEditable={isEditable}
        onCreate={onCreate}
        onUpdate={onUpdate}
      />
      <TaskList
        tasks={milestone.tasks || []}
        projectId={projectId}
        milestoneId={milestone.id}
        onRefreshData={onRefreshData}
      />
      {isEditing && (
        <TaskCreate
          index={milestone.tasks?.length || 0}
          projectId={projectId}
          milestoneId={milestone.id}
          onCancel={() => setIsEditing(false)}
          onRefreshData={onRefreshData}
        />
      )}
      <TaskAdd setIsEditing={setIsEditing} />
    </div>
  );
};

export default MilestoneItem;
