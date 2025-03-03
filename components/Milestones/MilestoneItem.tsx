import { useState } from 'react';
import dayjs from 'dayjs';
import {
  CreateProjectMilestoneRequest,
  ProjectMilestoneSchema,
  UpdateProjectMilestoneRequest,
} from '@/services/project/milestone';
import TaskList from '@/components/Tasks/TaskList';
import Collapse from '@/shared/components/Collapse';
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
      <Collapse defaultOpen>
        <Collapse.List>
          <Collapse.Item>
            <div className="pb-2 flex flex-col gap-2">
              <TaskList
                tasks={milestone.tasks || []}
                projectId={projectId}
                milestoneId={milestone.id}
                onRefreshData={onRefreshData}
              />
            </div>
          </Collapse.Item>
        </Collapse.List>
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
        <Collapse.Toggle withIcon className="w-full flex justify-center body-sm">
          {(isOpen) => (isOpen ? '收合' : '展開')}
        </Collapse.Toggle>
      </Collapse>
    </div>
  );
};

export default MilestoneItem;
