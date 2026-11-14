import hashlib
import importlib.util
import os
import stat
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[3]
SPEC = importlib.util.spec_from_file_location(
    "adapter", ROOT / ".github/scripts/blog_bootstrap/dev_adapter.py"
)
ADAPTER = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(ADAPTER)


class DevAdapterTests(unittest.TestCase):
    def fixture(self):
        return {
            "Id": "current",
            "Name": "/daodao-f2e-dev_website-1",
            "Image": "sha256:" + "a" * 64,
            "Config": {
                "Image": "fixture/daodao-website:dev",
                "Labels": {
                    "com.docker.compose.service": "dev_website",
                    "com.docker.compose.project": "daodao-f2e",
                },
            },
            "NetworkSettings": {"Networks": {"dev-daodao-network": {}}},
            "State": {"Status": "running"},
            "Mounts": [],
        }

    def test_actual_dev_identity_is_required(self):
        self.assertEqual(
            ADAPTER.validate_container(self.fixture())["image"], "sha256:" + "a" * 64
        )
        value = self.fixture()
        value["Config"]["Labels"]["com.docker.compose.service"] = "prod_website"
        with self.assertRaises(ValueError):
            ADAPTER.validate_container(value)

    def test_foreign_mount_and_prod_network_fail_closed(self):
        for change in [
            {"Mounts": [{"Source": "/root", "Destination": "/root", "RW": False}]},
            {"NetworkSettings": {"Networks": {"prod-daodao-network": {}}}},
        ]:
            value = {**self.fixture(), **change}
            with self.assertRaises(ValueError):
                ADAPTER.validate_container(value)

    def test_overlay_only_adds_readonly_parent_to_dev_website(self):
        payload = ADAPTER.overlay_payload("sha256:" + "a" * 64)
        self.assertEqual(set(payload["services"]), {"dev_website"})
        self.assertEqual(
            payload["services"]["dev_website"]["volumes"],
            [
                "/srv/daodao-blog-dev-releases:/srv/blog-releases:ro",
                "/srv/daodao-blog-dev-operator/nginx.conf:/etc/nginx/http.d/default.conf:ro",
            ],
        )
        command = ADAPTER.compose_command(ADAPTER.OVERLAY)
        self.assertEqual(command[-1], "dev_website")
        self.assertIn("--no-deps", command)
        self.assertNotIn("down", command)
        self.assertNotIn("prod_website", command)

    def test_external_overlay_path_is_never_executed(self):
        with self.assertRaises(ValueError):
            ADAPTER.compose_command(Path("/tmp/external.json"))

    def test_incomplete_managed_mount_pair_is_rejected(self):
        value = self.fixture()
        value["Mounts"] = [
            {
                "Source": str(ADAPTER.STORE),
                "Destination": "/srv/blog-releases",
                "RW": False,
            }
        ]
        with self.assertRaises(ValueError):
            ADAPTER.validate_container(value)

    def test_public_permissions_leave_private_metadata_and_receipt_unchanged(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            release = root / "releases" / ("a" * 64)
            site = release / "site"
            site.mkdir(parents=True)
            file = site / "index.html"
            file.write_bytes(b"validated public site")
            file.chmod(0o600)
            private = root / "private-receipt.json"
            private.write_bytes(b"private input not in the public site")
            private.chmod(0o600)
            manifest = {
                "files": {"index.html": hashlib.sha256(file.read_bytes()).hexdigest()}
            }
            with patch.object(ADAPTER, "STORE", root):
                self.assertEqual(
                    ADAPTER.public_site_permissions("a" * 64, lambda *args: manifest), 1
                )
            self.assertEqual(stat.S_IMODE(file.stat().st_mode), 0o644)
            self.assertEqual(stat.S_IMODE(site.stat().st_mode), 0o755)
            self.assertEqual(stat.S_IMODE(private.stat().st_mode), 0o600)
            self.assertEqual(
                private.read_bytes(), b"private input not in the public site"
            )

    def test_invalid_site_bytes_or_links_fail_before_permission_widening(self):
        for kind in ["bad-bytes", "symlink", "hardlink"]:
            with self.subTest(kind=kind), tempfile.TemporaryDirectory() as temporary:
                root = Path(temporary)
                site = root / "releases" / ("a" * 64) / "site"
                site.mkdir(parents=True)
                file = site / "index.html"
                file.write_bytes(b"private until validated")
                file.chmod(0o600)
                expected = hashlib.sha256(file.read_bytes()).hexdigest()
                if kind == "bad-bytes":
                    expected = "b" * 64
                elif kind == "symlink":
                    (site / "foreign").symlink_to(file)
                else:
                    os.link(file, root / "second-link")
                with (
                    patch.object(ADAPTER, "STORE", root),
                    self.assertRaises(ValueError),
                ):
                    ADAPTER.public_site_permissions(
                        "a" * 64,
                        lambda *args, bound_digest=expected: {
                            "files": {"index.html": bound_digest}
                        },
                    )
                self.assertEqual(stat.S_IMODE(file.stat().st_mode), 0o600)

    def test_compose_source_mismatch_never_calls_docker_or_creates_operator(self):
        with tempfile.TemporaryDirectory() as temporary:
            base = Path(temporary) / "compose.yaml"
            base.write_text("reviewed base")
            with (
                patch.object(ADAPTER, "BASE_COMPOSE", base),
                patch.object(
                    ADAPTER,
                    "inspect_container",
                    side_effect=AssertionError("Docker must not run"),
                ),
                self.assertRaises(ValueError),
            ):
                ADAPTER.apply_overlay(
                    {"id": "current", "image": "sha256:" + "a" * 64},
                    "b" * 64,
                    b"config",
                )

    def test_first_adoption_uses_verified_container_not_http_parse_failure(self):
        with (
            tempfile.TemporaryDirectory() as temporary,
            patch.object(ADAPTER, "STORE", Path(temporary) / "absent-store"),
        ):
            snapshot = {"id": "a" * 64, "managedMounts": False}
            self.assertEqual(
                ADAPTER.classify_adoption(snapshot, lambda value: True),
                "legacy-bootstrap",
            )
            with self.assertRaises(ValueError):
                ADAPTER.classify_adoption(snapshot, lambda value: False)

    def test_preexisting_store_without_operator_provenance_is_never_adopted(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            store = root / "foreign-store"
            store.mkdir()
            with (
                patch.object(ADAPTER, "STORE", store),
                patch.object(ADAPTER, "OPERATOR", root / "absent-operator"),
                patch.object(
                    ADAPTER,
                    "establish_operator",
                    side_effect=AssertionError("must not write"),
                ),
                self.assertRaisesRegex(ValueError, "Preexisting store"),
            ):
                ADAPTER.establish_store()

    def test_managed_configuration_changes_are_refused_without_overwriting_previous_bytes(
        self,
    ):
        with tempfile.TemporaryDirectory() as temporary:
            base = Path(temporary) / "compose.yaml"
            base.write_bytes(b"reviewed compose")
            previous_config = Path(temporary) / "previous-nginx.conf"
            previous_config.write_bytes(b"previous healthy config")
            snapshot = {
                "id": "current",
                "image": "sha256:" + "a" * 64,
                "managedMounts": True,
            }
            digest = hashlib.sha256(base.read_bytes()).hexdigest()
            with (
                patch.object(ADAPTER, "BASE_COMPOSE", base),
                patch.object(ADAPTER, "inspect_container", return_value=snapshot),
                patch.object(ADAPTER, "establish_store"),
                patch.object(
                    ADAPTER,
                    "read_owned_file",
                    return_value=previous_config.read_bytes(),
                ),
                patch.object(
                    ADAPTER,
                    "write_owned_overlay",
                    side_effect=AssertionError("No overwrite permitted"),
                ),
                self.assertRaisesRegex(ValueError, "separate review"),
            ):
                ADAPTER.apply_overlay(snapshot, digest, b"invalid new config")
            self.assertEqual(previous_config.read_bytes(), b"previous healthy config")


if __name__ == "__main__":
    unittest.main()
