"""Exercise the real CI shell with a mocked package manager."""

import os
from pathlib import Path
import subprocess
import tempfile
import unittest

import yaml


ROOT = Path(__file__).resolve().parents[3]


class QualityGateTests(unittest.TestCase):
    def test_quality_checks_propagate_failures_and_wait_for_every_check(self):
        self.check_workflow("linode-ci.yml", "test", ["typecheck", "lint", "test"])

    def test_mobile_checks_propagate_failures_and_wait_for_every_check(self):
        self.check_workflow("mobile-ci.yml", "check", ["typecheck", "lint"])

    def check_workflow(self, filename, job, checks):
        workflow = yaml.safe_load((ROOT / ".github/workflows" / filename).read_text())
        steps = workflow["jobs"][job]["steps"]
        check = next(step for step in steps if step.get("name") == "Run checks in parallel")
        if filename == "linode-ci.yml":
            self.assertNotIn("if", check)
        self.assertFalse(check.get("continue-on-error", False))
        self.assertFalse(workflow["jobs"][job].get("continue-on-error", False))

        for failed_check in ("", *checks):
            with self.subTest(failed_check=failed_check or "all pass"):
                with tempfile.TemporaryDirectory(prefix="ci-quality-gate-") as directory:
                    directory = Path(directory)
                    log = directory / "completed"
                    pnpm = directory / "pnpm"
                    pnpm.write_text(
                        '#!/bin/bash\n'
                        'if [ "$1" = --filter ]; then\n'
                        '  [ "$2" = @daodao/mobile ] || exit 98\n'
                        '  shift 2\n'
                        'fi\n'
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
                    self.assertCountEqual(log.read_text().splitlines(), checks)


if __name__ == "__main__":
    unittest.main()
