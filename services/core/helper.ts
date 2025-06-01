import { z } from "zod";

export const parseToString = (input?: unknown, isEncode = true) => {
  try {
    return isEncode
      ? encodeURIComponent(z.string().parse(input))
      : z.string().parse(input);
  } catch {
    return null;
  }
};

export const parseToUUID = (input?: unknown) => {
  try {
    return z.string().uuid().parse(input);
  } catch {
    return null;
  }
};

export const parseToNumber = (input?: unknown) => {
  try {
    return z
      .number()
      .int()
      .or(z.string().regex(/^\d*$/))
      .transform((val) => parseInt(val.toString(), 10))
      .parse(input);
  } catch {
    return null;
  }
};

export const parseToArray = <T extends string | number>(
  input?: unknown
): T[] | null => {
  try {
    return Array.isArray(input) ? input : [input];
  } catch {
    return null;
  }
};
