"""Trusted Pages build entrypoint: official content is data, never executable code."""

import argparse
import importlib.util
import json
import os
import re
import shutil
import subprocess
import tempfile
import time
from pathlib import Path
from urllib.parse import urlsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener

CONTENT_REPOSITORY = "https://github.com/daodaoedu/daodao-blog.git"
CONTENT_NAME = "daodaoedu/daodao-blog"
SHA = re.compile(r"[a-f0-9]{40}")


def git(root, *args):
    return subprocess.check_output(
        ["git", "-c", "core.hooksPath=/dev/null", "-C", str(root), *args],
        text=True,
        timeout=30,
    ).strip()


def validate_context(environment, content_root, frontend_root):
    content_sha = environment.get("CF_PAGES_COMMIT_SHA", "")
    frontend_sha = environment.get("BLOG_PREVIEW_FRONTEND_SHA", "")
    branch = environment.get("CF_PAGES_BRANCH", "")
    origin = environment.get("CF_PAGES_URL", "")
    parsed = urlsplit(origin)
    if (
        environment.get("CF_PAGES") != "1"
        or environment.get("SKIP_DEPENDENCY_INSTALL") not in ("1", "true")
        or not re.fullmatch(r"content/[A-Za-z0-9][A-Za-z0-9._/-]{0,160}", branch)
        or ".." in branch
        or not SHA.fullmatch(content_sha)
        or not SHA.fullmatch(frontend_sha)
    ):
        raise ValueError(
            "Explicit non-production Pages content branch and source pins required"
        )
    if (
        parsed.scheme != "https"
        or not re.fullmatch(
            r"[a-f0-9]{8}\.daodao-blog\.pages\.dev", parsed.hostname or ""
        )
        or parsed.username
        or parsed.password
        or parsed.port not in (None, 443)
        or parsed.path not in ("", "/")
        or parsed.query
        or parsed.fragment
    ):
        raise ValueError("Immutable daodao-blog Pages deployment origin required")
    if git(frontend_root, "rev-parse", "HEAD") != frontend_sha:
        raise ValueError("Frontend checkout differs from protected Pages pin")
    if git(content_root, "rev-parse", "HEAD") != content_sha:
        raise ValueError("Pages checkout differs from content pin")
    remote = urlsplit(git(content_root, "remote", "get-url", "origin"))
    if (
        remote.scheme != "https"
        or remote.hostname != "github.com"
        or remote.path.rstrip("/")
        not in ("/daodaoedu/daodao-blog", "/daodaoedu/daodao-blog.git")
    ):
        raise ValueError("Official content repository required")
    for name in (
        "functions",
        "_worker.js",
        "wrangler.toml",
        "wrangler.json",
        "wrangler.jsonc",
    ):
        path = content_root / name
        if path.exists() or path.is_symlink():
            raise ValueError(
                "Content checkout must not configure executable Pages code"
            )
    return {
        "content_sha": content_sha,
        "frontend_sha": frontend_sha,
        "branch": branch,
        "origin": origin.rstrip("/"),
    }


def resolve_pr(context, getter):
    values = getter(
        f"https://api.github.com/repos/{CONTENT_NAME}/commits/{context['content_sha']}/pulls?per_page=100"
    )
    if not isinstance(values, list):
        raise TypeError("Expected GitHub PR associations")
    matches = []
    for item in values:
        head = item.get("head") or {}
        base = item.get("base") or {}
        if (
            item.get("state") == "open"
            and base.get("ref") == "main"
            and (base.get("repo") or {}).get("full_name") == CONTENT_NAME
            and head.get("sha") == context["content_sha"]
            and head.get("ref") == context["branch"]
            and (head.get("repo") or {}).get("full_name") == CONTENT_NAME
        ):
            number = item.get("number")
            if not isinstance(number, int) or isinstance(number, bool) or number <= 0:
                raise ValueError("Positive official PR identity required")
            matches.append(number)
    if len(matches) != 1:
        raise ValueError(
            "Exactly one current open official content PR targeting main required"
        )
    return matches[0]


def clean_build_environment(context, snapshot):
    return {
        "HOME": os.environ.get("HOME", "/tmp"),
        "PATH": os.environ.get("PATH", "/usr/bin:/bin"),
        "CI": "1",
        "NEXT_OUTPUT": "export",
        "BLOG_CONTENT_MODE": "draft",
        "BLOG_CONTENT_DIR": str(snapshot),
        "BLOG_APPROVALS_FILE": "",
        "BLOG_PUBLISHED_BASELINE_FILE": "",
        "BLOG_EVIDENCE_ROOT": "",
        "NEXT_PUBLIC_WEBSITE_URL": context["origin"],
        "NEXT_PUBLIC_APP_URL": "https://app-dev.daodao.so",
        "NEXT_PUBLIC_PRODUCT_URL": "https://app-dev.daodao.so",
        "NEXT_PUBLIC_API_URL": "https://server-dev.daodao.so",
        "NEXT_PUBLIC_POSTHOG_KEY": "",
        "NEXT_PUBLIC_POSTHOG_HOST": "",
        "NEXT_PUBLIC_BLOG_SOURCE_CONTEXT_TTL_SECONDS": "2592000",
        "NEXT_PUBLIC_BLOG_SOURCE_CONTEXT_DOMAIN": "",
        "NEXT_PUBLIC_BLOG_SOURCE_CONTEXT_COOKIE": "daodao_blog_preview_context",
    }


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def public_json(url):
    request = Request(
        url,
        headers={
            "User-Agent": "DaoDao-Article-Preview/1",
            "Accept": "application/vnd.github+json",
        },
    )
    with build_opener(NoRedirect).open(request, timeout=20) as response:
        data = response.read(2 * 1024 * 1024 + 1)
        if len(data) > 2 * 1024 * 1024:
            raise ValueError("GitHub response exceeds limit")
        return json.loads(data)


def artifact_helper(frontend_root):
    spec = importlib.util.spec_from_file_location(
        "blog_article_preview", frontend_root / "scripts/blog-article-preview.py"
    )
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def build_preview(context, pr_number, frontend_root, output):
    helper = artifact_helper(frontend_root)
    with tempfile.TemporaryDirectory(prefix="daodao-article-preview-") as temporary:
        source = frontend_root / ".blog-dev-preview-source"
        if source.exists() or source.is_symlink():
            raise ValueError("Fresh frontend checkout required")
        subprocess.run(
            [
                "git",
                "-c",
                "core.hooksPath=/dev/null",
                "clone",
                "--no-checkout",
                "--filter=blob:none",
                CONTENT_REPOSITORY,
                str(source),
            ],
            check=True,
            timeout=120,
        )
        subprocess.run(
            [
                "git",
                "-c",
                "core.hooksPath=/dev/null",
                "-C",
                str(source),
                "checkout",
                "--detach",
                context["content_sha"],
            ],
            check=True,
            timeout=120,
        )
        stage = helper.stage(
            pr_number,
            context["content_sha"],
            context["frontend_sha"],
            frontend_root,
            Path(temporary),
            origin=context["origin"],
        )
        environment = clean_build_environment(context, Path(stage["snapshot"]))
        node = subprocess.check_output(
            ["node", "--version"], text=True, env=environment
        ).strip()
        if node != "v20.19.4":
            raise ValueError("NODE_VERSION must select20.19.4")
        for name in (
            ".env",
            ".env.local",
            ".env.production",
            ".env.production.local",
            "apps/website/.env",
            "apps/website/.env.local",
            "apps/website/.env.production",
            "apps/website/.env.production.local",
        ):
            if (frontend_root / name).exists():
                raise ValueError("Fresh frontend must not inherit dotenv configuration")
        subprocess.run(
            ["pnpm", "install", "--frozen-lockfile", "--filter", "@daodao/website..."],
            cwd=frontend_root,
            env=environment,
            check=True,
            timeout=900,
        )
        subprocess.run(
            ["pnpm", "--filter", "@daodao/config", "generate:env"],
            cwd=frontend_root,
            env=environment,
            check=True,
            timeout=120,
        )
        validation = json.loads(
            subprocess.check_output(
                [
                    "pnpm",
                    "--silent",
                    "--filter",
                    "@daodao/blog-content",
                    "validate",
                    "--root",
                    stage["snapshot"],
                    "--mode",
                    "draft",
                ],
                cwd=frontend_root,
                env=environment,
                text=True,
                timeout=120,
            )
        )
        if validation.get("ok") is not True:
            raise ValueError("Shared draft validator rejected content")
        subprocess.run(
            ["pnpm", "--filter", "@daodao/website", "build"],
            cwd=frontend_root,
            env=environment,
            check=True,
            timeout=900,
        )
        build = frontend_root / "apps/website/out"
        marker = helper.finalize(
            build,
            validation,
            pr_number,
            context["content_sha"],
            context["frontend_sha"],
        )
        # Recheck after the build: stale work must not advertise readiness for a newer revision.
        if resolve_pr(context, public_json) != pr_number:
            raise ValueError("PR identity changed during preview build")
        if output.exists() or output.is_symlink():
            raise ValueError("Refuse to replace an existing Pages output directory")
        shutil.copytree(build, output)
        return marker


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--content-root", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    frontend = Path(__file__).resolve().parents[1]
    content = args.content_root.resolve(strict=True)
    if args.output.absolute() != content / "out":
        raise ValueError("Pages output must be the content checkout's out directory")
    context = validate_context(os.environ, content, frontend)
    for attempt in range(3):
        try:
            pr = resolve_pr(context, public_json)
            break
        except ValueError:
            if attempt == 2:
                raise
            time.sleep(10)
    marker = build_preview(context, pr, frontend, args.output)
    print(
        json.dumps(
            {
                "kind": marker["kind"],
                "pr_number": pr,
                "content_sha": context["content_sha"],
                "origin": context["origin"],
                "routes": marker["routes"],
            }
        )
    )


if __name__ == "__main__":
    main()
