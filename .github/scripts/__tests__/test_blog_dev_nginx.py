"""Exercise the DEV publication config with a real unprivileged Nginx worker."""

import os
import subprocess
import tempfile
import time
import unittest
import uuid
from pathlib import Path

IMAGE = "nginx@sha256:fed7e14be83cbd2661a75cdc5b872d936cf155d46c327084d30b8df19ae88d72"
ROOT = Path(__file__).resolve().parents[3]


def docker(*args, check=True, request_data=None):
    return subprocess.run(
        ["docker", *args],
        capture_output=True,
        text=True,
        check=check,
        timeout=45,
        input=request_data,
    )


class DevelopmentPublicationNginx(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp = tempfile.TemporaryDirectory(prefix="blog-dev-nginx-")
        cls.store = Path(cls.temp.name)
        cls.name = "blog-dev-nginx-test-" + uuid.uuid4().hex
        cls.store.chmod(0o755)
        for version in ("a", "b"):
            site = cls.store / "releases" / version / "site"
            for path, body in {
                "zh-TW.html": "home-" + version,
                "en.html": "english-home-" + version,
                "zh-TW/blog.html": "list-" + version,
                "zh-TW/blog/weekly.html": "article-" + version,
                "en/blog/weekly.html": "english-article-" + version,
                "zh-TW/blog.txt": "list-rsc-" + version,
                "zh-TW/blog/weekly.txt": "article-rsc-" + version,
                "en/blog/weekly.txt": "english-article-rsc-" + version,
                "zh-TW/blog/topic/facilitation.html": "topic-" + version,
                "zh-TW/blog/topic/facilitation.txt": "topic-rsc-" + version,
                "zh-TW/blog/folder/child.html": "nested-" + version,
                "assets/check.svg": "asset-" + version,
                "_next/static/check.js": "chunk-" + version,
                "blog-images/pair/check.png": "image-" + version,
                "blog-release.json": '{"version":"' + version + '"}',
                "404.html": "missing-" + version,
                "blog-published-baseline.json": '{"version":"' + version + '"}',
                "active.json": "private-state-fixture",
                "inputs/approval.json": "private-input-fixture",
            }.items():
                target = site / path
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_text(body)
                target.chmod(0o644)
            for directory in (cls.store / "releases").rglob("*"):
                if directory.is_dir():
                    directory.chmod(0o755)
        (cls.store / "current").symlink_to("releases/a")
        config = Path(
            os.environ.get("BLOG_DEV_NGINX_CONFIG", ROOT / "docker/blog-dev/nginx.conf")
        )
        try:
            docker(
                "run",
                "--detach",
                "--name",
                cls.name,
                "--network",
                "none",
                "--read-only",
                "--cap-drop",
                "ALL",
                "--security-opt",
                "no-new-privileges",
                "--user",
                "100:101",
                "--tmpfs",
                "/run:uid=100,gid=101,mode=0700",
                "--tmpfs",
                "/var/cache/nginx:uid=100,gid=101,mode=0700",
                "--mount",
                f"type=bind,src={cls.store},dst=/srv/blog-releases,readonly",
                "--mount",
                f"type=bind,src={config},dst=/etc/nginx/conf.d/default.conf,readonly",
                IMAGE,
            )
            deadline = time.monotonic() + 15
            while time.monotonic() < deadline:
                response = cls.request("/")
                if "200 OK" in response.stderr:
                    return
                time.sleep(0.1)
            raise AssertionError(
                "Nginx did not start: " + docker("logs", cls.name).stdout
            )
        except BaseException:
            docker("rm", "--force", cls.name, check=False)
            cls.temp.cleanup()
            raise

    @classmethod
    def tearDownClass(cls):
        docker("rm", "--force", cls.name, check=False)
        cls.temp.cleanup()

    @classmethod
    def request(cls, route):
        response = docker(
            "exec",
            "-i",
            cls.name,
            "nc",
            "-w",
            "2",
            "127.0.0.1",
            "3000",
            request_data=f"GET {route} HTTP/1.0\r\nHost: localhost\r\nConnection: close\r\n\r\n",
            check=False,
        )
        headers, _, body = response.stdout.partition("\n\n")
        return subprocess.CompletedProcess(
            [], response.returncode, stdout=body, stderr=headers
        )

    def test_all_html_assets_and_error_routes_are_nonindexable(self):
        for route, status, body in (
            ("/", "200 OK", "home-a"),
            ("/blog", "200 OK", "list-a"),
            ("/blog/weekly", "200 OK", "article-a"),
            ("/en/blog/weekly", "200 OK", "english-article-a"),
            ("/assets/check.svg", "200 OK", "asset-a"),
            ("/_next/static/check.js", "200 OK", "chunk-a"),
            ("/blog-images/pair/check.png", "200 OK", "image-a"),
            ("/blog-release.json", "200 OK", '{"version":"a"}'),
            ("/blog-published-baseline.json", "200 OK", '{"version":"a"}'),
            ("/blog/missing", "404 Not Found", None),
            ("/blog-images/pair/missing.png", "404 Not Found", None),
            ("/assets/missing.svg", "404 Not Found", None),
        ):
            with self.subTest(route=route):
                response = self.request(route)
                self.assertIn(status, response.stderr)
                self.assertIn(
                    "x-robots-tag: noindex, nofollow", response.stderr.lower()
                )
                cache_controls = [
                    line.partition(":")[2].strip()
                    for line in response.stderr.lower().splitlines()
                    if line.startswith("cache-control:")
                ]
                self.assertEqual(cache_controls, ["no-store"])
                if route in ("/blog-release.json", "/blog-published-baseline.json"):
                    self.assertIn(
                        "content-type: application/json", response.stderr.lower()
                    )
                if body is not None:
                    self.assertEqual(response.stdout, body)

    def test_physical_html_and_rsc_files_without_directory_redirects(self):
        for route, body in (
            ("/blog.html", "list-a"),
            ("/blog.txt", "list-rsc-a"),
            ("/blog/weekly.html", "article-a"),
            ("/blog/weekly.txt", "article-rsc-a"),
            ("/zh-TW/blog/weekly.txt", "article-rsc-a"),
            ("/en/blog/weekly.html", "english-article-a"),
            ("/en/blog/weekly.txt", "english-article-rsc-a"),
            ("/blog/topic/facilitation.txt", "topic-rsc-a"),
        ):
            with self.subTest(route=route):
                response = self.request(route)
                self.assertIn("200 OK", response.stderr)
                self.assertEqual(response.stdout, body)
                self.assertIn(
                    "x-robots-tag: noindex, nofollow", response.stderr.lower()
                )
                self.assertIn("cache-control: no-store", response.stderr.lower())
        for route in ("/blog/topic", "/blog/folder", "/zh-TW/blog/folder"):
            with self.subTest(undefined_directory=route):
                response = self.request(route)
                self.assertIn("404 Not Found", response.stderr)
                self.assertNotIn("301 Moved", response.stderr)

    def test_private_operator_paths_are_real_noncacheable_404(self):
        for route in (
            "/active.json",
            "/generation.json",
            "/pending.json",
            "/release.json",
            "/trusted-artifacts.json",
            "/.release.lock",
            "/inputs/approval.json",
            "/logs/example.log",
            "/source/package.json",
            "/releases/example/site/",
            "/current/site/",
            "/unexpected.json",
        ):
            with self.subTest(route=route):
                response = self.request(route)
                self.assertIn("404 Not Found", response.stderr)
                self.assertIn(
                    "x-robots-tag: noindex, nofollow", response.stderr.lower()
                )
                self.assertIn("cache-control: no-store", response.stderr.lower())
                self.assertNotIn("private-state-fixture", response.stdout)
                self.assertNotIn("private-input-fixture", response.stdout)

    def test_missing_public_identity_files_return_404_not_html_200(self):
        for name in ("blog-release.json", "blog-published-baseline.json"):
            target = self.store / "releases/a/site" / name
            original = target.read_bytes()
            try:
                target.unlink()
                response = self.request("/" + name)
                self.assertIn("404 Not Found", response.stderr)
                self.assertIn(
                    "x-robots-tag: noindex, nofollow", response.stderr.lower()
                )
                self.assertIn("cache-control: no-store", response.stderr.lower())
            finally:
                target.write_bytes(original)
                target.chmod(0o644)

    def test_readonly_parent_observes_atomic_pair_switch_without_restart(self):
        before = docker("inspect", "--format", "{{.Id}}", self.name).stdout
        replacement = self.store / "current-next"
        replacement.symlink_to("releases/b")
        try:
            os.replace(replacement, self.store / "current")
            self.assertEqual(self.request("/blog/weekly").stdout, "article-b")
            self.assertEqual(
                self.request("/en/blog/weekly").stdout, "english-article-b"
            )
            self.assertEqual(
                self.request("/blog-release.json").stdout, '{"version":"b"}'
            )
            self.assertEqual(
                docker("inspect", "--format", "{{.Id}}", self.name).stdout, before
            )
            denied = docker(
                "exec",
                self.name,
                "touch",
                "/srv/blog-releases/server-write",
                check=False,
            )
            self.assertNotEqual(denied.returncode, 0)
            self.assertFalse((self.store / "server-write").exists())
        finally:
            replacement.symlink_to("releases/a")
            os.replace(replacement, self.store / "current")


if __name__ == "__main__":
    unittest.main()
