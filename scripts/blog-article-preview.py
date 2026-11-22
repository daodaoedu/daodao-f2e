"""Build data-only, immutable bilingual article preview artifacts; never publish production."""

import argparse
import hashlib
import importlib.util
import json
import mimetypes
import re
import shutil
import subprocess
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.error import HTTPError
from urllib.parse import quote, urlsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener

ROOT = Path(__file__).resolve().parents[1]
SHA = re.compile(r"[a-f0-9]{40}")
DIGEST = re.compile(r"[a-f0-9]{64}")
MAX_FILES = 20000
MAX_FILE_BYTES = 32 * 1024 * 1024
MAX_TOTAL_BYTES = 2 * 1024 * 1024 * 1024
MARKER = "blog-preview.json"


def identity(pr_number, content_sha, frontend_sha):
    if not isinstance(pr_number, int) or isinstance(pr_number, bool) or pr_number <= 0:
        raise ValueError("Positive official content PR number required")
    if not SHA.fullmatch(content_sha) or not SHA.fullmatch(frontend_sha):
        raise ValueError("Full immutable content and frontend SHAs required")
    return {
        "pr_number": pr_number,
        "content_sha": content_sha,
        "frontend_sha": frontend_sha,
    }


def regular_tree(root):
    if root.is_symlink() or not root.is_dir():
        raise ValueError("Regular artifact directory required")
    files = []
    total = 0
    for path in sorted(root.rglob("*")):
        relative = path.relative_to(root)
        if path.is_symlink() or any(
            part in ("functions", "_worker.js") or part.startswith(".")
            for part in relative.parts
        ):
            raise ValueError("Executable or symlink preview content rejected")
        if path.is_dir():
            continue
        if not path.is_file() or any(
            c in str(relative) for c in ("\n", "\r", "\\", "?", "#", "%")
        ):
            raise ValueError("Unsupported public file")
        size = path.stat().st_size
        total += size
        if size > MAX_FILE_BYTES or total > MAX_TOTAL_BYTES or len(files) >= MAX_FILES:
            raise ValueError("Preview artifact exceeds bounded limits")
        files.append(path)
    return files


def stage(
    pr_number,
    content_sha,
    frontend_sha,
    workspace,
    temporary,
    output_env=None,
    origin=None,
):
    record = identity(pr_number, content_sha, frontend_sha)
    origin = build_origin(origin or f"https://pr-{pr_number}.daodao-blog.pages.dev")
    actual = subprocess.check_output(
        [
            "git",
            "-c",
            "core.hooksPath=/dev/null",
            "-C",
            str(workspace),
            "rev-parse",
            "HEAD",
        ],
        text=True,
    ).strip()
    if actual != frontend_sha:
        raise ValueError("Frontend checkout differs from selected revision")
    spec = importlib.util.spec_from_file_location(
        "trusted_blog_snapshot", ROOT / ".github/scripts/blog-dev-preview.py"
    )
    helper = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(helper)
    source, temp = helper.checked_checkout(
        {"GITHUB_WORKSPACE": str(workspace), "RUNNER_TEMP": str(temporary)}, content_sha
    )
    snapshot = helper.snapshot_public_content(source, temp)
    try:
        regular_tree(snapshot)
        values = {
            "BLOG_CONTENT_DIR": str(snapshot),
            "BLOG_CONTENT_MODE": "draft",
            "NEXT_OUTPUT": "export",
            "BLOG_APPROVALS_FILE": "",
            "BLOG_PUBLISHED_BASELINE_FILE": "",
            "BLOG_EVIDENCE_ROOT": "",
            "NEXT_PUBLIC_WEBSITE_URL": origin,
            "NEXT_PUBLIC_APP_URL": "https://app-dev.daodao.so",
            "NEXT_PUBLIC_PRODUCT_URL": "https://app-dev.daodao.so",
            "NEXT_PUBLIC_API_URL": "https://server-dev.daodao.so",
            "NEXT_PUBLIC_POSTHOG_KEY": "",
            "NEXT_PUBLIC_POSTHOG_HOST": "",
            "NEXT_PUBLIC_BLOG_SOURCE_CONTEXT_TTL_SECONDS": "2592000",
            "NEXT_PUBLIC_BLOG_SOURCE_CONTEXT_DOMAIN": "",
            "NEXT_PUBLIC_BLOG_SOURCE_CONTEXT_COOKIE": "daodao_blog_preview_context",
        }
        if any("\n" in v or "\r" in v for v in values.values()):
            raise ValueError("Unsafe environment value")
        if output_env:
            with output_env.open("a") as output:
                output.writelines(f"{key}={value}\n" for key, value in values.items())
        return {**record, "snapshot": str(snapshot), "environment": values}
    except Exception:
        shutil.rmtree(snapshot)
        raise


class ArticleHTML(HTMLParser):
    def __init__(self):
        super().__init__()
        self.noindex = False
        self.preview = False
        self.h1 = False
        self.canonical = False
        self.jsonld = False
        self.body = False
        self.in_h1 = False
        self.h1_text = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "meta" and attrs.get("name", "").lower() == "robots":
            self.noindex = "noindex" in attrs.get("content", "").lower().split(",")
        if "blog-preview" in attrs.get("class", "").split():
            self.preview = True
        self.h1 |= tag == "h1"
        self.in_h1 |= tag == "h1"
        self.body |= tag == "body"
        self.canonical |= (
            tag == "link" and "canonical" in attrs.get("rel", "").lower().split()
        )
        self.jsonld |= (
            tag == "script" and attrs.get("type", "").lower() == "application/ld+json"
        )

    def handle_endtag(self, tag):
        if tag == "h1":
            self.in_h1 = False

    def handle_data(self, value):
        if self.in_h1:
            self.h1_text.append(value)


def assert_draft_html(data, expected_title=None):
    if len(data) < 80:
        raise ValueError("Empty article HTML")
    page = ArticleHTML()
    page.feed(data.decode("utf-8"))
    if (
        not all((page.body, page.h1, page.preview, page.noindex))
        or page.canonical
        or page.jsonld
    ):
        raise ValueError("Article is not an unindexed rendered draft")
    if expected_title is not None and " ".join(
        "".join(page.h1_text).split()
    ) != " ".join(expected_title.split()):
        raise ValueError("Rendered article title differs from validated content")


def alias_chinese(root):
    source = root / "zh-TW"
    candidates = []
    if (source / "blog.html").is_file():
        candidates.append(source / "blog.html")
    if (source / "blog").is_dir():
        candidates.extend(p for p in (source / "blog").rglob("*") if p.is_file())
    for path in candidates:
        target = root / path.relative_to(source)
        if target.exists() and target.read_bytes() != path.read_bytes():
            raise ValueError("Chinese route alias collides with different content")
        target.parent.mkdir(parents=True, exist_ok=True)
        if not target.exists():
            shutil.copyfile(path, target)


def validator_routes(validation):
    if (
        validation.get("ok") is not True
        or validation.get("mode") != "draft"
        or validation.get("errors")
    ):
        raise ValueError("Successful shared draft validator result required")
    routes = []
    titles = {}
    pairs = {}
    for article in validation.get("articles", []):
        metadata = article["metadata"]
        lang, slug, article_id = metadata["lang"], metadata["slug"], metadata["id"]
        if lang not in ("zh-TW", "en") or not re.fullmatch(
            r"[a-z0-9]+(?:-[a-z0-9]+)*", slug
        ):
            raise ValueError("Unsupported article route from validator")
        pairs.setdefault(article_id, set()).add(lang)
        route = ("/en" if lang == "en" else "") + "/blog/" + slug
        if route in routes:
            raise ValueError("Duplicate article route")
        title = metadata.get("title")
        if not isinstance(title, str) or not title.strip():
            raise ValueError("Validated article title required")
        titles[route] = title
        routes.append(route)
    digests = validation.get("digests", {})
    if not routes or any(languages != {"zh-TW", "en"} for languages in pairs.values()):
        raise ValueError("Complete bilingual article pairs required")
    if set(digests) != set(pairs) or any(
        not isinstance(v, str) or not DIGEST.fullmatch(v) for v in digests.values()
    ):
        raise ValueError("Shared bilingual digests required")
    return sorted(routes), digests, titles


def finalize(root, validation, pr_number, content_sha, frontend_sha):
    record = identity(pr_number, content_sha, frontend_sha)
    regular_tree(root)
    routes, digests, titles = validator_routes(validation)
    alias_chinese(root)
    for route in routes:
        path = root / (route.lstrip("/") + ".html")
        if not path.is_file():
            raise ValueError("Missing rendered bilingual article " + route)
        assert_draft_html(path.read_bytes(), titles[route])
    if not (root / "404.html").is_file():
        raise ValueError("Root 404.html required to disable SPA fallback")
    # Preview assets are static only; do not allow uploaded Pages configuration to select code or redirects.
    for name in ("_redirects", "_routes.json", ".assetsignore"):
        if (root / name).exists():
            raise ValueError("Unexpected Pages routing configuration")
    (root / "_headers").write_text(
        "/*\n  X-Robots-Tag: noindex, nofollow\n  Cache-Control: no-store, no-transform\n  X-Content-Type-Options: nosniff\n",
        encoding="utf-8",
    )
    files = {}
    for path in regular_tree(root):
        name = path.relative_to(root).as_posix()
        if name != MARKER:
            files[name] = {
                "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
                "size": path.stat().st_size,
            }
    marker = {
        "kind": "daodao-article-draft-preview",
        "version": 1,
        **record,
        "digests": digests,
        "routes": routes,
        "titles": titles,
        "files": files,
    }
    (root / MARKER).write_text(
        json.dumps(marker, ensure_ascii=False, sort_keys=True, indent=2) + "\n",
        encoding="utf-8",
    )
    return marker


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def build_origin(origin):
    value = urlsplit(origin)
    if (
        value.scheme != "https"
        or not re.fullmatch(
            r"(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)?daodao-blog\.pages\.dev",
            value.hostname or "",
        )
        or value.port not in (None, 443)
        or value.username
        or value.password
        or value.path not in ("", "/")
        or value.query
        or value.fragment
    ):
        raise ValueError("Expected the fixed Pages project build origin")
    return origin.rstrip("/")


def preview_origin(origin):
    value = urlsplit(origin)
    local = value.scheme == "http" and value.hostname in ("127.0.0.1", "::1")
    remote = (
        value.scheme == "https"
        and re.fullmatch(r"[a-f0-9]{8}\.daodao-blog\.pages\.dev", value.hostname or "")
        and value.port in (None, 443)
    )
    if (
        not (local or remote)
        or value.username
        or value.password
        or value.path not in ("", "/")
        or value.query
        or value.fragment
    ):
        raise ValueError("Expected immutable Pages preview origin or literal loopback")
    return origin.rstrip("/")


def mime_ok(name, content_type):
    actual = content_type.split(";", 1)[0].strip().lower()
    expected = mimetypes.guess_type(name)[0]
    if name.endswith(".js"):
        return actual in ("application/javascript", "text/javascript")
    if name.endswith(".json"):
        return actual == "application/json"
    if name in ("_headers",):
        return True
    return expected is None or actual == expected


def verify(origin, marker):
    origin = preview_origin(origin)
    identity(marker["pr_number"], marker["content_sha"], marker["frontend_sha"])
    if (
        marker.get("kind") != "daodao-article-draft-preview"
        or marker.get("version") != 1
    ):
        raise ValueError("Unsupported preview marker")
    if (
        not isinstance(marker.get("files"), dict)
        or not marker["files"]
        or len(marker["files"]) > MAX_FILES
    ):
        raise ValueError("Invalid preview file catalog")
    opener = build_opener(NoRedirect())

    def fetch(route, allow_missing=False):
        request = Request(
            origin + route,
            headers={
                "User-Agent": "DaoDao-Article-Preview-Verify/1",
                "Cache-Control": "no-cache",
            },
        )
        try:
            response = opener.open(request, timeout=20)
        except HTTPError as error:
            if error.code == 404 and allow_missing:
                response = error
            else:
                error.close()
                raise
        with response:
            data = response.read(MAX_FILE_BYTES + 1)
            if response.geturl() != origin + route or len(data) > MAX_FILE_BYTES:
                raise ValueError("Redirected or oversized preview response")
            return data, response.headers, response.status

    live, _, _ = fetch("/" + MARKER)
    if json.loads(live) != marker:
        raise ValueError("Public preview marker differs from expected revision")
    total = 0
    for name, info in marker["files"].items():
        path = Path(name)
        if (
            path.is_absolute()
            or ".." in path.parts
            or any(c in name for c in ("\n", "\r", "\\", "?", "#", "%"))
        ):
            raise ValueError("Unsafe catalog path")
        if name in ("_headers", "404.html"):
            continue  # Pages consumes its control file rather than serving it.
        route = "/" + quote(name, safe="/")
        if name.endswith(".html"):
            route = route[:-5]
            if route.endswith("/index"):
                route = route[:-5]
        data, headers, _ = fetch(route)
        total += len(data)
        if (
            total > MAX_TOTAL_BYTES
            or len(data) != info["size"]
            or hashlib.sha256(data).hexdigest() != info["sha256"]
            or not mime_ok(name, headers.get("Content-Type", ""))
        ):
            raise ValueError("Public preview bytes or MIME differ: " + name)
    for route in marker["routes"]:
        data, headers, _ = fetch(route)
        assert_draft_html(data, marker["titles"][route])
        if "noindex" not in headers.get("X-Robots-Tag", "").lower():
            raise ValueError("Public preview lacks noindex response header")
    missing, headers, status = fetch(
        "/blog/daodao-preview-definitely-missing-" + marker["content_sha"],
        allow_missing=True,
    )
    if status != 404:
        raise ValueError("Unknown article must return HTTP404")
    expected_404 = marker["files"].get("404.html")
    if (
        not expected_404
        or len(missing) != expected_404["size"]
        or hashlib.sha256(missing).hexdigest() != expected_404["sha256"]
        or not mime_ok("404.html", headers.get("Content-Type", ""))
    ):
        raise ValueError("Public 404 bytes or MIME differ")
    return {
        "ok": True,
        "origin": origin,
        "content_sha": marker["content_sha"],
        "routes": [origin + route for route in marker["routes"]],
        "verified_files": len(marker["files"]) - int("_headers" in marker["files"]),
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    for name in ("stage", "finalize"):
        command = commands.add_parser(name)
        command.add_argument("--pr-number", type=int, required=True)
        command.add_argument("--content-sha", required=True)
        command.add_argument("--frontend-sha", required=True)
        if name == "stage":
            command.add_argument("--workspace", type=Path, default=ROOT)
            command.add_argument("--temporary", type=Path, required=True)
            command.add_argument("--output-env", type=Path)
            command.add_argument("--origin")
        else:
            command.add_argument("--output", type=Path, required=True)
            command.add_argument("--validation", type=Path, required=True)
    check = commands.add_parser("verify")
    check.add_argument("--origin", required=True)
    check.add_argument("--marker", type=Path, required=True)
    args = parser.parse_args()
    try:
        if args.command == "stage":
            result = stage(
                args.pr_number,
                args.content_sha,
                args.frontend_sha,
                args.workspace.resolve(),
                args.temporary.resolve(),
                args.output_env,
                args.origin,
            )
        elif args.command == "finalize":
            result = finalize(
                args.output.absolute(),
                json.loads(args.validation.read_text()),
                args.pr_number,
                args.content_sha,
                args.frontend_sha,
            )
        else:
            result = verify(args.origin, json.loads(args.marker.read_text()))
        print(json.dumps(result, ensure_ascii=False))
        return 0
    except (
        OSError,
        ValueError,
        KeyError,
        TypeError,
        subprocess.SubprocessError,
    ) as error:
        print(json.dumps({"ok": False, "error": str(error)}), file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
