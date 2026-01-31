"use client";

import { Button } from "@daodao/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@daodao/ui/components/dropdown-menu";
import { cn } from "@daodao/ui/lib/utils";
import { Ellipsis } from "lucide-react";
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
}

interface InProgressSectionProps {
  tasks: InProgressTask[];
}

export const InProgressSection = ({ tasks }: InProgressSectionProps) => {
  console.log("tasks", tasks);
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
      <div className="max-w-[640px] px-5 mx-auto mb-3 flex items-center justify-between">
        <h2 className="text-[1.125rem] font-medium text-bg-dark">進行中</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                filterStatus !== FilterStatus.all &&
                  "bg-light-cyan text-logo-cyan hover:text-logo-cyan"
              )}
            >
              <Ellipsis className="size-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => setFilterStatus(FilterStatus.all)}
              className={cn(
                filterStatus === FilterStatus.all && "bg-accent text-accent-foreground"
              )}
            >
              全部
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFilterStatus(FilterStatus.draft)}
              className={cn(
                filterStatus === FilterStatus.draft && "bg-accent text-accent-foreground"
              )}
            >
              草稿
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFilterStatus(FilterStatus.notStarted)}
              className={cn(
                filterStatus === FilterStatus.notStarted && "bg-accent text-accent-foreground"
              )}
            >
              未開始
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFilterStatus(FilterStatus.inProgress)}
              className={cn(
                filterStatus === FilterStatus.inProgress && "bg-accent text-accent-foreground"
              )}
            >
              進行中
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
          />
        ))}
      </div>
    </section>
  );
};
