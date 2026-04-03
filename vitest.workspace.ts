import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  "packages/shared",
  "packages/api",
  "packages/auth",
  "packages/config",
  "packages/features/*",
]);
