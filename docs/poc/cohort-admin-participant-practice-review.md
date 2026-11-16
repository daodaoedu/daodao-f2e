# Cohort admin participant practice review POC

FRD: [Cohort Admin Participant Practice Review](https://docs.google.com/document/d/1ebQ3vQMkImLO7zx5hdYJKne15gBfCPwX0kZstfzEvLk/edit)

## Scope

This POC adds an organization-admin cohort roster for reviewing joined members' practices. It includes name/email search, a practice filter, check-in and latest-activity sorting, and a link to manage the cohort in Lighthouse. Selecting a participant opens their practice in an admin review view with check-ins selected by default. Admins can react and comment, while practice editing and copying stay unavailable in this view. Previous/next participant navigation and Back to list are available only in the cohort-admin view.

Organization admins can view all cohorts belonging to their organization. Cohort access must continue to follow the existing organization membership and Lighthouse authorization rules; the `view=cohort-admin` query parameter is presentation context, not an authorization boundary.

## How to exercise

1. Start the product app at `http://localhost:3001` and sign in as an organization admin using the configured local API/auth environment.
2. Open an organization cohort through Spaces and use the participant roster. A known local/dev example is `/en/cohorts/28?programId=15` when that seed data is available.
3. Search by participant name or email, change the practice filter, and sort by Check-ins or Latest activity.
4. Open a participant row. Confirm the review view opens on Check-ins in List mode, navigate between participants, add a reaction or comment, and use Back to list.
5. Use Manage cohort to open that cohort's Lighthouse management dashboard.

## Review boundaries

- This is a frontend POC using the existing Lighthouse cohort, enrollment, participant, and outcome endpoints. No server contract or database schema changes are included.
- The admin view keeps reaction and comment interactions enabled; it suppresses practice edit/copy actions. Check-in detail links preserve cohort context.
- Organization-admin permission enforcement belongs to the existing organization/Lighthouse access model. Do not treat client query parameters as proof of authorization.
- The sample cohort and participant IDs depend on the configured local/dev dataset and may not exist in other environments.
- `pnpm run typecheck` passed. The cohort API test passed (13 tests), and the check-in stack test passed (5 tests).
- Focused lint passed for `apps/product`, `packages/api`, and `packages/i18n`. Repository-wide `pnpm run lint` still fails in unchanged `packages/blog-content` files on formatter/CRLF checks.
- Local browser smoke test on 2026-11-16 at `/en/cohorts/28?programId=15`: roster showed 7 members; searching `no-such-participant@example.test` displayed “No participants match your filters.”; clearing the search and opening 周品妍 showed the admin review URL, `1 / 7`, the Check-ins tab selected, `Check-ins (6)`, and six check-in entries.
- SonarCloud initially reported 40 duplicated lines in the two sort-header blocks in `cohort-admin-home-page.tsx`; those blocks now share one mapped renderer. The updated Sonar result is pending a new PR analysis.
- This handoff is a code review preview, not acceptance or deployment evidence.

## 驗證證據

讀取權限驗證：不適用：本 PR 僅調整前端顯示和導覽，未新增或變更 API、資料庫或伺服器端授權；存取仍由既有組織與燈塔權限控制。

### 核心旅程矩陣

| ID | 旅程 | 類型 | 輸入 | 預期結果 | 實際 |
| --- | --- | --- | --- | --- | --- |
| J-01 | Cohort 參與者搜尋並檢視實踐 | 正常 | `/en/cohorts/28?programId=15`，選擇周品妍 | 開啟參與者的打卡檢視 | ✅ UI：名冊顯示 7 位成員；開啟後顯示周品妍 `1 / 7`、`Check-ins (6)`，並列出 6 筆打卡 |
| J-01 | Cohort 參與者搜尋並檢視實踐 | 錯誤路徑 | 搜尋 `no-such-participant@example.test` | 無符合成員時顯示空狀態 | ✅ UI 訊息：`No participants match your filters.`；清除搜尋後可返回 7 位成員名冊 |

證據報告：[Cohort admin participant practice review handoff](https://github.com/daodaoedu/daodao-f2e/blob/feat/cohort-admin-participant-practice-review/docs/poc/cohort-admin-participant-practice-review.md)。
