import { mutate } from "swr";
import { getResourcePathname } from "./core";

export const refetchResource = async () => {
  await mutate((key: unknown) => {
    const pathname = Array.isArray(key) ? key[0] : key;
    return pathname.startsWith(getResourcePathname());
  });
};
