import {
    Task as TaskType
  } from '@/contexts/Milestones/type';
import Task from './Task';

const TaskList = ({
    tasks,
    projectId,
    milestoneId
  }: {
    tasks: TaskType[];
    projectId: string;
    milestoneId: number;
  }) => {
    return (
      <>
        {tasks
          .sort((a, b) => a.id - b.id)
          .map((task) => (
            <Task
              key={task.id}
              projectId={projectId}
              milestoneId={milestoneId}
              task={task}
            />
          ))}
      </>
    );
  };

  export default TaskList;
