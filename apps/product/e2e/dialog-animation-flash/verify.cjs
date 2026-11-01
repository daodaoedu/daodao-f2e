const { chromium } = require("@playwright/test");
const fs = require("node:fs");
const cp = require("node:child_process");
async function main() {
  for (const key of [
    "QA_CREDENTIAL_FILE",
    "BASE_URL",
    "FOCUS_PATH",
    "COMPOSE_LABEL",
    "REPORT_PATH",
  ])
    if (!process.env[key]) throw new Error(`Missing ${key}`);
  const browser = await chromium.launch({ headless: true, channel: "chrome" });
  const results = [];
  try {
    const context = await browser.newContext({
      viewport: process.env.MOBILE ? { width: 390, height: 844 } : { width: 1440, height: 1000 },
      reducedMotion: process.env.REDUCED_MOTION ? "reduce" : "no-preference",
    });
    const token = JSON.parse(fs.readFileSync(process.env.QA_CREDENTIAL_FILE, "utf8"))[
      process.env.QA_ACTOR_KEY || "qaCoach"
    ].token;
    await context.addCookies([
      {
        name: "auth_token",
        value: token,
        domain: new URL(process.env.BASE_URL).hostname,
        path: "/",
        httpOnly: true,
      },
    ]);
    await context.route("**/api/v1/**", (route) => {
      if (["GET", "OPTIONS"].includes(route.request().method())) return route.continue();
      return route.abort("blockedbyclient");
    });
    const page = await context.newPage();
    page.setDefaultTimeout(15000);
    page.setDefaultNavigationTimeout(30000);
    await page.goto(new URL(process.env.FOCUS_PATH, process.env.BASE_URL).href);
    await page.getByRole("tab", { name: /Worth celebrating/ }).click();
    const compose = page.getByRole("button", { name: process.env.COMPOSE_LABEL, exact: true });
    await compose.waitFor();
    for (const kind of ["compose", "history", "compose", "history"]) {
      await page.evaluate(() => {
        window.__frames = [];
        window.__record = true;
        let next = 0;
        const ids = new WeakMap();
        const frame = (t) => {
          if (!window.__record) return;
          window.__frames.push({
            t,
            nodes: [
              ...document.querySelectorAll(
                '[data-slot="dialog-content"],[data-slot="dialog-overlay"]'
              ),
            ].map((e) => {
              if (!ids.has(e)) ids.set(e, ++next);
              const s = getComputedStyle(e);
              return {
                id: ids.get(e),
                slot: e.dataset.slot,
                state: e.dataset.state,
                opacity: Number(s.opacity),
                transform: s.transform,
              };
            }),
          });
          requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
      });
      if (kind === "compose") await compose.click();
      else
        await page
          .getByRole("tabpanel")
          .getByRole("button")
          .filter({ hasText: /^\s*\d+\s*$/ })
          .first()
          .click();
      await page.getByRole("dialog").waitFor();
      await page.waitForTimeout(2200);
      const frames = await page.evaluate(() => {
        window.__record = false;
        return window.__frames;
      });
      if (
        !frames.some((frame) =>
          ["dialog-content", "dialog-overlay"].every((slot) =>
            frame.nodes.some(
              (node) => node.slot === slot && node.state === "open" && node.opacity >= 0.98
            )
          )
        )
      )
        throw new Error(`${kind} dialog and overlay never became visible together`);
      const regressions = [];
      let visible = false;
      const identities = new Map();
      for (const frame of frames) {
        const content = frame.nodes.find((node) => node.slot === "dialog-content");
        if (content?.opacity >= 0.98) visible = true;
        if (!visible) continue;
        for (const slot of ["dialog-content", "dialog-overlay"]) {
          const node = frame.nodes.find((item) => item.slot === slot);
          if (!node || (identities.has(slot) && identities.get(slot) !== node.id)) {
            regressions.push({ t: frame.t, slot, reason: "Open surface disappeared or remounted" });
          }
          if (node && !identities.has(slot)) identities.set(slot, node.id);
        }
      }
      const previous = new Map();
      for (const frame of frames)
        for (const node of frame.nodes) {
          const prev = previous.get(node.id);
          if (
            prev &&
            node.state === "open" &&
            prev.state === "open" &&
            prev.opacity - node.opacity > 0.2
          )
            regressions.push({
              t: frame.t,
              slot: node.slot,
              id: node.id,
              from: prev.opacity,
              to: node.opacity,
            });
          previous.set(node.id, node);
        }
      await page.keyboard.press("Escape");
      await page.getByRole("dialog").waitFor({ state: "detached" });
      results.push({ kind, frames, regressions, closed: true });
    }
    const report = {
      browserVersion: browser.version(),
      viewport: page.viewportSize(),
      reducedMotion: process.env.REDUCED_MOTION ? "reduce" : "no-preference",
      primitiveSha256: require("node:crypto")
        .createHash("sha256")
        .update(
          fs.readFileSync("packages/ui/src/components/animate-ui/primitives/radix/dialog.tsx")
        )
        .digest("hex"),
      head: cp.execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
      results,
    };
    fs.writeFileSync(process.env.REPORT_PATH, JSON.stringify(report, null, 2));
    const summary = results.map(({ kind, regressions, closed }) => ({ kind, regressions, closed }));
    console.log(JSON.stringify(summary));
    if (results.some((r) => r.regressions.length)) process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
