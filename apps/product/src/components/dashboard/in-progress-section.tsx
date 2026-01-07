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
import { type TaskStatus } from "@/constants/task-status";
import { InProgressTaskCard } from "./in-progress-task-card";

export type FilterStatus = "all" | "draft" | "not-started" | "in-progress";

export interface InProgressTask {
  id: number;
  label: string;
  title: string;
  description: string;
  progress: string;
  messagesCount: number;
  isUnreadMessages: boolean;
  theme: string;
  status: TaskStatus;
  isCheckIn: boolean;
}

interface InProgressSectionProps {
  tasks: InProgressTask[];
  onCheckIn: (taskTitle: string) => void;
}

export const InProgressSection = ({ tasks, onCheckIn }: InProgressSectionProps) => {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  const filteredTasks =
    filterStatus === "all" ? tasks : tasks.filter((task) => task.status === filterStatus);

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
                filterStatus !== "all" && "bg-light-cyan text-logo-cyan hover:text-logo-cyan"
              )}
            >
              <Ellipsis className="size-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => setFilterStatus("all")}
              className={cn(filterStatus === "all" && "bg-accent text-accent-foreground")}
            >
              全部
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFilterStatus("draft")}
              className={cn(filterStatus === "draft" && "bg-accent text-accent-foreground")}
            >
              草稿
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFilterStatus("not-started")}
              className={cn(filterStatus === "not-started" && "bg-accent text-accent-foreground")}
            >
              未開始
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFilterStatus("in-progress")}
              className={cn(filterStatus === "in-progress" && "bg-accent text-accent-foreground")}
            >
              進行中
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div
        className={cn(
          "max-w-[640px] px-5 mx-auto",
          "flex overflow-auto *:shrink-0 gap-3 md:grid md:grid-cols-2"
        )}
      >
        {filteredTasks.map((task) => (
          <InProgressTaskCard
            key={task.id}
            id={task.id.toString()}
            label={task.label}
            title={task.title}
            description={task.description}
            progress={task.progress}
            messagesCount={task.messagesCount}
            theme={task.theme}
            isUnreadMessages={task.isUnreadMessages}
            isCheckIn={task.isCheckIn}
            status={task.status}
            onCheckIn={() => onCheckIn(task.title)}
          />
        ))}
      </div>
    </section>
  );
};
