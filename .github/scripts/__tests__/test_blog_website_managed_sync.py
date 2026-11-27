"""Decision table for website_managed_sync (daodao#563).

Expected values come from the issue's acceptance contract: publish website
heads automatically, keep approved content, never double-dispatch, alert when
the public site keeps lagging.
"""

import datetime as dt
import importlib.util
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
SPEC = importlib.util.spec_from_file_location(
    "website_managed_sync", ROOT / ".github/scripts/website_managed_sync.py"
)
sync = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(sync)

OLD = "1da94428e0b83d0d5135200d055739e263f27364"
HEAD = "d01a04c8913c13a640e7326f34fe7ba0634a084a"
CONTENT = "5c4eee88b2e022229852846b07e073bef8b7c10d"
NOW = dt.datetime(2026, 11, 23, 12, 0, tzinfo=dt.UTC)


class _FrozenDatetime(dt.datetime):
    @classmethod
    def now(cls, tz=None):
        return NOW


def setUpModule():
    # collect() stamps State.now with the wall clock; fixtures date from 2026-11-23,
    # so without a fixed clock lag-window cases turn into "alert" an hour later.
    sync.dt = type("FrozenDt", (), {**vars(dt), "datetime": _FrozenDatetime})


def tearDownModule():
    sync.dt = dt


def state(**overrides):
    values = {
        "channel": "dev",
        "managed": True,
        "head_sha": HEAD,
        "marker": {"frontend_sha": OLD, "content_sha": CONTENT},
        "changed_files": [
            "apps/website/src/app/[locale]/(without-layout)/dev/mock-preview/lighthouse/route.ts"
        ],
        "ci": {
            "id": 111,
            "status": "completed",
            "conclusion": "success",
            "updated_at": "2026-11-23T11:50:00Z",
        },
        "legacy_cd_idle": True,
        "managed_runs": [],
        "now": NOW,
    }
    values.update(overrides)
    return sync.State(**values)


class DecideTests(unittest.TestCase):
    def test_dev_website_change_dispatches_refresh_preserving_live_content(self):
        decision = sync.decide(state())
        self.assertEqual(decision["action"], "dispatch")
        self.assertEqual(decision["workflow"], "blog-dev-bootstrap.yml")
        self.assertEqual(decision["ref"], "dev")
        self.assertEqual(
            decision["inputs"],
            {"operation": "frontend-refresh", "content_sha": CONTENT},
        )

    def test_prod_website_change_dispatches_with_exact_ci_run(self):
        decision = sync.decide(
            state(
                channel="prod",
                marker={"frontend_sha": OLD, "content_sha": CONTENT},
                content_pins={"content": CONTENT, "published": CONTENT},
            )
        )
        self.assertEqual(decision["action"], "dispatch")
        self.assertEqual(decision["workflow"], "blog-prod-publish.yml")
        self.assertEqual(decision["ref"], "prod")
        self.assertEqual(decision["inputs"], {"ci_run_id": "111", "expected_content_sha": CONTENT})

    def test_prod_never_auto_publishes_a_staged_content_release(self):
        staged = "7" * 40
        for pins in [
            {"content": staged, "published": CONTENT},
            {"content": CONTENT, "published": staged},
            {"content": "", "published": ""},
        ]:
            with self.subTest(pins=pins):
                decision = sync.decide(
                    state(
                        channel="prod",
                        marker={"frontend_sha": OLD, "content_sha": CONTENT},
                        content_pins=pins,
                    )
                )
                self.assertEqual(decision["action"], "wait")

    def test_prod_staged_content_alerts_after_lag_window(self):
        decision = sync.decide(
            state(
                channel="prod",
                marker={"frontend_sha": OLD, "content_sha": CONTENT},
                content_pins={"content": "7" * 40, "published": CONTENT},
                ci={
                    "id": 111,
                    "status": "completed",
                    "conclusion": "success",
                    "updated_at": "2026-11-23T10:30:00Z",
                },
            )
        )
        self.assertEqual(decision["action"], "alert")

    def test_site_already_on_head_does_nothing(self):
        decision = sync.decide(
            state(marker={"frontend_sha": HEAD, "content_sha": CONTENT})
        )
        self.assertEqual(decision["action"], "up-to-date")

    def test_head_without_website_changes_does_nothing(self):
        decision = sync.decide(
            state(
                changed_files=["apps/product/src/app/page.tsx", "apps/mobile/app.tsx"]
            )
        )
        self.assertEqual(decision["action"], "no-website-change")

    def test_shared_package_change_counts_as_website_change(self):
        decision = sync.decide(state(changed_files=["packages/ui/src/button.tsx"]))
        self.assertEqual(decision["action"], "dispatch")

    def test_unknown_diff_is_treated_as_website_change(self):
        decision = sync.decide(state(changed_files=None))
        self.assertEqual(decision["action"], "dispatch")

    def test_running_publication_for_head_is_not_dispatched_again(self):
        for status in ["queued", "in_progress", "waiting", "pending", "requested"]:
            with self.subTest(status=status):
                decision = sync.decide(
                    state(managed_runs=[{"id": 9, "head_sha": HEAD, "status": status}])
                )
                self.assertEqual(decision["action"], "wait")

    def test_running_publication_for_older_sha_does_not_block_new_head(self):
        decision = sync.decide(
            state(managed_runs=[{"id": 9, "head_sha": OLD, "status": "in_progress"}])
        )
        self.assertEqual(decision["action"], "dispatch")

    def test_one_failed_publication_is_retried_once(self):
        decision = sync.decide(
            state(
                managed_runs=[
                    {
                        "id": 9,
                        "head_sha": HEAD,
                        "status": "completed",
                        "conclusion": "failure",
                    }
                ]
            )
        )
        self.assertEqual(decision["action"], "dispatch")
        self.assertTrue(decision["retry"])

    def test_repeated_failure_alerts_instead_of_redispatching(self):
        failed = [
            {"id": n, "head_sha": HEAD, "status": "completed", "conclusion": "failure"}
            for n in (9, 10)
        ]
        decision = sync.decide(state(managed_runs=failed))
        self.assertEqual(decision["action"], "alert")
        self.assertEqual(decision["runs"], [9, 10])

    def test_success_without_marker_change_alerts(self):
        decision = sync.decide(
            state(
                managed_runs=[
                    {
                        "id": 9,
                        "head_sha": HEAD,
                        "status": "completed",
                        "conclusion": "success",
                    }
                ]
            )
        )
        self.assertEqual(decision["action"], "alert")

    def test_ci_still_running_waits(self):
        decision = sync.decide(state(ci={"id": 111, "status": "in_progress"}))
        self.assertEqual(decision["action"], "wait")

    def test_missing_ci_waits(self):
        self.assertEqual(sync.decide(state(ci=None))["action"], "wait")

    def test_failed_ci_never_publishes(self):
        decision = sync.decide(
            state(ci={"id": 111, "status": "completed", "conclusion": "failure"})
        )
        self.assertEqual(decision["action"], "blocked")

    def test_busy_legacy_cd_waits_inside_lag_window(self):
        decision = sync.decide(state(legacy_cd_idle=False))
        self.assertEqual(decision["action"], "wait")

    def test_busy_legacy_cd_alerts_after_lag_window(self):
        decision = sync.decide(
            state(
                legacy_cd_idle=False,
                ci={
                    "id": 111,
                    "status": "completed",
                    "conclusion": "success",
                    "updated_at": "2026-11-23T10:30:00Z",
                },
            )
        )
        self.assertEqual(decision["action"], "alert")

    def test_unreadable_marker_alerts(self):
        for marker in [None, {}, {"frontend_sha": "short"}]:
            with self.subTest(marker=marker):
                self.assertEqual(sync.decide(state(marker=marker))["action"], "alert")

    def test_dev_marker_without_full_content_sha_alerts_instead_of_default_content(
        self,
    ):
        decision = sync.decide(state(marker={"frontend_sha": OLD}))
        self.assertEqual(decision["action"], "alert")

    def test_unmanaged_channel_is_left_to_legacy_cd(self):
        self.assertEqual(sync.decide(state(managed=False))["action"], "legacy")


class FakeApi:
    def __init__(self, responses):
        self.responses = responses
        self.calls = []

    def __call__(self, endpoint):
        self.calls.append(endpoint)
        for prefix, value in self.responses.items():
            if endpoint.startswith(prefix):
                if isinstance(value, Exception):
                    raise value
                return value
        raise AssertionError("unexpected endpoint " + endpoint)


def repo(path):
    return "repos/daodaoedu/daodao-f2e/" + path


class CollectTests(unittest.TestCase):
    def api(self, **overrides):
        responses = {
            repo("git/ref/heads/dev"): {"object": {"sha": HEAD}},
            repo(f"compare/{OLD}...{HEAD}"): {
                "status": "ahead",
                "files": [{"filename": "apps/website/src/x.ts"}],
            },
            repo("actions/workflows/linode-ci.yml/runs"): {
                "workflow_runs": [
                    {
                        "id": 1,
                        "head_sha": HEAD,
                        "status": "completed",
                        "conclusion": "failure",
                        "created_at": "2026-11-23T10:00:00Z",
                    },
                    {
                        "id": 2,
                        "head_sha": HEAD,
                        "status": "completed",
                        "conclusion": "success",
                        "created_at": "2026-11-23T11:00:00Z",
                        "updated_at": "2026-11-23T11:10:00Z",
                    },
                ]
            },
            repo("actions/workflows/linode-cd.yml/runs"): {"workflow_runs": []},
            repo("actions/workflows/blog-dev-bootstrap.yml/runs"): {
                "workflow_runs": []
            },
        }
        responses.update(overrides)
        return FakeApi(responses)

    def marker(self, _url):
        return {"frontend_sha": OLD, "content_sha": CONTENT}

    def test_collect_uses_latest_ci_attempt_and_live_marker(self):
        result = sync.collect(
            "dev", {"BLOG_DEV_RELEASE_MANAGED": "true"}, self.api(), self.marker
        )
        self.assertEqual(result.ci["id"], 2)
        self.assertEqual(result.changed_files, ["apps/website/src/x.ts"])
        self.assertTrue(result.legacy_cd_idle)
        self.assertEqual(sync.decide(result)["action"], "dispatch")

    def test_dev_idle_check_covers_every_branch_like_the_drain(self):
        api = self.api()
        sync.collect("dev", {"BLOG_DEV_RELEASE_MANAGED": "true"}, api, self.marker)
        cd_calls = [call for call in api.calls if "linode-cd.yml" in call]
        self.assertTrue(cd_calls)
        self.assertFalse(any("branch=" in call for call in cd_calls))

    def test_active_legacy_cd_is_not_idle(self):
        api = self.api(
            **{
                repo("actions/workflows/linode-cd.yml/runs"): {
                    "workflow_runs": [{"id": 5, "status": "in_progress"}]
                }
            }
        )
        result = sync.collect(
            "dev", {"BLOG_DEV_RELEASE_MANAGED": "true"}, api, self.marker
        )
        self.assertFalse(result.legacy_cd_idle)

    def test_compare_failure_means_unknown_diff(self):
        api = self.api(
            **{repo(f"compare/{OLD}...{HEAD}"): subprocess.CalledProcessError(1, "gh")}
        )
        result = sync.collect(
            "dev", {"BLOG_DEV_RELEASE_MANAGED": "true"}, api, self.marker
        )
        self.assertIsNone(result.changed_files)

    def test_diverged_or_truncated_compare_means_unknown_diff(self):
        for comparison in [
            {"status": "diverged", "files": []},
            {"status": "ahead", "files": [{"filename": "a"}] * 300},
        ]:
            with self.subTest(status=comparison["status"]):
                api = self.api(**{repo(f"compare/{OLD}...{HEAD}"): comparison})
                result = sync.collect(
                    "dev", {"BLOG_DEV_RELEASE_MANAGED": "true"}, api, self.marker
                )
                self.assertIsNone(result.changed_files)

    def test_unmanaged_channel_reads_nothing_else(self):
        api = self.api()
        result = sync.collect(
            "dev", {"BLOG_DEV_RELEASE_MANAGED": "false"}, api, self.marker
        )
        self.assertEqual(sync.decide(result)["action"], "legacy")
        self.assertEqual(api.calls, [repo("git/ref/heads/dev")])


class ReviewRegressionTests(unittest.TestCase):
    """Findings from the four-engine review of daodao#563."""

    def test_linode_cd_website_trigger_paths_also_hand_off(self):
        # linode-cd.yml treats these as website changes and then skips them.
        for name in [
            ".dockerignore",
            ".github/workflows/linode-cd.yml",
            ".github/scripts/blog-dev-preview.py",
        ]:
            with self.subTest(name=name):
                self.assertEqual(
                    sync.decide(state(changed_files=[name]))["action"], "dispatch"
                )

    def test_paths_that_only_look_similar_are_not_website_changes(self):
        for name in [".dockerignore.bak", ".github/workflows/linode-ci.yml"]:
            with self.subTest(name=name):
                self.assertEqual(
                    sync.decide(state(changed_files=[name]))["action"],
                    "no-website-change",
                )

    def test_dev_probe_runs_are_not_publication_attempts(self):
        # A successful probe on head publishes nothing; it must not raise a
        # "succeeded but marker unchanged" alert or block the refresh.
        def run(identifier, title, conclusion):
            return {
                "id": identifier,
                "head_sha": HEAD,
                "status": "completed",
                "conclusion": conclusion,
                "display_title": title,
            }

        api = CollectTests().api(
            **{
                repo("actions/workflows/blog-dev-bootstrap.yml/runs"): {
                    "workflow_runs": [
                        run(7, "Blog development probe", "success"),
                        run(8, "Blog development probe", "failure"),
                        run(9, "Blog development probe", "failure"),
                    ]
                }
            }
        )
        result = sync.collect(
            "dev",
            {"BLOG_DEV_RELEASE_MANAGED": "true"},
            api,
            lambda _url: {"frontend_sha": OLD, "content_sha": CONTENT},
        )
        self.assertEqual(result.managed_runs, [])
        self.assertEqual(sync.decide(result)["action"], "dispatch")

    def test_dev_publication_runs_still_count(self):
        api = CollectTests().api(
            **{
                repo("actions/workflows/blog-dev-bootstrap.yml/runs"): {
                    "workflow_runs": [
                        {
                            "id": 9,
                            "head_sha": HEAD,
                            "status": "in_progress",
                            "display_title": "Blog development frontend-refresh",
                        }
                    ]
                }
            }
        )
        result = sync.collect(
            "dev",
            {"BLOG_DEV_RELEASE_MANAGED": "true"},
            api,
            lambda _url: {"frontend_sha": OLD, "content_sha": CONTENT},
        )
        self.assertEqual(sync.decide(result)["action"], "wait")


class SpecAuditRegressionTests(unittest.TestCase):
    """Independent spec audit findings for daodao#563 (AC-04, AC-05)."""

    def failed_once(self):
        return state(
            managed_runs=[
                {
                    "id": 9,
                    "head_sha": HEAD,
                    "status": "completed",
                    "conclusion": "failure",
                }
            ]
        )

    def run_main(self, decision_state, tmp):
        import os
        from unittest.mock import patch

        env = {
            "GITHUB_STEP_SUMMARY": str(tmp / "summary.md"),
            "GITHUB_OUTPUT": str(tmp / "output.txt"),
        }
        with (
            patch.object(sync, "collect", return_value=decision_state),
            patch.object(sync, "dispatch") as dispatched,
            patch.object(sync.sys, "argv", ["sync", "--channel", "dev"]),
            patch.dict(os.environ, env),
        ):
            code = sync.main()
        return code, dispatched, (tmp / "output.txt").read_text()

    def test_first_failure_retries_and_still_fails_the_check(self):
        import tempfile

        with tempfile.TemporaryDirectory() as directory:
            code, dispatched, output = self.run_main(
                self.failed_once(), Path(directory)
            )
        self.assertEqual(code, 1)
        dispatched.assert_called_once()
        self.assertIn("retried once", output)

    def test_first_publication_dispatch_keeps_the_check_green(self):
        import tempfile

        with tempfile.TemporaryDirectory() as directory:
            code, dispatched, _output = self.run_main(state(), Path(directory))
        self.assertEqual(code, 0)
        dispatched.assert_called_once()

    def test_publication_stuck_past_lag_window_alerts(self):
        decision = sync.decide(
            state(
                managed_runs=[{"id": 9, "head_sha": HEAD, "status": "queued"}],
                ci={
                    "id": 111,
                    "status": "completed",
                    "conclusion": "success",
                    "updated_at": "2026-11-23T10:30:00Z",
                },
            )
        )
        self.assertEqual(decision["action"], "alert")

    def test_cancelled_runs_do_not_use_the_retry_budget(self):
        cancelled = [
            {
                "id": n,
                "head_sha": HEAD,
                "status": "completed",
                "conclusion": "cancelled",
            }
            for n in (9, 10)
        ]
        decision = sync.decide(state(managed_runs=cancelled))
        self.assertEqual(decision["action"], "dispatch")
        self.assertFalse(decision["retry"])

    def test_managed_flag_matches_cd_ownership_rule(self):
        api = CollectTests().api()
        for value, managed in [
            ("true", True),
            ("TRUE", True),
            ("1", True),
            ("false", False),
            ("", False),
        ]:
            with self.subTest(value=value):
                result = sync.collect(
                    "dev",
                    {"BLOG_DEV_RELEASE_MANAGED": value},
                    api,
                    lambda _url: {"frontend_sha": HEAD, "content_sha": CONTENT},
                )
                self.assertEqual(result.managed, managed)


class SyncWorkflowTests(unittest.TestCase):
    def setUp(self):
        import yaml

        self.yaml = yaml
        self.workflow = yaml.safe_load(
            (ROOT / ".github/workflows/website-managed-sync.yml").read_text()
        )

    def test_cd_completion_is_not_filtered_by_head_branch(self):
        # Linode CD runs from the default branch: its workflow_run head_branch
        # is dev even when it deployed prod, so a branch filter drops prod.
        events = self.workflow.get("on", self.workflow.get(True))
        self.assertNotIn("branches", events["workflow_run"])
        self.assertIn("Linode CD", events["workflow_run"]["workflows"])
        for step in self.workflow["jobs"]["sync"]["steps"][:2]:
            self.assertNotIn("head_branch", str(step.get("if", "")))

    def test_dev_run_title_names_the_operation(self):
        dev = self.yaml.safe_load(
            (ROOT / ".github/workflows/blog-dev-bootstrap.yml").read_text()
        )
        self.assertEqual(
            dev["run-name"], "Blog development ${{ inputs.operation || 'probe' }}"
        )
        options = dev.get("on", dev.get(True))["workflow_dispatch"]["inputs"][
            "operation"
        ]["options"]
        expected = {"Blog development " + name for name in options}
        self.assertEqual(sync.PUBLICATION_TITLES, expected - {"Blog development probe"})


class FakeResponse:
    def __init__(self, status, body):
        self.status = status
        self.body = body

    def __enter__(self):
        return self

    def __exit__(self, *_args):
        return False

    def read(self, _limit):
        return self.body


class MarkerTests(unittest.TestCase):
    def test_marker_request_avoids_blocked_default_user_agent(self):
        # Regression: Cloudflare returned 403 to urllib's default agent, which
        # made every sync raise a false "marker unreadable" alert.
        seen = []

        def opener(request, timeout):
            seen.append(request.get_header("User-agent"))
            return FakeResponse(200, b'{"frontend_sha": "x"}')

        self.assertEqual(
            sync.read_marker("https://dev.daodao.so/blog-release.json", opener),
            {"frontend_sha": "x"},
        )
        self.assertTrue(seen[0])
        self.assertNotIn("Python-urllib", seen[0])

    def test_marker_errors_become_unreadable(self):
        def refused(_request, timeout):
            raise OSError("refused")

        self.assertIsNone(sync.read_marker("https://x", refused))
        self.assertIsNone(
            sync.read_marker("https://x", lambda _r, timeout: FakeResponse(200, b"<"))
        )


class DispatchTests(unittest.TestCase):
    def test_dispatch_command_targets_channel_ref_and_inputs(self):
        calls = []
        sync.dispatch(sync.decide(state()), run=calls.append)
        self.assertEqual(
            calls,
            [
                [
                    "gh",
                    "workflow",
                    "run",
                    "blog-dev-bootstrap.yml",
                    "--repo",
                    "daodaoedu/daodao-f2e",
                    "--ref",
                    "dev",
                    "-f",
                    f"content_sha={CONTENT}",
                    "-f",
                    "operation=frontend-refresh",
                ]
            ],
        )


if __name__ == "__main__":
    unittest.main()

