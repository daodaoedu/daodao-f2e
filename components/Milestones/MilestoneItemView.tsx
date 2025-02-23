import { Milestone as MilestoneType } from '@/contexts/Milestones/type';

import MilestoneView from './MilestoneView';
import TaskListView from '../Tasks/TaskListView';

interface MilestoneItemViewProps {
  milestone: MilestoneType;
}

const MilestoneItemView = ({
  milestone,
}: MilestoneItemViewProps) => {
  return (
    <div className="p-2.5 bg-basic-100 flex flex-col gap-2">
      <MilestoneView
        milestone={milestone}
      />
      <TaskListView
        tasks={milestone.tasks || []}
      />
    </div>
  );
};

export default MilestoneItemView;
