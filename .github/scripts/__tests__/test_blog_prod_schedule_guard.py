"""A queued schedule must not publish replacement content after settings change."""
import importlib.util
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
FRONTEND = "a" * 40
BASELINE = "b" * 40
CONTENT = "c" * 40


class ScheduledContentGuardTests(unittest.TestCase):
    def setUp(self):
        spec = importlib.util.spec_from_file_location("scheduled_prod_gate", ROOT/".github/scripts/blog_prod_gate.py")
        self.gate = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(self.gate)
        self.environment = {
            "GITHUB_REPOSITORY": "daodaoedu/daodao-f2e", "GITHUB_EVENT_NAME": "workflow_dispatch",
            "GITHUB_REF": "refs/heads/prod", "GITHUB_SHA": FRONTEND,
            "BLOG_PROD_RELEASE_MANAGED": "true", "BLOG_PROD_CONTENT_SHA": CONTENT,
            "BLOG_PROD_PUBLISHED_CONTENT_SHA": BASELINE,
        }

    def test_matching_scheduled_revision_can_enter_existing_gate(self):
        self.environment["BLOG_PROD_EXPECTED_CONTENT_SHA"] = CONTENT
        self.assertEqual(self.gate.context(self.environment), (FRONTEND, CONTENT, BASELINE))

    def test_settings_changed_after_dispatch_cannot_publish_different_content(self):
        self.environment["BLOG_PROD_EXPECTED_CONTENT_SHA"] = "d"*40
        with self.assertRaises(ValueError):
            self.gate.context(self.environment)

    def test_ordinary_manual_publication_does_not_require_schedule(self):
        self.assertEqual(self.gate.context(self.environment), (FRONTEND, CONTENT, BASELINE))

    def test_workflow_supplies_the_expected_revision_to_every_gate_check(self):
        import yaml
        workflow = yaml.safe_load((ROOT/".github/workflows/blog-prod-publish.yml").read_text())
        inputs = workflow.get("on", workflow.get(True))["workflow_dispatch"]["inputs"]
        self.assertFalse(inputs["expected_content_sha"]["required"])
        self.assertEqual(workflow["jobs"]["publish"]["env"]["BLOG_PROD_EXPECTED_CONTENT_SHA"], "${{ inputs.expected_content_sha }}")


if __name__ == "__main__":
    unittest.main()
