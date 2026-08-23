# Plan: #759 帳號設定提醒 email 未寄出

## Issue

Users who register via the quiz flow should receive an account settings reminder email 3 minutes after the welcome email. This email is not being sent.

## Investigation

### f2e repo findings

The onboarding flow in `apps/product/src/components/onboarding/` handles user registration. The `success-section.tsx` shows the completion page but does NOT trigger any email sends.

Email sending functions exported from `packages/api/src/services/email.ts`:
- `sendWelcomeEmail` — called from admin UI, not from onboarding flow
- No "account settings reminder" or "profile completion" email function exists in the f2e API client

No evidence of any delayed email scheduling (setTimeout, job queue) in the f2e codebase.

### Root cause location

The account settings reminder email must be sent server-side from **daodao-server**. The trigger would be:
1. User registers via quiz flow (sets `registrationFlow: "quiz"`)
2. Server sends welcome email
3. Server schedules a delayed job (3 minutes later) to send account settings reminder

The issue is either:
a. The delayed job/scheduler does not exist in daodao-server
b. The job exists but is misconfigured or broken
c. The email template exists but the trigger condition is wrong

### Registration flow flag

`packages/api/src/services/user.ts` line 244:
```ts
registrationFlow?: "landing_page" | "quiz" | "action_maker";
```

This flag is passed to the server during onboarding to identify quiz-registered users.

## Changes Required

### Primary change: `daodao-server`

1. Verify that a post-registration email scheduler exists for `registrationFlow === "quiz"`
2. If it doesn't exist, add a delayed job:
   - After sending the welcome email, schedule a job to run after 3 minutes
   - The job sends an "account settings reminder" email to the user
3. Verify the `account-settings-reminder` email template exists in the server

### Secondary change in this repo (if applicable)

If the account settings reminder email requires new parameters passed from the frontend (e.g., a settings URL), update `packages/api/src/services/email.ts` to add the corresponding API client function.

Currently no action needed in daodao-f2e until the server implementation is confirmed.

## Scope Assessment

This issue requires investigation and implementation in daodao-server. May be mislabeled as `target-repo:daodao-f2e`.

## Action Required

Investigate daodao-server's email service and registration flow hook to implement the 3-minute delayed account settings reminder email for quiz registrations.
