"""Production release authorization must bind CI, source and private approvals."""

import copy
import importlib.util
import json
import os
import stat
import subprocess
import tempfile
import unittest
from pathlib import Path

SCRIPT = Path(__file__).resolve().parents[1] / "blog_prod_gate.py"
SPEC = importlib.util.spec_from_file_location("blog_prod_gate", SCRIPT)
gate = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(gate)
SHA = "a" * 40
CONTENT = "b" * 40
REPOSITORY = "daodaoedu/daodao-f2e"


def environment():
    return {
        "GITHUB_REPOSITORY": REPOSITORY,
        "GITHUB_EVENT_NAME": "workflow_dispatch",
        "GITHUB_REF": "refs/heads/prod",
        "GITHUB_SHA": SHA,
        "BLOG_PROD_CONTENT_SHA": CONTENT,
        "BLOG_PROD_RELEASE_MANAGED": "true",
        "BLOG_PROD_APPROVALS": json.dumps(
            [
                {
                    "id": "guide",
                    "digest": "c" * 64,
                    "reviewer": "pm",
                    "evidence": "review-539",
                }
            ]
        ),
    }


class GateTests(unittest.TestCase):
    def setUp(self):
        self.env = environment()
        self.workflow = {
            "id": 12,
            "path": ".github/workflows/linode-ci.yml",
            "state": "active",
        }
        self.run = {
            "id": 45,
            "workflow_id": 12,
            "path": ".github/workflows/linode-ci.yml",
            "repository": {"full_name": REPOSITORY, "fork": False},
            "head_repository": {"full_name": REPOSITORY, "fork": False},
            "head_branch": "prod",
            "head_sha": SHA,
            "event": "push",
            "status": "completed",
            "conclusion": "success",
            "run_attempt": 2,
        }
        self.calls = []

    def api(self, endpoint):
        self.calls.append(endpoint)
        if endpoint.endswith("git/ref/heads/prod"):
            return {"object": {"sha": SHA}}
        if endpoint.endswith("actions/workflows/linode-ci.yml"):
            return copy.deepcopy(self.workflow)
        if endpoint.endswith("actions/runs/45"):
            return copy.deepcopy(self.run)
        if "actions/workflows/linode-cd.yml/runs?" in endpoint:
            return {"workflow_runs": []}
        self.fail(f"Unexpected API endpoint: {endpoint}")

    def authorize(self, **kwargs):
        return gate.authorize(self.env, "45", SHA, self.api, **kwargs)

    def test_success_binds_source_content_and_exact_ci(self):
        result = self.authorize()
        self.assertEqual(result["frontend_sha"], SHA)
        self.assertEqual(result["content_sha"], CONTENT)
        self.assertEqual(result["ci_run_id"], 45)
        self.assertEqual(result["ci_run_attempt"], 2)
        self.assertEqual(result["approvals"][0]["reviewer"], "pm")
        self.assertIn(SHA, result["release_id"])
        self.assertIn(CONTENT, result["release_id"])
        self.assertEqual(len(self.calls), 4)

    def test_manual_nonprod_fork_and_disabled_managed_contexts_reject_before_api(self):
        for key, value in [
            ("GITHUB_REPOSITORY", "fork/daodao-f2e"),
            ("GITHUB_EVENT_NAME", "pull_request"),
            ("GITHUB_REF", "refs/heads/dev"),
            ("BLOG_PROD_RELEASE_MANAGED", "false"),
            ("BLOG_PROD_RELEASE_MANAGED", "yes"),
        ]:
            with self.subTest(key=key, value=value):
                self.env = environment()
                self.env[key] = value
                with self.assertRaises(ValueError):
                    self.authorize()
                self.assertEqual(self.calls, [])

    def test_invalid_sha_and_ci_ids_rejected_without_api(self):
        for ci in ("0", "-1", "45\n", "4e2", "+45", "４５"):
            with self.subTest(ci=ci), self.assertRaises(ValueError):
                gate.authorize(self.env, ci, SHA, self.api)
        for key in ("GITHUB_SHA", "BLOG_PROD_CONTENT_SHA"):
            for value in ("", "a" * 39, "A" * 40, "a" * 40 + "\n"):
                self.env = environment()
                self.env[key] = value
                with self.subTest(key=key, value=value), self.assertRaises(ValueError):
                    self.authorize()
        self.assertEqual(self.calls, [])

    def test_checkout_or_current_prod_mismatch_rejects(self):
        with self.assertRaises(ValueError):
            gate.authorize(self.env, "45", "d" * 40, self.api)
        self.env["GITHUB_SHA"] = "e" * 40
        with self.assertRaises(ValueError):
            gate.authorize(self.env, "45", "e" * 40, self.api)

    def test_ci_identity_failure_incomplete_wrong_source_and_pull_request_reject(self):
        mutations = [
            ("id", 46),
            ("workflow_id", 99),
            ("path", ".github/workflows/fake.yml"),
            ("head_sha", "d" * 40),
            ("head_branch", "dev"),
            ("event", "pull_request"),
            ("status", "in_progress"),
            ("conclusion", "failure"),
            ("conclusion", "cancelled"),
            ("conclusion", "skipped"),
            ("conclusion", None),
            ("repository", {"full_name": "fork/daodao-f2e", "fork": False}),
            ("head_repository", {"full_name": REPOSITORY, "fork": True}),
            ("head_repository", {"full_name": REPOSITORY}),
        ]
        original = copy.deepcopy(self.run)
        for key, value in mutations:
            self.run = copy.deepcopy(original)
            self.run[key] = value
            with self.subTest(key=key, value=value), self.assertRaises(ValueError):
                self.authorize()

    def test_manual_ci_for_exact_production_revision_is_allowed(self):
        self.run["event"] = "workflow_dispatch"
        self.assertEqual(self.authorize()["ci_run_id"], 45)

    def test_workflow_metadata_must_match_canonical_active_ci(self):
        for key, value in (
            ("path", "evil.yml"),
            ("state", "disabled_manually"),
            ("id", "12"),
        ):
            with self.subTest(key=key):
                original = self.workflow[key]
                self.workflow[key] = value
                with self.assertRaises(ValueError):
                    self.authorize()
                self.workflow[key] = original

    def test_missing_approval_never_produces_release(self):
        for approvals in ("", "[]", "{}", "not json"):
            self.env["BLOG_PROD_APPROVALS"] = approvals
            with self.subTest(approvals=approvals), self.assertRaises(ValueError):
                self.authorize()

    def test_recheck_rejects_changed_approval_content_or_ci_attempt(self):
        snapshot = self.authorize()
        for key, value in [
            ("BLOG_PROD_CONTENT_SHA", "e" * 40),
            (
                "BLOG_PROD_APPROVALS",
                self.env["BLOG_PROD_APPROVALS"].replace("review-539", "new-review"),
            ),
        ]:
            original = self.env[key]
            self.env[key] = value
            with self.subTest(key=key), self.assertRaises(ValueError):
                gate.check_snapshot(snapshot, self.env, SHA, self.api)
            self.env[key] = original
        self.run["run_attempt"] = 3
        with self.assertRaises(ValueError):
            gate.check_snapshot(snapshot, self.env, SHA, self.api)

    def test_equivalent_json_whitespace_does_not_require_new_approval(self):
        snapshot = self.authorize()
        self.env["BLOG_PROD_APPROVALS"] = json.dumps(snapshot["approvals"], indent=2)
        self.assertEqual(
            gate.check_snapshot(snapshot, self.env, SHA, self.api), snapshot
        )

    def test_private_snapshot_and_public_outputs_do_not_expose_approval(self):
        snapshot = self.authorize()
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary).resolve()
            workspace = root / "workspace"
            workspace.mkdir()
            runner = root / "runner"
            runner.mkdir()
            self.env.update(GITHUB_WORKSPACE=str(workspace), RUNNER_TEMP=str(runner))
            path = gate.write_snapshot(snapshot, self.env)
            self.assertTrue(path.is_relative_to(runner))
            self.assertEqual(stat.S_IMODE(path.stat().st_mode), 0o600)
            self.assertEqual(stat.S_IMODE(path.parent.stat().st_mode), 0o700)
            output = gate.public_outputs(snapshot, path)
            self.assertNotIn("review-539", output)
            self.assertNotIn('"reviewer"', output)
            self.assertNotIn("c" * 64, output)
            self.assertEqual(gate.read_snapshot(path, self.env), snapshot)
            tampered = json.loads(path.read_text())
            tampered["release_id"] = "different"
            path.write_text(json.dumps(tampered))
            with self.assertRaises(ValueError):
                gate.check_snapshot(
                    gate.read_snapshot(path, self.env), self.env, SHA, self.api
                )

    def test_snapshot_rejects_workspace_location_symlink_and_public_mode(self):
        snapshot = self.authorize()
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary).resolve()
            workspace = root / "workspace"
            workspace.mkdir()
            self.env.update(GITHUB_WORKSPACE=str(workspace), RUNNER_TEMP=str(workspace))
            with self.assertRaises(ValueError):
                gate.write_snapshot(snapshot, self.env)
            runner = root / "runner"
            runner.mkdir()
            self.env["RUNNER_TEMP"] = str(runner)
            path = gate.write_snapshot(snapshot, self.env)
            link = runner / "link.json"
            link.symlink_to(path)
            with self.assertRaises(ValueError):
                gate.read_snapshot(link, self.env)
            os.chmod(path, 0o644)
            with self.assertRaises(ValueError):
                gate.read_snapshot(path, self.env)

    def test_pending_legacy_deployment_on_second_page_blocks_release(self):
        pages = []

        def api(endpoint):
            if "linode-cd.yml/runs?" not in endpoint:
                return self.api(endpoint)
            pages.append(endpoint)
            if endpoint.endswith("page=1"):
                return {"workflow_runs": [{"status": "completed"}] * 100}
            return {"workflow_runs": [{"status": "queued"}]}

        with self.assertRaises(ValueError):
            gate.authorize(self.env, "45", SHA, api)
        self.assertEqual(len(pages), 2)

    def test_legacy_failed_completed_run_does_not_block_new_release(self):
        self.assertIsNone(
            gate.require_idle_legacy_cd(
                lambda endpoint: {
                    "workflow_runs": [{"status": "completed", "conclusion": "failure"}]
                }
            )
        )

    def test_legacy_unknown_status_malformed_or_api_failure_reject(self):
        for result in (
            {},
            {"workflow_runs": {}},
            {"workflow_runs": [{}]},
            {"workflow_runs": [{"status": "waiting"}]},
        ):
            with self.subTest(result=result), self.assertRaises(ValueError):
                gate.require_idle_legacy_cd(lambda endpoint, value=result: value)

        def unavailable(endpoint):
            raise subprocess.CalledProcessError(1, ["gh", "api"])

        with self.assertRaises(subprocess.CalledProcessError):
            gate.require_idle_legacy_cd(unavailable)

    def test_stage_uses_frozen_snapshot_and_actual_official_checkout(self):
        snapshot = self.authorize()
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary).resolve()
            workspace = root / "workspace"
            workspace.mkdir()
            runner = root / "runner"
            runner.mkdir()
            source = workspace / ".blog-dev-preview-source"
            source.mkdir()
            for name in ("authors.json", "topics.json"):
                (source / name).write_text("[]")
            (source / "articles").mkdir()
            (source / "articles/guide.md").write_text("approved article")
            commands = [
                ["git", "init", "-q"],
                ["git", "add", "."],
                [
                    "git",
                    "-c",
                    "user.name=Fixture",
                    "-c",
                    "user.email=fixture@example.invalid",
                    "-c",
                    "core.hooksPath=/dev/null",
                    "commit",
                    "-qm",
                    "content",
                ],
            ]
            for command in commands:
                subprocess.run(command, cwd=source, check=True, capture_output=True)
            snapshot["content_sha"] = subprocess.check_output(
                ["git", "rev-parse", "HEAD"], cwd=source, text=True
            ).strip()
            output = root / "github-env"
            output.touch()
            self.env.update(
                GITHUB_WORKSPACE=str(workspace),
                RUNNER_TEMP=str(runner),
                GITHUB_ENV=str(output),
            )
            # Stage receives the already checked frozen data, not this changed live value.
            self.env["BLOG_PROD_APPROVALS"] = "do not use this"
            gate.stage_snapshot(snapshot, self.env)
            values = dict(
                line.split("=", 1) for line in output.read_text().splitlines()
            )
            self.assertEqual(values["BLOG_CONTENT_MODE"], "publish")
            approvals = Path(values["BLOG_APPROVALS_FILE"])
            self.assertFalse(approvals.is_relative_to(workspace))
            self.assertEqual(json.loads(approvals.read_text()), snapshot["approvals"])
            self.assertEqual(
                (Path(values["BLOG_CONTENT_DIR"]) / "articles/guide.md").read_text(),
                "approved article",
            )

    def test_frozen_snapshot_hash_rejects_modified_private_file(self):
        snapshot = self.authorize()
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary).resolve()
            (root / "workspace").mkdir()
            (root / "runner").mkdir()
            self.env.update(
                GITHUB_WORKSPACE=str(root / "workspace"),
                RUNNER_TEMP=str(root / "runner"),
            )
            path = gate.write_snapshot(snapshot, self.env)
            expected = gate.digest(path.read_bytes())
            self.assertEqual(gate.read_snapshot(path, self.env, expected), snapshot)
            path.write_text(path.read_text().replace("review-539", "different"))
            with self.assertRaises(ValueError):
                gate.read_snapshot(path, self.env, expected)


if __name__ == "__main__":
    unittest.main()
