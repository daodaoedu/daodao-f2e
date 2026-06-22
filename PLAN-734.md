# Plan: #734 我的小島-人物誌題目呈現方式

## Current State

`PersonaProfileMe` component already shows single-card + switch-question button (implemented in #750).

## Remaining Gap

Progress counter still shows **"已回答 {answered}/{total} 題"** but should be **"剩 {remaining}/{total} 題完成人物誌"**.

## Changes Required

### 1. `apps/product/src/components/persona/persona-profile-me.tsx`
- Add `remaining = questions.length - answered.length` computed value
- Pass `remaining` to the i18n key instead of `answered`

### 2. `packages/i18n/src/locales/zh-TW.json`
- `persona.myProfile.progress`: `"已回答 {answered}/{total} 題"` → `"剩 {remaining}/{total} 題完成人物誌"`

### 3. `packages/i18n/src/locales/en.json`
- `persona.myProfile.progress`: update to `"{remaining}/{total} questions left to complete your persona"`

## Files Changed
- `apps/product/src/components/persona/persona-profile-me.tsx`
- `packages/i18n/src/locales/zh-TW.json`
- `packages/i18n/src/locales/en.json`
