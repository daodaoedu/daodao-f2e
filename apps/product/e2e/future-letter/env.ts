import { getEnv, getRequiredEnv } from "@daodao/config";

export interface IE2EEnvironment {
  productBaseUrl: string;
  apiBaseUrl: string;
  databaseUrl: string;
  redisUrl: string;
  ownerToken: string;
  otherUserToken: string;
  ownerUserId: number;
  otherUserId: number;
  practiceId?: string;
  practiceTitle?: string;
  serverLogPath?: string;
  workerLogPath?: string;
}

function parsePositiveInteger(name: string): number {
  const value = Number(getRequiredEnv(name));
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }
  return value;
}

function isLoopbackHost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
}

function assertLocalOrExplicitlyAllowed(
  name: string,
  rawUrl: string,
  allowRemoteEnvironmentName: string
): URL {
  const url = new URL(rawUrl);
  const allowRemote = getEnv(allowRemoteEnvironmentName) === "true";
  if (!isLoopbackHost(url.hostname) && !allowRemote) {
    throw new Error(
      `${name} must use a loopback host unless ${allowRemoteEnvironmentName}=true is explicitly set`
    );
  }
  return url;
}

function assertIsolatedDatabase(databaseUrl: string): void {
  const url = assertLocalOrExplicitlyAllowed(
    "E2E_TEST_DATABASE_URL",
    databaseUrl,
    "E2E_ALLOW_REMOTE_TEST_DATABASE"
  );
  const databaseName = url.pathname.slice(1);
  const isTestDatabase = /(^|[_-])(test|e2e)([_-]|$)/i.test(databaseName);

  if (!isTestDatabase) {
    throw new Error(
      "E2E_TEST_DATABASE_URL database name must contain a dedicated test/e2e segment"
    );
  }
}

function assertIsolatedRedis(redisUrl: string): void {
  const url = assertLocalOrExplicitlyAllowed(
    "E2E_REDIS_URL",
    redisUrl,
    "E2E_ALLOW_REMOTE_TEST_REDIS"
  );
  const databaseNumber = Number(url.pathname.slice(1));
  if (!Number.isInteger(databaseNumber) || databaseNumber <= 0) {
    throw new Error("E2E_REDIS_URL must select a non-zero dedicated Redis database");
  }
}

export function readE2EEnvironment(): IE2EEnvironment {
  const productBaseUrl = getEnv("E2E_PRODUCT_BASE_URL", "http://127.0.0.1:3001") as string;
  const apiBaseUrl = getEnv("E2E_API_BASE_URL", "http://127.0.0.1:4000") as string;
  const databaseUrl = getRequiredEnv("E2E_TEST_DATABASE_URL");
  const redisUrl = getRequiredEnv("E2E_REDIS_URL");
  const ownerUserId = parsePositiveInteger("E2E_USER_A_ID");
  const otherUserId = parsePositiveInteger("E2E_USER_B_ID");
  if (ownerUserId === otherUserId) {
    throw new Error("E2E_USER_A_ID and E2E_USER_B_ID must identify different users");
  }

  assertLocalOrExplicitlyAllowed(
    "E2E_PRODUCT_BASE_URL",
    productBaseUrl,
    "E2E_ALLOW_REMOTE_PRODUCT"
  );
  assertLocalOrExplicitlyAllowed("E2E_API_BASE_URL", apiBaseUrl, "E2E_ALLOW_REMOTE_API");
  assertIsolatedDatabase(databaseUrl);
  assertIsolatedRedis(redisUrl);

  return {
    productBaseUrl,
    apiBaseUrl,
    databaseUrl,
    redisUrl,
    ownerToken: getRequiredEnv("E2E_USER_A_TOKEN"),
    otherUserToken: getRequiredEnv("E2E_USER_B_TOKEN"),
    ownerUserId,
    otherUserId,
    practiceId: getEnv("E2E_PRACTICE_ID"),
    practiceTitle: getEnv("E2E_PRACTICE_TITLE"),
    serverLogPath: getEnv("E2E_SERVER_LOG_PATH"),
    workerLogPath: getEnv("E2E_WORKER_LOG_PATH"),
  };
}

export function requirePracticeFixture(env: IE2EEnvironment): {
  id: string;
  title: string;
} {
  if (!env.practiceId || !env.practiceTitle) {
    throw new Error(
      "Practice snapshot E2E requires E2E_PRACTICE_ID and E2E_PRACTICE_TITLE for a disposable practice owned by user A"
    );
  }
  return { id: env.practiceId, title: env.practiceTitle };
}
