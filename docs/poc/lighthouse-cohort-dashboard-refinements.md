# Lighthouse cohort dashboard refinements POC

## Open the POC

Start the local product app and open a cohort dashboard, for example:
`/zh-TW/lighthouse/programs/15/cohorts/28/dashboard`.

## What to review

- Mobile cohort navigation remains visible while scrolling; cohort information can collapse, and dashboard filters and KPIs stay in a predictable order.
- Dashboard date controls use `YYYY/MM/DD`; the heatmap and check-in trend show date guides and scale information.
- Activity and participant tables keep the name column visible while horizontally scrolling, with a resize handle where requested.
- Outcome tables use the revised participant progress and comment labels, sticky name columns, and the report uses the same date format.
- Check-in detail includes a link to the participant check-in page for leaving a comment when the API provides the practice's public identifier.

## Scope and limits

This branch is a UI POC based on `dev`. It does not change the server API. The current check-in response does not include the practice's public identifier, so the comment link stays hidden until the API adds it. `publishedCommentCount` is also optional; the column displays an em dash until the server provides the count. Survey experiments, calendar integration, login fixtures, and unrelated practice/template edits from the source checkout are intentionally excluded.
