import importlib.util
import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

SCRIPT = Path(__file__).resolve().parents[1] / "blog-cd-ownership.py"
spec = importlib.util.spec_from_file_location("ownership", SCRIPT)
ownership = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ownership)


class OwnershipTests(unittest.TestCase):
    def test_managed_and_unknown_policy_values_never_authorize_legacy_website(self):
        for value in ("true", "unknown", "TRUE", ""):
            result = ownership.decide(
                True,
                [{"variables": [{"name": "BLOG_RELEASE_MANAGED", "value": value}]}],
                True,
            )
            self.assertFalse(result["website"])

    def test_all_paginated_variables_are_checked(self):
        self.assertFalse(
            ownership.decide(
                True,
                [
                    {"variables": []},
                    {"variables": [{"name": "BLOG_RELEASE_MANAGED", "value": "true"}]},
                ],
                True,
            )["website"]
        )

    def test_unreadable_policy_never_authorizes_website(self):
        self.assertFalse(ownership.decide(True, [], False)["website"])

    def test_explicit_false_or_unconfigured_legacy_ownership_preserves_pre_cutover_behavior(
        self,
    ):
        self.assertTrue(ownership.decide(True, [{"variables": []}], True)["website"])
        self.assertTrue(
            ownership.decide(
                True,
                [{"variables": [{"name": "BLOG_RELEASE_MANAGED", "value": "false"}]}],
                True,
            )["website"]
        )
        self.assertFalse(ownership.decide(False, [{"variables": []}], True)["website"])

    def test_actual_cli_returns_skip_on_api_failure_without_failing_product_job(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            gh = root / "gh"
            gh.write_text(f"#!{sys.executable}\nimport sys\nsys.exit(1)\n")
            gh.chmod(0o755)
            result = subprocess.run(
                [
                    sys.executable,
                    str(SCRIPT),
                    "--repo",
                    "daodaoedu/daodao-f2e",
                    "--requested",
                    "true",
                ],
                capture_output=True,
                text=True,
                env={**os.environ, "PATH": str(root)},
                check=False,
            )
            self.assertEqual(result.returncode, 0)
            self.assertFalse(json.loads(result.stdout)["website"])


if __name__ == "__main__":
    unittest.main()
