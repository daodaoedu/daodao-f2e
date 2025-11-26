import { addYears, subYears, isAfter } from 'date-fns';
import { useMemo } from 'react';
import { useProject } from '@/services/projects';
import { useProjectMilestones } from './milestone';

export default function useMilestonesDateRange(projectId?: string) {
  const { data: project } = useProject(projectId);
  const { data: milestones } = useProjectMilestones(projectId);

  return useMemo(() => {
    if (!milestones?.length) {
      return {} as {
        startDate?: Date;
        endDate?: Date;
        maxDate?: Date;
        minDate?: Date;
      };
    }

    const isVersion2 = project?.version === 2;

    const milestoneStartDate = new Date(milestones[0]?.startDate || new Date());
    const milestoneEndDate = milestones.reduce<Date>((compareEndDate, milestone) => {
      const currentEndDate = new Date(milestone.endDate || compareEndDate);
      return isAfter(compareEndDate, currentEndDate) ? compareEndDate : currentEndDate;
    }, milestoneStartDate);

    return {
      startDate: milestoneStartDate,
      endDate: milestoneEndDate,
      maxDate: addYears(milestoneStartDate, 1),
      minDate: isVersion2 ? milestoneStartDate : subYears(milestoneEndDate, 1),
    };
  }, [milestones, project]);
}
