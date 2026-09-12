"""Exercise the real CI shell with a mocked package manager."""

import os
from pathlib import Path
import subprocess
import tempfile
import unittest

import yaml


ROOT = Path(__file__).resolve().parents[3]
WORKFLOW = ROOT / ".github/workflows/linode-ci.yml"


class QualityGateTests(unittest.TestCase):
    def test_quality_checks_propagate_failures_and_wait_for_every_check(self):
        workflow = yaml.safe_load(WORKFLOW.read_text())
        steps = workflow["jobs"]["test"]["steps"]
        check = next(step for step in steps if step.get("name") == "Run checks in parallel")
        self.assertNotIn("if", check)
        self.assertFalse(check.get("continue-on-error", False))
        self.assertFalse(workflow["jobs"]["test"].get("continue-on-error", False))

        for failed_check in ("", "typecheck", "lint", "test"):
            with self.subTest(failed_check=failed_check or "all pass"):
                with tempfile.TemporaryDirectory(prefix="ci-quality-gate-") as directory:
                    directory = Path(directory)
                    log = directory / "completed"
                    pnpm = directory / "pnpm"
                    pnpm.write_text(
                        '#!/bin/bash\n'
                        'check="$1"\n'
                        'if [ "$check" = run ]; then check="$2"; fi\n'
                        'case "$check" in typecheck|lint|test) ;; *) exit 99 ;; esac\n'
                        'if [ "$check" != "$FAILED_CHECK" ]; then sleep 0.1; fi\n'
                        'printf "%s\\n" "$check" >> "$CHECK_LOG"\n'
                        'if [ "$check" = "$FAILED_CHECK" ]; then exit 42; fi\n'
                    )
                    pnpm.chmod(0o755)
                    result = subprocess.run(
                        ["bash", "--noprofile", "--norc", "-eo", "pipefail", "-c", check["run"]],
                        cwd=directory,
                        env={
                            **os.environ,
                            "PATH": f"{directory}:{os.environ['PATH']}",
                            "FAILED_CHECK": failed_check,
                            "CHECK_LOG": str(log),
                        },
                        capture_output=True,
                        text=True,
                        timeout=10,
                    )
                    self.assertEqual(
                        result.returncode == 0,
                        not failed_check,
                        f"{failed_check or 'success'}: {result.stdout}\n{result.stderr}",
                    )
                    self.assertCountEqual(log.read_text().splitlines(), ["typecheck", "lint", "test"])


if __name__ == "__main__":
    unittest.main()
