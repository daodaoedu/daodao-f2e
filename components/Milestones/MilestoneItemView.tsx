import { Milestone as MilestoneType } from '@/contexts/Milestones/type';

import MilestoneView from './MilestoneView';
import TaskListView from '../Tasks/TaskListView';

interface MilestoneItemViewProps {
  index: number;
  milestone: MilestoneType;
}

const MilestoneItemView = ({ index, milestone }: MilestoneItemViewProps) => (
  <div className="flex flex-col gap-2 bg-basic-100 p-2.5">
    <MilestoneView index={index} milestone={milestone} />
    <TaskListView tasks={milestone.tasks || []} />
  </div>
);

export default MilestoneItemView;
