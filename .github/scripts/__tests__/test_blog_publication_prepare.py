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
            ("actor", "https://github.com/daodaoedu/daodao-f2e/actions/runs/１２３"),
            ("actor", "https://github.com/daodaoedu/daodao-f2e/actions/runs/١٢٣"),
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

    def test_api_url_is_the_bare_origin_the_api_client_expects(self):
        # packages/api appends "/api/v1/..." itself (same as ENV_DEV used by CD);
        # a "/api/v1" suffix made dev Blog call /api/v1/api/v1/auth/me -> 404.
        environment = PREPARE.safe_environment()
        self.assertEqual(
            environment["NEXT_PUBLIC_API_URL"], "https://server-dev.daodao.so"
        )

    def test_dev_blog_source_context_uses_its_own_cookie_and_30_day_window(self):
        # Decided 2026-11-15 (#538): 30-day attribution window; dev must not
        # share the production cookie name on the common daodao.so domain.
        environment = PREPARE.safe_environment()
        self.assertEqual(
            environment["NEXT_PUBLIC_BLOG_SOURCE_CONTEXT_TTL_SECONDS"], "2592000"
        )
        self.assertEqual(
            environment["NEXT_PUBLIC_BLOG_SOURCE_CONTEXT_DOMAIN"], "daodao.so"
        )
        self.assertEqual(
            environment["NEXT_PUBLIC_BLOG_SOURCE_CONTEXT_COOKIE"],
            "daodao_blog_context_dev",
        )


if __name__ == "__main__":
    unittest.main()
