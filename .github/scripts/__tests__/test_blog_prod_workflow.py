"""Exercise the actual production publisher's source and credential boundaries."""

import unittest
from pathlib import Path

import yaml
from workflow_condition import workflow_condition

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
        self.assertEqual(
            set(events["workflow_dispatch"]["inputs"]),
            {"ci_run_id", "legacy_bootstrap", "expected_content_sha"},
        )
        self.assertTrue(events["workflow_dispatch"]["inputs"]["ci_run_id"]["required"])
        bootstrap = events["workflow_dispatch"]["inputs"]["legacy_bootstrap"]
        self.assertEqual(bootstrap["type"], "boolean")
        self.assertFalse(bootstrap["required"])
        self.assertIs(bootstrap["default"], False)
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
        self.assertEqual(len(checkouts), 3)
        self.assertEqual(checkouts[0]["with"]["ref"], "${{ github.sha }}")
        self.assertEqual(checkouts[1]["with"]["repository"], "daodaoedu/daodao-blog")
        self.assertEqual(
            checkouts[1]["with"]["ref"], "${{ steps.gate.outputs.content-sha }}"
        )
        self.assertEqual(checkouts[1]["with"]["path"], ".blog-dev-preview-source")
        self.assertEqual(checkouts[2]["with"]["repository"], "daodaoedu/daodao-blog")
        self.assertEqual(
            checkouts[2]["with"]["ref"],
            "${{ steps.gate.outputs.baseline-content-sha }}",
        )
        self.assertEqual(checkouts[2]["with"]["path"], ".blog-prod-published-source")
        for step in checkouts:
            self.assertFalse(step["with"]["persist-credentials"])

    def test_dependencies_are_installed_before_shared_validator_stage_without_approval_env(
        self,
    ):
        install = self.step("Install frontend dependencies")
        stage = self.step("Stage frozen approved content")
        build = self.step("Build approved website only")
        self.assertLess(self.steps.index(install), self.steps.index(stage))
        self.assertLess(self.steps.index(stage), self.steps.index(build))
        self.assertIn("pnpm install --frozen-lockfile", install["run"])
        self.assertLess(
            install["run"].index("unset BLOG_PROD_APPROVALS"),
            install["run"].index("pnpm install"),
        )
        self.assertNotIn("pnpm install", build["run"])
        self.assertLess(
            install["run"].index("pnpm install --frozen-lockfile"),
            install["run"].index("pnpm --filter @daodao/config generate:env"),
        )

    def test_new_publisher_actions_are_all_immutable_full_commit_pins(self):
        actions = [step["uses"] for step in self.steps if "uses" in step]
        self.assertGreaterEqual(len(actions), 5)
        for action in actions:
            with self.subTest(action=action):
                self.assertRegex(action, r"@[a-f0-9]{40}$")

    def test_host_receives_trusted_previous_sha_and_explicit_bootstrap_boolean(self):
        self.assertEqual(
            self.job["env"]["BLOG_PROD_PUBLISHED_CONTENT_SHA"],
            "${{ vars.BLOG_PROD_PUBLISHED_CONTENT_SHA }}",
        )
        deploy = self.step(
            "Deploy Website digest and verify public content with rollback"
        )
        self.assertEqual(
            deploy["env"]["BASELINE_CONTENT_SHA"],
            "${{ steps.gate.outputs.baseline-content-sha }}",
        )
        self.assertEqual(
            deploy["env"]["ALLOW_LEGACY_BOOTSTRAP"],
            "${{ inputs.legacy_bootstrap && '1' || '0' }}",
        )
        self.assertIn('--baseline-content-sha "$BASELINE_CONTENT_SHA"', deploy["run"])
        self.assertIn(
            '--allow-legacy-bootstrap "$ALLOW_LEGACY_BOOTSTRAP"', deploy["run"]
        )
        # Bootstrap only selects the host's explicit migration branch; it cannot
        # skip any CI/source/approval stage in the job.
        for step in self.steps:
            if "blog_prod_gate.py" in step.get("run", ""):
                self.assertNotIn("legacy_bootstrap", str(step))
                self.assertNotIn("if", step)

    def test_contract_job_sets_up_real_native_runtime_before_unfiltered_discovery(self):
        contract = yaml.safe_load(
            (ROOT / ".github/workflows/blog-prod-install-check.yml").read_text()
        )
        events = contract.get("on", contract.get(True))
        for event in ("push", "pull_request"):
            self.assertIn(".github/scripts/blog_prod_*.py", events[event]["paths"])
            self.assertIn(
                ".github/workflows/blog-prod-publish.yml", events[event]["paths"]
            )
        steps = contract["jobs"]["contract"]["steps"]
        node_index = next(
            i
            for i, step in enumerate(steps)
            if step.get("uses", "").startswith("actions/setup-node@")
        )
        pnpm_index = next(
            i
            for i, step in enumerate(steps)
            if step.get("uses", "").startswith("pnpm/action-setup@")
        )
        install_index = next(
            i
            for i, step in enumerate(steps)
            if 'pnpm install --frozen-lockfile --filter "@daodao/blog-content..."'
            == step.get("run")
        )
        config_index = next(
            i
            for i, step in enumerate(steps)
            if step.get("run") == "pnpm --filter @daodao/config generate:env"
        )
        tests_index = next(
            i
            for i, step in enumerate(steps)
            if step.get("run")
            == "python3 -m unittest discover -s .github/scripts/__tests__ -p 'test_blog*.py' -v"
        )
        self.assertEqual(steps[node_index]["with"]["node-version"], "20.19.4")
        self.assertLess(node_index, pnpm_index)
        self.assertLess(pnpm_index, install_index)
        self.assertLess(install_index, config_index)
        self.assertLess(config_index, tests_index)
        for step in steps:
            self.assertNotIn("continue-on-error", step)
            self.assertNotIn("if", step)
            if "uses" in step:
                self.assertRegex(step["uses"], r"@[a-f0-9]{40}$")

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
        self.assertNotIn("--manifest", deploy["run"])
        artifact = self.step("Record exact public release bytes")["run"]
        for caller_path_option in ("--out", "--nginx", "--manifest"):
            self.assertNotIn(caller_path_option, artifact)
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
            build.index("pnpm --filter @daodao/config generate:env"),
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
