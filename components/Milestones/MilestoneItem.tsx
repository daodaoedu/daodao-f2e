import { useState } from 'react';
import dayjs from 'dayjs';
import { MdAdd } from 'react-icons/md';
import {
  CreateProjectMilestoneSchema,
  ProjectMilestoneSchema,
  UpdateProjectMilestoneSchema,
  ProjectTaskSchema,
} from '@/services/modules/projects';
import Button from '@/shared/components/Button';
import Collapse from '@/shared/components/Collapse';
import MilestoneCard from './MilestoneCard';
import Task from '../Tasks/Task';
import DraggableTasks from '../Tasks/DraggableTasks';

interface MilestoneItemProps {
  projectId: string;
  minDate?: dayjs.Dayjs;
  maxDate?: dayjs.Dayjs;
  isEditable?: boolean;
  milestone: ProjectMilestoneSchema;
  milestones: ProjectMilestoneSchema[];
  onCreate?: (request: CreateProjectMilestoneSchema) => void;
  onUpdate?: (request: UpdateProjectMilestoneSchema) => void;
  onRefreshData?: () => void;
  onReorderTask?: (task: ProjectTaskSchema) => void;
}

const MilestoneItem = ({
  projectId,
  minDate,
  maxDate,
  isEditable,
  milestone,
  milestones,
  onCreate,
  onUpdate,
  onRefreshData,
  onReorderTask,
}: MilestoneItemProps) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="p-2.5 bg-basic-100 rounded-xl flex flex-col gap-2">
      <MilestoneCard
        projectId={projectId}
        milestone={milestone}
        milestones={milestones}
        minDate={minDate}
        maxDate={maxDate}
        isEditable={isEditable}
        onCreate={onCreate}
        onUpdate={onUpdate}
      />
      <Collapse defaultOpen>
        <Collapse.List className="flex flex-col gap-2">
          <Collapse.Item className="w-full overflow-hidden">
            <DraggableTasks
              tasks={milestone.tasks}
              projectId={projectId}
              milestoneId={milestone.id}
              onRefreshData={onRefreshData}
              onReorderTask={onReorderTask}
            />
          </Collapse.Item>
          <Collapse.Item>
            {isEditing ? (
              <Task
                index={(milestone.tasks || []).length}
                projectId={projectId}
                milestoneId={milestone.id}
                onCancel={() => setIsEditing(false)}
                onRefreshData={onRefreshData}
              />
            ) : (
              <div className="flex justify-end">
                <Button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 py-0 body-sm"
                >
                  <MdAdd className="w-5 h-5" />
                  <span>新增子任務</span>
                </Button>
              </div>
            )}
          </Collapse.Item>
        </Collapse.List>
        <Collapse.Toggle
          withIcon
          className="pt-1.5 w-full flex justify-center body-sm"
        >
          {(isOpen) => (isOpen ? '收合' : '展開')}
        </Collapse.Toggle>
      </Collapse>
    </div>
  );
};

export default MilestoneItem;
