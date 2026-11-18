# Session feedback form POC

This POC previews the end-of-session cohort feedback form in English and Traditional Chinese.

- English: `/en/survey/preview/session-feedback`
- zh-TW: `/zh-tw/survey/preview/session-feedback`
- The preview uses synthetic names: `Example Organization` and `Example Cohort`.
- Submitting the preview is a no-op; it does not send or persist responses.
- The preview route is available only in development.
- Live forms need the survey API to return `organization_name` and `cohort_name` for the relevant cohort so the form can display the matching organization and cohort names.

The POC demonstrates the localized copy, rating choices, privacy notice, and written-response prompts. It is a design reference and does not establish production behavior or backend availability.
