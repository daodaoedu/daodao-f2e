# Plan: #760 歡迎信重覆寄送

## Issue

Two welcome emails (L0) are being sent to new users instead of one.

## Investigation

### f2e repo findings

`sendWelcomeEmail` is defined in `packages/api/src/services/email.ts` as an admin-facing API client. It is NOT called from any component in `apps/`. The function exists only as an exported utility for admin UI use.

No evidence of duplicate email triggering in the f2e codebase.

### Root cause location

The duplicate send is server-side. Possible causes in **daodao-server**:

1. **Google OAuth callback + local registration both trigger welcome email**: If a user registers via Google OAuth, both the OAuth callback handler and a separate registration hook might each send a welcome email.

2. **Duplicate event listeners**: A registration event might be subscribed to by multiple handlers, each sending a welcome email.

3. **Race condition**: Two concurrent requests (e.g., the user submitting onboarding and an OAuth token refresh) each triggering a welcome email.

4. **Queue/job duplicate processing**: A message queue retrying a failed job might result in two sends.

### Investigation steps for daodao-server

Search for all locations that call the welcome email send:
```bash
grep -rnE "email\.welcome|sendWelcome|welcomeEmail|welcome.*email" src/ --include="*.ts"
```

Expected: exactly one call site. If two are found, one should be removed or guarded with a "already sent" check.

## Changes Required

### Primary change: `daodao-server`

1. Find all call sites for welcome email sending
2. Add a guard: before sending, check if welcome email was already sent for this user (e.g., via DB flag `welcome_email_sent_at` or email history lookup)
3. If two call sites are genuinely needed, add a deduplication check

### No changes needed in this repo

The f2e codebase does not trigger welcome emails. All changes belong in daodao-server.

## Scope Assessment

No files to change in daodao-f2e. Issue may be mislabeled as `target-repo:daodao-f2e`.

## Action Required

Investigate daodao-server's registration flow and email service to find and fix the duplicate welcome email trigger.
