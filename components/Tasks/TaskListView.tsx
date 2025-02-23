import { useMemo } from "react";
import { Task as TaskType } from "@/contexts/Milestones/type";
import TaskView from "./TaskView";

interface TaskListViewProps {
  tasks: TaskType[];
}

const TaskListView = ({
  tasks,
}: TaskListViewProps) => {
  const sortedTasks = useMemo(
    () => (Array.isArray(tasks) ? [...tasks].sort((a, b) => a.id - b.id) : []),
    [tasks]
  );

  return sortedTasks.map((task) => (
    <TaskView
      key={task.id}
      task={task}
    />
  ));
};

export default TaskListView;
