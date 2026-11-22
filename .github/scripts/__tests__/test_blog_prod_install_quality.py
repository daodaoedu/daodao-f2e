"""Exercise the real CI shell with a mocked package manager."""

import os
import subprocess
import tempfile
import unittest
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[3]


class QualityGateTests(unittest.TestCase):
    def test_quality_checks_propagate_failures_and_wait_for_every_check(self):
        self.check_workflow("linode-ci.yml", "test", ["typecheck", "lint", "test"])

    def main_job_runtime(self, fail_generation=False):
        workflow = yaml.safe_load(
            (ROOT / ".github/workflows/linode-ci.yml").read_text()
        )
        steps = workflow["jobs"]["test"]["steps"]
        start = next(
            i
            for i, step in enumerate(steps)
            if step.get("name") == "Install dependencies"
        )
        end = next(
            i
            for i, step in enumerate(steps)
            if step.get("name") == "Run checks in parallel"
        )
        with tempfile.TemporaryDirectory(prefix="main-ci-runtime-") as temporary:
            directory = Path(temporary)
            log = directory / "operations"
            pnpm = directory / "pnpm"
            pnpm.write_text(
                "#!/bin/bash\n"
                'if [ "$*" = "install --frozen-lockfile" ]; then\n'
                '  echo install >> "$OPERATIONS"; touch dependencies-ready; exit 0\n'
                "fi\n"
                'if [ "$*" = "--filter @daodao/config generate:env" ]; then\n'
                '  echo generate >> "$OPERATIONS"\n'
                "  [ -f dependencies-ready ] || exit 98\n"
                '  [ "$FAIL_GENERATION" != true ] || exit 42\n'
                "  mkdir -p packages/config/generated\n"
                '  echo "export const env = {};" > packages/config/generated/env.ts\n'
                "  exit 0\n"
                "fi\n"
                'check="$1"; if [ "$check" = run ]; then check="$2"; fi\n'
                'case "$check" in typecheck|lint|test) ;; *) exit 99 ;; esac\n'
                'echo "quality:$check" >> "$OPERATIONS"\n'
                "[ -f packages/config/generated/env.ts ] || exit 17\n"
            )
            pnpm.chmod(0o755)
            environment = {
                **os.environ,
                "PATH": f"{directory}:{os.environ['PATH']}",
                "OPERATIONS": str(log),
                "FAIL_GENERATION": "true" if fail_generation else "false",
            }
            result = None
            for step in steps[start : end + 1]:
                self.assertNotIn("if", step)
                self.assertFalse(step.get("continue-on-error", False))
                result = subprocess.run(
                    [
                        "bash",
                        "--noprofile",
                        "--norc",
                        "-eo",
                        "pipefail",
                        "-c",
                        step["run"],
                    ],
                    cwd=directory,
                    env=environment,
                    capture_output=True,
                    text=True,
                    timeout=10,
                    check=False,
                )
                if result.returncode:
                    break
            return result.returncode, log.read_text().splitlines()

    def test_main_job_generates_required_config_before_quality_checks(self):
        status, operations = self.main_job_runtime()
        self.assertEqual(status, 0)
        self.assertEqual(operations[:2], ["install", "generate"])
        self.assertCountEqual(
            operations[2:], ["quality:typecheck", "quality:lint", "quality:test"]
        )

    def test_main_job_generation_failure_prevents_all_quality_commands(self):
        status, operations = self.main_job_runtime(fail_generation=True)
        self.assertNotEqual(status, 0)
        self.assertEqual(operations, ["install", "generate"])

    def check_workflow(self, filename, job, checks):
        workflow = yaml.safe_load((ROOT / ".github/workflows" / filename).read_text())
        steps = workflow["jobs"][job]["steps"]
        check = next(
            step for step in steps if step.get("name") == "Run checks in parallel"
        )
        if filename == "linode-ci.yml":
            self.assertNotIn("if", check)
        self.assertFalse(check.get("continue-on-error", False))
        self.assertFalse(workflow["jobs"][job].get("continue-on-error", False))

        for failed_check in ("", *checks):
            with (
                self.subTest(failed_check=failed_check or "all pass"),
                tempfile.TemporaryDirectory(prefix="ci-quality-gate-") as directory,
            ):
                directory = Path(directory)
                log = directory / "completed"
                pnpm = directory / "pnpm"
                pnpm.write_text(
                    "#!/bin/bash\n"
                    'if [ "$1" = --filter ]; then\n'
                    '  [ "$2" = @daodao/mobile ] || exit 98\n'
                    "  shift 2\n"
                    "fi\n"
                    'check="$1"\n'
                    'if [ "$check" = run ]; then check="$2"; fi\n'
                    'case "$check" in typecheck|lint|test) ;; *) exit 99 ;; esac\n'
                    'if [ "$check" != "$FAILED_CHECK" ]; then sleep 0.1; fi\n'
                    'printf "%s\\n" "$check" >> "$CHECK_LOG"\n'
                    'if [ "$check" = "$FAILED_CHECK" ]; then exit 42; fi\n'
                )
                pnpm.chmod(0o755)
                result = subprocess.run(
                    [
                        "bash",
                        "--noprofile",
                        "--norc",
                        "-eo",
                        "pipefail",
                        "-c",
                        check["run"],
                    ],
                    cwd=directory,
                    env={
                        **os.environ,
                        "PATH": f"{directory}:{os.environ['PATH']}",
                        "FAILED_CHECK": failed_check,
                        "CHECK_LOG": str(log),
                    },
                    check=False,
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
