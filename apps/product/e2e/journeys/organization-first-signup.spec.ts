import { randomUUID } from "node:crypto";
import { getEnv, getRequiredEnv } from "@daodao/config";
import { type APIRequestContext, type APIResponse, expect, test } from "@playwright/test";
import { fixtureUser, serviceUrl } from "./contracts";
import { manifest, urls } from "./fixtures";

/**
 * Full application journey in the disposable local stack. Only Google's external
 * authorization/token/profile boundary is controlled; it is not real Google QA.
 * A fixed provider identity deliberately requires a fresh DB on every run.
 */
test.describe.configure({ retries: 0 });

const enabled = getEnv("JOURNEY_FIRST_SIGNUP") === "1";
const recipient = getEnv(
  "JOURNEY_FIRST_SIGNUP_EMAIL",
  "first-signup@journeys.example.test"
) as string;
const subject = getEnv(
  "JOURNEY_FIRST_SIGNUP_SUBJECT",
  "journey-first-signup-google-subject"
) as string;
const mailboxUrl = getEnv("JOURNEY_MAILPIT_URL", "http://127.0.0.1:43143") as string;

function localOrigin(value: string): URL {
  const url = new URL(value);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
  ) {
    throw new Error("First-signup journey accepts only disposable loopback services");
  }
  return url;
}

async function adminCall(
  request: APIRequestContext,
  token: string,
  method: string,
  path: string,
  data?: unknown
) {
  return request.fetch(serviceUrl(urls.api, path), {
    method,
    headers: { Authorization: `Bearer ${token}` },
    data,
  });
}

interface MailSummary {
  ID: string;
  To: { Address: string }[];
}
interface MailMessage {
  HTML?: string;
  Text?: string;
}
interface Invitation {
  id: number;
  status: string;
}
interface Member {
  userId: number;
  role: string;
}

test("first Google-boundary signup accepts an emailed invitation and opens Lighthouse in the same session", async ({
  page,
  context,
  request,
}, testInfo) => {
  test.skip(!enabled, "Requires the explicit disposable first-signup stack");
  test.skip(
    testInfo.project.name !== "desktop",
    "One fixed identity per fresh DB; run desktop once per disposable stack"
  );
  if (getEnv("JOURNEY_MODE") !== "local")
    throw new Error("First-signup journey must never run against shared dev");
  const product = localOrigin(urls.product);
  const api = localOrigin(urls.api);
  localOrigin(mailboxUrl);
  if (!recipient.endsWith("@journeys.example.test"))
    throw new Error("Only synthetic first-signup recipients are supported");
  testInfo.annotations.push({
    type: "provider",
    description: "synthetic external Google boundary; real app, DB, Redis and SMTP",
  });
  testInfo.annotations.push({
    type: "acceptance",
    description: "local engineering E2E; not real Google or formal PM acceptance",
  });

  const observations: Record<string, unknown> = {
    provider: "synthetic Google wire boundary",
    firstSignupSubject: subject,
    viewport: page.viewportSize(),
    startedAt: new Date().toISOString(),
  };
  const owner = fixtureUser(manifest, "owner");
  const secret = getRequiredEnv("JOURNEY_DEV_LOGIN_SECRET");
  const absent = await request.post(serviceUrl(urls.api, "/api/v1/auth/dev-login"), {
    headers: { "x-dev-login-secret": secret },
    data: { email: recipient, mode: "user" },
  });
  expect(absent.status(), "fixed recipient must not be an existing formal user").toBe(404);
  const login = await request.post(serviceUrl(urls.api, "/api/v1/auth/dev-login"), {
    headers: { "x-dev-login-secret": secret },
    data: { email: owner.email, mode: "user" },
  });
  expect(login.status()).toBe(200);
  const adminToken = (await login.json()).data.token as string;
  expect(typeof adminToken).toBe("string");
  const name = `First signup ${randomUUID().slice(0, 8)}`;
  const created = await adminCall(
    request,
    adminToken,
    "POST",
    "/api/v1/lighthouse/admin/organizations",
    {
      name,
      ownerEmail: recipient,
    }
  );
  expect(created.status()).toBe(201);
  const organizationId = (await created.json()).data.id as number;
  expect(Number.isInteger(organizationId)).toBe(true);
  let formalUserUuid: string | undefined;
  try {
    const invitationsPath = `/api/v1/lighthouse/admin/organizations/${organizationId}/invitations`;
    const membersPath = `/api/v1/lighthouse/admin/organizations/${organizationId}/members`;
    const before = await adminCall(request, adminToken, "GET", invitationsPath);
    expect(before.status()).toBe(200);
    const pending = (await before.json()).data as Invitation[];
    expect(pending).toHaveLength(1);
    expect(pending[0]?.status).toBe("pending");
    expect((await (await adminCall(request, adminToken, "GET", membersPath)).json()).data).toEqual(
      []
    );

    let messageId = "";
    await expect
      .poll(
        async () => {
          const response = await request.get(serviceUrl(mailboxUrl, "/api/v1/messages"));
          expect(response.status()).toBe(200);
          const messages = (await response.json()).messages as MailSummary[];
          messageId =
            messages.find((message) => message.To.some((to) => to.Address === recipient))?.ID ?? "";
          return Boolean(messageId);
        },
        { timeout: 30_000, message: "real local SMTP must deliver invitation into owned Mailpit" }
      )
      .toBe(true);
    const delivered = await request.get(serviceUrl(mailboxUrl, `/api/v1/message/${messageId}`));
    expect(delivered.status()).toBe(200);
    const message = (await delivered.json()) as MailMessage;
    const match = `${message.HTML ?? ""}\n${message.Text ?? ""}`.match(
      /https?:\/\/[^\s"'<>]*organization-invitation\?token=[a-f0-9]{64}/
    );
    expect(match, "delivered invitation must contain its actual link").not.toBeNull();
    const invitation = new URL(match?.[0] as string);
    expect(invitation.origin).toBe(product.origin);
    const invitationToken = invitation.searchParams.get("token");
    expect(invitationToken).toMatch(/^[a-f0-9]{64}$/);

    await context.addCookies([{ name: "NEXT_LOCALE", value: "en", url: product.origin }]);
    let providerRequests = 0;
    let unexpectedProviderRequests = 0;
    const callbackObservation: { response?: APIResponse } = {};
    // A provider redirect must never leave this synthetic local test. The
    // browser-level block also covers redirected requests that Playwright routing
    // does not revisit after the initial URL in a redirect chain.
    const network = await context.newCDPSession(page);
    await network.send("Network.enable");
    await network.send("Network.setBlockedURLs", {
      urls: [
        "*://accounts.google.com/*",
        "*://oauth2.googleapis.com/*",
        "*://www.googleapis.com/oauth2/*",
      ],
    });
    await context.route(
      (url) =>
        ["https://accounts.google.com", "https://oauth2.googleapis.com"].includes(url.origin),
      async (route) => {
        unexpectedProviderRequests++;
        await route.abort("blockedbyclient");
      }
    );
    // Playwright routes are called for the first URL in a redirect chain. Fetch
    // the real app initiation without following its provider redirect, preserving
    // its state/Redis/session work; replace only the external provider hop.
    await page.route(
      (url) => url.pathname === "/api/v1/auth/google",
      async (route) => {
        expect(route.request().isNavigationRequest()).toBe(true);
        expect(new URL(route.request().url()).origin).toBe(api.origin);
        const initiated = await route.fetch({ maxRedirects: 0 });
        expect(initiated.status()).toBe(302);
        const location = initiated.headers().location;
        expect(location).toBeTruthy();
        const authorization = new URL(location as string);
        expect(authorization.origin).toBe("https://accounts.google.com");
        const redirect = authorization.searchParams.get("redirect_uri");
        expect(redirect).toBe(`${api.origin}/api/v1/auth/google/callback`);
        expect(authorization.searchParams.get("response_type")).toBe("code");
        expect(authorization.searchParams.get("client_id")).toBe("isolated-first-signup-client");
        const state = authorization.searchParams.get("state");
        expect(state).toBeTruthy();
        const stateData = JSON.parse(Buffer.from(state as string, "base64url").toString()) as {
          redirectUrl: string;
          nonce: string;
        };
        expect(stateData.redirectUrl).toBe("/en/organization-invitation");
        expect(stateData.nonce).toBeTruthy();
        expect(JSON.stringify(stateData)).not.toContain(invitationToken);
        providerRequests++;
        const callback = new URL(redirect as string);
        callback.searchParams.set("code", "journey-first-signup");
        callback.searchParams.set("state", state as string);
        // Keep the real callback, cookies and nonce validation, but inspect its
        // original response before browser interception can follow the redirect.
        const completed = await context.request.get(callback.toString(), { maxRedirects: 0 });
        callbackObservation.response = completed;
        await route.fulfill({ response: completed });
      }
    );
    await page.goto(invitation.toString());
    await expect(page).toHaveURL(`${product.origin}/en/organization-invitation`);
    expect(new URL(page.url()).searchParams.has("token")).toBe(false);
    await page
      .getByRole("button", { name: "Sign in or register to continue", exact: true })
      .click();
    await page.getByRole("button", { name: "Sign in with Google account", exact: true }).click();
    await expect(page).toHaveURL(
      /\/en\/auth\/onboarding\?redirect=%2Fen%2Forganization-invitation$/
    );
    await expect(
      page.getByRole("heading", { name: "Personal Information", exact: true })
    ).toBeVisible();
    expect(providerRequests).toBe(1);
    expect(unexpectedProviderRequests, "external provider navigation must remain blocked").toBe(0);
    const callback = callbackObservation.response;
    if (!callback) throw new Error("The real OAuth callback was not completed");
    expect(callback.status(), "OAuth callback redirects to the product").toBe(302);
    const callbackLocation = callback.headers().location;
    expect(callbackLocation, "OAuth callback must provide its product redirect").toBeTruthy();
    const callbackUrl = new URL(callbackLocation as string);
    expect(callbackUrl.origin).toBe(product.origin);
    expect(callbackUrl.pathname).toBe("/auth/callback");
    expect(
      callbackUrl.searchParams.get("isNewUser"),
      "callback must identify an actual new app identity"
    ).toBe("true");
    const temporary = await context.request.get(serviceUrl(urls.api, "/api/v1/auth/me"));
    expect(temporary.status()).toBe(200);
    expect((await temporary.json()).data.isTemporary).toBe(true);
    const premature = await context.request.post(
      serviceUrl(urls.api, "/api/v1/lighthouse/organization-invitations/accept"),
      {
        data: { token: invitationToken },
      }
    );
    expect(premature.status()).toBe(401);
    expect((await (await adminCall(request, adminToken, "GET", membersPath)).json()).data).toEqual(
      []
    );

    await expect(page.locator('input[name="email"]')).toHaveValue(recipient);
    await page.getByPlaceholder("Select your birthday").click();
    await page.getByRole("combobox", { name: "Choose the Year" }).selectOption("1990");
    await page.getByRole("combobox", { name: "Choose the Month" }).selectOption("0");
    await page.getByRole("button", { name: "Tuesday, January 2nd, 1990", exact: true }).click();
    await page
      .getByPlaceholder("How would you like others to call you")
      .fill(`First signup ${randomUUID().slice(0, 8)}`);
    await page
      .getByPlaceholder("Set your unique username")
      .fill(`fs${randomUUID().replace(/-/g, "").slice(0, 10)}`);
    await page.getByPlaceholder("Introduce yourself in one sentence").fill("首次註冊與邀請驗收");
    await page.getByRole("button", { name: "Next", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Professional & Interest Fields", exact: true })
    ).toBeVisible();
    await page.getByText("Technology ICT", { exact: true }).click();
    await page.getByText("Nature Environment", { exact: true }).click();
    await page.getByRole("button", { name: "Next", exact: true }).click();
    await page.getByRole("radio", { name: "Instagram", exact: true }).check();
    const signupResponse = page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        new URL(response.url()).pathname === "/api/v1/users/me"
    );
    await page.getByRole("button", { name: "Complete Registration", exact: true }).click();
    expect((await signupResponse).status()).toBe(201);
    await page
      .getByRole("button", { name: "Continue to your organization invitation", exact: true })
      .click();
    await expect(page).toHaveURL(`${product.origin}/en/organization-invitation`);
    const formal = await context.request.get(serviceUrl(urls.api, "/api/v1/auth/me"));
    expect(formal.status()).toBe(200);
    const formalIdentity = (await formal.json()).data;
    expect(formalIdentity.isTemporary).toBe(false);
    formalUserUuid = formalIdentity.user.id;
    const authCookie = (await context.cookies(api.origin)).find(
      (cookie) => cookie.name === "auth_token"
    );
    expect(authCookie).toBeTruthy();
    const claims = JSON.parse(
      Buffer.from((authCookie?.value as string).split(".")[1] as string, "base64url").toString()
    ) as { id: number; _id: string; isTemp: boolean };
    expect(claims._id).toBe(formalUserUuid);
    expect(claims.isTemp).toBe(false);
    expect(Number.isInteger(claims.id)).toBe(true);
    const acceptedResponse = page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        new URL(response.url()).pathname === "/api/v1/lighthouse/organization-invitations/accept"
    );
    await page.getByRole("button", { name: "Accept invitation", exact: true }).click();
    const accepted = await acceptedResponse;
    expect(accepted.status()).toBe(200);
    expect((await accepted.json()).data.status).toBe("accepted");
    await expect(
      page.getByRole("heading", { name: "You have joined the organization", exact: true })
    ).toBeVisible();
    await expect(page.getByText(name, { exact: true })).toBeVisible();
    const members = (await (await adminCall(request, adminToken, "GET", membersPath)).json())
      .data as Member[];
    expect(members).toEqual([expect.objectContaining({ userId: claims.id, role: "owner" })]);
    const finalInvitations = (
      await (await adminCall(request, adminToken, "GET", invitationsPath)).json()
    ).data as Invitation[];
    expect(finalInvitations).toEqual([
      expect.objectContaining({ id: pending[0]?.id, status: "accepted" }),
    ]);
    await page.getByRole("link", { name: "Open Lighthouse", exact: true }).click();
    await expect(page).toHaveURL(`${product.origin}/en/lighthouse/o/${organizationId}`);
    // A single organization renders its name without a switcher.
    await expect(page.getByText(name, { exact: true })).toBeVisible();
    await page.getByRole("link", { name: "Organization settings", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Organization settings", exact: true })
    ).toBeVisible();
    await expect(page.getByLabel("Organization name", { exact: true })).toHaveValue(name);
    const list = await context.request.get(
      serviceUrl(urls.api, "/api/v1/lighthouse/organizations")
    );
    expect(list.status()).toBe(200);
    expect((await list.json()).data).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: organizationId })])
    );
    const detail = await context.request.get(
      serviceUrl(urls.api, `/api/v1/lighthouse/organizations/${organizationId}`)
    );
    expect(detail.status()).toBe(200);
    expect((await detail.json()).data.id).toBe(organizationId);
    observations.completedAt = new Date().toISOString();
    observations.organizationId = organizationId;
    observations.signup = 201;
    observations.accept = 200;
    observations.lighthouseList = list.status();
    observations.lighthouseDetail = detail.status();
    observations.temporaryDenied = premature.status();
    observations.formalIdentityConsistent = true;
    await testInfo.attach("first-signup-journey", {
      body: JSON.stringify(observations, null, 2),
      contentType: "application/json",
    });
    await testInfo.attach("new-owner-settings", {
      body: await page.screenshot({ fullPage: true }),
      contentType: "image/png",
    });
  } finally {
    // These writes only affect this run's new resources; stack teardown destroys its DB.
    if (formalUserUuid) {
      const unsubscribe = await context.request.put(serviceUrl(urls.api, "/api/v1/users/me"), {
        multipart: { isSubscribeEmail: "false" },
      });
      expect.soft(unsubscribe.ok(), "new test user unsubscribed").toBe(true);
    }
    const suspended = await adminCall(
      request,
      adminToken,
      "PATCH",
      `/api/v1/lighthouse/admin/organizations/${organizationId}`,
      { status: "suspended" }
    );
    expect.soft(suspended.status(), "owned organization suspended before stack teardown").toBe(200);
  }
});
