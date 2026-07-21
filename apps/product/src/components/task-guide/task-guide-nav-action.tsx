"use client";

import { useAuth } from "@daodao/auth";
import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { cn } from "@daodao/ui/lib/utils";
import { ListChecks } from "lucide-react";
import { usePathname } from "next/navigation";
import { useOnboardingProgress } from "./onboarding-progress-context";
import { isTaskGuideAllowedPath } from "./task-guide-availability";

export function TaskGuideNavAction() {
  const { isAuthenticated, isTemporary } = useAuth();
  const { taskList, completedTasks, isLoading, isTaskGuideExpanded, openTaskGuide } =
    useOnboardingProgress();
  const pathname = usePathname();
  const t = useTranslations("onboarding.taskGuide");

  const hasIncompleteTasks = taskList.length > 0 && completedTasks < taskList.length;
  const shouldShow =
    isAuthenticated &&
    !isTemporary &&
    !isLoading &&
    hasIncompleteTasks &&
    isTaskGuideAllowedPath(pathname);

  if (!shouldShow) return <li className="flex flex-1 justify-center" />;

  return (
    <li className="flex flex-1 justify-center">
      <Button
        variant="ghost"
        size="icon"
        onClick={openTaskGuide}
        className={cn(
          "size-11 rounded-xl text-light-gray hover:bg-logo-cyan/10",
          isTaskGuideExpanded && "bg-logo-cyan/10 text-logo-cyan"
        )}
        aria-label={t("ariaOpen")}
        aria-expanded={isTaskGuideExpanded}
      >
        <ListChecks className="size-7" />
      </Button>
    </li>
  );
}
