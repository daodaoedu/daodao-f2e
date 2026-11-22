"""Published route manifest behavior, not build implementation details."""

import hashlib
import importlib.util
import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[3]
SPEC = importlib.util.spec_from_file_location(
    "artifact", ROOT / ".github/scripts/blog_prod_artifact.py"
)
artifact = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(artifact)


class ArtifactTests(unittest.TestCase):
    def test_prepare_does_not_write_any_files(self):
        with tempfile.TemporaryDirectory() as directory:
            root, output, _nginx, _runner = self.fixed_fixture(
                Path(directory).resolve()
            )
            before = {
                path.relative_to(root): path.read_bytes()
                for path in root.rglob("*")
                if path.is_file()
            }
            manifest = artifact.prepare(output, "a" * 40, "b" * 40, "release-1")
            after = {
                path.relative_to(root): path.read_bytes()
                for path in root.rglob("*")
                if path.is_file()
            }
            self.assertEqual(after, before)
            self.assertEqual(manifest["content_sha"], "b" * 40)

    def test_stale_exported_marker_never_replaces_new_marker_hash(self):
        with tempfile.TemporaryDirectory() as directory:
            _root, output, _nginx, _runner = self.fixed_fixture(
                Path(directory).resolve()
            )
            stale = output / "blog-release.json"
            previous = b'{"frontend_sha":"old","content_sha":"old"}\n'
            stale.write_bytes(previous)
            manifest = artifact.prepare(output, "a" * 40, "b" * 40, "release-1")
            self.assertEqual(stale.read_bytes(), previous)
            expected = self.expected_marker()
            route = next(
                r for r in manifest["routes"] if r["path"] == "/blog-release.json"
            )
            self.assertEqual(route["sha256"], hashlib.sha256(expected).hexdigest())
            self.assertNotEqual(route["sha256"], hashlib.sha256(previous).hexdigest())

    def expected_marker(self):
        return (
            json.dumps(
                {
                    "frontend_sha": "a" * 40,
                    "content_sha": "b" * 40,
                    "release_id": "release-1",
                },
                sort_keys=True,
            )
            + "\n"
        ).encode()

    def fixed_fixture(self, base):
        root = base / "workspace"
        output = root / "apps/website/out"
        for locale in ("zh-TW", "en"):
            index = output / locale / "blog.html"
            index.parent.mkdir(parents=True)
            index.write_text("existing article")
        nginx = root / "docker/production/nginx.conf"
        nginx.parent.mkdir(parents=True)
        nginx.write_text("server {\n}\n")
        runner = base / "runner"
        runner.mkdir()
        return root, output, nginx, runner

    def main_args(self):
        return [
            str(SPEC.origin),
            "--frontend-sha",
            "a" * 40,
            "--content-sha",
            "b" * 40,
            "--release-id",
            "release-1",
        ]

    def test_cli_only_writes_its_fixed_workspace_and_runner_paths(self):
        with tempfile.TemporaryDirectory() as directory:
            root, output, nginx, runner = self.fixed_fixture(Path(directory).resolve())
            with (
                patch.object(artifact, "ROOT", root),
                patch.dict(os.environ, RUNNER_TEMP=str(runner)),
                patch.object(sys, "argv", self.main_args()),
            ):
                artifact.main()
            manifest = json.loads((runner / artifact.MANIFEST_NAME).read_text())
            self.assertEqual(manifest["content_sha"], "b" * 40)
            self.assertEqual(
                json.loads((output / "blog-release.json").read_text())["frontend_sha"],
                "a" * 40,
            )
            self.assertIn("no-store, no-transform", nginx.read_text())

    def test_symlink_runner_destination_is_rejected_before_any_write(self):
        with tempfile.TemporaryDirectory() as directory:
            base = Path(directory).resolve()
            root, output, nginx, runner = self.fixed_fixture(base)
            outside = base / "outside.json"
            outside.write_text("unchanged outside")
            (runner / artifact.MANIFEST_NAME).symlink_to(outside)
            with (
                patch.object(artifact, "ROOT", root),
                patch.dict(os.environ, RUNNER_TEMP=str(runner)),
                patch.object(sys, "argv", self.main_args()),
                self.assertRaises(ValueError),
            ):
                artifact.main()
            self.assertEqual(outside.read_text(), "unchanged outside")
            self.assertEqual(nginx.read_text(), "server {\n}\n")
            self.assertFalse((output / "blog-release.json").exists())

    def test_runtime_inside_build_context_or_symlink_source_rejects(self):
        with tempfile.TemporaryDirectory() as directory:
            base = Path(directory).resolve()
            root, output, nginx, runner = self.fixed_fixture(base)
            with patch.object(artifact, "ROOT", root), self.assertRaises(ValueError):
                artifact.fixed_paths({"RUNNER_TEMP": str(root)})
            outside = base / "outside.conf"
            outside.write_text("unchanged outside")
            nginx.unlink()
            nginx.symlink_to(outside)
            with patch.object(artifact, "ROOT", root), self.assertRaises(ValueError):
                artifact.fixed_paths({"RUNNER_TEMP": str(runner)})
            self.assertEqual(outside.read_text(), "unchanged outside")
            self.assertFalse((output / "blog-release.json").exists())

    def test_cli_rejects_caller_supplied_paths_before_any_write(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            output = root / "output"
            for locale in ("zh-TW", "en"):
                index = output / locale / "blog.html"
                index.parent.mkdir(parents=True)
                index.write_text("existing article")
            nginx = root / "outside.conf"
            nginx.write_text("server {\n}\n")
            manifest = root / "outside.json"
            manifest.write_text("unchanged manifest")
            result = subprocess.run(
                [
                    sys.executable,
                    str(SPEC.origin),
                    "--frontend-sha",
                    "a" * 40,
                    "--content-sha",
                    "b" * 40,
                    "--release-id",
                    "release-1",
                    "--out",
                    str(output),
                    "--nginx",
                    str(nginx),
                    "--manifest",
                    str(manifest),
                ],
                text=True,
                capture_output=True,
                check=False,
            )
            self.assertNotEqual(result.returncode, 0)
            self.assertEqual(nginx.read_text(), "server {\n}\n")
            self.assertEqual(manifest.read_text(), "unchanged manifest")
            self.assertFalse((output / "blog-release.json").exists())

    def test_nginx_generation_is_pure_and_preserves_existing_routes(self):
        source = 'server {\n    location /blog { try_files $uri =404; }\n    add_header Cache-Control "public, immutable";\n}\n'
        result = artifact.configure_nginx(source)
        self.assertIn(
            'add_header Cache-Control "no-store, no-transform" always;', result
        )
        self.assertIn("location /blog { try_files $uri =404; }", result)
        self.assertIn('"public, immutable, no-transform"', result)
        self.assertIn("location = /blog-release.json", result)

    def test_manifest_covers_pretty_routes_images_and_exact_marker(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            for name in (
                "zh-TW/blog.html",
                "en/blog.html",
                "zh-TW/blog/example.html",
                "en/blog/example.html",
                "blog-images/photo.png",
            ):
                path = root / name
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_bytes(b"article or image")
            manifest = artifact.prepare(root, "a" * 40, "b" * 40, "release-1")
            routes = {r["path"]: r for r in manifest["routes"]}
            self.assertIn("/blog/example", routes)
            self.assertIn("/en/blog/example", routes)
            self.assertNotIn("/zh-TW/blog/example.html", routes)
            self.assertEqual(
                routes["/blog/example"]["file_path"], "zh-TW/blog/example.html"
            )
            self.assertEqual(
                routes["/blog-images/photo.png"]["content_type"], "image/png"
            )
            marker = self.expected_marker()
            self.assertEqual(artifact.marker_text(manifest).encode(), marker)
            self.assertEqual(
                routes["/blog-release.json"]["sha256"],
                hashlib.sha256(marker).hexdigest(),
            )
            self.assertEqual(json.loads(marker)["content_sha"], "b" * 40)

    def test_symlink_and_invalid_identity_are_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "link").symlink_to("/etc/passwd")
            with self.assertRaises(ValueError):
                artifact.prepare(root, "a" * 40, "b" * 40, "release-1")
            with self.assertRaises(ValueError):
                artifact.prepare(root, "not-a-sha", "b" * 40, "release-1")


if __name__ == "__main__":
    unittest.main()
