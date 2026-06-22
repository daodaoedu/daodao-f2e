# Plan: #757 許願池英文修正

## Investigation

Searched the codebase for the strings listed in the acceptance criteria.

### Current state in `packages/i18n/src/locales/en.json`

| Acceptance Criteria | Current Value | Status |
|---|---|---|
| "200+ partners involved" → "200+ Users Engaged" | `{count}+ Users Engaged` (line 7) | ✅ Already done |
| "1+ pieces of feedback" → "1 Wishes Submitted" | `{count} Wishes Submitted` (line 8) | ✅ Already done |
| "No items in this category yet" → "No wishes in this category yet" | `No wishes in this category yet` (line 38) | ✅ Already done |
| "DaoDao" → "Dao Dao" | `"brand": "DaoDao"` (lines 6202, 6429) | ⚠️ Needs update |

### "DaoDao" → "Dao Dao" scope

Occurrences of `DaoDao`/`Daodao` (without space) in en.json:
- Line 5807: `"share_hashtag": "#DaoDaoLearning"` — hashtag, should NOT change
- Line 6202: `"brand": "DaoDao"` — display brand name in check-in share card ✏️
- Line 6220: `"share_text": "... #DaoDao"` — hashtag, should NOT change
- Line 6226: `"share_hashtag": "#DaoDao"` — hashtag, should NOT change
- Line 6429: `"brand": "DaoDao"` — display brand name in practice share card ✏️
- Line 6441: `"share_message": "... on DaoDao."` — inline display text ✏️
- Line ~6120: `"subtitle": "How did you hear about Daodao?"` — onboarding referral ✏️
- Lines ~5423, 5426, 5429, 5432: `Daodao` in user testimonials — display text ✏️

Hashtag strings must NOT be changed. All other display-text occurrences should be updated.

### zh-TW.json status

- Line 38: `"empty_title": "這個分類目前還沒有項目"` — should be updated to "這個分類目前還沒有願望" (more natural than "許願" as noun)

## Changes Required

### File 1: `packages/i18n/src/locales/en.json`

```diff
- "brand": "DaoDao",   // line 6202 (check-in share)
+ "brand": "Dao Dao",

- "brand": "DaoDao",   // line 6429 (practice share)
+ "brand": "Dao Dao",

- "share_message": "I completed \"{title}\" with {count} learning footprints on DaoDao."  // line 6441
+ "share_message": "I completed \"{title}\" with {count} learning footprints on Dao Dao."

- "subtitle": "How did you hear about Daodao?"  // line ~6120 (onboarding referral)
+ "subtitle": "How did you hear about Dao Dao?"

// Lines ~5423-5432: replace "Daodao" with "Dao Dao" in each testimonial string
```

### File 2: `packages/i18n/src/locales/zh-TW.json`

```diff
- "empty_title": "這個分類目前還沒有項目",   // line 38
+ "empty_title": "這個分類目前還沒有願望",
```

## Scope Assessment

2 files, ~9 line changes — within XS (≤3 files) scope, upper bound.

## Notes

- Hashtag strings (`#DaoDaoLearning`, `#DaoDao`) must NOT be changed as they would break social media tagging.
- No component files need modification — all changes are in i18n JSON files.
- `"brand"` fields and testimonial strings are displayed to users, safe to update to "Dao Dao".
- "願望" is preferred over "許願" as noun in zh-TW (more natural for "wishes").
