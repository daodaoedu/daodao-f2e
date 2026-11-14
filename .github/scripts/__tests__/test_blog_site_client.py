import hashlib
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[3]
SPEC = importlib.util.spec_from_file_location(
    "site_client", ROOT / ".github/scripts/blog_bootstrap/site_client.py"
)
CLIENT = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(CLIENT)
POLICY = {"x-robots-tag": "noindex, nofollow", "cache-control": "no-store"}


class SiteClientTests(unittest.TestCase):
    def test_public_matrix_preserves_failed_a_retries_b_and_ends_official_a(self):
        a, b = "a" * 64, "b" * 64
        current = [a]
        operations = []

        def invoke(
            name,
            operation,
            identifier,
            generation,
            origin=CLIENT.DEV_ORIGIN,
            expected=0,
        ):
            operations.append((name, operation, identifier, generation))
            if name == "induced-readback-failure":
                return {"stage": "recovery"}
            if name == "stale-a":
                return {"stage": "superseded"}
            current[0] = identifier
            return {"id": identifier, "reused": name == "public-b-retry"}

        before = {"files": {"index.html": "same"}}
        image = b"image"
        after = {
            "files": {
                **before["files"],
                "blog-images/new.png": hashlib.sha256(image).hexdigest(),
            }
        }
        with (
            patch.object(CLIENT, "PRODUCER", {"artifacts": [{"id": a}, {"id": b}]}),
            patch.object(CLIENT, "BASE", 1000),
            patch.object(CLIENT, "invoke", invoke),
            patch.object(CLIENT, "full", side_effect=[before, after, before]),
            patch.object(CLIENT, "marker", side_effect=lambda: {"id": current[0]}),
            patch.object(CLIENT, "cached_asset_observation", return_value=[]),
            patch.object(
                CLIENT,
                "request",
                return_value=(200, image, {**POLICY, "content-type": "image/png"}),
            ),
            patch.object(
                CLIENT,
                "verify_removed_and_private",
                return_value=["blog-images/new.png"],
            ),
        ):
            result = CLIENT.public_matrix()
        self.assertEqual(current[0], a)
        self.assertTrue(result["failurePreservedA"])
        self.assertTrue(result["pairedRollback"])
        self.assertEqual(
            [item[3] for item in operations], [1010, 1020, 1020, 1020, 1010, 1030]
        )
        self.assertEqual(operations[-1][1:3], ("rollback", a))

    def test_fixed_dev_and_owned_loopback_origins(self):
        for origin in ["https://dev.daodao.so", "https://127.0.0.1:12345"]:
            CLIENT.allowed_origin(origin)
        for origin in [
            "https://daodao.so",
            "http://dev.daodao.so",
            "https://dev.daodao.so.evil.test",
            "https://user@dev.daodao.so",
            "https://dev.daodao.so/path",
        ]:
            with self.subTest(origin=origin), self.assertRaises(ValueError):
                CLIENT.allowed_origin(origin)

    def test_file_supplied_release_cannot_become_controller_option(self):
        for identifier in ["--store=/foreign", "a" * 63, "g" * 64, "a" * 64 + "\n", ""]:
            with (
                self.subTest(identifier=identifier),
                patch.object(CLIENT.subprocess, "run") as process,
            ):
                with self.assertRaises(ValueError):
                    CLIENT.invoke("negative", "activate", identifier, 1000)
                process.assert_not_called()
        with (
            patch.object(
                CLIENT,
                "PRODUCER",
                {"artifacts": [{"id": "--store=/foreign", "manifestSha256": "a" * 64}]},
            ),
            patch.object(CLIENT.subprocess, "run") as process,
        ):
            with self.assertRaises(ValueError):
                CLIENT.import_pair()
            process.assert_not_called()

    def test_headers_require_three_dev_controls(self):
        CLIENT.noindex_headers(POLICY)
        for changed in [
            {"x-robots-tag": "noindex"},
            {"x-robots-tag": "nofollow"},
            {"cache-control": "public, max-age=999"},
        ]:
            with self.subTest(changed=changed), self.assertRaises(ValueError):
                CLIENT.noindex_headers({**POLICY, **changed})

    def test_physical_paths_preserved_and_header_evidence_normalized(self):
        files = {
            "_not-found.html": b"notfound",
            "blog/article.html": b"article",
            "blog.txt": b"RSC",
        }
        manifest = {
            "files": {
                name: hashlib.sha256(data).hexdigest() for name, data in files.items()
            },
            "smoke": {"/blog/article": "blog/article.html"},
        }
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            (root / "releases/a").mkdir(parents=True)
            (root / "releases/a/release.json").write_text(json.dumps(manifest))
            routes = []

            def request(route):
                routes.append(route)
                name = "blog/article.html" if route == "/blog/article" else route[1:]
                return (
                    200,
                    files[name],
                    {
                        **POLICY,
                        "content-type": "text/html"
                        if name.endswith("html")
                        else "text/plain",
                    },
                )

            with (
                patch.object(CLIENT, "STORE", root),
                patch.object(CLIENT, "OUT", root),
                patch.object(CLIENT, "request", request),
            ):
                CLIENT.full("a", "proof")
            self.assertEqual(
                routes,
                [
                    "/_not-found.html",
                    "/blog/article.html",
                    "/blog.txt",
                    "/blog/article",
                ],
            )
            proof = json.loads((root / "proof.json").read_text())
            self.assertTrue(
                all(item["robots"] == "noindex, nofollow" for item in proof["files"])
            )

    def test_preimage_rejects_cached_marker_different_from_active_state(self):
        from types import SimpleNamespace

        active = "a" * 64
        manifest = {
            "id": active,
            "frontend_sha": "b" * 40,
            "content_sha": "c" * 40,
            "baseline_sha256": "d" * 64,
        }
        controller = SimpleNamespace(
            stored_release=lambda store, identifier: manifest,
            _active_state=lambda *args: {"id": active},
            _check_active_pointer=lambda *args: None,
        )
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            (root / "active.json").write_text(json.dumps({"id": active}))
            with (
                patch.object(CLIENT, "STORE", root),
                patch.object(CLIENT, "controller_module", return_value=controller),
                patch.object(
                    CLIENT,
                    "request",
                    return_value=(
                        200,
                        json.dumps({**manifest, "id": "e" * 64}).encode(),
                        {},
                    ),
                ),
                patch.object(CLIENT, "full") as readback,
            ):
                with self.assertRaises(ValueError):
                    CLIENT.verified_preimage()
                readback.assert_not_called()

    def test_public_outage_does_not_undo_local_verified_failure_recovery(self):
        from types import SimpleNamespace

        controller = SimpleNamespace(
            stored_release=lambda store, identifier: {"id": identifier}
        )
        previous = "a" * 64
        with (
            patch.object(CLIENT, "controller_module", return_value=controller),
            patch.object(
                CLIENT, "loopback_operation", return_value={"id": previous}
            ) as rollback,
            patch.object(CLIENT, "full", side_effect=OSError("public network down")),
        ):
            result = CLIENT.recover_previous(previous)
            rollback.assert_called_once_with(previous, "rollback", CLIENT.BASE + 99)
            self.assertTrue(result["localRecoveryVerified"])
            self.assertFalse(result["publicRecoveryVerified"])
            self.assertEqual(result["recoveredId"], previous)

    def test_readiness_retries_but_wallclock_is_bounded(self):
        with (
            patch.object(
                CLIENT,
                "request",
                side_effect=[OSError("network"), (200, b'{"id":"a"}', {})],
            ) as request,
            patch.object(CLIENT.time, "sleep"),
        ):
            CLIENT.wait_for_seeded_public_a("a")
            self.assertEqual(request.call_count, 2)
            self.assertEqual(request.call_args.kwargs["timeout"], 3)
        with (
            patch.object(CLIENT.time, "monotonic", side_effect=[0, 76]),
            self.assertRaises(ValueError),
        ):
            CLIENT.wait_for_seeded_public_a("a")


if __name__ == "__main__":
    unittest.main()
