"""Exercise commit-changes.sh against a real local git remote with a fake `gh`.

守的是 2026-09-20 的教訓：dev／prod 上了 ruleset「Protect branches」之後，workflow 直推會被拒，
自動產生的變更必須改走 PR；而 feat/** 未受保護，不該為了一次生成物就開 PR。
"""

import os
from pathlib import Path
import subprocess
import tempfile
import unittest

import yaml


ROOT = Path(__file__).resolve().parents[3]
SCRIPT = ROOT / ".github/scripts/commit-changes.sh"


def git(cwd, *args):
    return subprocess.run(["git", *args], cwd=cwd, check=True,
                          capture_output=True, text=True).stdout.strip()


class CommitChangesTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(prefix="commit-changes-")
        base = Path(self.tmp.name)
        self.addCleanup(self.tmp.cleanup)

        self.remote = base / "remote.git"
        subprocess.run(["git", "init", "--bare", "-b", "dev", str(self.remote)],
                       check=True, capture_output=True)

        self.repo = base / "work"
        self.repo.mkdir()
        git(self.repo, "init", "-b", "dev")
        git(self.repo, "config", "user.email", "t@example.com")
        git(self.repo, "config", "user.name", "t")
        (self.repo / "generated").mkdir()
        (self.repo / "generated/tokens.ts").write_text("export const a = 1\n")
        git(self.repo, "add", "-A")
        git(self.repo, "commit", "-m", "init")
        git(self.repo, "remote", "add", "origin", str(self.remote))
        git(self.repo, "push", "-u", "origin", "dev")

        # 假 gh：把每次呼叫的參數寫進 log，讓測試核對真的開了 PR
        self.bin = base / "bin"
        self.bin.mkdir()
        self.ghlog = base / "gh.log"
        (self.bin / "gh").write_text(
            "#!/bin/bash\n"
            f'printf "%s\\n" "$*" >> {self.ghlog}\n'
            'if [ "$1 $2" = "pr list" ]; then exit 0; fi\n'
            'if [ "$1 $2" = "pr create" ]; then echo "https://github.com/o/r/pull/1"; fi\n'
        )
        (self.bin / "gh").chmod(0o755)

    def run_script(self, *args, target="dev", env=None):
        environ = dict(
            os.environ,
            PATH=f"{self.bin}:{os.environ['PATH']}",
            TARGET_REF=target,
            GITHUB_RUN_ID="42",
            GH_TOKEN="x",
        )
        environ.update(env or {})
        return subprocess.run(["bash", str(SCRIPT), *args], cwd=self.repo,
                              env=environ, capture_output=True, text=True)

    def dirty(self):
        (self.repo / "generated/tokens.ts").write_text("export const a = 2\n")

    def test_protected_branch_opens_pr_and_leaves_target_untouched(self):
        self.dirty()
        result = self.run_script("chore: regen", "mobile-tokens", "generated/")
        self.assertEqual(result.returncode, 0, result.stderr)

        branches = git(self.repo, "ls-remote", "--heads", "origin")
        self.assertIn("chore/mobile-tokens-42", branches)
        # dev 不能被動到
        self.assertEqual(
            git(self.repo, "rev-parse", "origin/dev"),
            git(self.repo, "rev-list", "--max-parents=0", "HEAD"),
        )
        log = self.ghlog.read_text()
        self.assertIn("pr create", log)
        self.assertIn("--base dev", log)

    def test_unprotected_branch_pushes_directly(self):
        git(self.repo, "checkout", "-b", "feat/x")
        git(self.repo, "push", "-u", "origin", "feat/x")
        self.dirty()
        result = self.run_script("chore: regen", "mobile-tokens", "generated/",
                                 target="feat/x")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertNotIn("pr create", self.ghlog.read_text() if self.ghlog.exists() else "")
        self.assertEqual(
            git(self.repo, "rev-parse", "origin/feat/x"),
            git(self.repo, "rev-parse", "HEAD"),
        )

    def test_no_changes_is_a_noop(self):
        result = self.run_script("chore: regen", "mobile-tokens", "generated/")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertFalse(self.ghlog.exists() and "pr create" in self.ghlog.read_text())
        self.assertEqual(git(self.repo, "ls-remote", "--heads", "origin", "chore/*"), "")

    def test_pr_body_carries_evidence_section(self):
        """PR evidence gate 已是 required check；機器 PR 必須自帶不適用聲明才合得進去。"""
        self.dirty()
        self.run_script("chore: regen", "mobile-tokens", "generated/")
        log = self.ghlog.read_text()
        self.assertIn("## 驗證證據", log)
        self.assertIn("核心旅程不適用", log)

    def test_missing_target_ref_fails_loudly(self):
        self.dirty()
        result = self.run_script("chore: regen", "mobile-tokens", "generated/",
                                 target="", env={"GITHUB_REF_NAME": ""})
        self.assertEqual(result.returncode, 2)


class WorkflowWiringTests(unittest.TestCase):
    """三支會產生 commit 的 workflow 都必須走 commit-changes.sh，不得自己 git push。"""

    WORKFLOWS = ("generate-mobile-tokens.yml", "update-i18n.yml", "sync-openapi.yml")

    def test_no_direct_push_in_auto_commit_workflows(self):
        for name in self.WORKFLOWS:
            with self.subTest(workflow=name):
                text = (ROOT / ".github/workflows" / name).read_text()
                self.assertNotIn("git push", text)
                self.assertIn("commit-changes.sh", text)

    def test_auto_commit_workflows_can_open_prs(self):
        for name in self.WORKFLOWS:
            with self.subTest(workflow=name):
                workflow = yaml.safe_load((ROOT / ".github/workflows" / name).read_text())
                perms = workflow.get("permissions", {})
                self.assertEqual(perms.get("pull-requests"), "write")
                self.assertEqual(perms.get("contents"), "write")
