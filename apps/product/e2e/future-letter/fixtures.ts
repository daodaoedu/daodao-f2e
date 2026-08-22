import { readFile } from "node:fs/promises";
import {
  type APIRequestContext,
  type APIResponse,
  test as base,
  request as createRequestContext,
  expect,
} from "@playwright/test";
import type { ConnectionOptions } from "bullmq";
import { Queue } from "bullmq";
import { Client } from "pg";
import { type IE2EEnvironment, readE2EEnvironment } from "./env";

export interface IFutureLetter {
  id: string;
  currentSelf?: string | null;
  message?: string | null;
  status: "draft" | "scheduled" | "delivered" | "deleted";
  deliverAt: string | null;
  sentAt?: string | null;
  deliveredAt: string | null;
  openedAt?: string | null;
  practice?: { id: string | null; title: string } | null;
}

interface ICreateDraftInput {
  currentSelf?: string;
  message?: string;
  deliverAt?: string;
  practiceId?: string | null;
}

interface INetworkEvidence {
  method: string;
  status: number;
  url: string;
  body?: string;
  captureError?: string;
}

interface INetworkEvidenceCollector {
  entries: INetworkEvidence[];
  settle: () => Promise<void>;
}

function redisConnectionFromUrl(redisUrl: string): ConnectionOptions {
  const url = new URL(redisUrl);
  return {
    host: url.hostname,
    port: Number(url.port || 6379),
    username: url.username || undefined,
    password: url.password || undefined,
    db: Number(url.pathname.slice(1)),
    tls: url.protocol === "rediss:" ? {} : undefined,
  };
}

async function responseJson<T>(response: APIResponse): Promise<T> {
  if (!response.ok()) {
    throw new Error(`${response.url()} failed with ${response.status()}: ${await response.text()}`);
  }
  const body = (await response.json()) as { data?: T | { data?: T } };
  const nested =
    body.data && typeof body.data === "object" && "data" in body.data ? body.data.data : body.data;
  return nested as T;
}

export class FutureLetterApi {
  private readonly createdLetterIds = new Set<string>();

  constructor(
    private readonly context: APIRequestContext,
    private readonly apiBaseUrl: string
  ) {}

  get trackedLetterIds(): string[] {
    return [...this.createdLetterIds];
  }

  track(letterId: string): void {
    this.createdLetterIds.add(letterId);
  }

  async createDraft(data: ICreateDraftInput): Promise<IFutureLetter> {
    const response = await this.context.post(`${this.apiBaseUrl}/api/v1/me/future-letters`, {
      data: { currentSelf: "", message: "", ...data },
    });
    const letter = await responseJson<IFutureLetter>(response);
    this.createdLetterIds.add(letter.id);
    return letter;
  }

  async list(): Promise<IFutureLetter[]> {
    const response = await this.context.get(
      `${this.apiBaseUrl}/api/v1/me/future-letters?limit=100`
    );
    return responseJson<IFutureLetter[]>(response);
  }

  async get(id: string): Promise<{ response: APIResponse; letter?: IFutureLetter }> {
    const response = await this.context.get(`${this.apiBaseUrl}/api/v1/me/future-letters/${id}`);
    if (!response.ok()) return { response };
    return { response, letter: await responseJson<IFutureLetter>(response) };
  }

  async send(id: string, deliverAt: string): Promise<IFutureLetter> {
    const response = await this.context.post(
      `${this.apiBaseUrl}/api/v1/me/future-letters/${id}/send`,
      { data: { deliverAt } }
    );
    return responseJson<IFutureLetter>(response);
  }

  async open(id: string): Promise<IFutureLetter> {
    const response = await this.context.post(
      `${this.apiBaseUrl}/api/v1/me/future-letters/${id}/open`
    );
    return responseJson<IFutureLetter>(response);
  }

  async delete(id: string): Promise<APIResponse> {
    return this.context.delete(`${this.apiBaseUrl}/api/v1/me/future-letters/${id}`);
  }
}

interface IFutureLetterFixtures {
  e2eEnv: IE2EEnvironment;
  ownerApi: FutureLetterApi;
  otherUserApi: FutureLetterApi;
  database: Client;
  futureLetterQueue: Queue;
  advanceLetterToDelivery: (letterId: string) => Promise<void>;
  getDeliveryJobId: (letterId: string) => Promise<string>;
  assertDeliveryJobMissing: (jobId: string) => Promise<void>;
  assertNoDeliveryNotification: (letterId: string) => Promise<void>;
  networkEvidence: INetworkEvidenceCollector;
  authenticate: undefined;
}

export const test = base.extend<IFutureLetterFixtures>({
  e2eEnv: async ({ baseURL: _baseURL }, use) => {
    await use(readE2EEnvironment());
  },

  authenticate: [
    async ({ context, e2eEnv }, use) => {
      // The homepage also loads the optional AI feed service, which is outside
      // this feature's test stack. Keep that unrelated dependency deterministic.
      await context.route("http://localhost:8002/api/v1/feed**", async (route) => {
        await route.fulfill({ status: 200, contentType: "application/json", body: '{"data":[]}' });
      });
      const approvedApiOrigin = new URL(e2eEnv.apiBaseUrl).origin;
      await context.route(/\/api\/v1\/me\/(future-letters|timeline)(?:[/?]|$)/, async (route) => {
        const requestOrigin = new URL(route.request().url()).origin;
        if (requestOrigin !== approvedApiOrigin) {
          await route.abort("blockedbyclient");
          throw new Error(
            `Blocked Future Letter E2E request to unapproved API origin ${requestOrigin}; expected ${approvedApiOrigin}`
          );
        }
        await route.continue();
      });
      const domain = new URL(e2eEnv.productBaseUrl).hostname;
      await context.addCookies([
        {
          name: "auth_token",
          value: e2eEnv.ownerToken,
          domain,
          path: "/",
          httpOnly: true,
          secure: e2eEnv.productBaseUrl.startsWith("https://"),
          sameSite: "Lax",
        },
      ]);
      await use(undefined);
    },
    { auto: true },
  ],

  database: async ({ e2eEnv }, use) => {
    const database = new Client({ connectionString: e2eEnv.databaseUrl });
    await database.connect();
    await use(database);
    await database.end();
  },

  futureLetterQueue: async ({ e2eEnv }, use) => {
    const queue = new Queue("future-letter", {
      connection: redisConnectionFromUrl(e2eEnv.redisUrl),
    });
    await use(queue);
    await queue.close();
  },

  ownerApi: async ({ e2eEnv, database, futureLetterQueue }, use) => {
    const initialRows = await database.query<{ external_id: string }>(
      "SELECT external_id::text FROM future_letters WHERE user_id = $1",
      [e2eEnv.ownerUserId]
    );
    const initialLetterIds = new Set(initialRows.rows.map((row) => row.external_id));
    const context = await createRequestContext.newContext({
      extraHTTPHeaders: { cookie: `auth_token=${e2eEnv.ownerToken}` },
    });
    const api = new FutureLetterApi(context, e2eEnv.apiBaseUrl);
    await use(api);

    const finalRows = await database.query<{ external_id: string }>(
      "SELECT external_id::text FROM future_letters WHERE user_id = $1",
      [e2eEnv.ownerUserId]
    );
    for (const row of finalRows.rows) {
      if (!initialLetterIds.has(row.external_id)) api.track(row.external_id);
    }
    const ids = api.trackedLetterIds;
    if (ids.length > 0) {
      const rows = await database.query<{ id: number }>(
        "SELECT id FROM future_letters WHERE user_id = $1 AND external_id::text = ANY($2::text[])",
        [e2eEnv.ownerUserId, ids]
      );
      for (const row of rows.rows) {
        await futureLetterQueue.remove(`future-letter-${row.id}`).catch(() => undefined);
      }
      const internalIds = rows.rows.map((row) => row.id);
      if (internalIds.length > 0) {
        await database.query(
          "DELETE FROM notifications WHERE recipient_id = $1 AND entity_type = 'future_letter' AND entity_id = ANY($2::int[])",
          [e2eEnv.ownerUserId, internalIds]
        );
        await database.query(
          "DELETE FROM notification_events WHERE recipient_id = $1 AND entity_type = 'future_letter' AND entity_id = ANY($2::int[])",
          [e2eEnv.ownerUserId, internalIds]
        );
      }
      await database.query(
        "DELETE FROM future_letters WHERE user_id = $1 AND external_id::text = ANY($2::text[])",
        [e2eEnv.ownerUserId, ids]
      );
    }
    await context.dispose();
  },

  otherUserApi: async ({ e2eEnv }, use) => {
    const context = await createRequestContext.newContext({
      extraHTTPHeaders: { cookie: `auth_token=${e2eEnv.otherUserToken}` },
    });
    await use(new FutureLetterApi(context, e2eEnv.apiBaseUrl));
    await context.dispose();
  },

  advanceLetterToDelivery: async ({ database, e2eEnv, futureLetterQueue, ownerApi }, use) => {
    await use(async (letterId: string) => {
      const result = await database.query<{ id: number }>(
        `UPDATE future_letters
            SET deliver_at = NOW() - INTERVAL '1 second', updated_at = NOW()
          WHERE external_id::text = $1 AND user_id = $2 AND status = 'scheduled'
          RETURNING id`,
        [letterId, e2eEnv.ownerUserId]
      );
      const internalId = result.rows[0]?.id;
      if (!internalId) throw new Error(`Unable to advance scheduled test letter ${letterId}`);

      await futureLetterQueue.remove(`future-letter-${internalId}`).catch(() => undefined);
      await futureLetterQueue.add(
        "deliver",
        { letterId: internalId },
        { jobId: `future-letter-${internalId}`, delay: 0 }
      );

      await expect
        .poll(async () => (await ownerApi.get(letterId)).letter?.status, {
          message: "real future-letter worker did not deliver the advanced test row",
          timeout: 30_000,
        })
        .toBe("delivered");
    });
  },

  getDeliveryJobId: async ({ database, e2eEnv }, use) => {
    await use(async (letterId: string) => {
      const result = await database.query<{ id: number }>(
        "SELECT id FROM future_letters WHERE external_id::text = $1 AND user_id = $2",
        [letterId, e2eEnv.ownerUserId]
      );
      const internalId = result.rows[0]?.id;
      if (!internalId) throw new Error(`Unable to resolve delivery job for ${letterId}`);
      return `future-letter-${internalId}`;
    });
  },

  assertDeliveryJobMissing: async ({ futureLetterQueue }, use) => {
    await use(async (jobId: string) => {
      await expect.poll(async () => futureLetterQueue.getJob(jobId)).toBeFalsy();
    });
  },

  assertNoDeliveryNotification: async ({ database, e2eEnv }, use) => {
    await use(async (letterId: string) => {
      const result = await database.query<{ notification_count: string; event_count: string }>(
        `SELECT
           (SELECT COUNT(*) FROM notifications
             WHERE recipient_id = $1 AND entity_type = 'future_letter' AND entity_id = letter.id)::text AS notification_count,
           (SELECT COUNT(*) FROM notification_events
             WHERE recipient_id = $1 AND entity_type = 'future_letter' AND entity_id = letter.id)::text AS event_count
         FROM future_letters AS letter
         WHERE letter.user_id = $1 AND letter.external_id::text = $2`,
        [e2eEnv.ownerUserId, letterId]
      );
      const counts = result.rows[0];
      if (!counts) throw new Error(`Unable to inspect notification state for ${letterId}`);
      expect(
        Number(counts.notification_count),
        "timeline-only delivery created a notification"
      ).toBe(0);
      expect(
        Number(counts.event_count),
        "timeline-only delivery created a notification event"
      ).toBe(0);
    });
  },

  networkEvidence: [
    async ({ page, e2eEnv, authenticate: _authenticate }, use, testInfo) => {
      const evidence: INetworkEvidence[] = [];
      const pendingCaptures = new Set<Promise<void>>();
      const browserErrors: string[] = [];
      let expectedCleanAccountQuiz404s = 0;
      page.on("pageerror", (error) => browserErrors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") browserErrors.push(message.text());
      });
      page.on("response", (response) => {
        const url = new URL(response.url());
        if (url.pathname === "/api/v1/quiz/latest" && response.status() === 404) {
          const verifyExpectedQuiz404 = (async () => {
            try {
              const body = (await response.json()) as {
                error?: { message?: string };
              };
              if (body.error?.message === "尚無測驗結果") {
                expectedCleanAccountQuiz404s += 1;
              }
            } catch {
              // An unreadable or unexpected 404 remains visible as a browser error below.
            }
          })();
          pendingCaptures.add(verifyExpectedQuiz404);
          void verifyExpectedQuiz404.finally(() => pendingCaptures.delete(verifyExpectedQuiz404));
        }
        if (!/(future-letters|\/timeline)/.test(response.url())) return;
        const capture = (async () => {
          let body: string | undefined;
          try {
            body = await response.text();
          } catch (error) {
            body = undefined;
            evidence.push({
              method: response.request().method(),
              status: response.status(),
              url: response.url(),
              captureError: error instanceof Error ? error.message : String(error),
            });
            return;
          }
          evidence.push({
            method: response.request().method(),
            status: response.status(),
            url: response.url(),
            body,
          });
        })();
        pendingCaptures.add(capture);
        void capture.finally(() => pendingCaptures.delete(capture));
      });

      const settle = async () => {
        while (pendingCaptures.size > 0) {
          await Promise.all([...pendingCaptures]);
        }
      };
      await use({ entries: evidence, settle });
      await settle();
      await testInfo.attach("network-evidence.json", {
        body: JSON.stringify(evidence, null, 2),
        contentType: "application/json",
      });
      await testInfo.attach("browser-errors.json", {
        body: JSON.stringify(browserErrors, null, 2),
        contentType: "application/json",
      });

      for (const [name, logPath] of [
        ["server.log", e2eEnv.serverLogPath],
        ["worker.log", e2eEnv.workerLogPath],
      ] as const) {
        if (!logPath) continue;
        const log = await readFile(logPath, "utf8").catch(() => "log file unavailable");
        await testInfo.attach(name, { body: log.slice(-100_000), contentType: "text/plain" });
      }

      const unexpectedBrowserErrors = [...browserErrors];
      const expectedQuiz404ConsoleError =
        "Failed to load resource: the server responded with a status of 404 (Not Found)";
      for (let index = 0; index < expectedCleanAccountQuiz404s; index += 1) {
        const errorIndex = unexpectedBrowserErrors.indexOf(expectedQuiz404ConsoleError);
        if (errorIndex === -1) break;
        unexpectedBrowserErrors.splice(errorIndex, 1);
      }
      expect(unexpectedBrowserErrors, "browser console/page errors").toEqual([]);
    },
    { auto: true },
  ],
});

export { expect } from "@playwright/test";
