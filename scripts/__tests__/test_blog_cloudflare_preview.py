"""Exercise the Cloudflare preview trust boundary with real local Git checkouts."""

import copy
import importlib.util
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

SCRIPT = Path(__file__).resolve().parents[1] / "blog-cloudflare-preview.py"
SPEC = importlib.util.spec_from_file_location("blog_cloudflare_preview", SCRIPT)
preview = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = preview
SPEC.loader.exec_module(preview)


def git(root, *arguments):
    return subprocess.check_output(
        ["git", "-c", "core.hooksPath=/dev/null", "-C", str(root), *arguments],
        text=True,
        stderr=subprocess.PIPE,
    ).strip()


def checkout(root, branch, remote):
    root.mkdir()
    git(root, "init", "-q", "-b", branch)
    git(root, "remote", "add", "origin", remote)
    (root / "README.md").write_text("Known preview test content\n")
    git(root, "add", "README.md")
    git(
        root,
        "-c",
        "user.name=Preview test",
        "-c",
        "user.email=preview-test@example.invalid",
        "-c",
        "commit.gpgsign=false",
        "commit",
        "-qm",
        "Fixture only",
    )
    return git(root, "rev-parse", "HEAD")


class PreviewContextTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.root = Path(self.temporary.name).resolve()
        self.content = self.root / "content"
        self.frontend = self.root / "frontend"
        self.content_sha = checkout(
            self.content,
            "content/review-42",
            "https://github.com/daodaoedu/daodao-blog.git",
        )
        self.frontend_sha = checkout(
            self.frontend,
            "dev",
            "https://github.com/daodaoedu/daodao-f2e.git",
        )
        self.environment = {
            "CF_PAGES": "1",
            "CF_PAGES_BRANCH": "content/review-42",
            "CF_PAGES_COMMIT_SHA": self.content_sha,
            "CF_PAGES_URL": "https://a1b2c3d4.daodao-blog.pages.dev",
            "BLOG_PREVIEW_FRONTEND_SHA": self.frontend_sha,
            "SKIP_DEPENDENCY_INSTALL": "1",
        }

    def tearDown(self):
        self.temporary.cleanup()

    def validate(self, changes=None):
        environment = dict(self.environment)
        environment.update(changes or {})
        return preview.validate_context(environment, self.content, self.frontend)

    def test_accepts_exact_official_content_and_reviewed_frontend(self):
        before = {
            str(root): (
                git(root, "rev-parse", "HEAD"),
                git(root, "status", "--porcelain"),
            )
            for root in (self.content, self.frontend)
        }
        context = self.validate()
        self.assertEqual(context["content_sha"], self.content_sha)
        self.assertEqual(context["frontend_sha"], self.frontend_sha)
        self.assertEqual(context["branch"], "content/review-42")
        self.assertEqual(context["origin"], self.environment["CF_PAGES_URL"])
        for root in (self.content, self.frontend):
            self.assertEqual(
                (git(root, "rev-parse", "HEAD"), git(root, "status", "--porcelain")),
                before[str(root)],
            )

    def test_dependency_install_must_be_explicitly_disabled(self):
        for value in ("1", "true"):
            with self.subTest(value=value):
                self.validate({"SKIP_DEPENDENCY_INSTALL": value})
        for value in ("", "0", "false", "yes"):
            with self.subTest(value=value), self.assertRaises(ValueError):
                self.validate({"SKIP_DEPENDENCY_INSTALL": value})

    def test_production_and_non_content_branches_cannot_use_preview_builder(self):
        for value in ("main", "prod", "dev", "fix/article", ""):
            with self.subTest(branch=value), self.assertRaises(ValueError):
                self.validate({"CF_PAGES_BRANCH": value})
        with self.assertRaises(ValueError):
            self.validate({"CF_PAGES": "0"})

    def test_short_or_stale_revision_is_rejected_before_build(self):
        for variable in ("CF_PAGES_COMMIT_SHA", "BLOG_PREVIEW_FRONTEND_SHA"):
            for value in ("abc123", "A" * 40, "f" * 40, ""):
                with (
                    self.subTest(variable=variable, value=value),
                    self.assertRaises(ValueError),
                ):
                    self.validate({variable: value})

    def test_preview_origin_must_be_the_expected_cloudflare_deployment(self):
        origins = (
            "https://daodao.so",
            "http://a1b2c3d4.daodao-blog.pages.dev",
            "https://a1b2c3d4.other.pages.dev",
            "https://daodao-blog.pages.dev",
            "https://content-review-42.daodao-blog.pages.dev",
            "https://a.b.daodao-blog.pages.dev",
            "https://a1b2c3d4.daodao-blog.pages.dev.evil.invalid",
            "https://user:password@a1b2c3d4.daodao-blog.pages.dev",
            "https://a1b2c3d4.daodao-blog.pages.dev/blog",
            "https://a1b2c3d4.daodao-blog.pages.dev?token=value",
            "https://a1b2c3d4.daodao-blog.pages.dev#fragment",
            "",
        )
        for origin in origins:
            with self.subTest(origin=origin), self.assertRaises(ValueError):
                self.validate({"CF_PAGES_URL": origin})

    def test_fork_or_non_github_remote_cannot_supply_official_content(self):
        for remote in (
            "https://github.com/outsider/daodao-blog.git",
            "https://github.com/daodaoedu/another-repo.git",
            "https://github.com.evil.invalid/daodaoedu/daodao-blog.git",
            "https://example.invalid/daodaoedu/daodao-blog.git",
            str(self.frontend),
        ):
            git(self.content, "remote", "set-url", "origin", remote)
            with self.subTest(remote=remote), self.assertRaises(ValueError):
                self.validate()

    def test_content_cannot_supply_functions_or_wrangler_configuration(self):
        for name in (
            "functions",
            "_worker.js",
            "wrangler.toml",
            "wrangler.json",
            "wrangler.jsonc",
        ):
            path = self.content / name
            if name == "functions":
                path.mkdir()
            else:
                path.write_text("untrusted content\n")
            try:
                with self.subTest(name=name), self.assertRaises(ValueError):
                    self.validate()
            finally:
                path.rmdir() if path.is_dir() else path.unlink()


class PullRequestIdentityTests(unittest.TestCase):
    def setUp(self):
        self.context = {
            "content_sha": "a" * 40,
            "frontend_sha": "b" * 40,
            "branch": "content/review-42",
            "origin": "https://c1d2e3f4.daodao-blog.pages.dev",
        }
        self.pr = {
            "number": 42,
            "state": "open",
            "base": {"ref": "main", "repo": {"full_name": "daodaoedu/daodao-blog"}},
            "head": {
                "sha": self.context["content_sha"],
                "ref": self.context["branch"],
                "repo": {"full_name": "daodaoedu/daodao-blog"},
            },
        }

    def test_resolves_exact_open_official_pr(self):
        requests = []

        def getter(url):
            requests.append(url)
            return [self.pr]

        self.assertEqual(preview.resolve_pr(self.context, getter), 42)
        self.assertEqual(len(requests), 1)
        self.assertTrue(
            requests[0].startswith(
                "https://api.github.com/repos/daodaoedu/daodao-blog/commits/"
                + self.context["content_sha"]
                + "/pulls"
            )
        )

    def test_closed_stale_fork_or_wrong_base_does_not_authorize_a_preview(self):
        mutations = (
            ("state", "closed"),
            ("base.ref", "dev"),
            ("base.repo.full_name", "outsider/daodao-blog"),
            ("head.sha", "c" * 40),
            ("head.ref", "content/another-review"),
            ("head.repo.full_name", "outsider/daodao-blog"),
            ("head.repo", None),
            ("number", 0),
            ("number", True),
        )
        for key, value in mutations:
            pr = copy.deepcopy(self.pr)
            target = pr
            parts = key.split(".")
            for part in parts[:-1]:
                target = target[part]
            target[parts[-1]] = value
            with self.subTest(field=key), self.assertRaises(ValueError):
                preview.resolve_pr(self.context, lambda _url, pr=pr: [pr])

    def test_no_match_or_ambiguous_matching_prs_fail_closed(self):
        other = copy.deepcopy(self.pr)
        other["number"] = 43
        for response in ([], [self.pr, other]):
            with self.subTest(response=response), self.assertRaises(ValueError):
                preview.resolve_pr(
                    self.context, lambda _url, response=response: response
                )

    def test_non_list_response_cannot_authorize_preview(self):
        for response in ({}, None):
            with (
                self.subTest(response=response),
                self.assertRaises((ValueError, TypeError)),
            ):
                preview.resolve_pr(
                    self.context, lambda _url, response=response: response
                )


class BuildEnvironmentTests(unittest.TestCase):
    def test_build_uses_only_controlled_public_configuration_and_draft_mode(self):
        context = {
            "content_sha": "a" * 40,
            "frontend_sha": "b" * 40,
            "branch": "content/review-42",
            "origin": "https://c1d2e3f4.daodao-blog.pages.dev",
        }
        with tempfile.TemporaryDirectory() as temporary:
            snapshot = Path(temporary).resolve()
            ambient = {
                "PATH": "/usr/bin:/bin",
                "HOME": "/home/preview-builder",
                "CI": "true",
                "CLOUDFLARE_API_TOKEN": "private-cloudflare-token",
                "GITHUB_TOKEN": "private-github-token",
                "NODE_OPTIONS": "--require /untrusted/hook.js",
                "NEXT_PUBLIC_PRIVATE_SENTINEL": "ambient-public-secret",
                "NEXT_PUBLIC_WEBSITE_URL": "https://daodao.so",
                "NEXT_PUBLIC_API_URL": "https://evil.invalid",
                "BLOG_CONTENT_MODE": "publish",
                "BLOG_APPROVALS_FILE": "/private/approvals.json",
                "BLOG_EVIDENCE_ROOT": "/private",
                "BLOG_PUBLISHED_BASELINE_FILE": "/private/baseline.json",
            }
            with patch.dict(os.environ, ambient, clear=True):
                environment = preview.clean_build_environment(context, snapshot)
            self.assertEqual(environment["PATH"], ambient["PATH"])
            self.assertEqual(environment["HOME"], ambient["HOME"])
            self.assertEqual(environment["BLOG_CONTENT_MODE"], "draft")
            self.assertEqual(environment["BLOG_CONTENT_DIR"], str(snapshot))
            self.assertEqual(environment["NEXT_OUTPUT"], "export")
            self.assertEqual(environment["NEXT_PUBLIC_WEBSITE_URL"], context["origin"])
            self.assertEqual(
                environment["NEXT_PUBLIC_API_URL"], "https://server-dev.daodao.so"
            )
            self.assertEqual(
                environment["NEXT_PUBLIC_APP_URL"], "https://app-dev.daodao.so"
            )
            for key in (
                "CLOUDFLARE_API_TOKEN",
                "GITHUB_TOKEN",
                "NODE_OPTIONS",
                "NEXT_PUBLIC_PRIVATE_SENTINEL",
            ):
                self.assertNotIn(key, environment)
            for key in (
                "BLOG_APPROVALS_FILE",
                "BLOG_EVIDENCE_ROOT",
                "BLOG_PUBLISHED_BASELINE_FILE",
            ):
                self.assertFalse(environment.get(key))
            for value in (
                "private-cloudflare-token",
                "private-github-token",
                "ambient-public-secret",
            ):
                self.assertNotIn(value, environment.values())


if __name__ == "__main__":
    unittest.main()
