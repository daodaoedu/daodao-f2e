# Plan: #757 許願池英文修正

## Investigation

Searched the codebase for the strings listed in the acceptance criteria.

### Current state in `packages/i18n/src/locales/en.json`

| Acceptance Criteria | Current Value | Status |
|---|---|---|
| "200+ partners involved" → "200+ Users Engaged" | `{count}+ Users Engaged` (line 7) | ✅ Already done |
| "1+ pieces of feedback" → "1 Wishes Submitted" | `{count} Wishes Submitted` (line 8) | ✅ Already done |
| "No items in this category yet" → "No wishes in this category yet" | `No wishes in this category yet` (line 38) | ✅ Already done |
| "DaoDao" → "Dao Dao" | `"brand": "DaoDao"` (lines 6202, 6429) | ⚠️ Needs clarification |

### "DaoDao" → "Dao Dao" scope

Occurrences of `DaoDao` (without space) in en.json:
- Line 5807: `"share_hashtag": "#DaoDaoLearning"` — hashtag, should NOT change
- Line 6202: `"brand": "DaoDao"` — display brand name in check-in share card
- Line 6220: `"share_text": "... #DaoDao"` — hashtag, should NOT change
- Line 6226: `"share_hashtag": "#DaoDao"` — hashtag, should NOT change
- Line 6429: `"brand": "DaoDao"` — display brand name in practice share card
- Line 6441: `"share_message": "... on DaoDao."` — inline text, may need change

Only `"brand"` fields (lines 6202, 6429) and the inline `DaoDao` in line 6441 are candidates for "Dao Dao" update.

### zh-TW.json status

- Line 38: `"empty_title": "這個分類目前還沒有項目"` — translates to "No items in this category yet", should be updated to match the semantics of the English fix (e.g., "這個分類目前還沒有許願")

## Changes Required

### File 1: `packages/i18n/src/locales/en.json`

```diff
- "brand": "DaoDao",   // line 6202 (check-in share)
+ "brand": "Dao Dao",

- "brand": "DaoDao",   // line 6429 (practice share)
+ "brand": "Dao Dao",

- "share_message": "I completed \"{title}\" with {count} learning footprints on DaoDao."  // line 6441
+ "share_message": "I completed \"{title}\" with {count} learning footprints on Dao Dao."
```

### File 2: `packages/i18n/src/locales/zh-TW.json`

```diff
- "empty_title": "這個分類目前還沒有項目",   // line 38
+ "empty_title": "這個分類目前還沒有許願",
```

## Scope Assessment

2 files, 4 line changes — within XS (≤3 files) scope.

## Notes

- Hashtag strings (`#DaoDaoLearning`, `#DaoDao`) must NOT be changed as they would break social media tagging.
- No component files need modification — all changes are in i18n JSON files.
- `"brand"` fields appear in share card UI displayed to users, safe to update to "Dao Dao".
