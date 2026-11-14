import os
import subprocess
import tempfile
import unittest
from pathlib import Path

import yaml
from test_blog_dev_preview import workflow_condition

ROOT = Path(__file__).resolve().parents[3]
WORKFLOW = ROOT / ".github/workflows/linode-cd.yml"
HELPER = ROOT / ".github/scripts/blog-cd-ownership.py"


def context(branch="dev", managed="true"):
    return {
        "github.repository": "daodaoedu/daodao-f2e",
        "github.event_name": "workflow_run",
        "github.event.workflow_run.head_repository.full_name": "daodaoedu/daodao-f2e",
        "github.event.workflow_run.head_repository.fork": False,
        "github.event.workflow_run.conclusion": "success",
        "github.event.workflow_run.event": "push",
        "inputs.force_deploy": False,
        "env.BRANCH_NAME": branch,
        "vars.BLOG_DEV_RELEASE_MANAGED": managed,
        "needs.detect-changes.outputs.build-website": "true",
        "needs.detect-changes.outputs.build-product": "true",
        "needs.detect-changes.outputs.legacy-website": "false"
        if branch == "dev" and managed not in ("", "false")
        else "true",
        "needs.build-website.result": "success",
        "needs.build-product.result": "success",
        "needs.deploy.result": "success",
        "needs.verify.result": "success",
        "needs.deploy.outputs.website": "false",
        "needs.deploy.outputs.dev-branch": "true" if branch == "dev" else "false",
        "steps.ownership.outputs.website": "false",
        "inputs.app": "all",
    }


class BlogCdOwnershipTests(unittest.TestCase):
    def setUp(self):
        self.jobs = yaml.safe_load(WORKFLOW.read_text())["jobs"]

    def test_managed_dev_website_never_builds_even_when_forced(self):
        for manual in [False, True]:
            data = context()
            if manual:
                data.update(
                    {
                        "github.event_name": "workflow_dispatch",
                        "inputs.force_deploy": True,
                    }
                )
            self.assertFalse(workflow_condition(self.jobs["build-website"]["if"], data))

    def test_shared_ref_does_not_certify_skipped_requested_dev_website(self):
        self.assertFalse(
            workflow_condition(self.jobs["update-deploy-ref"]["if"], context())
        )

    def test_product_and_other_channels_keep_their_decisions(self):
        for branch in ["dev", "prod", "feat/example", "DEV"]:
            for managed in ["", "false", "true", "unexpected"]:
                data = context(branch, managed)
                with self.subTest(branch=branch, managed=managed):
                    self.assertTrue(
                        workflow_condition(self.jobs["build-product"]["if"], data)
                    )
                    if branch != "dev":
                        self.assertTrue(
                            workflow_condition(self.jobs["build-website"]["if"], data)
                        )
                        self.assertTrue(
                            workflow_condition(
                                self.jobs["update-deploy-ref"]["if"], data
                            )
                        )

    def step(self, job, identifier):
        return next(s for s in self.jobs[job]["steps"] if s.get("id") == identifier)

    def run_policy_shell(self, job, branch, flag, requested=True, helper_present=True):
        step = self.step(job, "ownership")
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            if helper_present:
                target = root / ".github/scripts/blog-cd-ownership.py"
                target.parent.mkdir(parents=True)
                target.write_bytes(HELPER.read_bytes())
            output = root / "output"
            sentinel = root / "network-command-called"
            bin_dir = root / "bin"
            bin_dir.mkdir()
            for name in ["gh", "curl", "wget"]:
                trap = bin_dir / name
                trap.write_text(f'#!/bin/sh\nprintf bad > "{sentinel}"\nexit 90\n')
                trap.chmod(0o755)
            env = {
                **os.environ,
                "BRANCH_NAME": branch,
                "BLOG_DEV_RELEASE_MANAGED": flag,
                "REQUESTED": str(requested).lower(),
                "GITHUB_OUTPUT": str(output),
                "PATH": str(bin_dir) + os.pathsep + os.environ["PATH"],
                "PYTHONDONTWRITEBYTECODE": "1",
            }
            result = subprocess.run(
                ["bash", "-e", "-c", step["run"]],
                cwd=root,
                env=env,
                capture_output=True,
                text=True,
                check=False,
            )
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertFalse(sentinel.exists())
            return dict(line.split("=", 1) for line in output.read_text().splitlines())

    def test_actual_detect_and_deploy_shell_policy_matrix(self):
        for job in ["detect-changes", "deploy"]:
            for branch in ["dev", "prod", "feat/example", "DEV"]:
                for flag in [
                    "",
                    "false",
                    "FALSE",
                    "true",
                    "TRUE",
                    "unexpected",
                    "$(touch never-run)",
                ]:
                    for requested in [False, True]:
                        with self.subTest(
                            job=job, branch=branch, flag=flag, requested=requested
                        ):
                            expected = requested and (
                                branch != "dev" or flag.lower() in ["", "false"]
                            )
                            output = self.run_policy_shell(job, branch, flag, requested)
                            self.assertEqual(output["website"], str(expected).lower())
                            self.assertEqual(
                                output["dev"], str(branch == "dev").lower()
                            )

    def test_nondev_older_checkout_does_not_require_the_new_helper(self):
        for job in ["detect-changes", "deploy"]:
            for branch in ["prod", "feat/example", "DEV"]:
                self.assertEqual(
                    self.run_policy_shell(job, branch, "true", helper_present=False)[
                        "website"
                    ],
                    "true",
                )

    def test_deploy_and_verification_use_actual_ownership_output(self):
        for job, step_name, expected_expression in [
            ("deploy", "Deploy to Linode", "steps.ownership.outputs.website"),
            ("verify", "Deployment Verification", "needs.deploy.outputs.website"),
        ]:
            step = next(
                s for s in self.jobs[job]["steps"] if s.get("name") == step_name
            )
            for allowed in ["true", "false"]:
                data = context()
                data[expected_expression] = allowed
                self.assertEqual(
                    workflow_condition(step["env"]["DEPLOY_WEBSITE"], data), allowed
                )

    def test_secret_acquisition_is_skipped_when_website_blocked_and_no_product(self):
        data = context()
        data["needs.build-product.result"] = "skipped"
        for name in [
            "Debug - Check secrets",
            "Set up SSH",
            "Add Linode to known_hosts",
            "Create environment files on Linode",
            "Deploy to Linode",
        ]:
            step = next(
                s for s in self.jobs["deploy"]["steps"] if s.get("name") == name
            )
            self.assertFalse(workflow_condition(step.get("if"), data), name)
        data["needs.build-product.result"] = "success"
        self.assertTrue(
            workflow_condition(
                next(
                    s
                    for s in self.jobs["deploy"]["steps"]
                    if s.get("name") == "Deploy to Linode"
                )["if"],
                data,
            )
        )

    def test_prod_job_has_no_new_helper_checkout_dependency(self):
        checkout = self.step("deploy", "ownership-source")
        self.assertFalse(workflow_condition(checkout["if"], context("prod")))
        self.assertEqual(checkout["with"]["ref"], "${{ github.workflow_sha }}")
        self.assertFalse(checkout["with"]["persist-credentials"])

    def test_managed_dev_product_is_still_verified_without_website_job(self):
        data = context()
        data["needs.build-website.result"] = "skipped"
        self.assertTrue(workflow_condition(self.jobs["verify"]["if"], data))
        data["needs.build-product.result"] = "failure"
        self.assertFalse(workflow_condition(self.jobs["verify"]["if"], data))
        for branch in ["prod", "feat/example"]:
            data = context(branch)
            self.assertTrue(workflow_condition(self.jobs["verify"]["if"], data))
            data["needs.build-website.result"] = "skipped"
            self.assertFalse(workflow_condition(self.jobs["verify"]["if"], data))

    def test_filtered_snapshot_is_wired_to_website_build_without_changing_product(self):
        for branch in ["dev", "prod", "feat/example", "DEV"]:
            selected = self.run_policy_shell("detect-changes", branch, "true")
            data = context(branch)
            data.update(
                {
                    "steps.changes.outputs.website": "true",
                    "steps.changes.outputs.product": "true",
                    "steps.ownership.outputs.website": selected["website"],
                }
            )
            for key, expression in self.jobs["detect-changes"]["outputs"].items():
                data["needs.detect-changes.outputs." + key] = workflow_condition(
                    expression, data
                )
            self.assertEqual(
                workflow_condition(self.jobs["build-website"]["if"], data),
                branch != "dev",
            )
            self.assertTrue(workflow_condition(self.jobs["build-product"]["if"], data))

    def test_dev_notification_does_not_claim_blocked_website_was_deployed(self):
        step = self.jobs["notify"]["steps"][0]
        script = step["run"]
        start = script.index('DEPLOYED_APPS=""')
        script = (
            script[start : script.index("curl -X POST", start)]
            + '\nprintf "%s" "$DEPLOYED_APPS"\n'
        )
        for dev, selected, expected in [
            ("true", "false", "Product"),
            ("true", "true", "Website, Product"),
            ("false", "false", "Website, Product"),
        ]:
            result = subprocess.run(
                ["bash", "-e", "-c", script],
                env={
                    **os.environ,
                    "DEV_CHANNEL": dev,
                    "DEPLOY_WEBSITE_SELECTED": selected,
                    "BUILD_WEBSITE_STATUS": "success",
                    "BUILD_PRODUCT_STATUS": "success",
                },
                capture_output=True,
                text=True,
                check=False,
            )
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertEqual(result.stdout, expected)

    def test_product_only_dev_ref_may_advance_but_requested_web_cannot(self):
        data = context()
        data["needs.detect-changes.outputs.build-website"] = "false"
        self.assertTrue(workflow_condition(self.jobs["update-deploy-ref"]["if"], data))
        data["needs.detect-changes.outputs.build-website"] = "true"
        self.assertFalse(workflow_condition(self.jobs["update-deploy-ref"]["if"], data))
        data["needs.deploy.outputs.website"] = "true"
        self.assertTrue(workflow_condition(self.jobs["update-deploy-ref"]["if"], data))


if __name__ == "__main__":
    unittest.main()
