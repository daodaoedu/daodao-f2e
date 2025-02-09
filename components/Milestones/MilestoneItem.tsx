import { useState } from 'react';
import {
    Milestone as MilestoneType
  } from '@/contexts/Milestones/type';
import TaskList from '@/components/Tasks/TaskList';
import Milestone from './Milestone';
import TaskCreate from '../Tasks/Create';
import TaskAdd from '../Tasks/Add';

const MilestoneItem = ({
  milestone,
  isLgScreen,
  projectId
}: {
  milestone: MilestoneType;
  isLgScreen: boolean;
  projectId: string;
}) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="p-[10px] bg-basic-100 flex flex-col gap-2">
      <Milestone milestone={milestone} isLgScreen={isLgScreen} />
      <TaskList
        tasks={milestone.Tasks || []}
        projectId={projectId}
        milestoneId={milestone.id}
      />
      {isEditing && (
        <TaskCreate
          index={milestone.Tasks?.length || 0}
          projectId={projectId}
          milestoneId={milestone.id}
          onCancel={() => setIsEditing(false)}
        />
      )}
      <TaskAdd setIsEditing={setIsEditing} />
    </div>
  );
};

export default MilestoneItem;
