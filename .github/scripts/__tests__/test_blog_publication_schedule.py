"""Scheduled publication behavior, including content-only and delayed ticks."""

import datetime as dt
import importlib.util
import json
import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[3]
SPEC = importlib.util.spec_from_file_location(
    "scheduled_sync", ROOT / ".github/scripts/website_managed_sync.py"
)
sync = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(sync)
FRONTEND = "a" * 40
BASELINE = "b" * 40
CONTENT = "c" * 40
DUE = dt.datetime(2026, 11, 27, 1, 0, tzinfo=dt.UTC)
SCHEDULE = {
    "publish_at": "2026-11-27T09:00:00+08:00",
    "content_sha": CONTENT,
    "baseline_content_sha": BASELINE,
}


def state(**overrides):
    values = {
        "channel": "prod", "managed": True, "head_sha": FRONTEND,
        "marker": {"frontend_sha": FRONTEND, "content_sha": BASELINE},
        "changed_files": [], "legacy_cd_idle": True, "now": DUE,
        "ci": {"id": 123, "status": "completed", "conclusion": "success",
               "updated_at": "2026-11-20T00:00:00Z"},
        "content_pins": {"content": CONTENT, "published": BASELINE},
        "publication_schedule": json.dumps(SCHEDULE),
        "publication_check": True,
    }
    values.update(overrides)
    return sync.State(**values)


def run(identifier=1, conclusion="failure", **overrides):
    value = {"id": identifier, "head_sha": FRONTEND, "status": "completed",
             "created_at": "2026-11-27T01:00:00Z", "conclusion": conclusion}
    value.update(overrides)
    return value


class ScheduledPublicationTests(unittest.TestCase):
    def test_future_taipei_time_does_not_publish_even_with_old_ci(self):
        self.assertEqual(sync.decide(state(now=DUE-dt.timedelta(seconds=1)))["action"], "wait")

    def test_scheduled_work_without_managed_publisher_alerts(self):
        self.assertEqual(sync.decide(state(managed=False))["action"], "alert")

    def test_due_content_only_release_reuses_existing_production_publisher(self):
        decision = sync.decide(state())
        self.assertEqual(decision["action"], "dispatch")
        self.assertEqual(decision["workflow"], "blog-prod-publish.yml")
        self.assertEqual(decision["ref"], "prod")
        self.assertEqual(decision["inputs"], {"ci_run_id": "123", "expected_content_sha": CONTENT})
        self.assertFalse(decision["retry"])

    def test_delayed_tick_catches_up_instead_of_missing_the_release(self):
        self.assertEqual(sync.decide(state(now=DUE+dt.timedelta(hours=4)))["action"], "dispatch")

    def test_live_target_is_not_dispatched_again(self):
        decision = sync.decide(state(marker={"frontend_sha": FRONTEND, "content_sha": CONTENT}))
        self.assertEqual(decision["action"], "up-to-date")

    def test_old_frontend_success_does_not_block_new_content_on_same_frontend(self):
        prior = run(conclusion="success", created_at="2026-11-26T01:00:00Z")
        self.assertEqual(sync.decide(state(managed_runs=[prior]))["action"], "dispatch")

    def test_all_active_production_runs_prevent_a_duplicate_dispatch(self):
        for status in sync.ACTIVE:
            with self.subTest(status=status):
                active = run(head_sha="d"*40, status=status, conclusion=None)
                self.assertEqual(sync.decide(state(managed_runs=[active]))["action"], "wait")

    def test_changed_content_or_baseline_pin_requires_review(self):
        for pins in ({"content": "d"*40, "published": BASELINE},
                     {"content": CONTENT, "published": "d"*40}):
            with self.subTest(pins=pins):
                self.assertEqual(sync.decide(state(content_pins=pins))["action"], "alert")

    def test_changed_live_baseline_cannot_be_overwritten_by_a_stale_schedule(self):
        marker = {"frontend_sha": FRONTEND, "content_sha": "d"*40}
        self.assertEqual(sync.decide(state(marker=marker))["action"], "alert")

    def test_invalid_or_ambiguous_schedule_never_dispatches(self):
        invalid = ["{}", "[]", "null", "not json"]
        for change in ({"publish_at": "2026-11-27T09:00:00"},
                       {"publish_at": "tomorrow"}, {"content_sha": "main"},
                       {"baseline_content_sha": CONTENT}, {"extra": "field"}):
            invalid.append(json.dumps({**SCHEDULE, **change}))
        for raw in invalid:
            with self.subTest(raw=raw):
                self.assertEqual(sync.decide(state(publication_schedule=raw))["action"], "alert")

    def test_no_schedule_preserves_manual_content_publication(self):
        self.assertEqual(sync.decide(state(publication_schedule=""))["action"], "up-to-date")

    def test_normal_sync_leaves_due_publication_to_the_daily_job(self):
        self.assertEqual(sync.decide(state(publication_check=False))["action"], "wait")

    def test_completed_schedule_does_not_disable_later_frontend_sync(self):
        decision = sync.decide(state(
            publication_check=False, head_sha="d"*40,
            marker={"frontend_sha": FRONTEND, "content_sha": CONTENT},
            changed_files=["apps/website/src/page.tsx"],
            content_pins={"content": CONTENT, "published": CONTENT},
        ))
        self.assertEqual(decision["action"], "dispatch")
        self.assertEqual(decision["inputs"], {"ci_run_id": "123", "expected_content_sha": CONTENT})

    def test_frontend_refresh_queued_before_scheduling_cannot_publish_future_content(self):
        decision = sync.decide(state(
            publication_check=False, publication_schedule="", head_sha="d"*40,
            changed_files=["apps/website/src/page.tsx"],
            content_pins={"content": BASELINE, "published": BASELINE},
        ))
        self.assertEqual(decision["inputs"]["expected_content_sha"], BASELINE)
        spec = importlib.util.spec_from_file_location("queued_prod_gate", ROOT/".github/scripts/blog_prod_gate.py")
        gate = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(gate)
        with self.assertRaises(ValueError):
            gate.context({
                "GITHUB_REPOSITORY": "daodaoedu/daodao-f2e", "GITHUB_EVENT_NAME": "workflow_dispatch",
                "GITHUB_REF": "refs/heads/prod", "GITHUB_SHA": "d"*40,
                "BLOG_PROD_RELEASE_MANAGED": "true", "BLOG_PROD_CONTENT_SHA": CONTENT,
                "BLOG_PROD_PUBLISHED_CONTENT_SHA": BASELINE,
                "BLOG_PROD_EXPECTED_CONTENT_SHA": decision["inputs"]["expected_content_sha"],
            })

    def test_failed_ci_and_busy_legacy_cd_do_not_publish(self):
        self.assertEqual(sync.decide(state(ci={"id": 1, "status": "completed", "conclusion": "failure"}))["action"], "alert")
        self.assertEqual(sync.decide(state(legacy_cd_idle=False))["action"], "wait")
        self.assertEqual(sync.decide(state(ci=None))["action"], "wait")

    def test_overdue_blocked_release_alerts_relative_to_due_time(self):
        for changes in ({"legacy_cd_idle": False}, {"ci": None},
                        {"managed_runs": [run(status="waiting", conclusion=None)]}):
            with self.subTest(changes=changes):
                self.assertEqual(sync.decide(state(now=DUE+dt.timedelta(minutes=61), **changes))["action"], "alert")

    def test_one_failed_schedule_retries_once_and_second_failure_stops(self):
        once = sync.decide(state(managed_runs=[run()]))
        self.assertEqual(once["action"], "dispatch")
        self.assertTrue(once["retry"])
        self.assertEqual(sync.decide(state(managed_runs=[run(), run(2)]))["action"], "alert")

    def test_cancelled_run_does_not_consume_retry_budget(self):
        decision = sync.decide(state(managed_runs=[run(conclusion="cancelled")]))
        self.assertEqual(decision["action"], "dispatch")
        self.assertFalse(decision["retry"])

    def test_success_without_intended_live_content_is_not_republished(self):
        self.assertEqual(sync.decide(state(managed_runs=[run(conclusion="success")]))["action"], "alert")

    def test_unknown_history_timestamp_stops_instead_of_ignoring_an_attempt(self):
        self.assertEqual(sync.decide(state(managed_runs=[run(created_at=None)]))["action"], "alert")

    def test_dry_run_reports_due_release_without_dispatching(self):
        with patch.object(sync, "collect", return_value=state()), \
             patch.object(sync, "dispatch") as dispatch, \
             patch.object(sync.sys, "argv", ["sync", "--channel", "prod", "--scheduled-only", "--dry-run"]), \
             tempfile.TemporaryDirectory() as directory, \
             patch.dict(os.environ, {"GITHUB_OUTPUT": str(Path(directory)/"output"),
                                     "GITHUB_STEP_SUMMARY": str(Path(directory)/"summary")}):
            self.assertEqual(sync.main(), 0)
            dispatch.assert_not_called()
            self.assertIn("action=dispatch", (Path(directory)/"output").read_text())

    def test_daily_job_with_no_schedule_never_refreshes_the_frontend(self):
        empty = state(publication_schedule="", head_sha="d"*40,
                      changed_files=["apps/website/src/page.tsx"],
                      content_pins={"content": BASELINE, "published": BASELINE})
        with patch.object(sync, "collect", return_value=empty), \
             patch.object(sync, "dispatch") as dispatch, \
             patch.object(sync.sys, "argv", ["sync", "--channel", "prod", "--scheduled-only"]), \
             tempfile.TemporaryDirectory() as directory, \
             patch.dict(os.environ, {"GITHUB_OUTPUT": str(Path(directory)/"output"),
                                     "GITHUB_STEP_SUMMARY": str(Path(directory)/"summary")}):
            self.assertEqual(sync.main(), 0)
            dispatch.assert_not_called()
            self.assertIn("action=no-schedule", (Path(directory)/"output").read_text())

    def test_workflow_passes_schedule_and_keeps_shared_serialization(self):
        import yaml
        workflow = yaml.safe_load((ROOT/".github/workflows/website-managed-sync.yml").read_text())
        job = workflow["jobs"]["sync"]
        step = next(step for step in job["steps"] if step.get("id") == "sync")
        self.assertEqual(step["env"]["BLOG_PROD_PUBLICATION_SCHEDULE"], "${{ vars.BLOG_PROD_PUBLICATION_SCHEDULE }}")
        self.assertEqual(job["concurrency"]["group"], "website-managed-sync-${{ matrix.channel }}")
        self.assertEqual(job["permissions"], {"contents": "read", "actions": "write"})

    def test_scheduled_job_runs_daily_and_uses_the_production_queue(self):
        import yaml
        workflow = yaml.safe_load((ROOT/".github/workflows/blog-scheduled-publish.yml").read_text())
        self.assertEqual(workflow.get("on", workflow.get(True))["schedule"], [{"cron": "0 1 * * *"}])
        job = workflow["jobs"]["schedule"]
        self.assertEqual(job["concurrency"]["group"], "website-managed-sync-prod")
        self.assertIn("--scheduled-only", job["steps"][1]["run"])
        self.assertEqual(job["permissions"], {"contents": "read", "actions": "write"})


if __name__ == "__main__":
    unittest.main()
