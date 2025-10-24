import { defineConfig } from "orval";

export default defineConfig({
  client: {
    input: {
      target: "./services/openapi.yaml",
    },
    output: {
      mode: "tags",
      client: "swr",
      target: "generated/api",
      schemas: "generated/models",
      clean: true,
      fileExtension: ".client.ts",
      override: {
        mutator: {
          path: "shared/api/client-fetcher.ts",
          name: "clientFetcher",
        },
      },
    },
  },
  server: {
    input: {
      target: "./services/openapi.yaml",
    },
    output: {
      mode: "tags",
      client: "fetch",
      fileExtension: ".server.ts",
      target: "generated/api",
      schemas: "generated/models",
      override: {
        mutator: {
          path: "shared/api/server-fetcher.ts",
          name: "serverFetcher",
        },
      },
    },
  },
});
