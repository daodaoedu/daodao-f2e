"""Production ownership decisions exercised through the actual CLI."""

import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
HELPER = ROOT / ".github/scripts/blog-cd-ownership.py"


class ProductionOwnershipTests(unittest.TestCase):
    def decision(self, branch, prod="true", dev="false", requested="true"):
        with tempfile.TemporaryDirectory() as directory:
            result = subprocess.run(
                [
                    sys.executable,
                    str(HELPER),
                    "--branch",
                    branch,
                    "--requested",
                    requested,
                ],
                env={
                    **os.environ,
                    "BLOG_PROD_RELEASE_MANAGED": prod,
                    "BLOG_DEV_RELEASE_MANAGED": dev,
                    "GITHUB_OUTPUT": str(Path(directory) / "output"),
                },
                text=True,
                capture_output=True,
                check=True,
            )
            return json.loads(result.stdout)

    def test_managed_production_never_deploys_legacy_website(self):
        for flag in ("true", "TRUE", "unknown"):
            with self.subTest(flag=flag):
                result = self.decision("prod", prod=flag)
                self.assertFalse(result["website"])
                self.assertTrue(result["managed"])

    def test_unmanaged_production_retains_requested_decision(self):
        for flag in ("", "false", "FALSE"):
            with self.subTest(flag=flag):
                self.assertTrue(self.decision("prod", prod=flag)["website"])
                self.assertFalse(
                    self.decision("prod", prod=flag, requested="false")["website"]
                )

    def test_production_flag_does_not_change_other_environments(self):
        for branch in ("dev", "main", "feat/example"):
            with self.subTest(branch=branch):
                self.assertTrue(self.decision(branch)["website"])
        self.assertFalse(self.decision("dev", dev="true")["website"])


if __name__ == "__main__":
    unittest.main()
