"use client";

import { cn } from "@daodao/ui/lib/utils";
import { useState } from "react";
import {
  FilterStatus,
  type FilterStatus as FilterStatusType,
  type TaskStatus,
} from "@/constants/task-status";
import { InProgressTaskCard } from "./in-progress-task-card";

export interface InProgressTask {
  id: string;
  label: string;
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
}

interface InProgressSectionProps {
  tasks: InProgressTask[];
}

const filterOptions = [
  { value: FilterStatus.all, label: "全部" },
  { value: FilterStatus.draft, label: "草稿" },
  { value: FilterStatus.notStarted, label: "未開始" },
  { value: FilterStatus.inProgress, label: "進行中" },
];

export const InProgressSection = ({ tasks }: InProgressSectionProps) => {
  const [filterStatus, setFilterStatus] = useState<FilterStatusType>(FilterStatus.all);

  const filteredTasks =
    filterStatus === FilterStatus.all
      ? tasks
      : tasks.filter((task) => task.status === filterStatus);

  if (tasks.length === 0) {
    return null;
  }

  return (
    <section className="mb-6">
      <div className="max-w-[640px] px-5 mx-auto mb-3">
        <h2 className="text-[1.125rem] font-medium text-bg-dark mb-3">進行中</h2>
        <div
          role="tablist"
          aria-label="任務篩選"
          className="flex gap-2 overflow-x-auto scrollbar-hide"
        >
          {filterOptions.map((option) => (
            <button
              type="button"
              key={option.value}
              role="tab"
              aria-selected={filterStatus === option.value}
              onClick={() => setFilterStatus(option.value)}
              className={cn(
                "px-5 py-2 rounded-full text-sm whitespace-nowrap border transition-colors",
                filterStatus === option.value
                  ? "bg-primary-base border-primary-base text-white"
                  : "bg-white border-primary-base text-primary-base"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <div
        className={cn(
          "max-w-[640px] px-5 mx-auto",
          "flex overflow-auto *:shrink-0 gap-3 md:grid md:grid-cols-2 scrollbar-hide"
        )}
      >
        {filteredTasks.map((task) => (
          <InProgressTaskCard
            key={task.id}
            id={task.id.toString()}
            label={task.label}
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
          />
        ))}
      </div>
    </section>
  );
};
