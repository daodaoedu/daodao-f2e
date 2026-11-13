import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  "packages/shared",
  "packages/blog-content",
  "packages/api",
  "packages/auth",
  "packages/config",
  "packages/features/*",
  "apps/product",
]);
