import React, { useMemo } from 'react';
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

    const sortedTasks = useMemo(() => {
      return [...tasks].sort((a, b) => a.id - b.id);
    }, [tasks]);
    return (
      <>
        {sortedTasks
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