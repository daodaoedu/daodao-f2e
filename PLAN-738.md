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

## Proposed Constant

```ts
const OTHER_OPTION = "其他"; // or import from @/constants if a shared constant exists
```

## Files to Change

| File | Change |
|------|--------|
| `apps/product/src/components/persona/persona-profile-me.tsx` | Add `otherText` state + conditional textarea in `InlineAnswerForm` choice branch |
| `apps/product/src/app/[locale]/persona/[id]/page.tsx` | Same pattern in `InlineFlipCard` back-face choice branch |
| `packages/i18n/src/locales/zh-TW.json` | Add `persona.myProfile.otherPlaceholder` key |
| `packages/i18n/src/locales/en.json` | Same key in English |

> Backend question data changes are handled in `daodao-server` — not in this repo.
