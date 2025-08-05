import { defineConfig } from "orval";

export default defineConfig({
  daodao: {
    input: {
      target: "./services/openapi.yaml",
    },
    output: {
      mode: "tags",
      target: "services/generated",
      schemas: "services/generated/schemas",
      client: "swr",
      mock: false,
      clean: true,
      prettier: true,
      override: {
        mutator: {
          path: "services/fetcher.ts",
          name: "fetcher",
        },
      },
    },
  },
});
