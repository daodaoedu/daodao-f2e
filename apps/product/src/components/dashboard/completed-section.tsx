"use client";

import { CompletedTaskCard } from "./completed-task-card";

interface CompletedTask {
  id: number;
  label: string;
  title: string;
  viewCount: number;
  commentCount: number;
  tags: string[];
}

interface CompletedSectionProps {
  tasks: CompletedTask[];
}

export const CompletedSection = ({ tasks }: CompletedSectionProps) => {
  return (
    <section className="max-w-[640px] pt-4 px-5 mx-auto">
      <h2 className="mb-3 text-[1.125rem] font-medium text-bg-dark">
        已完成
      </h2>
      <div className="flex flex-col gap-3">
        {tasks.map((task) => (
          <CompletedTaskCard
            key={task.id}
            label={task.label}
            title={task.title}
            viewCount={task.viewCount}
            commentCount={task.commentCount}
            tags={task.tags}
          />
        ))}
      </div>
    </section>
  );
};

