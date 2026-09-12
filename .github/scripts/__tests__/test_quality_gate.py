"""Guard the Linode CI quality gate against false-green shell patterns."""

from pathlib import Path
import unittest

import yaml


ROOT = Path(__file__).resolve().parents[3]
WORKFLOW = ROOT / ".github/workflows/linode-ci.yml"


class QualityGateTests(unittest.TestCase):
    def test_quality_checks_are_sequential_and_exit_transparent(self):
        workflow = yaml.safe_load(WORKFLOW.read_text())
        test_job = workflow["jobs"]["test"]
        steps = test_job["steps"]
        expected_commands = {
            "Run typecheck": "pnpm run typecheck",
            "Run lint": "pnpm run lint",
            "Run tests": "pnpm test",
        }

        self.assertFalse(test_job.get("continue-on-error", False))
        quality_steps = [step for step in steps if step.get("name") in expected_commands]
        self.assertEqual([step["name"] for step in quality_steps], list(expected_commands))

        for step in quality_steps:
            with self.subTest(step=step["name"]):
                command = step["run"]
                self.assertEqual(command, expected_commands[step["name"]])
                self.assertFalse(step.get("continue-on-error", False))
                self.assertNotIn("&", command)
                self.assertNotIn("wait", command)


if __name__ == "__main__":
    unittest.main()
