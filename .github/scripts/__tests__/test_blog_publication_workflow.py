"""Actual parsed manual workflow boundaries, without any hosted/SSH mutation."""

import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

import yaml
from test_blog_dev_preview import workflow_condition

ROOT = Path(__file__).resolve().parents[3]
WORKFLOW = ROOT / ".github/workflows/blog-dev-bootstrap.yml"
CHECKS = ROOT / ".github/workflows/blog-dev-bootstrap-check.yml"


def context(**updates):
    values = {
        "github.repository": "daodaoedu/daodao-f2e",
        "github.event_name": "workflow_dispatch",
        "github.ref": "refs/heads/dev",
        "inputs.operation": "publication-test",
        "vars.BLOG_DEV_RELEASE_MANAGED": "true",
        "needs.prepare.result": "success",
        "steps.publish.outcome": "success",
    }
    values.update(updates)
    return values


class PublicationWorkflowTests(unittest.TestCase):
    def setUp(self):
        self.workflow = yaml.safe_load(WORKFLOW.read_text())
        self.jobs = self.workflow["jobs"]

    def test_manual_publication_is_an_explicit_choice_with_probe_default(self):
        events = self.workflow.get("on", self.workflow.get(True))
        inputs = (events["workflow_dispatch"] or {}).get("inputs", {})
        self.assertEqual(
            inputs.get("operation", {}).get("options"), ["probe", "publication-test"]
        )
        self.assertEqual(inputs["operation"]["default"], "probe")
        self.assertEqual(
            inputs["content_sha"]["default"], "0daa4231bb2072657c807813e960919b982f9d8e"
        )

    def test_publication_only_uses_official_manual_dev_and_managed_owner(self):
        self.assertTrue(workflow_condition(self.jobs["prepare"]["if"], context()))
        self.assertTrue(workflow_condition(self.jobs["publish"]["if"], context()))
        for changes in [
            {"github.repository": "fork/daodao-f2e"},
            {"github.event_name": "pull_request"},
            {"github.ref": "refs/heads/prod"},
            {"inputs.operation": "probe"},
            {"inputs.operation": "unknown"},
        ]:
            with self.subTest(changes=changes):
                self.assertFalse(
                    workflow_condition(self.jobs["prepare"]["if"], context(**changes))
                )
                self.assertFalse(
                    workflow_condition(self.jobs["publish"]["if"], context(**changes))
                )
        self.assertFalse(
            workflow_condition(
                self.jobs["publish"]["if"],
                context(**{"vars.BLOG_DEV_RELEASE_MANAGED": "false"}),
            )
        )
        self.assertFalse(
            workflow_condition(
                self.jobs["publish"]["if"],
                context(**{"needs.prepare.result": "failure"}),
            )
        )
        for operation in ["probe", ""]:
            self.assertTrue(
                workflow_condition(
                    self.jobs["probe"]["if"], context(**{"inputs.operation": operation})
                )
            )

    def test_preparation_has_no_environment_or_ssh_secrets_and_uses_immutable_source(
        self,
    ):
        job = self.jobs["prepare"]
        self.assertNotIn("environment", job)
        self.assertNotIn("secrets.", json.dumps(job))
        self.assertEqual(job["permissions"], {"contents": "read", "actions": "read"})
        checkout = next(
            s for s in job["steps"] if s.get("uses", "").startswith("actions/checkout@")
        )
        self.assertEqual(checkout["with"]["ref"], "${{ github.sha }}")
        self.assertIs(checkout["with"]["persist-credentials"], False)
        node = next(
            s
            for s in job["steps"]
            if s.get("uses", "").startswith("actions/setup-node@")
        )
        pnpm = next(
            s
            for s in job["steps"]
            if s.get("uses", "").startswith("pnpm/action-setup@")
        )
        self.assertEqual(node["with"]["node-version"], "20.19.4")
        self.assertEqual(pnpm["with"]["version"], "10.20.0")
        self.assertIn(
            'pnpm install --frozen-lockfile --filter "@daodao/blog-content..."',
            "\n".join(step.get("run", "") for step in job["steps"]),
        )

    def test_uploaded_data_and_expected_hash_are_bound_to_prepare_job_outputs(self):
        job = self.jobs["prepare"]
        upload = next(s for s in job["steps"] if s.get("id") == "upload")
        self.assertEqual(upload["with"]["name"], "dev-publication-data")
        self.assertEqual(
            upload["with"]["path"],
            "${{ runner.temp }}/blog-development-publication/transfer",
        )
        self.assertEqual(upload["with"]["if-no-files-found"], "error")
        self.assertEqual(
            job["outputs"]["producer_sha"], "${{ steps.prepare.outputs.producer_sha }}"
        )
        self.assertEqual(
            job["outputs"]["artifact_id"], "${{ steps.upload.outputs.artifact-id }}"
        )
        download = next(
            s for s in self.jobs["publish"]["steps"] if s.get("id") == "download"
        )
        self.assertEqual(
            download["with"]["artifact-ids"], "${{ needs.prepare.outputs.artifact_id }}"
        )
        self.assertEqual(download["with"]["run-id"], "${{ github.run_id }}")
        self.assertIs(download["with"]["merge-multiple"], True)
        self.assertNotIn("name", download["with"])
        self.assertNotIn("pattern", download["with"])

    def test_fresh_source_and_data_are_verified_before_any_ssh_identity(self):
        job = self.jobs["publish"]
        steps = job["steps"]
        self.assertEqual(job["needs"], "prepare")
        self.assertEqual(job["environment"], "development")
        self.assertEqual(job["permissions"], {"contents": "read", "actions": "read"})
        self.assertFalse(
            any(
                "setup-node" in s.get("uses", "") or "pnpm" in s.get("run", "")
                for s in steps
            )
        )
        checkout = next(
            s for s in steps if s.get("uses", "").startswith("actions/checkout@")
        )
        self.assertEqual(checkout["with"]["ref"], "${{ github.sha }}")
        self.assertIs(checkout["with"]["persist-credentials"], False)
        first_secret = next(
            i for i, s in enumerate(steps) if "secrets." in json.dumps(s)
        )
        for identifier in [
            "source-guard",
            "artifact-identity",
            "download",
            "data-guard",
        ]:
            self.assertLess(
                next(i for i, s in enumerate(steps) if s.get("id") == identifier),
                first_secret,
            )
        source = next(s for s in steps if s.get("id") == "source-guard")
        self.assertIn("source['check_context'](os.environ)", source["run"])
        self.assertIn("source['check_source'](os.environ)", source["run"])
        guard = next(s for s in steps if s.get("id") == "data-guard")
        self.assertIn("--verify-only", guard["run"])
        self.assertEqual(
            guard["env"]["EXPECTED_PRODUCER_SHA"],
            "${{ needs.prepare.outputs.producer_sha }}",
        )
        publish = next(s for s in steps if s.get("id") == "publish")
        self.assertEqual(
            publish["env"]["EXPECTED_PRODUCER_SHA"],
            guard["env"]["EXPECTED_PRODUCER_SHA"],
        )
        self.assertEqual(
            publish["env"]["BLOG_SSH_HOST"], "${{ secrets.LINODE_INSTANCE_IP }}"
        )
        self.assertEqual(
            publish["env"]["BLOG_SSH_PRIVATE_KEY"],
            "${{ secrets.LINODE_SSH_PRIVATE_KEY }}",
        )
        self.assertNotIn("BOT_PAT", json.dumps(job))

    def test_artifact_metadata_guard_rejects_empty_or_data_injected_handles(self):
        step = next(
            s
            for s in self.jobs["publish"]["steps"]
            if s.get("id") == "artifact-identity"
        )
        for identifier, digest, valid in [
            ("123", "a" * 64, True),
            ("", "a" * 64, False),
            ("123", "", False),
            ("$(touch never)", "a" * 64, False),
            ("123", "a" * 63, False),
        ]:
            result = subprocess.run(
                ["bash", "-e", "-c", step["run"]],
                env={
                    **os.environ,
                    "ARTIFACT_ID": identifier,
                    "EXPECTED_PRODUCER_SHA": digest,
                },
                capture_output=True,
                text=True,
                check=False,
            )
            self.assertEqual(result.returncode == 0, valid)

    def test_content_input_is_an_argument_not_executable_shell(self):
        step = next(
            s for s in self.jobs["prepare"]["steps"] if s.get("id") == "prepare"
        )
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            bin_dir = root / "bin"
            bin_dir.mkdir()
            record = root / "args.json"
            sentinel = root / "injected"
            python = bin_dir / "python3"
            python.write_text(
                "#!"
                + sys.executable
                + '\nimport json,os,sys\nopen(os.environ["ARG_RECORD"],"w").write(json.dumps(sys.argv[1:]))\n'
            )
            python.chmod(0o755)
            injected = '$(touch "' + str(sentinel) + '")'
            result = subprocess.run(
                ["bash", "-e", "-c", step["run"]],
                env={
                    **os.environ,
                    "PATH": str(bin_dir) + os.pathsep + os.environ["PATH"],
                    "CONTENT_SHA": injected,
                    "ARG_RECORD": str(record),
                },
                capture_output=True,
                text=True,
                check=False,
            )
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertFalse(sentinel.exists())
            self.assertEqual(json.loads(record.read_text())[-1], injected)

    def test_publication_key_is_private_unset_for_child_and_removed_by_trap(self):
        step = next(
            s for s in self.jobs["publish"]["steps"] if s.get("id") == "publish"
        )
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            bin_dir = root / "bin"
            bin_dir.mkdir()
            record = root / "boundary.json"
            python = bin_dir / "python3"
            python.write_text(
                "#!"
                + sys.executable
                + '\nimport json,os,pathlib,sys\nkey=pathlib.Path(os.environ["BLOG_SSH_KEY_FILE"])\nrecord={"key_env_present":"BLOG_SSH_PRIVATE_KEY" in os.environ,"mode":key.stat().st_mode & 0o777,"fixture_only":key.read_text()=="fixture-not-a-real-key\\n","args":sys.argv[1:]}\npathlib.Path(os.environ["ARG_RECORD"]).write_text(json.dumps(record))\nprint(json.dumps({"test_fixture":True}))\n'
            )
            python.chmod(0o755)
            result = subprocess.run(
                ["bash", "-e", "-c", step["run"]],
                env={
                    **os.environ,
                    "PATH": str(bin_dir) + os.pathsep + os.environ["PATH"],
                    "RUNNER_TEMP": str(root),
                    "BLOG_SSH_PRIVATE_KEY": "fixture-not-a-real-key",
                    "ARG_RECORD": str(record),
                    "EXPECTED_PRODUCER_SHA": "a" * 64,
                },
                capture_output=True,
                text=True,
                check=False,
            )
            self.assertEqual(result.returncode, 0, result.stderr)
            data = json.loads(record.read_text())
            self.assertFalse(data["key_env_present"])
            self.assertEqual(data["mode"], 0o600)
            self.assertTrue(data["fixture_only"])
            self.assertFalse(list(root.glob("blog-dev-key.*")))
            self.assertEqual(data["args"][-1], "a" * 64)

    def test_serial_host_runtime_and_quality_native_integration_are_preserved(self):
        self.assertEqual(
            self.workflow["concurrency"],
            {
                "group": "blog-development-bootstrap-runtime",
                "cancel-in-progress": False,
            },
        )
        checks = yaml.safe_load(CHECKS.read_text())
        job = checks["jobs"]["contract"]
        self.assertIn("-p 'test_blog*.py'", json.dumps(job))
        integration = checks["jobs"]["native-validator"]
        self.assertNotIn("environment", integration)
        self.assertNotIn("secrets.", json.dumps(integration))
        self.assertIn(
            "integration_blog_publication_prepare.py", json.dumps(integration)
        )
        self.assertTrue(
            any(
                s.get("uses", "").startswith("actions/setup-node@")
                for s in integration["steps"]
            )
        )


if __name__ == "__main__":
    unittest.main()
