import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

import yaml

SCRIPT = Path(__file__).resolve().parents[1] / "blog-dev-preview.py"
WORKFLOW = Path(__file__).resolve().parents[2] / "workflows/linode-cd.yml"


class BlogDevPreviewTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.root = Path(self.temporary.name).resolve()
        self.workspace = self.root / "frontend"
        self.workspace.mkdir()
        self.runner_temp = self.root / "runner-temp"
        self.runner_temp.mkdir()
        self.source = self.workspace / ".blog-dev-preview-source"
        self.source.mkdir()
        for name in ("authors.json", "topics.json"):
            (self.source / name).write_text("[]\n")
        (self.source / "articles").mkdir()
        (self.source / "articles/guide.md").write_text("draft article\n")
        (self.source / "images").mkdir()
        (self.source / "do-not-execute.sh").write_text("exit 99\n")
        self.git("init", "-q")
        self.git("add", ".")
        self.git(
            "-c",
            "user.name=Preview Test",
            "-c",
            "user.email=preview@example.invalid",
            "-c",
            "commit.gpgsign=false",
            "commit",
            "-qm",
            "fixture",
        )
        self.sha = self.git("rev-parse", "HEAD").stdout.strip()
        self.env_file = self.root / "github-env"
        self.output_file = self.root / "github-output"
        self.env = {
            **os.environ,
            "BRANCH_NAME": "dev",
            "BLOG_DEV_PREVIEW_CONTENT_SHA": self.sha,
            "GITHUB_WORKSPACE": str(self.workspace),
            "RUNNER_TEMP": str(self.runner_temp),
            "GITHUB_ENV": str(self.env_file),
            "GITHUB_OUTPUT": str(self.output_file),
        }

    def tearDown(self):
        self.temporary.cleanup()

    def git(self, *args):
        return subprocess.run(
            ["git", "-c", "core.hooksPath=/dev/null", "-C", str(self.source), *args],
            capture_output=True,
            text=True,
            check=True,
        )

    def run_helper(self, operation, **env):
        return subprocess.run(
            [sys.executable, str(SCRIPT), operation],
            env={**self.env, **env},
            capture_output=True,
            text=True,
            timeout=10,
            check=False,
        )

    def read_env(self):
        return dict(
            line.split("=", 1) for line in self.env_file.read_text().splitlines()
        )

    def test_dev_pin_is_selected_and_content_is_staged_as_draft_outside_docker_context(
        self,
    ):
        selected = self.run_helper("select")
        self.assertEqual(selected.returncode, 0, selected.stderr)
        self.assertEqual(
            self.output_file.read_text(), f"enabled=true\ncontent-sha={self.sha}\n"
        )
        prepared = self.run_helper("prepare")
        self.assertEqual(prepared.returncode, 0, prepared.stderr)
        values = self.read_env()
        snapshot = Path(values["BLOG_CONTENT_DIR"])
        self.assertTrue(snapshot.is_relative_to(self.runner_temp))
        self.assertFalse(snapshot.is_relative_to(self.workspace))
        self.assertEqual(
            (snapshot / "articles/guide.md").read_text(), "draft article\n"
        )
        self.assertEqual(values["BLOG_CONTENT_MODE"], "draft")
        self.assertEqual(values["NEXT_PUBLIC_WEBSITE_URL"], "https://dev.daodao.so")
        for key in (
            "BLOG_APPROVALS_FILE",
            "BLOG_PUBLISHED_BASELINE_FILE",
            "BLOG_EVIDENCE_ROOT",
        ):
            self.assertEqual(values[key], "")
        self.assertFalse((snapshot / ".git").exists())
        self.assertFalse((snapshot / "do-not-execute.sh").exists())
        self.assertTrue((self.source / ".git").is_dir())

    def test_missing_pin_preserves_empty_build_and_does_not_touch_content(self):
        for operation in ("select", "prepare"):
            result = self.run_helper(operation, BLOG_DEV_PREVIEW_CONTENT_SHA="")
            self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(self.output_file.read_text(), "enabled=false\n")
        self.assertFalse(self.env_file.exists())
        self.assertEqual(list(self.runner_temp.iterdir()), [])

    def test_non_dev_never_uses_draft_even_with_malformed_pin(self):
        for branch in ("prod", "main", "feat/demo", "release", ""):
            with self.subTest(branch=branch):
                self.output_file.unlink(missing_ok=True)
                for operation in ("select", "prepare"):
                    result = self.run_helper(
                        operation,
                        BRANCH_NAME=branch,
                        BLOG_DEV_PREVIEW_CONTENT_SHA="$(touch compromised)",
                    )
                    self.assertEqual(result.returncode, 0, result.stderr)
                self.assertEqual(self.output_file.read_text(), "enabled=false\n")
                self.assertFalse(self.env_file.exists())
                self.assertFalse((self.workspace / "compromised").exists())
                self.assertEqual(list(self.runner_temp.iterdir()), [])

    def test_invalid_pin_fails_before_content_or_environment_changes(self):
        for pin in (
            "dev",
            "f" * 39,
            "F" * 40,
            "--upload-pack=sh",
            "$(touch compromised)",
            "f" * 40 + "\nNEXT_PUBLIC_WEBSITE_URL=https://daodao.so",
        ):
            with self.subTest(pin=pin):
                for operation in ("select", "prepare"):
                    result = self.run_helper(
                        operation, BLOG_DEV_PREVIEW_CONTENT_SHA=pin
                    )
                    self.assertNotEqual(result.returncode, 0)
                self.assertFalse(self.env_file.exists())
                self.assertEqual(list(self.runner_temp.iterdir()), [])

    def test_checkout_revision_mismatch_is_rejected_before_staging(self):
        result = self.run_helper("prepare", BLOG_DEV_PREVIEW_CONTENT_SHA="0" * 40)
        self.assertNotEqual(result.returncode, 0)
        self.assertFalse(self.env_file.exists())
        self.assertEqual(list(self.runner_temp.iterdir()), [])

    def test_runner_temp_inside_workspace_is_refused(self):
        inside = self.workspace / "runner-temp"
        inside.mkdir()
        result = self.run_helper("prepare", RUNNER_TEMP=str(inside))
        self.assertNotEqual(result.returncode, 0)
        self.assertFalse(self.env_file.exists())
        self.assertEqual(list(inside.iterdir()), [])

    def test_top_level_content_symlink_is_rejected_without_copying_private_target(self):
        private = self.root / "private"
        private.mkdir()
        (private / "private-marker").write_text("SHOULD_NOT_BE_COPIED")
        for name in ("articles", "images"):
            with self.subTest(name=name):
                directory = self.source / name
                backup = self.source / f"{name}-original"
                directory.rename(backup)
                directory.symlink_to(private, target_is_directory=True)
                try:
                    result = self.run_helper("prepare")
                    self.assertNotEqual(result.returncode, 0)
                    self.assertFalse(self.env_file.exists())
                    self.assertEqual(list(self.runner_temp.iterdir()), [])
                finally:
                    directory.unlink()
                    backup.rename(directory)
        self.assertEqual(
            (private / "private-marker").read_text(), "SHOULD_NOT_BE_COPIED"
        )

    def test_registry_symlinks_are_rejected_before_staging(self):
        private = self.root / "private-registry.json"
        private.write_text("SHOULD_NOT_BE_COPIED")
        for name in ("authors.json", "topics.json"):
            with self.subTest(name=name):
                original = self.source / name
                original.unlink()
                original.symlink_to(private)
                try:
                    result = self.run_helper("prepare")
                    self.assertNotEqual(result.returncode, 0)
                    self.assertFalse(self.env_file.exists())
                    self.assertEqual(list(self.runner_temp.iterdir()), [])
                finally:
                    original.unlink()
                    original.write_text("[]\n")

    def test_nested_symlink_is_preserved_for_shared_validator_rejection_not_dereferenced(
        self,
    ):
        private = self.root / "private-marker"
        private.write_text("SHOULD_NOT_BE_COPIED")
        (self.source / "images/linked.png").symlink_to(private)
        result = self.run_helper("prepare")
        self.assertEqual(result.returncode, 0, result.stderr)
        linked = Path(self.read_env()["BLOG_CONTENT_DIR"]) / "images/linked.png"
        self.assertTrue(linked.is_symlink())

    def test_workflow_uses_guarded_official_checkout_before_build(self):
        workflow = yaml.safe_load(WORKFLOW.read_text())
        steps = workflow["jobs"]["build-website"]["steps"]
        selected = next(
            i for i, step in enumerate(steps) if step.get("id") == "blog-preview"
        )
        acquisition = next(
            i
            for i, step in enumerate(steps)
            if step.get("with", {}).get("repository") == "daodaoedu/daodao-blog"
        )
        preparation = next(
            i
            for i, step in enumerate(steps)
            if "blog-dev-preview.py prepare" in step.get("run", "")
        )
        build = next(
            i
            for i, step in enumerate(steps)
            if "pnpm --filter @daodao/config generate:env" in step.get("run", "")
        )
        self.assertLess(selected, acquisition)
        self.assertLess(acquisition, preparation)
        self.assertLess(preparation, build)
        checkout = steps[acquisition]
        self.assertEqual(checkout["if"], "steps.blog-preview.outputs.enabled == 'true'")
        self.assertEqual(steps[preparation]["if"], checkout["if"])
        self.assertFalse(checkout["with"]["persist-credentials"])
        self.assertEqual(
            checkout["with"]["ref"], "${{ steps.blog-preview.outputs.content-sha }}"
        )
        frontend_checkout = next(
            step for step in steps if step.get("name") == "Checkout code"
        )
        self.assertEqual(frontend_checkout["with"]["ref"], "${{ env.COMMIT_SHA }}")
        self.assertIn(
            ".blog-dev-preview-source/",
            WORKFLOW.parents[2].joinpath(".dockerignore").read_text().splitlines(),
        )


if __name__ == "__main__":
    unittest.main()
