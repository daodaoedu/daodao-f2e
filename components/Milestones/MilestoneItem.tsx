import { useState } from 'react';
import { Plus } from 'lucide-react';
import {
  ProjectMilestoneSchema,
  ProjectMilestoneFormSchema,
  ProjectTaskSchema,
} from '@/services/projects';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/ui/collapsible';
import { Button } from '@/shared/ui/button';
import { cn } from '@/utils/cn';
import MilestoneCard from './MilestoneCard';
import Task from '../Tasks/Task';
import DraggableTasks from '../Tasks/DraggableTasks';

interface MilestoneItemProps {
  projectId: string;
  minDate?: Date;
  maxDate?: Date;
  isEditable?: boolean;
  milestone: ProjectMilestoneSchema;
  milestones: ProjectMilestoneSchema[];
  onCreate?: (request: ProjectMilestoneFormSchema) => void;
  onUpdate?: (request: ProjectMilestoneFormSchema) => void;
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
    <div className="flex flex-col gap-2 rounded-xl bg-basic-100 p-2.5">
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
      <Collapsible>
        <CollapsibleContent className="flex flex-col gap-2">
          <DraggableTasks
            tasks={milestone.tasks}
            projectId={projectId}
            milestoneId={milestone.id}
            onRefreshData={onRefreshData}
            onReorderTask={onReorderTask}
          />
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
                variant="ghost"
                className="body-sm flex items-center gap-2 py-0"
              >
                <Plus className="size-5" />
                <span>新增子任務</span>
              </Button>
            </div>
          )}
        </CollapsibleContent>
        <CollapsibleTrigger
          withIcon
          className={cn(
            'pt-1.5 w-full flex justify-center body-sm',
            '[&[data-state=open]>span:nth-child(1)]:hidden',
            '[&[data-state=closed]>span:nth-child(2)]:hidden'
          )}
        >
          <span>展開</span>
          <span>收合</span>
        </CollapsibleTrigger>
      </Collapsible>
    </div>
  );
};

export default MilestoneItem;
