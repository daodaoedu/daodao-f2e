import hashlib
import importlib.util
import json
import os
import stat
import subprocess
import tempfile
import unittest
from contextlib import ExitStack
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

    def test_bare_image_requires_exact_owned_restore_provenance(self):
        value = self.fixture()
        snapshot = ADAPTER.validate_container(value)
        value["Config"]["Image"] = value["Image"]
        with tempfile.TemporaryDirectory() as temporary:
            operator = Path(temporary) / "operator"
            operator.mkdir(mode=0o700)
            marker = operator / "ownership.json"
            journal = operator / "adoption.json"
            marker.write_text(json.dumps(ADAPTER.ownership_marker()))
            payload = {
                "schema": 1,
                "service": ADAPTER.SERVICE,
                "producerSha256": "b" * 64,
                "phase": "mounting",
                "snapshot": snapshot,
            }
            journal.write_text(json.dumps(payload))
            original_lstat = Path.lstat

            def root_owned(path):
                metadata = original_lstat(path)
                fields = list(metadata)
                fields[4] = 0  # Model root-owned host files without local privilege.
                return os.stat_result(fields)

            with (
                patch.object(ADAPTER, "OPERATOR", operator),
                patch.object(Path, "lstat", root_owned),
            ):
                result = ADAPTER.validate_container(value)
                self.assertEqual(result["registryNamespace"], "fixture")
                for key, bad in [
                    ("image", "sha256:" + "c" * 64),
                    ("managedMounts", True),
                    ("registryNamespace", "../foreign"),
                ]:
                    changed = {**payload, "snapshot": {**snapshot, key: bad}}
                    journal.write_text(json.dumps(changed))
                    with self.assertRaises(ValueError):
                        ADAPTER.validate_container(value)
                journal.write_text(json.dumps(payload))
                marker.write_text("{}")
                with self.assertRaises(ValueError):
                    ADAPTER.validate_container(value)
                marker.write_text(json.dumps(ADAPTER.ownership_marker()))
                journal.rename(operator / "saved.json")
                journal.symlink_to(operator / "saved.json")
                with self.assertRaises(ValueError):
                    ADAPTER.validate_container(value)
                journal.unlink()
                with self.assertRaises(ValueError):
                    ADAPTER.validate_container(value)

    def test_bare_image_without_provenance_and_wrong_service_rejected(self):
        value = self.fixture()
        value["Config"]["Image"] = value["Image"]
        with (
            tempfile.TemporaryDirectory() as temporary,
            patch.object(ADAPTER, "OPERATOR", Path(temporary) / "absent"),
        ):
            with self.assertRaises(ValueError):
                ADAPTER.validate_container(value)
            value["Config"]["Labels"]["com.docker.compose.service"] = "prod_website"
            with self.assertRaises(ValueError):
                ADAPTER.validate_container(value)

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


class ManagedConfigurationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.image = "sha256:" + "a" * 64
        self.current = {
            "id": "old-container",
            "image": self.image,
            "managedMounts": True,
            "registryNamespace": "fixture",
        }
        self.stack = ExitStack()
        self.addCleanup(self.stack.close)
        for name, value in [
            ("OPERATOR", self.root),
            ("NGINX", self.root / "nginx.conf"),
            ("OVERLAY", self.root / "compose.json"),
            ("BASE_COMPOSE", self.root / "base-compose.yaml"),
        ]:
            self.stack.enter_context(patch.object(ADAPTER, name, value))
        self.stack.enter_context(patch.object(ADAPTER, "establish_operator"))
        self.stack.enter_context(patch.object(ADAPTER, "establish_store"))
        self.stack.enter_context(
            patch.object(
                ADAPTER, "read_owned_file", side_effect=lambda p: p.read_bytes()
            )
        )
        self.stack.enter_context(
            patch.object(
                ADAPTER,
                "atomic_owned_write",
                side_effect=lambda p, data, mode=0o600: p.write_bytes(data),
            )
        )
        self.stack.enter_context(
            patch.object(
                ADAPTER,
                "inspect_container",
                side_effect=lambda **kw: dict(self.current),
            )
        )
        ADAPTER.BASE_COMPOSE.write_bytes(b"reviewed compose")
        self.digest = hashlib.sha256(b"reviewed compose").hexdigest()
        ADAPTER.NGINX.write_bytes(b"previous healthy config")
        ADAPTER.OVERLAY.write_text(json.dumps(ADAPTER.overlay_payload(self.image)))
        self.previous_overlay = ADAPTER.OVERLAY.read_bytes()
        self.calls = []
        self.fail_syntax = False

    def execute(self, command, **kwargs):
        self.calls.append(command)
        if command[:2] == ["docker", "run"]:
            if self.fail_syntax:
                raise subprocess.CalledProcessError(1, command)
        elif "config" in command:
            return subprocess.CompletedProcess(
                command,
                0,
                stdout=json.dumps({"services": {"dev_website": {"image": self.image}}}),
            )
        else:
            self.assertEqual(command[-1], "dev_website")
            self.assertIn("--force-recreate", command)
            self.current["id"] = "owned-recreated-container"
            self.current["configurationToken"] = (
                json.loads(ADAPTER.OVERLAY.read_text())["services"]["dev_website"]
                .get("labels", {})
                .get(ADAPTER.CONFIGURATION_LABEL)
            )
        return subprocess.CompletedProcess(command, 0)

    def prepare(self):
        snapshot = dict(self.current)
        return ADAPTER.prepare_configuration(snapshot, b"new healthy config")

    def test_valid_upgrade_preserves_preimage_and_recreates_only_dev(self):
        snapshot = self.prepare()
        ADAPTER.apply_overlay(
            snapshot, self.digest, b"new healthy config", run=self.execute
        )
        self.assertEqual(ADAPTER.NGINX.read_bytes(), b"new healthy config")
        self.assertEqual(len(self.calls), 3)
        syntax = self.calls[0]
        self.assertIn("--network=none", syntax)
        self.assertIn("--cap-drop=ALL", syntax)
        self.assertIn(self.image, syntax)
        self.assertIn("no-new-privileges", syntax)
        ADAPTER.restore_previous(snapshot, self.digest, run=self.execute)
        self.assertEqual(ADAPTER.NGINX.read_bytes(), b"previous healthy config")
        self.assertEqual(ADAPTER.OVERLAY.read_bytes(), self.previous_overlay)

    def test_invalid_syntax_does_not_change_serving_files_or_container(self):
        snapshot = self.prepare()
        self.fail_syntax = True
        with self.assertRaises(subprocess.CalledProcessError):
            ADAPTER.apply_overlay(
                snapshot, self.digest, b"new healthy config", run=self.execute
            )
        self.assertEqual(ADAPTER.NGINX.read_bytes(), b"previous healthy config")
        self.assertEqual(self.current["id"], "old-container")
        self.assertEqual(ADAPTER.OVERLAY.read_bytes(), self.previous_overlay)

    def test_same_configuration_is_idempotent(self):
        snapshot = ADAPTER.prepare_configuration(
            dict(self.current), b"previous healthy config"
        )
        ADAPTER.apply_overlay(
            snapshot, self.digest, b"previous healthy config", run=self.execute
        )
        self.assertEqual(self.calls, [])

    def test_current_and_owned_base_compose_mismatch_never_changes_serving(self):
        snapshot = self.prepare()
        current_base = self.root / "current-base.yaml"
        current_base.write_bytes(b"new reviewed compose")
        digest = hashlib.sha256(current_base.read_bytes()).hexdigest()
        with (
            patch.object(ADAPTER, "BASE_COMPOSE", current_base),
            self.assertRaisesRegex(ValueError, "Saved reviewed compose"),
        ):
            ADAPTER.apply_overlay(
                snapshot, digest, b"new healthy config", run=self.execute
            )
        self.assertEqual(self.calls, [])
        self.assertEqual(ADAPTER.NGINX.read_bytes(), b"previous healthy config")
        self.assertEqual(ADAPTER.OVERLAY.read_bytes(), self.previous_overlay)

    def reviewed_change(self):
        """Repo head moved from the saved reviewed compose to a newer reviewed one."""
        current_base = self.root / "current-base.yaml"
        current_base.write_bytes(b"new reviewed compose")
        self.stack.enter_context(patch.object(ADAPTER, "BASE_COMPOSE", current_base))
        new_digest = hashlib.sha256(b"new reviewed compose").hexdigest()
        return new_digest, [new_digest, self.digest]

    def saved_base(self):
        return (self.root / ADAPTER.OWNED_BASE_NAME).read_bytes()

    def test_reviewed_compose_change_updates_saved_base_without_nginx_change(self):
        # Regression for daodao#584: a reviewed compose change blocked every refresh.
        digest, history = self.reviewed_change()
        snapshot = ADAPTER.prepare_configuration(
            dict(self.current), b"previous healthy config"
        )
        ADAPTER.apply_overlay(
            snapshot,
            digest,
            b"previous healthy config",
            run=self.execute,
            reviewed_history=history,
        )
        self.assertEqual(self.saved_base(), b"new reviewed compose")
        self.assertEqual(ADAPTER.NGINX.read_bytes(), b"previous healthy config")
        self.assertEqual(ADAPTER.OVERLAY.read_bytes(), self.previous_overlay)

    def test_reviewed_compose_change_with_nginx_transition_recreates_on_new_base(self):
        digest, history = self.reviewed_change()
        snapshot = self.prepare()
        seen = []

        def observe(command, **kwargs):
            if "up" in command:
                seen.append(self.saved_base())
            return self.execute(command, **kwargs)

        ADAPTER.apply_overlay(
            snapshot,
            digest,
            b"new healthy config",
            run=observe,
            reviewed_history=history,
        )
        self.assertEqual(seen, [b"new reviewed compose"])
        self.assertEqual(ADAPTER.NGINX.read_bytes(), b"new healthy config")

    def test_tampered_saved_base_outside_reviewed_history_fails_closed(self):
        digest, history = self.reviewed_change()
        (self.root / ADAPTER.OWNED_BASE_NAME).write_bytes(b"host edited compose")
        for nginx in (b"previous healthy config", b"new healthy config"):
            with self.subTest(nginx=nginx):
                snapshot = ADAPTER.prepare_configuration(dict(self.current), nginx)
                with self.assertRaisesRegex(ValueError, "Saved reviewed compose"):
                    ADAPTER.apply_overlay(
                        snapshot,
                        digest,
                        nginx,
                        run=self.execute,
                        reviewed_history=history,
                    )
                self.assertEqual(self.calls, [])
                self.assertEqual(self.saved_base(), b"host edited compose")
                self.assertEqual(ADAPTER.NGINX.read_bytes(), b"previous healthy config")
                self.assertEqual(ADAPTER.OVERLAY.read_bytes(), self.previous_overlay)

    def test_history_must_contain_the_reviewed_head(self):
        digest, _history = self.reviewed_change()
        snapshot = ADAPTER.prepare_configuration(
            dict(self.current), b"previous healthy config"
        )
        with self.assertRaisesRegex(ValueError, "reviewed compose history"):
            ADAPTER.apply_overlay(
                snapshot,
                digest,
                b"previous healthy config",
                run=self.execute,
                reviewed_history=[self.digest],
            )
        self.assertEqual(self.saved_base(), b"reviewed compose")

    def test_restore_accepts_reviewed_history_but_not_tampered_saved_base(self):
        digest, history = self.reviewed_change()
        snapshot = self.prepare()
        # Failure before apply_overlay leaves the older reviewed base in place.
        ADAPTER.restore_previous(
            snapshot, digest, run=self.execute, reviewed_history=history
        )
        self.assertEqual(ADAPTER.NGINX.read_bytes(), b"previous healthy config")
        (self.root / ADAPTER.OWNED_BASE_NAME).write_bytes(b"host edited compose")
        with self.assertRaisesRegex(ValueError, "Saved reviewed compose"):
            ADAPTER.restore_previous(
                snapshot, digest, run=self.execute, reviewed_history=history
            )
        self.assertEqual(self.calls, [])

    def test_changed_preimage_is_rejected_before_syntax_or_serving_mutation(self):
        snapshot = self.prepare()
        ADAPTER.NGINX.write_bytes(b"externally updated config")
        with self.assertRaises(ValueError):
            ADAPTER.apply_overlay(
                snapshot, self.digest, b"new healthy config", run=self.execute
            )
        self.assertEqual(self.calls, [])
        self.assertEqual(ADAPTER.NGINX.read_bytes(), b"externally updated config")

    def test_external_write_of_target_bytes_is_not_mistaken_for_idempotent_run(self):
        snapshot = self.prepare()
        ADAPTER.NGINX.write_bytes(b"new healthy config")
        with self.assertRaisesRegex(ValueError, "transition input changed"):
            ADAPTER.apply_overlay(
                snapshot, self.digest, b"new healthy config", run=self.execute
            )
        self.assertEqual(self.calls, [])
        self.assertEqual(ADAPTER.OVERLAY.read_bytes(), self.previous_overlay)

    def test_stopped_operation_container_uses_persistent_preimage_for_restore(self):
        snapshot = self.prepare()
        ADAPTER.apply_overlay(
            snapshot, self.digest, b"new healthy config", run=self.execute
        )
        # Recover from a freshly decoded snapshot, not references retained by apply.
        recovered_snapshot = json.loads(json.dumps(snapshot))
        probes = []

        def inspect(**kwargs):
            probes.append(kwargs)
            if not kwargs.get("allow_stopped") and len(probes) == 1:
                raise ValueError("operation container is stopped")
            return dict(self.current)

        with patch.object(ADAPTER, "inspect_container", side_effect=inspect):
            ADAPTER.restore_previous(recovered_snapshot, self.digest, run=self.execute)
        self.assertTrue(probes[0]["allow_stopped"])
        self.assertEqual(ADAPTER.NGINX.read_bytes(), b"previous healthy config")
        self.assertEqual(ADAPTER.OVERLAY.read_bytes(), self.previous_overlay)

    def test_recreate_failure_after_owned_container_creation_restores_old_config(self):
        snapshot = self.prepare()

        def broken(command, **kwargs):
            result = self.execute(command, **kwargs)
            if "up" in command:
                raise subprocess.CalledProcessError(1, command)
            return result

        with self.assertRaises(subprocess.CalledProcessError):
            ADAPTER.apply_overlay(
                snapshot, self.digest, b"new healthy config", run=broken
            )
        self.assertEqual(
            self.current["configurationToken"], snapshot["configurationTransition"]
        )
        ADAPTER.restore_previous(snapshot, self.digest, run=self.execute)
        self.assertEqual(ADAPTER.NGINX.read_bytes(), b"previous healthy config")
        self.assertEqual(ADAPTER.OVERLAY.read_bytes(), self.previous_overlay)

    def test_managed_digest_image_does_not_require_historical_registry_namespace(self):
        self.current["registryNamespace"] = None
        snapshot = self.prepare()
        self.assertEqual(
            ADAPTER.compose_environment(snapshot)["DOCKER_HUB_USERNAME"],
            "managed-dev-unused",
        )
        ADAPTER.apply_overlay(
            snapshot, self.digest, b"new healthy config", run=self.execute
        )
        self.assertEqual(ADAPTER.NGINX.read_bytes(), b"new healthy config")

    def test_foreign_container_or_changed_config_is_never_restored(self):
        for kind in ("container", "nginx", "overlay"):
            with self.subTest(kind=kind):
                snapshot = self.prepare()
                ADAPTER.apply_overlay(
                    snapshot, self.digest, b"new healthy config", run=self.execute
                )
                if kind == "container":
                    self.current["configurationToken"] = "f" * 32
                elif kind == "nginx":
                    ADAPTER.NGINX.write_bytes(b"foreign config")
                else:
                    ADAPTER.OVERLAY.write_bytes(b"foreign overlay")
                before = ADAPTER.NGINX.read_bytes(), ADAPTER.OVERLAY.read_bytes()
                with self.assertRaises(ValueError):
                    ADAPTER.restore_previous(snapshot, self.digest, run=self.execute)
                self.assertEqual(
                    (ADAPTER.NGINX.read_bytes(), ADAPTER.OVERLAY.read_bytes()), before
                )
                # Restore the isolated fixture without calling production recovery.
                self.current = {
                    "id": "old-container",
                    "image": self.image,
                    "managedMounts": True,
                    "registryNamespace": "fixture",
                }
                ADAPTER.NGINX.write_bytes(b"previous healthy config")
                ADAPTER.OVERLAY.write_bytes(self.previous_overlay)


if __name__ == "__main__":
    unittest.main()
