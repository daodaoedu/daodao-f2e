# Plan: #758 測驗提醒信CTA 連結更正

## Issue

Quiz reminder email CTA button "進行測驗" links to the wrong URL. It should link to https://daodao.so/quiz.

## Investigation

### f2e repo findings

`packages/api/src/services/email.ts` — the `sendWelcomeEmail` function accepts:
```ts
quizUrl?: string;   // line 99
```

However, `sendWelcomeEmail` is NOT called from any component in `apps/`. It is only exported as an admin API client function.

### Root cause location

The quiz reminder email (測驗提醒信) is a separate email type from the welcome email. It is sent server-side from **daodao-server**, not triggered by the f2e frontend.

The email template and the CTA link are defined in the server-side email template engine (daodao-server, likely in `services/email/` or `templates/`).

### Relevant f2e entry points

There are no React components in `apps/` that directly trigger the quiz reminder email. This is a pure server-side concern.

## Changes Required

### Primary change: `daodao-server` (not this repo)

Locate the quiz reminder email template in daodao-server and update the CTA href:

```diff
- href="https://daodao.so/[current-wrong-path]"
+ href="https://daodao.so/quiz"
```

Search path in daodao-server:
- `src/services/email/` or `services/email/`
- Template files containing "進行測驗" or "CTA"

### Secondary change in this repo (if applicable)

If `sendWelcomeEmail` in `packages/api/src/services/email.ts` is ever called from f2e with a `quizUrl` parameter, ensure the value passed is `https://daodao.so/quiz`. No such call site exists currently.

## Scope Assessment

0 files to change in daodao-f2e (changes belong in daodao-server). This issue may be mislabeled as `target-repo:daodao-f2e`.

## Action Required

A human or the pipeline running against daodao-server should fix the quiz reminder email template CTA link.
