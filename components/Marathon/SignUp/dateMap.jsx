export const ISO_WEEK_DAY_MAP = [
  "2024-01-01T00:00:00.000Z",
  "2024-01-02T00:00:00.000Z",
  "2024-01-03T00:00:00.000Z",
  "2024-01-04T00:00:00.000Z",
  "2024-01-05T00:00:00.000Z",
  "2024-01-06T00:00:00.000Z",
  "2024-01-07T00:00:00.000Z"
];
export const ZH_WEEK_DAY_MAP = [
  "週一",
  "週二",
  "週三",
  "週四",
  "週五",
  "週六",
  "週日"
];
export const ISOToWeekday = (isoDate) => {
  switch (isoDate) {
    case ("2024-01-01T00:00:00.000Z"):
      return "週一";
    case ("2024-01-02T00:00:00.000Z"):
      return "週二";
    case ("2024-01-03T00:00:00.000Z"):
      return "週三";
    case ("2024-01-04T00:00:00.000Z"):
      return "週四";
    case ("2024-01-05T00:00:00.000Z"):
      return "週五";
    case ("2024-01-06T00:00:00.000Z"):
      return "週六";
    case ("2024-01-07T00:00:00.000Z"):
      return "週日";
    default:
      return null;
  }
};

export const weekdayToISO = (weekday) => {
  switch (weekday) {
    case ("週一"):
      return "2024-01-01T00:00:00.000Z";
    case ("週二"):
      return "2024-01-02T00:00:00.000Z";
    case ("週三"):
      return "2024-01-03T00:00:00.000Z";
    case ("週四"):
      return "2024-01-04T00:00:00.000Z";
    case ("週五"):
      return "2024-01-05T00:00:00.000Z";
    case ("週六"):
      return "2024-01-06T00:00:00.000Z";
    case ("週日"):
      return "2024-01-07T00:00:00.000Z";
    default:
      return null;
  }
};
