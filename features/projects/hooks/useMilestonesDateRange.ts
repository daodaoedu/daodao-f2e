import dayjs from "dayjs";
import { useMemo } from "react";
import { useProject } from "@/services/projects";
import { useProjectMilestones } from "./milestone";

export default function useMilestonesDateRange(projectId?: string) {
  const { data: project } = useProject(projectId);
  const { data: milestones } = useProjectMilestones(projectId);

  return useMemo(() => {
    if (!milestones?.length) return {};

    const isVersion2 = project?.version === 2;
    const milestoneStartDate = dayjs(milestones[0].startDate);
    const milestoneEndDate = milestones.reduce((compareEndDate, milestone) => {
      const currentEndDate = dayjs(milestone.endDate);

      return compareEndDate.isAfter(currentEndDate)
        ? compareEndDate
        : currentEndDate;
    }, milestoneStartDate);

    return {
      startDate: milestoneStartDate,
      endDate: milestoneEndDate,
      maxDate: milestoneStartDate.add(1, "year"),
      minDate: isVersion2
        ? milestoneStartDate
        : milestoneEndDate.subtract(1, "year"),
    };
  }, [milestones, project]);
}
