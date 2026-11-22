"""Published route manifest behavior, not build implementation details."""

import hashlib
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
SPEC = importlib.util.spec_from_file_location(
    "artifact", ROOT / ".github/scripts/blog_prod_artifact.py"
)
artifact = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(artifact)


class ArtifactTests(unittest.TestCase):
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
            marker = (root / "blog-release.json").read_bytes()
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
