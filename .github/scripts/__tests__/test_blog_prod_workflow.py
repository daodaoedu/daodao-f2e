"""Exercise the actual production publisher's source and credential boundaries."""

import unittest
from pathlib import Path

import yaml
from test_blog_dev_preview import workflow_condition

ROOT = Path(__file__).resolve().parents[3]
WORKFLOW = ROOT / ".github/workflows/blog-prod-publish.yml"


class ProductionWorkflowTests(unittest.TestCase):
    def setUp(self):
        self.workflow = yaml.safe_load(WORKFLOW.read_text())
        self.job = self.workflow["jobs"]["publish"]
        self.steps = self.job["steps"]

    def step(self, name):
        return next(step for step in self.steps if step.get("name") == name)

    def context(self, **changes):
        context = {
            "github.repository": "daodaoedu/daodao-f2e",
            "github.event_name": "workflow_dispatch",
            "github.ref": "refs/heads/prod",
        }
        context.update(changes)
        return context

    def test_only_official_production_manual_job_can_reach_sensitive_steps(self):
        self.assertTrue(workflow_condition(self.job["if"], self.context()))
        for changes in [
            {"github.repository": "someone/fork"},
            {"github.ref": "refs/heads/dev"},
            {"github.ref": "refs/heads/fix/publisher"},
            {"github.ref": "refs/tags/prod"},
            {"github.event_name": "pull_request"},
            {"github.event_name": "push"},
            {"github.event_name": "workflow_run"},
        ]:
            with self.subTest(changes=changes):
                self.assertFalse(
                    workflow_condition(self.job["if"], self.context(**changes))
                )
        self.assertEqual(self.job["environment"], "production")

    def test_entry_has_no_force_or_product_choice_and_serializes_publications(self):
        events = self.workflow.get("on", self.workflow.get(True))
        self.assertEqual(set(events), {"workflow_dispatch"})
        self.assertEqual(set(events["workflow_dispatch"]["inputs"]), {"ci_run_id"})
        self.assertTrue(events["workflow_dispatch"]["inputs"]["ci_run_id"]["required"])
        self.assertEqual(
            self.workflow["permissions"], {"contents": "read", "actions": "read"}
        )
        self.assertFalse(self.workflow["concurrency"]["cancel-in-progress"])
        self.assertEqual(
            self.workflow["concurrency"]["group"], "blog-production-publication"
        )

    def test_failed_gate_prevents_environment_registry_and_ssh_credentials(self):
        gate_index = next(
            i for i, step in enumerate(self.steps) if step.get("id") == "gate"
        )
        self.assertIn('prepare --ci-run-id "$CI_RUN_ID"', self.steps[gate_index]["run"])
        sensitive = []
        for index, step in enumerate(self.steps):
            text = str(step)
            if "secrets." in text:
                sensitive.append(step)
                self.assertGreater(index, gate_index)
                # GitHub defaults each step to success(); no sensitive step may override it.
                self.assertNotIn("if", step)
                self.assertNotIn("continue-on-error", step)
        self.assertGreaterEqual(len(sensitive), 3)
        self.assertNotIn("continue-on-error", self.job)

    def test_frontend_and_content_checkout_are_exact_and_do_not_retain_credentials(
        self,
    ):
        checkouts = [
            step
            for step in self.steps
            if step.get("uses", "").startswith("actions/checkout@")
        ]
        self.assertEqual(len(checkouts), 2)
        self.assertEqual(checkouts[0]["with"]["ref"], "${{ github.sha }}")
        self.assertEqual(checkouts[1]["with"]["repository"], "daodaoedu/daodao-blog")
        self.assertEqual(
            checkouts[1]["with"]["ref"], "${{ steps.gate.outputs.content-sha }}"
        )
        self.assertEqual(checkouts[1]["with"]["path"], ".blog-dev-preview-source")
        for step in checkouts:
            self.assertFalse(step["with"]["persist-credentials"])

    def test_stage_and_both_rechecks_use_the_original_snapshot_and_digest(self):
        stage = self.step("Stage frozen approved content")
        checks = [
            step
            for step in self.steps
            if "blog_prod_gate.py check " in step.get("run", "")
        ]
        self.assertEqual(len(checks), 2)
        for step in [stage, *checks]:
            self.assertEqual(
                step["env"]["SNAPSHOT"], "${{ steps.gate.outputs.snapshot }}"
            )
            self.assertEqual(
                step["env"]["SNAPSHOT_SHA256"],
                "${{ steps.gate.outputs.snapshot-sha256 }}",
            )
            self.assertIn(
                '--snapshot "$SNAPSHOT" --snapshot-sha256 "$SNAPSHOT_SHA256"',
                step["run"],
            )
            self.assertNotIn("BLOG_PROD_APPROVALS", step["env"])
        self.assertIn("blog_prod_gate.py stage ", stage["run"])
        registry_index = next(
            i
            for i, step in enumerate(self.steps)
            if step.get("uses", "").startswith("docker/login-action@")
        )
        deploy_index = self.steps.index(
            self.step("Deploy Website digest and verify public content with rollback")
        )
        self.assertLess(self.steps.index(checks[0]), registry_index)
        self.assertGreater(self.steps.index(checks[1]), registry_index)
        self.assertLess(self.steps.index(checks[1]), deploy_index)

    def test_only_website_is_built_and_deployed_by_immutable_digest(self):
        build = self.step("Build approved website only")["run"]
        self.assertIn("pnpm --filter @daodao/website build", build)
        self.assertNotIn("@daodao/product", build)
        images = [
            step
            for step in self.steps
            if step.get("uses", "").startswith("docker/build-push-action@")
        ]
        self.assertEqual(len(images), 1)
        self.assertEqual(images[0]["with"]["target"], "website")
        self.assertTrue(images[0]["with"]["push"])
        self.assertIn("${{ steps.gate.outputs.release-id }}", images[0]["with"]["tags"])
        self.assertIn(
            "${{ github.run_id }}-${{ github.run_attempt }}", images[0]["with"]["tags"]
        )
        deploy = self.step(
            "Deploy Website digest and verify public content with rollback"
        )
        self.assertEqual(
            deploy["env"]["IMAGE"],
            "${{ secrets.DOCKER_HUB_USERNAME }}/daodao-website@${{ steps.image.outputs.digest }}",
        )
        self.assertIn("blog_prod_deploy.py", deploy["run"])
        all_commands = "\n".join(step.get("run", "") for step in self.steps)
        self.assertNotIn("gh workflow run", all_commands)
        self.assertNotIn("force_deploy", all_commands)
        self.assertNotIn("prod_product", all_commands)

    def test_build_does_not_forward_private_approval_and_cleanup_runs_after_failure(
        self,
    ):
        build = self.step("Build approved website only")["run"]
        self.assertLess(
            build.index("unset ENV_PROD BLOG_PROD_APPROVALS"),
            build.index("pnpm install"),
        )
        deploy = self.step(
            "Deploy Website digest and verify public content with rollback"
        )["run"]
        self.assertLess(
            deploy.index("unset BLOG_SSH_PRIVATE_KEY BLOG_PROD_APPROVALS"),
            deploy.index("python3 .github/scripts/blog_prod_deploy.py"),
        )
        cleanup = self.step("Remove private runner inputs")
        self.assertEqual(cleanup["if"], "always()")
        self.assertIn("rm -f .env apps/website/.env", cleanup["run"])
        self.assertIn('rm -f -- "$SNAPSHOT"', cleanup["run"])
        self.assertIn('rm -f -- "$BLOG_APPROVALS_FILE"', cleanup["run"])


if __name__ == "__main__":
    unittest.main()
