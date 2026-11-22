"""Feature-branch deploys must not cancel the dev/prod deploy of another branch (daodao#544 dev rollout)."""
import re
import unittest
from pathlib import Path

import yaml

WORKFLOW = Path(__file__).resolve().parents[2] / "workflows/linode-cd.yml"


def render_group(template: str, context: dict) -> str:
    """Evaluate the `a || b` expressions used by the concurrency group with a workflow context."""
    def evaluate(match: re.Match) -> str:
        for name in (part.strip() for part in match.group(1).split("||")):
            value = context.get(name, "")
            if value:
                return value
        return ""
    return re.sub(r"\$\{\{\s*(.*?)\s*\}\}", evaluate, template)


class LinodeCdConcurrencyTest(unittest.TestCase):
    def setUp(self):
        self.workflow = yaml.safe_load(WORKFLOW.read_text())
        self.group = self.workflow["concurrency"]["group"]

    def run_for(self, head_branch: str, event: str = "push") -> dict:
        # workflow_run always runs on the default branch, whatever branch triggered CI.
        return {"github.ref": "refs/heads/dev", "github.ref_name": "dev",
                "github.event.workflow_run.head_branch": head_branch,
                "github.event.workflow_run.event": event}

    def test_feature_branch_deploy_does_not_share_the_dev_group(self):
        dev = render_group(self.group, self.run_for("dev"))
        feature = render_group(self.group, self.run_for("feat/activity-detail-information"))
        self.assertNotEqual(dev, feature)

    def test_newer_deploy_of_the_same_branch_still_replaces_the_older_one(self):
        self.assertEqual(render_group(self.group, self.run_for("dev")), render_group(self.group, self.run_for("dev")))
        self.assertTrue(self.workflow["concurrency"]["cancel-in-progress"])

    def test_manual_dispatch_groups_by_its_own_branch(self):
        manual = {"github.ref": "refs/heads/dev", "github.ref_name": "dev"}
        self.assertEqual(render_group(self.group, manual), "linode-cd-dev-")

    def test_host_lock_still_serialises_deploys_across_branches(self):
        steps = self.workflow["jobs"]["deploy"]["steps"]
        deploy = next(step for step in steps if step.get("name") == "Deploy to Linode")
        self.assertIn("flock -w 600 9", deploy["run"])


if __name__ == "__main__":
    unittest.main()
