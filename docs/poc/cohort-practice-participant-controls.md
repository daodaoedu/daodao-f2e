# Cohort practice participant controls POC

This frontend POC covers Lighthouse cohort practices only. Challenge practices keep their existing behavior.

## Review paths

- Open a cohort practice at `/practices/:id/edit`: its start date and duration are read-only, and saves omit those two fields.
- Open a cohort practice at `/practices/:id`: a cohort practice returned as `draft` is shown as `not_started`, and check-in stays disabled until the start date, using the same before-start behavior as the cohort practice card.

The current `dev` branch already contains the Lighthouse template and cohort resource editing UI. The server-side snapshotting of default template resources, participant resource locks, and assignment status initialization are separate backend changes and are not included in this F2E branch; validate those with the corresponding `daodao-server` work before relying on end-to-end behavior.
