# Plan: #761 Onboarding 歡迎信更正

## Issue

The welcome email sent to new L0 users (non-quiz registration) should use a new template. The new template content is described in a Google Doc (link in issue body — requires access to retrieve content).

## Investigation

### f2e repo findings

The `sendWelcomeEmail` function in `packages/api/src/services/email.ts` sends a POST to `/api/v1/email/welcome` with:
```ts
{
  email: string;
  name: string;
  hasCompletedQuiz: boolean;  // distinguishes L0 (false) from quiz users (true)
  practiceUrl?: string;
  quizUrl?: string;
  illustrationUrl?: string;
  unsubscribeUrl?: string;
  userId?: number;
}
```

The `hasCompletedQuiz: false` path corresponds to the L0 welcome email for new non-quiz users.

However, `sendWelcomeEmail` is NOT called from any component in `apps/`. Email sending is server-side.

### Email template location

The L0 welcome email template is defined in **daodao-server**, not in this repo. The template likely:
- Lives in `src/services/email/templates/welcome.ts` or similar
- Renders different content based on `hasCompletedQuiz`

### New template content

The replacement template is documented at the Google Doc linked in the issue body. A human with access must retrieve and apply the new email body content to the server-side template.

## Changes Required

### Primary change: `daodao-server`

1. Locate the welcome email template file (search for `hasCompletedQuiz` or `welcome` in the email service)
2. Retrieve new L0 template content from the Google Doc linked in issue #761
3. Update the template for `hasCompletedQuiz === false` (L0 path) with the new content
4. Verify rendering with a preview call to `POST /api/v1/email/preview`

### No changes needed in this repo

The f2e codebase does not contain email templates. All changes belong in daodao-server.

## Scope Assessment

No files to change in daodao-f2e. Issue may be mislabeled as `target-repo:daodao-f2e`.

Human action required to retrieve template content from the Google Doc.

## Action Required

A human with access to the Google Doc should:
1. Copy the new L0 welcome email content
2. Apply it to the daodao-server welcome email template
3. Test with `POST /api/v1/email/preview` before deploying
