import { useState } from 'react';
import { Milestone as MilestoneType } from '@/contexts/Milestones/type';
import TaskList from '@/components/Tasks/TaskList';
import Milestone from './Milestone';
import TaskCreate from '../Tasks/Create';
import TaskAdd from '../Tasks/Add';

interface MilestoneItemProps {
  milestone: MilestoneType;
  isLgScreen: boolean;
  projectId: string;
  onRefreshData?: () => void;
}

const MilestoneItem = ({
  milestone,
  isLgScreen,
  projectId,
  onRefreshData,
}: MilestoneItemProps) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="p-2.5 bg-basic-100 flex flex-col gap-2">
      <Milestone
        projectId={projectId}
        milestone={milestone}
        isLgScreen={isLgScreen}
        onRefreshData={onRefreshData}
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
