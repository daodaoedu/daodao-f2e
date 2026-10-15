"""Keep the EAS CLI runtime independent from the application's runtime."""

from pathlib import Path
import unittest

import yaml


ROOT = Path(__file__).resolve().parents[3]


class MobileRuntimeTests(unittest.TestCase):
    def test_eas_uses_node_22_while_application_checks_keep_nvmrc(self):
        jobs = yaml.safe_load((ROOT / ".github/workflows/mobile-ci.yml").read_text())["jobs"]
        for job_name in ("check", "eas-build-check"):
            with self.subTest(job=job_name):
                step = next(
                    step for step in jobs[job_name]["steps"]
                    if step.get("uses", "").startswith("actions/setup-node@")
                )
                if job_name == "check":
                    self.assertEqual(step["with"]["node-version-file"], ".nvmrc")
                    self.assertEqual((ROOT / ".nvmrc").read_text().strip(), "20.19.4")
                    self.assertNotIn("node-version", step["with"])
                else:
                    self.assertEqual(step["with"]["node-version"], "22.18.0")
                    self.assertNotIn("node-version-file", step["with"])


if __name__ == "__main__":
    unittest.main()
