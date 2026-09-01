import { readE2EEnvironment } from "./future-letter/env";

export default function globalSetup(): void {
  readE2EEnvironment();
}
