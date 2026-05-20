"use client";

import { useTranslations } from "@daodao/i18n";
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
  const t = useTranslations("dashboard");

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
            aria-label={t("fab_add_task")}
          >
            <Plus className="size-6" />
          </Button>
        }
      />
      <TooltipPanel>
        <p>{t("fab_create_practice")}</p>
      </TooltipPanel>
    </Tooltip>
  );
};
