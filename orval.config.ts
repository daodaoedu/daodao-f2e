import { defineConfig } from "orval";

export default defineConfig({
  api: {
    input: {
      target: "./services/openapi.yaml",
      override: {
        transformer: "scripts/orval-transformer/index.js",
      },
    },
    output: {
      mode: "tags",
      client: "swr",
      target: "generated/endpoints",
      schemas: "generated/models",
      mock: true,
      prettier: true,
      override: {
        mutator: {
          path: "services/fetcher.ts",
          name: "fetcher",
        },
      },
    },
  },
  zod: {
    input: {
      target: "./services/openapi.yaml",
      override: {
        transformer: "scripts/orval-transformer/index.js",
      },
    },
    output: {
      mode: "tags",
      client: "zod",
      target: "generated/endpoints",
      fileExtension: ".zod.ts",
      prettier: true,
    },
  },
});
