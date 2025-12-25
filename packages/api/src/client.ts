import createClient, { type Middleware } from "openapi-fetch";

import { createStorage, StorageKey } from "@daodao/shared";
import type { paths } from "./types";

export const PREFIX = "dao-dao-server-api" as const;

export const client = createClient<paths>({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
});

const middleware: Middleware = {
  async onRequest(request) {
    if (window === undefined) {
      const headers = await import("next/headers").then((mod) => mod.headers());
      Array.from(headers.entries()).forEach(([key, value]) => {
        if (key.toLowerCase() === "accept-encoding") {
          return;
        }
        request.headers.set(key, value);
      });
    } else {
      const tokenStorage = createStorage(StorageKey.Token);
      const token = tokenStorage.get();
      if (token) {
        request.headers.set("Authorization", `Bearer ${token}`);
      }
    }
    return request;
  },
};

client.use(middleware);
