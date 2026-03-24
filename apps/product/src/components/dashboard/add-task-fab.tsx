"use client";

import {
  Tooltip,
  TooltipPanel,
  TooltipTrigger,
} from "@daodao/ui/components/animate-ui/components/base/tooltip";
import { Button } from "@daodao/ui/components/button";
import { Plus } from "lucide-react";

interface AddTaskFABProps {
  onAddTask?: () => void;
}

export const AddTaskFAB = ({ onAddTask }: AddTaskFABProps) => {
  const handleClick = () => {
    onAddTask?.();
  };

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="default"
            size="icon"
            className="fixed bottom-20 right-5 md:bottom-15 md:right-15 size-15 z-40"
            onClick={handleClick}
            aria-label="新增任務"
          >
            <Plus className="size-6" />
          </Button>
        }
      />
      <TooltipPanel>
        <p>建立主題實踐</p>
      </TooltipPanel>
    </Tooltip>
  );
};
