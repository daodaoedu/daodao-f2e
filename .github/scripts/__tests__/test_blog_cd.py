import ast
import json
import os
import re
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[3]
WORKFLOW = yaml.safe_load((ROOT / ".github/workflows/linode-cd.yml").read_text())


def expression(text, values):
    text = text.strip()
    if text.startswith("${{"):
        text = text[3:-2].strip()
    text = re.sub(
        r"(?:needs|steps|vars|inputs|github)\.[A-Za-z0-9_.-]+",
        lambda match: repr(values.get(match.group(), "")),
        text,
    )
    text = text.replace("always()", "True").replace("&&", " and ").replace("||", " or ")
    tree = ast.parse(text, mode="eval")
    allowed = (
        ast.Expression,
        ast.BoolOp,
        ast.And,
        ast.Or,
        ast.Compare,
        ast.Eq,
        ast.NotEq,
        ast.Constant,
        ast.Name,
        ast.Load,
    )
    if any(not isinstance(node, allowed) for node in ast.walk(tree)):
        raise ValueError("Unsupported test expression")
    if any(
        isinstance(node, ast.Name) and node.id not in {"true", "false"}
        for node in ast.walk(tree)
    ):
        raise ValueError("Unsupported test expression name")
    return eval(
        compile(tree, "workflow-condition", "eval"),
        {"__builtins__": {}, "true": True, "false": False},
    )


def step(job, name):
    return next(
        item for item in WORKFLOW["jobs"][job]["steps"] if item.get("name") == name
    )


class BlogCdTests(unittest.TestCase):
    def test_privileged_legacy_jobs_reject_foreign_workflow_runs(self):
        base = {
            "github.repository": "daodaoedu/daodao-f2e",
            "github.event_name": "workflow_run",
            "github.event.workflow_run.head_repository.full_name": "outside/fork",
            "github.event.workflow_run.conclusion": "success",
            "github.event.workflow_run.event": "push",
            "inputs.force_deploy": False,
            "needs.build-website.result": "success",
            "needs.build-product.result": "skipped",
        }
        for job in ("detect-changes", "deploy"):
            condition = WORKFLOW["jobs"][job]["if"]
            with self.subTest(job=job, case="foreign push"):
                self.assertFalse(expression(condition, base))
            same_repo = {
                **base,
                "github.event.workflow_run.head_repository.full_name": "daodaoedu/daodao-f2e",
            }
            with self.subTest(job=job, case="same-repository push"):
                self.assertTrue(expression(condition, same_repo))
            with self.subTest(job=job, case="same-repository PR"):
                self.assertFalse(
                    expression(
                        condition,
                        {
                            **same_repo,
                            "github.event.workflow_run.event": "pull_request",
                        },
                    )
                )
            with self.subTest(job=job, case="explicit manual deployment"):
                self.assertTrue(
                    expression(
                        condition,
                        {
                            **base,
                            "github.event_name": "workflow_dispatch",
                            "inputs.force_deploy": True,
                        },
                    )
                )

    def test_repository_write_is_limited_to_the_deploy_ref_writer(self):
        for name, job in WORKFLOW["jobs"].items():
            with self.subTest(job=name):
                self.assertTrue(
                    "permissions" in job, f"{name} needs explicit job token permissions"
                )
                self.assertNotIn("write-all", job["permissions"])
                if name != "update-deploy-ref":
                    self.assertNotIn("write", job["permissions"].values())

    def test_managed_skipped_website_does_not_skip_product_verification(self):
        condition = WORKFLOW["jobs"]["verify"]["if"]
        values = {
            "needs.deploy.outputs.website": "false",
            "needs.deploy.outputs.product": "true",
            "needs.deploy.result": "success",
        }
        # GitHub applies success() to dependencies unless a status function overrides it.
        dependencies_success = False  # managed website build is skipped
        enabled = expression(condition, values) and (
            "always()" in condition or dependencies_success
        )
        self.assertTrue(enabled)
        values["needs.deploy.outputs.product"] = "false"
        self.assertFalse(expression(condition, values))

    def trust_case(
        self,
        channel,
        reference,
        approved_source="dev",
        ci=True,
        protected=True,
        runner_source=None,
    ):
        workflow = yaml.safe_load(
            (ROOT / ".github/workflows/blog-release.yml").read_text()
        )
        item = next(
            item
            for item in workflow["jobs"]["trust"]["steps"]
            if item.get("id") == "pins"
        )
        body = item["run"].split("python3 - <<'PY'", 1)[1].rsplit("\nPY", 1)[0]
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            subprocess.run(["git", "init", "-q", "-b", "prod", str(root)], check=True)
            (root / "source").write_text("reviewed formal source")
            subprocess.run(["git", "-C", str(root), "add", "."], check=True)
            identity = [
                "-c",
                "user.name=Policy fixture",
                "-c",
                "user.email=fixture@example.invalid",
            ]
            subprocess.run(
                ["git", "-C", str(root), *identity, "commit", "-qm", "formal"],
                check=True,
            )
            prod = subprocess.check_output(
                ["git", "-C", str(root), "rev-parse", "HEAD"], text=True
            ).strip()
            subprocess.run(
                ["git", "-C", str(root), "checkout", "-qb", "dev"], check=True
            )
            (root / "source").write_text("reviewed dev bootstrap")
            subprocess.run(["git", "-C", str(root), "add", "."], check=True)
            subprocess.run(
                ["git", "-C", str(root), *identity, "commit", "-qm", "dev"], check=True
            )
            dev = subprocess.check_output(
                ["git", "-C", str(root), "rev-parse", "HEAD"], text=True
            ).strip()
            for name, value in [("prod", prod), ("dev", dev)]:
                subprocess.run(
                    [
                        "git",
                        "-C",
                        str(root),
                        "update-ref",
                        "refs/remotes/origin/" + name,
                        value,
                    ],
                    check=True,
                )
            approved = dev if approved_source == "dev" else prod
            fixture = root / "response.json"
            fixture.write_text(
                json.dumps({"sha": approved, "ci": ci, "protected": protected})
            )
            executable = root / "gh"
            executable.write_text(f"""#!{sys.executable}
import json,os,sys
value=json.load(open(os.environ['POLICY_FIXTURE']));endpoint=next(item for item in sys.argv if item.startswith('repos/'))
if endpoint.endswith('/actions/variables/BLOG_RELEASE_MANAGED'):print('true')
elif endpoint.endswith('/deployment-branch-policies'):print(json.dumps({{'branch_policies':[{{'name':'dev','type':'branch'}},{{'name':'prod','type':'branch'}}]}}))
elif endpoint.endswith('/environments/development'):print(json.dumps({{'protection_rules':[{{'type':'required_reviewers'}}] if value['protected'] else [],'deployment_branch_policy':{{'custom_branch_policies':True}}}}))
else:print(json.dumps({{'workflow_runs':[{{'name':'Linode CI','head_sha':value['sha'],'html_url':'https://example.invalid/ci'}}] if value['ci'] else []}}))
""")
            executable.chmod(0o755)
            output = root / "output"
            summary = root / "summary"
            environment = {
                **os.environ,
                "PATH": str(root) + os.pathsep + os.environ["PATH"],
                "POLICY_FIXTURE": str(fixture),
                "CHANNEL": channel,
                "WORKFLOW_REF": reference,
                "APPROVED": approved,
                "RUNNER": approved
                if runner_source is None
                else (prod if runner_source == "prod" else ""),
                "MANAGED": "true",
                "READY": "true",
                "BASE_URL": "https://development.example.invalid",
                "STORE": str(root / "store"),
                "REPOSITORY": "fixture/frontend",
                "OPERATION": "publish",
                "GITHUB_OUTPUT": str(output),
                "GITHUB_STEP_SUMMARY": str(summary),
            }
            result = subprocess.run(
                [sys.executable, "-c", body],
                cwd=root,
                env=environment,
                capture_output=True,
                text=True,
                check=False,
            )
            return (
                result.returncode,
                output.read_text() if output.exists() else "",
                result.stderr,
            )

    def test_frontend_ci_cannot_authorize_missing_or_uncertified_runner(self):
        for runner in ("missing", "prod"):
            code, output, _ = self.trust_case(
                "approved-dev-bootstrap", "refs/heads/dev", runner_source=runner
            )
            self.assertNotEqual(code, 0)
            self.assertNotIn("frontend=", output)
            self.assertNotIn("runner=", output)

    def test_reviewed_dev_bootstrap_does_not_require_prod_promotion(self):
        code, output, _ = self.trust_case("approved-dev-bootstrap", "refs/heads/dev")
        self.assertEqual(code, 0)
        self.assertIn("channel=approved-dev-bootstrap", output)

    def test_formal_channel_cannot_take_unpromoted_dev_commit(self):
        code, output, _ = self.trust_case("formal-prod", "refs/heads/prod")
        self.assertNotEqual(code, 0)
        self.assertNotIn("frontend=", output)
        code, output, _ = self.trust_case("formal-prod", "refs/heads/prod", "prod")
        self.assertEqual(code, 0)
        self.assertIn("channel=formal-prod", output)

    def test_bootstrap_requires_matching_protected_channel_ci_and_reviewer_gate(self):
        for kwargs in (
            {"reference": "refs/heads/feature"},
            {"reference": "refs/heads/dev", "ci": False},
            {"reference": "refs/heads/dev", "protected": False},
        ):
            code, output, _ = self.trust_case("approved-dev-bootstrap", **kwargs)
            self.assertNotEqual(code, 0)
            self.assertNotIn("frontend=", output)

    def test_embedded_release_python_blocks_compile(self):
        workflow = yaml.safe_load(
            (ROOT / ".github/workflows/blog-release.yml").read_text()
        )
        for job in workflow["jobs"].values():
            for item in job.get("steps", []):
                script = item.get("run", "")
                if "python3 - <<'PY'" in script:
                    body = script.split("python3 - <<'PY'", 1)[1].rsplit("\nPY", 1)[0]
                    compile(body, item.get("name", "workflow"), "exec")

    def test_product_only_prod_keeps_protected_production_environment(self):
        for job in ("deploy", "verify"):
            for website, product, expected in [
                ("", "prod", "production"),
                ("prod", "", "production"),
                ("dev", "", "development"),
                ("", "dev", "development"),
            ]:
                result = expression(
                    WORKFLOW["jobs"][job]["environment"],
                    {
                        "needs.build-website.outputs.image-tag": website,
                        "needs.build-product.outputs.image-tag": product,
                    },
                )
                self.assertEqual(result, expected)

    def test_late_ownership_skip_propagates_to_deploy_and_verification(self):
        requested = {
            "needs.build-website.result": "success",
            "needs.build-product.result": "success",
            "steps.ownership.outputs.website": "false",
            "needs.deploy.outputs.website": "false",
            "needs.deploy.outputs.product": "true",
        }
        self.assertEqual(
            expression(
                step("deploy", "Deploy to Linode")["env"]["DEPLOY_WEBSITE"], requested
            ),
            "false",
        )
        verify = step("verify", "Deployment Verification")["env"]
        self.assertEqual(expression(verify["DEPLOY_WEBSITE"], requested), "false")
        self.assertEqual(expression(verify["DEPLOY_PRODUCT"], requested), "true")

    def test_shared_deploy_ref_is_not_advanced_for_a_skipped_requested_app(self):
        values = {
            "needs.deploy.result": "success",
            "needs.verify.result": "success",
            "needs.detect-changes.outputs.build-website": "true",
            "needs.detect-changes.outputs.build-product": "true",
            "needs.deploy.outputs.website": "false",
            "needs.deploy.outputs.product": "true",
        }
        condition = WORKFLOW["jobs"]["update-deploy-ref"]["if"]
        self.assertFalse(expression(condition, values))
        values["needs.deploy.outputs.website"] = "true"
        self.assertTrue(expression(condition, values))
        values["needs.detect-changes.outputs.build-website"] = "false"
        values["needs.deploy.outputs.website"] = "false"
        self.assertTrue(expression(condition, values))

    def test_manual_product_only_never_advances_shared_website_ref(self):
        values = {
            "needs.deploy.result": "success",
            "needs.verify.result": "success",
            "needs.detect-changes.outputs.build-website": "false",
            "needs.detect-changes.outputs.build-product": "true",
            "needs.deploy.outputs.website": "false",
            "needs.deploy.outputs.product": "true",
            "github.event_name": "workflow_dispatch",
            "inputs.app": "product",
        }
        self.assertFalse(
            expression(WORKFLOW["jobs"]["update-deploy-ref"]["if"], values)
        )

    def test_no_app_authorized_never_runs_legacy_remote_mutations(self):
        values = {
            "steps.ownership.outputs.website": "false",
            "needs.build-product.result": "skipped",
        }
        for name in (
            "Set up SSH",
            "Add Linode to known_hosts",
            "Create environment files on Linode",
            "Deploy to Linode",
        ):
            self.assertFalse(expression(step("deploy", name)["if"], values))
        values["needs.build-product.result"] = "success"
        self.assertTrue(expression(step("deploy", "Deploy to Linode")["if"], values))

    def test_real_build_guard_fails_before_any_blog_empty_fallback(self):
        script = step("build-website", "Require pinned Blog publication pipeline")[
            "run"
        ]
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            self.assertEqual(
                subprocess.run(
                    ["bash", "-c", script], cwd=root, capture_output=True, check=False
                ).returncode,
                0,
            )
            (root / "packages/blog-content").mkdir(parents=True)
            result = subprocess.run(
                ["bash", "-c", script],
                cwd=root,
                capture_output=True,
                text=True,
                check=False,
            )
            self.assertEqual(result.returncode, 1)
            self.assertIn("pinned content and approval", result.stdout)


if __name__ == "__main__":
    unittest.main()
