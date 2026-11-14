import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
SPEC = importlib.util.spec_from_file_location(
    "prepare_dev", ROOT / ".github/scripts/blog_bootstrap/prepare_publication.py"
)
PREPARE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(PREPARE)


class DevelopmentPrepareTests(unittest.TestCase):
    def test_receipt_records_authenticated_dev_purpose_not_editorial(self):
        receipt = PREPARE.engineering_receipt(
            {"official-article": "a" * 64},
            "actual-user",
            "https://github.com/daodaoedu/daodao-f2e/actions/runs/123",
        )
        self.assertEqual(receipt[0]["reviewer"], "development-engineering:actual-user")
        self.assertIn(
            "NOT formal editorial or production approval", receipt[0]["evidence"]
        )
        for actor, url in [
            ("", "https://github.com/daodaoedu/daodao-f2e/actions/runs/123"),
            ("actor", "https://outside.example/123"),
        ]:
            with self.subTest(actor=actor), self.assertRaises(ValueError):
                PREPARE.engineering_receipt({"article": "a" * 64}, actor, url)

    def test_synthetic_pair_never_rewrites_existing_official_article(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            official = root / "articles/zh-tw/official.md"
            official.parent.mkdir(parents=True)
            official.write_bytes(b"unchanged official bytes")
            PREPARE.add_synthetic_fixture(root)
            self.assertEqual(official.read_bytes(), b"unchanged official bytes")
            for locale in ["zh-tw", "en"]:
                fixture = root / "articles" / locale / "development-rollback-fixture.md"
                self.assertTrue(fixture.is_file())
                self.assertIn("TEST ONLY", fixture.read_text())
            self.assertTrue(
                (root / "images/development-rollback-fixture.png").is_file()
            )
            with self.assertRaises(ValueError):
                PREPARE.add_synthetic_fixture(root)

    def test_shared_validator_failure_cannot_create_a_dev_receipt(self):
        def invalid(*args, **kwargs):
            return json.dumps({"ok": False, "errors": ["bad content"], "digests": {}})

        with self.assertRaises(ValueError):
            PREPARE.draft_digests(Path("/official"), Path("/private"), invalid)

    def test_environment_never_forwards_ssh_or_github_credentials(self):
        environment = PREPARE.safe_environment()
        self.assertNotIn("GH_TOKEN", environment)
        self.assertNotIn("BLOG_SSH_PRIVATE_KEY", environment)
        self.assertEqual(
            environment["NEXT_PUBLIC_WEBSITE_URL"], "https://dev.daodao.so"
        )


if __name__ == "__main__":
    unittest.main()
