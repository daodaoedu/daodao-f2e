import { useState } from 'react';
import dayjs from 'dayjs';
import {
  CreateProjectMilestoneSchema,
  ProjectMilestoneSchema,
  UpdateProjectMilestoneSchema,
} from '@/services/modules/projects';
import { cn } from '@/utils/cn';
import Collapse from '@/shared/components/Collapse';
import MilestoneCard from './MilestoneCard';
import TaskCreate from '../Tasks/Create';
import TaskAdd from '../Tasks/Add';
import Task from '../Tasks/Task';

interface MilestoneItemProps {
  projectId: string;
  startDate?: dayjs.Dayjs;
  endDate?: dayjs.Dayjs;
  isEditable?: boolean;
  milestone: ProjectMilestoneSchema;
  milestones: ProjectMilestoneSchema[];
  onCreate?: (request: CreateProjectMilestoneSchema) => void;
  onUpdate?: (request: UpdateProjectMilestoneSchema) => void;
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
          {/* TODO: 要調整裡面的下拉選單後再開啟 */}
          <Collapse.Item className={cn(false && "w-full overflow-hidden")}>
            <div className="pb-2 flex flex-col gap-2">
              {milestone.tasks?.map((task) => (
                <Task
                  key={task.id}
                  projectId={projectId}
                  milestoneId={milestone.id}
                  task={task}
                  onRefreshData={onRefreshData}
                />
              ))}
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
        <Collapse.Toggle
          withIcon
          className="w-full flex justify-center body-sm"
        >
          {(isOpen) => (isOpen ? '收合' : '展開')}
        </Collapse.Toggle>
      </Collapse>
    </div>
  );
};

export default MilestoneItem;
