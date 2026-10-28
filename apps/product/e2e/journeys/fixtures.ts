import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getEnv, getRequiredEnv } from "@daodao/config";
import {
  type APIRequestContext,
  type BrowserContext,
  test as base,
  expect,
} from "@playwright/test";
import {
  createAsyncCache,
  type FixtureManifest,
  fixtureUser,
  readApiData,
  serviceUrl,
} from "./contracts";
export const urls = {
  product: getEnv("JOURNEY_PRODUCT_URL", "http://127.0.0.1:3001") as string,
  admin: getEnv("JOURNEY_ADMIN_URL", "http://127.0.0.1:5173/admin") as string,
  api: getEnv("JOURNEY_API_URL", "http://127.0.0.1:4000") as string,
};
export const manifest = JSON.parse(
  readFileSync(
    getEnv(
      "JOURNEY_FIXTURES_MANIFEST",
      resolve(__dirname, "../../../../../daodao-storage/scripts/acceptance_fixtures/manifest.json")
    ) as string,
    "utf8"
  )
) as FixtureManifest;
const cachedToken = createAsyncCache<string>();
export async function login(context: BrowserContext, role: string) {
  const user = fixtureUser(manifest, role);
  const token = await cachedToken(`${urls.api}:${user.email}`, async () => {
    const response = await context.request.post(serviceUrl(urls.api, "/api/v1/auth/dev-login"), {
      headers: { "x-dev-login-secret": getRequiredEnv("JOURNEY_DEV_LOGIN_SECRET") },
      data: { email: user.email, mode: "user" },
    });
    expect(response.ok(), `fixture ${role} login`).toBeTruthy();
    const { data } = await response.json();
    expect(data.isTemporary).toBe(false);
    expect(data.user.email).toBe(user.email);
    expect(typeof data.token).toBe("string");
    expect(data.token.length).toBeGreaterThan(0);
    return data.token as string;
  });
  for (const origin of new Set([
    new URL(urls.product).origin,
    new URL(urls.api).origin,
    new URL(urls.admin).origin,
  ])) {
    await context.addCookies([
      {
        name: "auth_token",
        value: token,
        url: origin,
        httpOnly: true,
        sameSite: "Lax",
        secure: origin.startsWith("https:"),
      },
    ]);
  }
  await context.addInitScript(
    ({ origin, token }) => {
      if (location.origin === origin) localStorage.setItem("daodao_admin_token", token);
    },
    { origin: new URL(urls.admin).origin, token }
  );
  return token;
}
export async function api<
  T = { id: number; name: string; title: string; practiceId: string; joinToken: string },
>(request: APIRequestContext, token: string, method: string, path: string, data?: unknown) {
  const response = await request.fetch(serviceUrl(urls.api, path), {
    method,
    headers: { Authorization: `Bearer ${token}`, cookie: `auth_token=${token}` },
    data,
  });
  expect(response.ok(), `${method} ${path}: ${response.status()}`).toBeTruthy();
  return readApiData(response.status(), await response.text()) as T;
}
export const test = base.extend<{ learnerToken: string; evidence: undefined }>({
  evidence: [
    async ({ page }, use, testInfo) => {
      await use(undefined);
      if (!page.isClosed())
        await testInfo.attach("learner-page", {
          body: await page.screenshot({ fullPage: true }),
          contentType: "image/png",
        });
    },
    { auto: true },
  ],
  learnerToken: async ({ context }, use) => {
    await use(await login(context, "learner"));
  },
});
export { expect, serviceUrl };

/** Admin challenges belong to the official organization, unlike #323's private fixture program. */
export async function createChallengeFixtures(
  request: APIRequestContext,
  token: string,
  name: string
) {
  const template = manifest.journeys?.challengeTemplate;
  if (!template)
    throw new Error(
      "Journey manifest needs journeys.challengeTemplate: a dedicated, reusable official-organization template (id and title)"
    );
  const templates = await api<{ id: number; title: string }[]>(
    request,
    token,
    "GET",
    "/api/v1/admin/challenges/templates"
  );
  expect(
    templates.some(
      (entry: { id: number; title: string }) =>
        entry.id === template.id && entry.title === template.title
    ),
    "registered official challenge template must be readable"
  ).toBeTruthy();
  const program = await api(request, token, "POST", "/api/v1/admin/challenges/programs", { name });
  return { program, template };
}

/** Cleanup failures remain test failures, but never replace the original UI assertion. */
export async function cleanup(request: APIRequestContext, token: string, path: string) {
  try {
    await api(request, token, "DELETE", path);
  } catch (error) {
    expect
      .soft(error instanceof Error ? error.message : String(error), `cleanup ${path}`)
      .toBeUndefined();
  }
}
