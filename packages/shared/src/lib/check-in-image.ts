export const CHECK_IN_MAX_IMAGES = 3;

export const CHECK_IN_IMAGE_ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export type CheckInImageType = (typeof CHECK_IN_IMAGE_ACCEPTED_TYPES)[number];
