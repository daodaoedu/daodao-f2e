# Dialog animation completion regression

This read-only browser probe opens both message dialogs twice and samples every animation frame. It fails when an unchanged, open dialog or overlay drops more than 0.2 opacity between frames, or the dialog and overlay never become visible together. Escape must dismiss each dialog. This detects the real Chrome WAAPI completion flash that DOM-only component tests miss. It requires an authorized QA fixture with a celebration row and existing message history. No messages/templates are created or changed.

Requires Chrome and system Git at `/usr/bin/git` (macOS/Linux). Git is invoked by its fixed system path so a writable directory in `PATH` cannot substitute the executable used to record the source revision.

Run from repository root against an already started frontend and its matching API:

```sh
BASE_URL=http://localhost:3350 \
FOCUS_PATH=/en/lighthouse/programs/32/cohorts/94/focus \
COMPOSE_LABEL='Write a comment to QA344 owner' \
QA_CREDENTIAL_FILE=/path/to/ignored-credentials.json \
REPORT_PATH=/tmp/dialog-frames.json \
node apps/product/e2e/dialog-animation-flash/verify.cjs
```

The ignored credential file is `{ "qaCoach": { "token": "..." } }`; set `QA_ACTOR_KEY` for another key. Never commit tokens. `MOBILE=1` uses 390×844; `REDUCED_MOTION=1` emulates the reduced-motion preference. The report includes the source HEAD and frame evidence, not credentials. Use the same browser/frame workload before and after changes.
