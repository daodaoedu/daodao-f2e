import ast
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

    def test_workflow_selection_is_compatible_with_older_frontend_commits(self):
        workflow = yaml.safe_load(WORKFLOW.read_text())
        step = next(
            s
            for s in workflow["jobs"]["build-website"]["steps"]
            if s.get("id") == "blog-preview"
        )

        def enabled(expression, branch, pin):
            if not expression:
                return True
            for key, value in {
                "env.BRANCH_NAME": branch,
                "vars.BLOG_DEV_PREVIEW_CONTENT_SHA": pin,
            }.items():
                expression = expression.replace(key, repr(value))
            expression = expression.replace("&&", " and ").replace("||", " or ")

            def value(node):
                if isinstance(node, ast.Expression):
                    return value(node.body)
                if isinstance(node, ast.Constant):
                    return node.value
                if isinstance(node, ast.BoolOp):
                    values = [bool(value(v)) for v in node.values]
                    return all(values) if isinstance(node.op, ast.And) else any(values)
                if isinstance(node, ast.Compare):
                    left = value(node.left)
                    for op, right_node in zip(node.ops, node.comparators):
                        right = value(right_node)
                        if not (
                            (isinstance(op, ast.Eq) and left == right)
                            or (isinstance(op, ast.NotEq) and left != right)
                        ):
                            return False
                        left = right
                    return True
                raise AssertionError("Unsupported workflow condition")

            return value(ast.parse(expression, mode="eval"))

        for index, (branch, pin, helper, success, expected) in enumerate(
            [
                ("prod", self.sha, False, True, None),
                ("prod", self.sha, True, True, None),
                ("feat/older", self.sha, False, True, None),
                ("dev", self.sha, False, True, "enabled=false\n"),
                (
                    "dev",
                    self.sha,
                    True,
                    True,
                    f"enabled=true\ncontent-sha={self.sha}\n",
                ),
                ("dev", "--bad-ref", True, False, None),
                ("dev", "", False, True, None),
            ]
        ):
            with self.subTest(branch=branch, helper=helper, pin=pin):
                workspace = self.root / f"compat-{index}"
                workspace.mkdir()
                output = workspace / "github-output"
                if helper:
                    script = workspace / ".github/scripts/blog-dev-preview.py"
                    script.parent.mkdir(parents=True)
                    script.write_text(SCRIPT.read_text())
                if enabled(step.get("if"), branch, pin):
                    result = subprocess.run(
                        ["bash", "-e", "-c", step["run"]],
                        cwd=workspace,
                        env={
                            **self.env,
                            "BRANCH_NAME": branch,
                            "BLOG_DEV_PREVIEW_CONTENT_SHA": pin,
                            "GITHUB_OUTPUT": str(output),
                        },
                        capture_output=True,
                        text=True,
                        check=False,
                        timeout=10,
                    )
                    self.assertEqual(result.returncode == 0, success, result.stderr)
                else:
                    self.assertTrue(success)
                if expected is None:
                    self.assertFalse(output.exists())
                else:
                    self.assertEqual(output.read_text(), expected)

    def test_preview_wiring_changes_trigger_a_normal_website_build(self):
        workflow = yaml.safe_load(WORKFLOW.read_text())
        script = next(
            step["run"]
            for step in workflow["jobs"]["detect-changes"]["steps"]
            if step.get("name") == "Detect file changes"
        )
        for relative, expected in (
            (
                ".github/scripts/blog-dev-preview.py",
                {"website": "true", "product": "false"},
            ),
            (
                ".github/workflows/linode-cd.yml",
                {"website": "true", "product": "false"},
            ),
            (".dockerignore", {"website": "true", "product": "false"}),
            ("docs/preview.md", {"website": "false", "product": "false"}),
        ):
            with self.subTest(relative=relative):
                repository = self.root / ("changes-" + relative.replace("/", "_"))
                repository.mkdir()

                def git(*args, working_directory=repository):
                    return subprocess.run(
                        [
                            "git",
                            "-c",
                            "core.hooksPath=/dev/null",
                            "-c",
                            "user.name=Preview Test",
                            "-c",
                            "user.email=preview@example.invalid",
                            "-c",
                            "commit.gpgsign=false",
                            "-C",
                            str(working_directory),
                            *args,
                        ],
                        capture_output=True,
                        text=True,
                        check=True,
                    ).stdout.strip()

                git("init", "-q")
                changed = repository / relative
                changed.parent.mkdir(parents=True, exist_ok=True)
                changed.write_text("before")
                git("add", relative)
                git("commit", "-qm", "before")
                git("update-ref", "refs/deploy/dev", git("rev-parse", "HEAD"))
                changed.write_text("after")
                git("add", relative)
                git("commit", "-qm", "after")
                output = repository / "github-output"
                result = subprocess.run(
                    ["bash", "-e", "-c", script],
                    cwd=repository,
                    env={
                        **os.environ,
                        "BRANCH_NAME": "dev",
                        "EVENT_NAME": "workflow_run",
                        "APP_INPUT": "",
                        "GITHUB_OUTPUT": str(output),
                    },
                    capture_output=True,
                    text=True,
                    check=False,
                    timeout=10,
                )
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertEqual(
                    dict(
                        line.split("=", 1) for line in output.read_text().splitlines()
                    ),
                    expected,
                )

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
