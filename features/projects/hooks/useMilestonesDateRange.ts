import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useProjectMilestones } from '@/services/modules/projects';

export default function useMilestonesDateRange(projectId?: string) {
  const { data: milestones } = useProjectMilestones(projectId);

  return useMemo(() => {
    if (!milestones?.length) return {};

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
      maxDate: milestoneStartDate.add(1, 'year'),
      minDate: milestoneEndDate.subtract(1, 'year'),
    };
  }, [milestones]);
}
