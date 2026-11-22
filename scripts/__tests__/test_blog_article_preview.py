import copy
import hashlib
import importlib.util
import json
import subprocess
import tempfile
import threading
import unittest
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

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

    def test_cli_rejects_symlink_artifact_root(self):
        linked = self.root / "linked-output"
        linked.symlink_to(self.site, target_is_directory=True)
        validation_file = self.root / "validation.json"
        validation_file.write_text(json.dumps(self.validation))
        result = subprocess.run(
            [
                "python3",
                str(SCRIPT),
                "finalize",
                "--output",
                str(linked),
                "--validation",
                str(validation_file),
                "--pr-number",
                "23",
                "--content-sha",
                "a" * 40,
                "--frontend-sha",
                "b" * 40,
            ],
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Regular artifact directory", result.stderr)
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

        class Handler(BaseHTTPRequestHandler):
            def do_GET(self):
                route = self.path.split("?")[0]
                if redirect:
                    self.send_response(302)
                    self.send_header("Location", "/index")
                    self.end_headers()
                    return
                path = site / route.lstrip("/")
                if route == "/":
                    path = site / "index.html"
                elif not path.is_file():
                    path = site / (route.lstrip("/") + ".html")
                if not path.is_file():
                    self.send_response(unknown_status)
                    self.send_header("Content-Type", "text/html")
                    self.end_headers()
                    self.wfile.write((site / "404.html").read_bytes())
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

    def test_actual_http_bytes_routes_mime_and_404_pass(self):
        marker = self.finalize()
        result = preview.verify(self.server(), marker)
        self.assertTrue(result["ok"])
        self.assertEqual(len(result["routes"]), 2)

    def test_actual_http_changed_article_fails(self):
        marker = self.finalize()
        with self.assertRaisesRegex(ValueError, "bytes or MIME"):
            preview.verify(self.server(tamper=HTML + b"changed"), marker)

    def test_wrong_marker_and_soft404_fail(self):
        marker = self.finalize()
        bad = copy.deepcopy(marker)
        bad["content_sha"] = "d" * 40
        origin = self.server()
        with self.assertRaisesRegex(ValueError, "marker differs"):
            preview.verify(origin, bad)
        with self.assertRaisesRegex(ValueError, "HTTP404"):
            preview.verify(self.server(unknown_status=200), marker)

    def test_redirects_are_not_followed(self):
        from urllib.error import HTTPError

        marker = self.finalize()
        with self.assertRaises(HTTPError):
            preview.verify(self.server(redirect=True), marker)

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

    def test_nested_link_is_rejected_not_uploaded(self):
        (self.content / "articles/leak.md").symlink_to(self.root / "private")
        with self.assertRaisesRegex(ValueError, "symlink"):
            self.stage()


if __name__ == "__main__":
    unittest.main()
