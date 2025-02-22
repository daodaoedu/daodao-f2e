import dayjs from 'dayjs';

const MARATHON_START_DATE = dayjs('2025-02-09').startOf('day');
const MARATHON_END_DATE = dayjs('2025-07-12').endOf('day');

const marathonConfig = Object.freeze({
  isMarathonApplyEnabled: false,
  marathonStartDate: MARATHON_START_DATE,
  marathonEndDate: MARATHON_END_DATE,
  getWeekNumber: (date = dayjs()) => date.diff(MARATHON_START_DATE, 'week') + 1,
});

export default marathonConfig;
