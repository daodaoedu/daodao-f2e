import { useMemo } from "react";
import { Task as TaskType } from "@/contexts/Milestones/type";
import Task from "./Task";

interface TaskListProps {
  tasks: TaskType[];
  projectId: string;
  milestoneId: number;
  onRefreshData?: () => void;
}

const TaskList = ({
  tasks,
  projectId,
  milestoneId,
  onRefreshData,
}: TaskListProps) => {
  const sortedTasks = useMemo(
    () => (Array.isArray(tasks) ? [...tasks].sort((a, b) => a.id - b.id) : []),
    [tasks]
  );

  return sortedTasks.map((task) => (
    <Task
      key={task.id}
      projectId={projectId}
      milestoneId={milestoneId}
      task={task}
      onRefreshData={onRefreshData}
    />
  ));
};

export default TaskList;
