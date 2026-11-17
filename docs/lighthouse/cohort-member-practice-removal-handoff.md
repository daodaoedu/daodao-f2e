# Cohort member practice removal

Engineering review handoff for admin removal of a Lighthouse cohort participant.

## Behavior

When an admin removes a participant, the server soft-deletes that participant's active practices linked to the cohort by setting `deleted_at` and clearing `cohort_id`. The practice rows remain in the database. Regular participant and cohort-admin views filter deleted practices out, so neither side can see them after removal.

The participant-facing **Exit program/activity** action is unchanged: it opens the existing contact-administrator information dialog and does not submit a leave request. The underlying legacy exit service still detaches practices and preserves shared resources as personal copies; this PR does not change that API behavior.

## Review path

In the Lighthouse UI, open a cohort's participant roster and choose **Remove**. The confirmation copy is in `packages/i18n/src/locales/{en,zh-TW}/lighthouse.json`.

The server-side change is in the matching `feat/cohort-member-practice-removal` branch of `daodaoedu/daodao-server`.

## Validation

Local takeover verification covers 12 real PostgreSQL regression cases using the CI-pinned schema, including administrator removal, retained rows, unrelated practices, transaction rollback, and authenticated HTTP visibility. Old practice/check-in/comment URLs reject soft-deleted content. Successful removal also clears the cohort's cached management queries before they revalidate; rejected removal keeps valid cached data.

Rendered confirmation and contact-administrator dialogs were checked in English and Traditional Chinese using explicit local UI fixtures. These UI checks are separate from the real database/controller tests: a browser connected to the complete backend, dev deployment, and formal PM acceptance have not been completed. Forced dark styling exposes an existing shared Cancel-button contrast limitation; the removal message itself has a local dark foreground repair.
