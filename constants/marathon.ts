import {
  startOfDay,
  endOfDay,
  differenceInWeeks,
  parseISO,
} from 'date-fns';

const MARATHON_START_DATE = startOfDay(parseISO('2025-02-10'));
const MARATHON_END_DATE = endOfDay(parseISO('2025-07-12'));

const marathonConfig = Object.freeze({
  isMarathonApplyEnabled: false,
  marathonStartDate: MARATHON_START_DATE,
  marathonEndDate: MARATHON_END_DATE,
  getWeekNumber: (date = new Date()) => differenceInWeeks(date, MARATHON_START_DATE) + 1,
});

export default marathonConfig;
