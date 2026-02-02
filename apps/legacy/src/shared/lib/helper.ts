import { z } from "zod";

export const parseToString = (input?: unknown) => {
  try {
    return z
      .union([z.string(), z.number(), z.boolean()])
      .transform((val) => val.toString())
      .parse(input);
  } catch {
    return null;
  }
};

export const parseToNumber = (input?: unknown) => {
  try {
    return z
      .union([z.number(), z.string().transform(parseFloat)])
      .refine((val) => !Number.isNaN(val), { message: "Invalid number" })
      .parse(input);
  } catch {
    return null;
  }
};

export const parseToArray = <T extends string | number>(input?: unknown): T[] | null => {
  try {
    if (Array.isArray(input)) {
      return input;
    }
    if (input != null) {
      return [input as T];
    }
    return null;
  } catch {
    return null;
  }
};

interface MapItem {
  key?: string;
  value: string;
  label: string;
}

export const mapToTable = (map: MapItem[] = []) =>
  map.reduce((acc, item) => ({ ...acc, [item.key ?? item.value]: item.label }), {});
