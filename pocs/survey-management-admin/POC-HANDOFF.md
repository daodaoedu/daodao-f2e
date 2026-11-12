# Survey management admin POC

This is a standalone, review-only copy of the survey management prototype. It is not wired into the `daodao-f2e` product routes or production APIs.

## Run the prototype

From this directory:

```powershell
pnpm install --ignore-workspace --frozen-lockfile
Set-Content .env.local 'VITE_USE_PREVIEW_MOCK=true'
pnpm run dev
```

Open `http://localhost:5173/admin/surveys`. The editor, respondent preview, response list, response detail, analytics, and public response page use browser-local synthetic data. Start a new survey from the list to inspect the empty-question state, add questions, and exercise the save/publish flows.

## Scope included

- Full-page survey list, editor, and respondent-answerable preview.
- Public and participant-only audience choices, survey state and close controls, response limit, and dirty-state save behavior.
- Question setup for single choice, multiple choice, short/long text, email, link, star rating, scale ranges with endpoint labels, and click-to-rank options.
- Survey image settings and library interactions, branded public survey layout, and customizable thank-you message placeholder.
- Respondent list and response detail pages, navigable responses, CSV export, and question analytics including ranking aggregates.
- Traditional Chinese UI copy and `YYYY/MM/DD` date formatting.

## Review notes and limits

- All records and answers are synthetic. Preview persistence uses browser `localStorage` so the interaction can be demonstrated without a backend.
- Participant login and identity verification are not implemented. The participant-only option is a UI demonstration and must not be treated as access control.
- Save, publish, close, upload, delete, and export flows do not call production services. Storage, permissions, retention, and server-side validation remain engineering work.
- CSV output demonstrates multi-select and ranking-friendly answer columns; production schema, spreadsheet formula-injection handling, encoding, and export limits need implementation review.
- The demo reuses only the admin shell and UI primitives needed by the survey pages; unrelated admin routes and modules are excluded.

## Checks performed

- Standalone TypeScript check (`tsc --noEmit`): passed.
- Standalone Vite production build: passed.
- Biome lint on the survey pages, survey API module, and changed shell files: passed with existing warnings and no errors.
- Biome formatting for the survey-specific files: passed.
- `daodao-f2e` root lint and typecheck: passed (lint reports existing warnings).
- Standalone Biome check reports 10 lint warnings and 1 informational notice in the POC source, with no errors. Full-repository format check reports existing formatting findings across the wider repository; no unrelated formatting changes were applied.

## Requirements reference

The confirmed functional decisions are documented in [問卷管理｜功能需求文件（FRD） v1.1](https://docs.google.com/document/d/15oL_sjGUHc5KdsElcPEopz206t3a5grPI48Mtq9e4FE/edit?usp=drivesdk).
