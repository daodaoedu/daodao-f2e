# Plan: #738 人物誌題目修正 — Choice Questions with "Other" Free Text

## Acceptance Criteria

- 給新註冊的5題(標黃底)改為選擇題, 只可單選
- 當使用者點選其他, 可有 free text box 填寫

## Investigation

### Current Architecture

`InlineAnswerForm` (`apps/product/src/components/persona/persona-profile-me.tsx`) already supports two modes driven by `questionType`:
- `"choice"`: renders pill buttons for each option in `options[]`, submits `selectedValue`
- `"sentence_completion"` / `"scenario"`: renders a `<Textarea>`, submits `textAnswer`

The choice UI (lines 57–83) currently has **no "Other" free-text fallback** — selecting any pill button sets `selectedValue` and submits it directly. There is no provision for a free text box when "其他" is selected.

### What Needs to Change

**1. Backend (out of scope for this repo):** The 5 onboarding questions must be updated in the database to:
- `questionType: "choice"`
- `options: ["...", "...", "...", "其他"]` — the last option should be an explicit "其他" marker

**2. Frontend — `InlineAnswerForm` choice branch:**

When `selectedValue === "其他"` (or a configurable constant), render a `<Textarea>` below the pills for the free-text input. On submit, send `textAnswer` (the free text) instead of `selectedValue: "其他"`.

Revised submit logic:
```
if (selectedValue === OTHER_OPTION) {
  body = { questionId, textAnswer: otherText.trim() }
  validate: otherText is non-empty
} else {
  body = { questionId, selectedValue }
  validate: selectedValue is non-empty
}
```

**3. Frontend — persona/[id] page `InlineFlipCard`:**

The flip card back face also renders choice / text UI (lines 139–181). Same "Other" free-text pattern needs to be applied here for consistency.

## Proposed Constant & i18n Consideration

> **Gemini review flag (addressed):** Hardcoding `"其他"` as a string sentinel is fragile in multilingual environments if the backend ever localizes option labels for different locales.

**Recommended approach — backend sentinel (`__other__`):**

The backend should store a locale-independent marker as the "other" option value (e.g., `"__other__"`), and send the display label separately (or let the frontend translate it from the i18n key). The frontend matches against the stable marker:

```ts
const OTHER_OPTION = "__other__"; // matches backend sentinel, never localized
```

If the backend cannot be changed to use a sentinel, the fallback is **position-based detection** — the "other" option is always the last item in `options[]`:

```ts
const isOtherSelected = options && selectedValue === options[options.length - 1];
```

**If neither approach is feasible** (backend always returns `"其他"` regardless of locale because the product is Chinese-primary), document the constraint explicitly:

```ts
// Backend always stores and returns "其他" for the "other" option,
// regardless of the user's display locale. This is intentional for
// the Chinese-primary DaoDao platform. Change if the platform goes multilingual.
const OTHER_OPTION = "其他";
```

The implementer should confirm with the backend team which approach is used before coding.

## Files to Change

| File | Change |
|------|--------|
| `apps/product/src/components/persona/persona-profile-me.tsx` | Add `otherText` state + conditional textarea in `InlineAnswerForm` choice branch |
| `apps/product/src/app/[locale]/persona/[id]/page.tsx` | Same pattern in `InlineFlipCard` back-face choice branch |
| `packages/i18n/src/locales/zh-TW.json` | Add `persona.myProfile.otherPlaceholder` key |
| `packages/i18n/src/locales/en.json` | Same key in English |

> Backend question data changes are handled in `daodao-server` — not in this repo.
