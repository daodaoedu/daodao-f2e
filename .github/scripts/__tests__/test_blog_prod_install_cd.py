"""Exercise the narrow production CD ownership adapter without a remote host."""

import os
import subprocess
import tempfile
import unittest
from pathlib import Path

import yaml
from workflow_condition import workflow_condition

ROOT = Path(__file__).resolve().parents[3]
WORKFLOW = ROOT / ".github/workflows/linode-cd.yml"


class ProductionInstallCDTests(unittest.TestCase):
    def setUp(self):
        self.workflow = yaml.safe_load(WORKFLOW.read_text())
        self.jobs = self.workflow["jobs"]

    def context(self, **changes):
        values = {
            "github.repository": "daodaoedu/daodao-f2e",
            "github.event_name": "workflow_dispatch",
            "github.event.workflow_run.head_repository.full_name": "daodaoedu/daodao-f2e",
            "github.event.workflow_run.head_repository.fork": False,
            "github.event.workflow_run.conclusion": "success",
            "github.event.workflow_run.event": "push",
            "inputs.force_deploy": True,
            "needs.detect-changes.outputs.build-website": "true",
            "needs.detect-changes.outputs.legacy-website": "false",
            "needs.build-website.result": "skipped",
            "needs.build-product.result": "skipped",
            "needs.build-website.outputs.image-tag": "",
            "needs.build-product.outputs.image-tag": "",
            "needs.deploy.result": "success",
            "needs.deploy.outputs.controlled-branch": "true",
            "needs.deploy.outputs.website": "false",
            "steps.ownership.outputs.website": "false",
        }
        values.update(changes)
        return values

    def step(self, job, name):
        return next(
            step for step in self.jobs[job]["steps"] if step.get("name") == name
        )

    def git(self, root, *args):
        return subprocess.check_output(
            ["git", "-c", "core.hooksPath=/dev/null", *args], cwd=root, text=True
        ).strip()

    def commit(self, root, title):
        self.git(root, "add", ".")
        self.git(
            root,
            "-c",
            "user.name=Fixture",
            "-c",
            "user.email=fixture@example.invalid",
            "commit",
            "-qm",
            title,
        )
        return self.git(root, "rev-parse", "HEAD")

    def policy(
        self, branch, flag="true", requested="true", corrupt=False, source_sha=None
    ):
        body = self.step("detect-changes", "Select legacy website ownership")["run"]
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            self.git(root, "init", "-q")
            helper = root / ".github/scripts/blog-cd-ownership.py"
            helper.parent.mkdir(parents=True)
            helper.write_bytes(
                (ROOT / ".github/scripts/blog-cd-ownership.py").read_bytes()
            )
            trusted = self.commit(root, "trusted ownership")
            if corrupt:
                helper.write_text(
                    "raise RuntimeError('moving checkout must not execute')\n"
                )
            output = root / "output"
            result = subprocess.run(
                ["bash", "-euo", "pipefail", "-c", body],
                cwd=root,
                check=False,
                env={
                    **os.environ,
                    "RUNNER_TEMP": str(root),
                    "GITHUB_OUTPUT": str(output),
                    "BRANCH_NAME": branch,
                    "BLOG_PROD_RELEASE_MANAGED": flag,
                    "REQUESTED": requested,
                    "TRUSTED_WORKFLOW_SHA": trusted
                    if source_sha is None
                    else source_sha,
                },
                capture_output=True,
                text=True,
            )
            values = (
                dict(line.split("=", 1) for line in output.read_text().splitlines())
                if output.exists()
                else {}
            )
            return result, values

    def test_managed_production_stops_legacy_build_but_unmanaged_and_other_channels_work(
        self,
    ):
        self.assertFalse(
            workflow_condition(self.jobs["build-website"]["if"], self.context())
        )
        self.assertTrue(
            workflow_condition(
                self.jobs["build-website"]["if"],
                self.context(**{"needs.detect-changes.outputs.legacy-website": "true"}),
            )
        )
        for branch, flag, expected in (
            ("prod", "true", "false"),
            ("prod", "unknown", "false"),
            ("prod", "false", "true"),
            ("dev", "true", "true"),
            ("main", "true", "true"),
            ("feat/example", "true", "true"),
        ):
            with self.subTest(branch=branch, flag=flag):
                result, values = self.policy(branch, flag)
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertEqual(values["website"], expected)

    def test_policy_uses_trusted_workflow_source_and_rejects_missing_pin(self):
        result, values = self.policy("prod", corrupt=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(values["website"], "false")
        rejected, values = self.policy("prod", source_sha="not-a-sha")
        self.assertNotEqual(rejected.returncode, 0)
        self.assertEqual(values, {})

    def test_stale_website_build_cannot_reach_ssh_but_product_still_can(self):
        deploy = self.jobs["deploy"]
        sensitive = [
            step
            for step in deploy["steps"]
            if "secrets." in str(step) or "ssh " in str(step)
        ]
        self.assertGreaterEqual(len(sensitive), 4)
        for step in sensitive:
            with self.subTest(step=step.get("name")):
                self.assertFalse(
                    workflow_condition(
                        step.get("if"),
                        self.context(**{"needs.build-website.result": "success"}),
                    )
                )
                self.assertTrue(
                    workflow_condition(
                        step.get("if"),
                        self.context(**{"needs.build-product.result": "success"}),
                    )
                )
        source = self.step("deploy", "Checkout trusted workflow ownership helper")
        self.assertEqual(source["with"]["ref"], "${{ github.workflow_sha }}")
        self.assertFalse(source["with"]["persist-credentials"])
        deploy_step = self.step("deploy", "Deploy to Linode")
        self.assertEqual(
            deploy_step["env"]["DEPLOY_WEBSITE"],
            "${{ steps.ownership.outputs.website }}",
        )
        self.assertEqual(
            deploy_step["env"]["DEPLOY_PRODUCT"],
            "${{ needs.build-product.result == 'success' }}",
        )

    def test_product_only_production_keeps_production_environment_and_verification(
        self,
    ):
        context = self.context(
            **{
                "needs.build-product.result": "success",
                "needs.build-product.outputs.image-tag": "prod",
            }
        )
        environment = self.jobs["deploy"]["environment"]
        production_selected = environment.replace("'production'", "true").replace(
            "'development'", "false"
        )
        self.assertTrue(workflow_condition(production_selected, context))
        self.assertFalse(workflow_condition(production_selected, self.context()))
        self.assertTrue(workflow_condition(self.jobs["verify"].get("if"), context))
        self.assertFalse(
            workflow_condition(self.jobs["verify"].get("if"), self.context())
        )
        verify = self.step("verify", "Deployment Verification")
        self.assertEqual(
            verify["env"]["DEPLOY_WEBSITE"], "${{ needs.deploy.outputs.website }}"
        )

    def test_all_host_mutations_share_the_publisher_lock(self):
        deploy = self.step("deploy", "Deploy to Linode")["run"]
        lock = deploy.index("exec 9>/var/lock/daodao-production-deploy.lock")
        self.assertLess(lock, deploy.index("docker builder prune"))
        self.assertLess(lock, deploy.index("git fetch"))
        self.assertLess(lock, deploy.index("docker pull"))
        self.assertIn("flock -w 600 9", deploy)
        environment = self.step("deploy", "Create environment files on Linode")["run"]
        writes = [line for line in environment.splitlines() if "cat >" in line]
        self.assertEqual(len(writes), 2)
        for line in writes:
            self.assertIn("flock -w 600 /var/lock/daodao-production-deploy.lock", line)

    def test_notification_does_not_list_a_blocked_legacy_website(self):
        body = self.step("notify", "Send Discord Notification")["run"]
        apps = body[body.index('DEPLOYED_APPS=""') : body.index("curl -X")]
        for selected, product, expected in (
            ("false", "skipped", ""),
            ("true", "skipped", "Website"),
            ("false", "success", "Product"),
        ):
            with self.subTest(selected=selected, product=product):
                result = subprocess.run(
                    [
                        "bash",
                        "-euo",
                        "pipefail",
                        "-c",
                        apps + '\nprintf "%s" "$DEPLOYED_APPS"',
                    ],
                    env={
                        **os.environ,
                        "BUILD_WEBSITE_STATUS": "success",
                        "BUILD_PRODUCT_STATUS": product,
                        "DEPLOY_WEBSITE_SELECTED": selected,
                    },
                    check=True,
                    capture_output=True,
                    text=True,
                )
                self.assertEqual(result.stdout, expected)

    def test_failed_or_foreign_ci_still_cannot_start_legacy_jobs(self):
        for change in (
            {"github.event.workflow_run.conclusion": "failure"},
            {"github.event.workflow_run.head_repository.fork": True},
            {"github.event.workflow_run.head_repository.full_name": "someone/fork"},
        ):
            context = self.context(
                **{
                    "github.event_name": "workflow_run",
                    "inputs.force_deploy": False,
                    "needs.detect-changes.outputs.legacy-website": "true",
                    "needs.build-website.result": "success",
                    **change,
                }
            )
            for job in ("detect-changes", "build-website", "deploy"):
                with self.subTest(change=change, job=job):
                    self.assertFalse(workflow_condition(self.jobs[job]["if"], context))

    def test_product_change_detection_keeps_legacy_head_parent_policy(self):
        body = self.step("detect-changes", "Detect file changes")["run"]
        body = body.replace("${{ github.event_name }}", "workflow_run").replace(
            "${{ inputs.app }}", ""
        )
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            self.git(root, "init", "-q")
            product = root / "apps/product/example.txt"
            product.parent.mkdir(parents=True)
            product.write_text("A")
            first = self.commit(root, "base")
            product.write_text("B")
            self.commit(root, "product update")
            (root / "README.md").write_text("later docs")
            self.commit(root, "docs")
            self.git(root, "update-ref", "refs/deploy/prod", first)
            output = root / "output"
            result = subprocess.run(
                ["bash", "-euo", "pipefail", "-c", body],
                cwd=root,
                env={**os.environ, "GITHUB_OUTPUT": str(output)},
                check=True,
                text=True,
                capture_output=True,
            )
            values = dict(
                line.split("=", 1) for line in output.read_text().splitlines()
            )
            self.assertEqual(values["product"], "false", result.stdout)


if __name__ == "__main__":
    unittest.main()
