"use client";

import { cn } from "@daodao/ui/lib/utils";
import type { TaskStatus } from "@/constants/task-status";
import { InProgressTaskCard } from "./in-progress-task-card";

export interface InProgressTask {
  id: string;
  title: string;
  description: string;
  checkInCount: number;
  progress: number;
  messagesCount: number;
  isUnreadMessages: boolean;
  theme: string;
  status: TaskStatus;
  lastCheckInDate?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

interface InProgressSectionProps {
  tasks: InProgressTask[];
}

export const InProgressSection = ({ tasks }: InProgressSectionProps) => {
  if (tasks.length === 0) {
    return null;
  }

  return (
    <section className="mb-6">
      <div
        className={cn(
          "max-w-[640px] px-5 mx-auto",
          "flex overflow-auto *:shrink-0 gap-4 md:grid md:grid-cols-2 scrollbar-hide"
        )}
      >
        {tasks.map((task) => (
          <InProgressTaskCard
            key={task.id}
            id={task.id.toString()}
            title={task.title}
            description={task.description}
            checkInCount={task.checkInCount}
            progress={task.progress}
            messagesCount={task.messagesCount}
            theme={task.theme}
            isUnreadMessages={task.isUnreadMessages}
            status={task.status}
            lastCheckInDate={task.lastCheckInDate}
            startDate={task.startDate}
            endDate={task.endDate}
          />
        ))}
      </div>
    </section>
  );
};
