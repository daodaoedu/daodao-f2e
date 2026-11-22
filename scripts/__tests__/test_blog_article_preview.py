import copy
import hashlib
import importlib.util
import json
import os
import subprocess
import tempfile
import threading
import unittest
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote

SCRIPT = Path(__file__).resolve().parents[1] / "blog-article-preview.py"
spec = importlib.util.spec_from_file_location("article_preview", SCRIPT)
preview = importlib.util.module_from_spec(spec)
spec.loader.exec_module(preview)

HTML = b"""<!doctype html><html><head><meta name="robots" content="noindex,nofollow"></head><body><p class="blog-preview">Draft preview</p><h1>Reviewed article</h1><p>Complete article body</p></body></html>"""


def git(root, *args):
    return subprocess.check_output(
        ["git", "-c", "core.hooksPath=/dev/null", "-C", str(root), *args], text=True
    ).strip()


class ArtifactTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name).resolve()
        self.site = self.root / "out"
        for name, data in {
            "zh-TW/blog.html": HTML,
            "zh-TW/blog/review.html": HTML,
            "en/blog/review.html": HTML,
            "404.html": b"<html>Missing page</html>",
            "index.html": b"<html>Website home</html>",
            "_next/static/site.js": b"window.preview = true;",
            "_next/static/photo.png": b"\x89PNG\r\n\x1a\n",
        }.items():
            path = self.site / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(data)
        self.validation = {
            "ok": True,
            "mode": "draft",
            "errors": [],
            "digests": {"review": "c" * 64},
            "articles": [
                {
                    "metadata": {
                        "id": "review",
                        "lang": lang,
                        "slug": "review",
                        "title": "Reviewed article",
                    }
                }
                for lang in ("zh-TW", "en")
            ],
        }

    def tearDown(self):
        self.tmp.cleanup()

    def finalize(self):
        return preview.finalize(self.site, self.validation, 23, "a" * 40, "b" * 40)

    def test_finalize_makes_bilingual_clean_routes_and_preserves_assets(self):
        before = (self.site / "_next/static/site.js").read_bytes()
        result = self.finalize()
        self.assertEqual(result["routes"], ["/blog/review", "/en/blog/review"])
        self.assertEqual((self.site / "blog/review.html").read_bytes(), HTML)
        self.assertEqual((self.site / "_next/static/site.js").read_bytes(), before)
        self.assertEqual(result["digests"], {"review": "c" * 64})
        self.assertEqual(
            result["files"]["blog/review.html"]["sha256"],
            hashlib.sha256(HTML).hexdigest(),
        )
        self.assertNotIn("blog-preview.json", result["files"])
        self.assertIn("noindex, nofollow", (self.site / "_headers").read_text())
        self.assertEqual(
            json.loads((self.site / "blog-preview.json").read_text()), result
        )

    def test_revision_changes_marker_even_when_paths_remain(self):
        first = self.finalize()
        second = preview.finalize(self.site, self.validation, 23, "d" * 40, "b" * 40)
        self.assertNotEqual(first["content_sha"], second["content_sha"])
        self.assertEqual(first["routes"], second["routes"])

    def test_alias_collision_preserves_existing_bytes(self):
        (self.site / "blog").mkdir()
        original = b"Existing separate content"
        (self.site / "blog/review.html").write_bytes(original)
        with self.assertRaisesRegex(ValueError, "collides"):
            self.finalize()
        self.assertEqual((self.site / "blog/review.html").read_bytes(), original)

    def test_only_complete_shared_draft_validation_is_accepted(self):
        for changes in (
            {"mode": "publish"},
            {"ok": False},
            {"errors": ["bad"]},
            {"articles": self.validation["articles"][:1]},
            {"digests": {}},
            {"digests": {"review": "invalid"}},
        ):
            with self.subTest(changes=changes), self.assertRaises(ValueError):
                preview.finalize(
                    self.site, {**self.validation, **changes}, 23, "a" * 40, "b" * 40
                )

    def test_identity_rejects_missing_full_revision(self):
        for pr, content, frontend in (
            (0, "a" * 40, "b" * 40),
            (23, "a" * 7, "b" * 40),
            (23, "a" * 40, "refs/heads/dev"),
            (True, "a" * 40, "b" * 40),
        ):
            with self.subTest(pr=pr, content=content), self.assertRaises(ValueError):
                preview.identity(pr, content, frontend)

    def test_wrong_article_at_expected_route_is_rejected(self):
        (self.site / "en/blog/review.html").write_bytes(
            HTML.replace(b"Reviewed article", b"Different article")
        )
        with self.assertRaisesRegex(ValueError, "title differs"):
            self.finalize()

    def test_canonical_jsonld_and_missing_draft_markers_rejected(self):
        invalid = [
            HTML.replace(b"noindex,nofollow", b"index,follow"),
            HTML.replace(b"blog-preview", b"ordinary"),
            HTML.replace(b"<h1>", b"<h2>").replace(b"</h1>", b"</h2>"),
            HTML.replace(
                b"</head>",
                b'<link rel="canonical" href="https://daodao.so/blog/review"></head>',
            ),
            HTML.replace(
                b"</head>", b'<script type="application/ld+json">{}</script></head>'
            ),
            b"Not found",
        ]
        for data in invalid:
            with self.subTest(data=data), self.assertRaises(ValueError):
                preview.assert_draft_html(data)

    def test_upload_rejects_symlinks_code_private_and_control_files(self):
        for name in (
            "_worker.js",
            "functions/route.js",
            ".env",
            "_redirects",
            "_routes.json",
            ".assetsignore",
        ):
            path = self.site / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text("sensitive or executable")
            with self.subTest(name=name), self.assertRaises(ValueError):
                self.finalize()
            path.unlink()
            if path.parent.name == "functions":
                path.parent.rmdir()
        (self.site / "linked").symlink_to(self.root / "outside")
        with self.assertRaisesRegex(ValueError, "symlink"):
            self.finalize()

    def cli(self, *arguments, environment=None):
        env = os.environ.copy()
        for key in (
            "BLOG_PREVIEW_EVIDENCE_ROOT",
            "BLOG_PREVIEW_ARTIFACT_ROOT",
            "RUNNER_TEMP",
            "GITHUB_ENV",
        ):
            env.pop(key, None)
        env.update(environment or {})
        return subprocess.run(
            ["python3", str(SCRIPT), *arguments],
            env=env,
            capture_output=True,
            text=True,
            check=False,
        )

    def finalize_cli(self, validation, environment, output=None):
        return self.cli(
            "finalize",
            "--output",
            str(output or self.site),
            "--validation",
            str(validation),
            "--pr-number",
            "23",
            "--content-sha",
            "a" * 40,
            "--frontend-sha",
            "b" * 40,
            environment=environment,
        )

    def evidence(self):
        root = self.root / "evidence"
        root.mkdir(exist_ok=True)
        path = root / "validation.json"
        path.write_text(json.dumps(self.validation))
        return root, path

    def test_cli_requires_independent_evidence_root_before_read(self):
        _, validation = self.evidence()
        result = self.finalize_cli(
            validation, {"BLOG_PREVIEW_ARTIFACT_ROOT": str(self.site)}
        )
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("BLOG_PREVIEW_EVIDENCE_ROOT", result.stderr)
        self.assertFalse((self.site / "blog-preview.json").exists())

    def test_cli_rejects_validation_outside_evidence_scope(self):
        scope, _ = self.evidence()
        outside = self.root / "outside.json"
        outside.write_text(json.dumps(self.validation))
        result = self.finalize_cli(
            outside,
            {
                "BLOG_PREVIEW_EVIDENCE_ROOT": str(scope),
                "BLOG_PREVIEW_ARTIFACT_ROOT": str(self.site),
            },
        )
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("evidence root", result.stderr)
        self.assertFalse((self.site / "blog-preview.json").exists())

    def test_cli_rejects_symlink_and_parent_symlink_evidence(self):
        scope, validation = self.evidence()
        link = scope / "linked.json"
        link.symlink_to(validation)
        directory_link = scope / "linked-directory"
        directory_link.symlink_to(scope, target_is_directory=True)
        environment = {
            "BLOG_PREVIEW_EVIDENCE_ROOT": str(scope),
            "BLOG_PREVIEW_ARTIFACT_ROOT": str(self.site),
        }
        for path in (link, directory_link / "validation.json"):
            result = self.finalize_cli(path, environment)
            with self.subTest(path=path):
                self.assertNotEqual(result.returncode, 0)
                self.assertIn("evidence root", result.stderr)
        self.assertFalse((self.site / "blog-preview.json").exists())

    def test_cli_bounds_evidence_read(self):
        scope, validation = self.evidence()
        validation.write_text(
            json.dumps({**self.validation, "padding": "x" * (16 * 1024 * 1024)})
        )
        result = self.finalize_cli(
            validation,
            {
                "BLOG_PREVIEW_EVIDENCE_ROOT": str(scope),
                "BLOG_PREVIEW_ARTIFACT_ROOT": str(self.site),
            },
        )
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("evidence root", result.stderr)
        self.assertFalse((self.site / "blog-preview.json").exists())

    def test_cli_rejects_unconfigured_artifact_destination(self):
        scope, validation = self.evidence()
        result = self.finalize_cli(
            validation, {"BLOG_PREVIEW_EVIDENCE_ROOT": str(scope)}
        )
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("ARTIFACT", result.stderr.upper())
        self.assertFalse((self.site / "blog-preview.json").exists())

    def test_cli_authorized_artifact_and_evidence_succeed(self):
        scope, validation = self.evidence()
        result = self.finalize_cli(
            validation,
            {
                "BLOG_PREVIEW_EVIDENCE_ROOT": str(scope),
                "BLOG_PREVIEW_ARTIFACT_ROOT": str(self.site),
            },
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertTrue((self.site / "blog-preview.json").is_file())

    def test_verify_cli_rejects_marker_outside_evidence_before_network(self):
        scope, _ = self.evidence()
        outside = self.root / "outside-marker.json"
        outside.write_text("not JSON")
        result = self.cli(
            "verify",
            "--origin",
            "https://0123abcd.daodao-blog.pages.dev",
            "--marker",
            str(outside),
            environment={"BLOG_PREVIEW_EVIDENCE_ROOT": str(scope)},
        )
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("evidence root", result.stderr)

    def test_verify_cli_accepts_scoped_marker_and_real_public_readback(self):
        marker = self.finalize()
        scope, _ = self.evidence()
        receipt = scope / "marker.json"
        receipt.write_text(json.dumps(marker))
        origin = self.server()
        result = self.cli(
            "verify",
            "--origin",
            origin,
            "--marker",
            str(receipt),
            environment={"BLOG_PREVIEW_EVIDENCE_ROOT": str(scope)},
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        verified = json.loads(result.stdout)
        self.assertTrue(verified["ok"])
        self.assertEqual(verified["content_sha"], "a" * 40)
        self.assertEqual(
            verified["routes"], [origin + "/blog/review", origin + "/en/blog/review"]
        )

    def test_cli_rejects_symlink_artifact_root(self):
        linked = self.root / "linked-output"
        linked.symlink_to(self.site, target_is_directory=True)
        scope, validation = self.evidence()
        result = self.finalize_cli(
            validation,
            {
                "BLOG_PREVIEW_EVIDENCE_ROOT": str(scope),
                "BLOG_PREVIEW_ARTIFACT_ROOT": str(self.root),
            },
            output=linked,
        )
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("artifact root", result.stderr)
        self.assertFalse((self.site / "blog-preview.json").exists())

    def test_missing_article_and_404_rejected(self):
        (self.site / "en/blog/review.html").unlink()
        with self.assertRaisesRegex(ValueError, "Missing rendered"):
            self.finalize()
        (self.site / "en/blog/review.html").write_bytes(HTML)
        (self.site / "404.html").unlink()
        with self.assertRaisesRegex(ValueError, "404.html"):
            self.finalize()

    def server(self, tamper=None, unknown_status=404, redirect=False):
        site = self.site
        routes = {"/": site / "index.html"}
        for path in site.rglob("*"):
            if not path.is_file():
                continue
            route = "/" + path.relative_to(site).as_posix()
            routes[route] = path
            if path.suffix == ".html":
                routes[route[:-5]] = path

        class Handler(BaseHTTPRequestHandler):
            def do_GET(self):
                route = unquote(self.path.split("?")[0])
                if redirect:
                    self.send_response(302)
                    self.send_header("Location", "/index")
                    self.end_headers()
                    return
                path = routes.get(route)
                if path is None or not path.is_file():
                    self.send_response(unknown_status)
                    self.send_header("Content-Type", "text/html")
                    self.end_headers()
                    self.wfile.write((site / preview.NOT_FOUND_FILE).read_bytes())
                    return
                data = (
                    tamper
                    if tamper is not None and route == "/blog/review"
                    else path.read_bytes()
                )
                self.send_response(200)
                self.send_header(
                    "Content-Type",
                    preview.mimetypes.guess_type(str(path))[0]
                    or "application/octet-stream",
                )
                self.send_header("X-Robots-Tag", "noindex, nofollow")
                self.end_headers()
                self.wfile.write(data)

            def log_message(self, *args):
                pass

        server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        self.addCleanup(server.server_close)
        self.addCleanup(thread.join)
        self.addCleanup(server.shutdown)
        return "http://127.0.0.1:" + str(server.server_port)

    def test_actual_http_server_blocks_plain_and_encoded_traversal(self):
        secret = self.root / "private.txt"
        secret.write_bytes(b"private evidence must remain outside server")
        origin = self.server()
        for path in ("/../private.txt", "/%2e%2e/private.txt", "/%2e%2e%2fprivate.txt"):
            with self.subTest(path=path):
                with self.assertRaises(urllib.error.HTTPError) as error:
                    urllib.request.urlopen(origin + path)
                self.assertEqual(error.exception.code, 404)
                self.assertNotIn(secret.read_bytes(), error.exception.read())
                error.exception.close()

    def test_actual_http_bytes_routes_mime_and_404_pass(self):
        marker = self.finalize()
        result = preview.verify(self.server(), marker)
        self.assertTrue(result["ok"])
        self.assertEqual(len(result["routes"]), 2)

    def test_actual_http_changed_article_fails(self):
        marker = self.finalize()
        origin = self.server(tamper=HTML + b"changed")
        with self.assertRaisesRegex(ValueError, "bytes or MIME"):
            preview.verify(origin, marker)

    def test_wrong_marker_and_soft404_fail(self):
        marker = self.finalize()
        bad = copy.deepcopy(marker)
        bad["content_sha"] = "d" * 40
        origin = self.server()
        with self.assertRaisesRegex(ValueError, "marker differs"):
            preview.verify(origin, bad)
        soft404_origin = self.server(unknown_status=200)
        with self.assertRaisesRegex(ValueError, "HTTP404"):
            preview.verify(soft404_origin, marker)

    def test_redirects_are_not_followed(self):
        from urllib.error import HTTPError

        marker = self.finalize()
        origin = self.server(redirect=True)
        with self.assertRaises(HTTPError):
            preview.verify(origin, marker)

    def test_verify_does_not_allow_prod_or_moving_alias(self):
        for origin in (
            "https://daodao.so",
            "https://dev.daodao.so",
            "https://pr-23.daodao-blog.pages.dev",
            "https://aaaaaaaa.daodao-blog.pages.dev.evil.test",
            "https://aaaaaaaa.daodao-blog.pages.dev/path",
            "http://localhost:8000",
            "https://user@aaaaaaaa.daodao-blog.pages.dev",
        ):
            with self.subTest(origin=origin), self.assertRaises(ValueError):
                preview.preview_origin(origin)
        self.assertEqual(
            preview.preview_origin("https://0123abcd.daodao-blog.pages.dev"),
            "https://0123abcd.daodao-blog.pages.dev",
        )

    def test_build_origin_stays_in_fixed_project(self):
        for origin in (
            "https://daodao.so",
            "https://evil.pages.dev",
            "http://pr-23.daodao-blog.pages.dev",
            "https://pr-23.daodao-blog.pages.dev/path",
        ):
            with self.subTest(origin=origin), self.assertRaises(ValueError):
                preview.build_origin(origin)
        self.assertEqual(
            preview.build_origin("https://pr-23.daodao-blog.pages.dev/"),
            "https://pr-23.daodao-blog.pages.dev",
        )


class StageTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name).resolve()
        self.workspace = self.root / "frontend"
        self.workspace.mkdir()
        self.temporary = self.root / "temporary"
        self.temporary.mkdir()
        git(self.workspace, "init", "-q")
        git(
            self.workspace,
            "-c",
            "user.email=fixture@example.test",
            "-c",
            "user.name=Fixture",
            "commit",
            "--allow-empty",
            "-qm",
            "frontend",
        )
        self.frontend_sha = git(self.workspace, "rev-parse", "HEAD")
        self.content = self.workspace / ".blog-dev-preview-source"
        self.content.mkdir()
        git(self.content, "init", "-q")
        for name, data in {
            "authors.json": "{}",
            "topics.json": "{}",
            "articles/en/review.md": "English draft",
            "articles/zh-tw/review.md": "中文草稿",
            "private-approval.json": "must not copy",
            "package.json": "must not execute",
        }.items():
            path = self.content / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(data)
        git(self.content, "add", ".")
        git(
            self.content,
            "-c",
            "user.email=fixture@example.test",
            "-c",
            "user.name=Fixture",
            "commit",
            "-qm",
            "content",
        )
        self.content_sha = git(self.content, "rev-parse", "HEAD")

    def tearDown(self):
        self.tmp.cleanup()

    def stage(self, **kwargs):
        return preview.stage(
            23,
            kwargs.pop("content_sha", self.content_sha),
            kwargs.pop("frontend_sha", self.frontend_sha),
            self.workspace,
            kwargs.pop("temporary", self.temporary),
            **kwargs,
        )

    def test_snapshot_only_public_content_and_clear_approvals(self):
        env = self.root / "github-env"
        result = self.stage(output_env=env)
        snapshot = Path(result["snapshot"])
        self.assertEqual(
            (snapshot / "articles/zh-tw/review.md").read_text(), "中文草稿"
        )
        self.assertFalse((snapshot / "private-approval.json").exists())
        self.assertFalse((snapshot / "package.json").exists())
        self.assertEqual(result["environment"]["BLOG_CONTENT_MODE"], "draft")
        self.assertEqual(result["environment"]["BLOG_APPROVALS_FILE"], "")
        self.assertEqual(result["environment"]["NEXT_OUTPUT"], "export")
        self.assertIn("BLOG_APPROVALS_FILE=\n", env.read_text())
        self.assertEqual(
            result["environment"]["NEXT_PUBLIC_WEBSITE_URL"],
            "https://pr-23.daodao-blog.pages.dev",
        )

    def test_mismatched_revision_and_context_rejected(self):
        for kwargs in (
            {"content_sha": "a" * 40},
            {"frontend_sha": "b" * 40},
            {"temporary": self.workspace},
        ):
            with self.subTest(kwargs=kwargs), self.assertRaises(ValueError):
                self.stage(**kwargs)

    def stage_cli(self, workspace, temporary, environment=None, output_env=None):
        env = os.environ.copy()
        for key in ("RUNNER_TEMP", "GITHUB_ENV"):
            env.pop(key, None)
        env.update(environment or {})
        command = [
            "python3",
            str(SCRIPT),
            "stage",
            "--workspace",
            str(workspace),
            "--temporary",
            str(temporary),
            "--pr-number",
            "23",
            "--content-sha",
            self.content_sha,
            "--frontend-sha",
            self.frontend_sha,
        ]
        if output_env:
            command.extend(["--output-env", str(output_env)])
        return subprocess.run(
            command, env=env, capture_output=True, text=True, check=False
        )

    def test_cli_rejects_alternate_workspace(self):
        result = self.stage_cli(
            self.workspace, self.temporary, {"RUNNER_TEMP": str(self.temporary)}
        )
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("trusted frontend ROOT", result.stderr)

    def test_cli_requires_independent_temporary_scope(self):
        result = self.stage_cli(SCRIPT.parents[1], self.temporary)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("RUNNER_TEMP", result.stderr)

    def test_cli_rejects_temporary_escape(self):
        result = self.stage_cli(
            SCRIPT.parents[1], self.root, {"RUNNER_TEMP": str(self.temporary)}
        )
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("temporary root", result.stderr)

    def test_cli_rejects_environment_output_escape(self):
        allowed = self.root / "allowed-env"
        allowed.touch()
        outside = self.root / "outside-env"
        result = self.stage_cli(
            SCRIPT.parents[1],
            self.temporary,
            {"RUNNER_TEMP": str(self.temporary), "GITHUB_ENV": str(allowed)},
            outside,
        )
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("trusted GITHUB_ENV", result.stderr)
        self.assertFalse(outside.exists())

    def test_environment_writer_refuses_symlink(self):
        private = self.root / "private"
        private.write_text("unchanged")
        linked = self.root / "linked-env"
        linked.symlink_to(private)
        with self.assertRaises(OSError):
            self.stage(output_env=linked)
        self.assertEqual(private.read_text(), "unchanged")

    def test_nested_link_is_rejected_not_uploaded(self):
        (self.content / "articles/leak.md").symlink_to(self.root / "private")
        with self.assertRaisesRegex(ValueError, "symlink"):
            self.stage()


if __name__ == "__main__":
    unittest.main()
