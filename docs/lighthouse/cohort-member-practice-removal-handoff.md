# Cohort member practice removal

Engineering review handoff for admin removal of a Lighthouse cohort participant.

## Behavior

When an admin removes a participant, the server soft-deletes that participant's active practices linked to the cohort by setting `deleted_at` and clearing `cohort_id`. The practice rows remain in the database. Regular participant and cohort-admin views filter deleted practices out, so neither side can see them after removal.

Voluntary cohort exit is unchanged: it detaches practices into the participant's personal space, including preserving shared resources as personal copies.

## Review path

In the Lighthouse UI, open a cohort's participant roster and choose **Remove**. The confirmation copy is in `packages/i18n/src/locales/{en,zh-TW}/lighthouse.json`.

The server-side change is in the matching `feat/cohort-member-practice-removal` branch of `daodaoedu/daodao-server`.

## Validation

This branch is a review reference, not a production-readiness claim. End-to-end removal behavior has not been verified against a running environment.
