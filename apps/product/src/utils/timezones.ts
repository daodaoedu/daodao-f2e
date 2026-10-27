export const DEFAULT_COHORT_TIMEZONE = "Asia/Taipei";

const COMMON_TIMEZONES = [
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Toronto",
  "America/Vancouver",
  "America/Sao_Paulo",
  "Asia/Dubai",
  "Asia/Hong_Kong",
  "Asia/Jakarta",
  "Asia/Kolkata",
  "Asia/Seoul",
  "Asia/Singapore",
  "Asia/Taipei",
  "Asia/Tokyo",
  "Australia/Perth",
  "Australia/Sydney",
  "Europe/Amsterdam",
  "Europe/Berlin",
  "Europe/London",
  "Europe/Paris",
  "Pacific/Auckland",
  "UTC",
];

function getTimeZoneOptions(): string[] {
  const intlWithTimeZones = Intl as typeof Intl & {
    supportedValuesOf?: (key: "timeZone") => string[];
  };
  const supported = intlWithTimeZones.supportedValuesOf?.("timeZone") ?? COMMON_TIMEZONES;
  return Array.from(new Set(["UTC", DEFAULT_COHORT_TIMEZONE, ...supported])).sort();
}

export const TIME_ZONE_OPTIONS = getTimeZoneOptions();
