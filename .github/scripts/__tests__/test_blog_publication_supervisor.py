import hashlib
import importlib.util
import io
import json
import os
import stat
import subprocess
import tarfile
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import Mock, patch

ROOT = Path(__file__).resolve().parents[3]
SPEC = importlib.util.spec_from_file_location(
    "publication_supervisor",
    ROOT / ".github/scripts/blog_bootstrap/publication_supervisor.py",
)
SUPERVISOR = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(SUPERVISOR)


class PublicationSupervisorTests(unittest.TestCase):
    def managed_failure(self, failure):
        snapshot = {"managedMounts": True}
        adapter = SimpleNamespace(
            inspect_container=Mock(return_value=snapshot),
            classify_adoption=Mock(return_value="managed"),
            verify_base_compose=Mock(),
            establish_store=Mock(),
            record_journal=Mock(),
            apply_overlay=Mock(),
            restore_previous=Mock(),
        )
        previous = "a" * 64
        calls = []

        def phase(base, config, operation, **kwargs):
            calls.append((operation, kwargs))
            if operation == "import-only":
                return {"summary": {"previousId": previous}}
            if operation == "public-matrix":
                raise failure
            return {
                "summary": {
                    "ok": True,
                    "recoveredId": previous,
                    "localRecoveryVerified": True,
                    "publicRecoveryVerified": False,
                }
            }

        with tempfile.TemporaryDirectory() as temporary:
            base = Path(temporary)
            (base / "input").mkdir()
            (base / "input/nginx.conf").write_bytes(b"reviewed")
            with (
                patch.object(SUPERVISOR, "phase", phase),
                patch.object(SUPERVISOR.signal, "signal") as signals,
                patch.object(SUPERVISOR, "uid_processes", return_value=[]),
            ):
                with self.assertRaises(type(failure)):
                    SUPERVISOR.execute_adapter(
                        adapter,
                        base,
                        {"baseComposeSha256": "b" * 64, "producerSha256": "c" * 64},
                    )
                self.assertEqual(calls[-1], ("recover", {"recovery": previous}))
                self.assertEqual(signals.call_count, 3)
                journal = adapter.record_journal.call_args.args[0]
                self.assertTrue(journal["recovery"]["localRecoveryVerified"])
                self.assertFalse(journal["recovery"]["publicRecoveryVerified"])
                adapter.restore_previous.assert_not_called()

    def test_managed_signal_timeout_and_eof_recover_verified_preimage(self):
        for failure in [
            SystemExit(143),
            EOFError("SSH closed"),
            subprocess.TimeoutExpired("owned phase", 1),
        ]:
            with self.subTest(failure=type(failure).__name__):
                self.managed_failure(failure)

    def test_legacy_failed_readback_restores_only_captured_container(self):
        snapshot = {"managedMounts": False}
        adapter = SimpleNamespace(
            inspect_container=Mock(return_value=snapshot),
            classify_adoption=Mock(return_value="legacy-bootstrap"),
            verify_base_compose=Mock(),
            establish_store=Mock(),
            record_journal=Mock(),
            apply_overlay=Mock(),
            restore_previous=Mock(),
        )
        with tempfile.TemporaryDirectory() as temporary:
            base = Path(temporary)
            (base / "input").mkdir()
            (base / "input/nginx.conf").write_bytes(b"reviewed")
            with (
                patch.object(
                    SUPERVISOR,
                    "phase",
                    side_effect=[
                        {"summary": {"ok": True, "id": "a" * 64}},
                        RuntimeError("public readback failed"),
                        {
                            "summary": {
                                "localRecoveryVerified": True,
                                "publicRecoveryVerified": False,
                            }
                        },
                    ],
                ) as phase_calls,
                patch.object(SUPERVISOR.signal, "signal"),
                patch.object(SUPERVISOR, "uid_processes", return_value=[]),
            ):
                with self.assertRaises(RuntimeError):
                    SUPERVISOR.execute_adapter(
                        adapter,
                        base,
                        {"baseComposeSha256": "b" * 64, "producerSha256": "c" * 64},
                    )
                self.assertEqual(phase_calls.call_count, 3)
                self.assertEqual(phase_calls.call_args.args[2], "recover")
                self.assertEqual(phase_calls.call_args.kwargs["recovery"], "a" * 64)
                adapter.restore_previous.assert_called_once()
                self.assertFalse(
                    adapter.restore_previous.call_args.args[0]["managedMounts"]
                )
                self.assertEqual(adapter.restore_previous.call_args.args[1], "b" * 64)

    def test_legacy_container_restore_runs_even_when_local_recovery_fails(self):
        adapter = SimpleNamespace(restore_previous=Mock(), record_journal=Mock())
        snapshot = {"managedMounts": False}
        with patch.object(
            SUPERVISOR, "phase", side_effect=RuntimeError("local TLS unavailable")
        ):
            SUPERVISOR.recover_snapshot(
                adapter,
                Path("/owned/namespace"),
                {"baseComposeSha256": "b" * 64, "producerSha256": "c" * 64},
                snapshot,
                {"summary": {"id": "a" * 64}},
                True,
            )
        adapter.restore_previous.assert_called_once_with(snapshot, "b" * 64)
        state, _producer, outcome = adapter.record_journal.call_args.args
        self.assertTrue(state["legacyContainerRestored"])
        self.assertFalse(state["recovery"]["localRecoveryVerified"])
        self.assertEqual(outcome, "recovery-failed")

    def test_public_input_dirs_are_traversable_under_private_umask(self):
        contents = {name: b"source" for name in SUPERVISOR.SOURCE_NAMES}
        contents["blog-release.py"] = (ROOT / "scripts/blog-release.py").read_bytes()
        contents["data/producer.json"] = b"{}"
        config = {
            "inputHashes": {
                name: hashlib.sha256(data).hexdigest()
                for name, data in contents.items()
            },
            "controllerSha256": SUPERVISOR.CONTROLLER,
            "producerSha256": hashlib.sha256(b"{}").hexdigest(),
        }
        contents["provenance.json"] = json.dumps(config).encode()
        stream = io.BytesIO()
        with tarfile.open(fileobj=stream, mode="w:gz") as archive:
            for name, data in contents.items():
                item = tarfile.TarInfo(name)
                item.size = len(data)
                archive.addfile(item, io.BytesIO(data))
        with tempfile.TemporaryDirectory() as temporary:
            incoming = Path(temporary) / "input"
            incoming.mkdir()
            previous = os.umask(0o077)
            try:
                SUPERVISOR.unpack(stream.getvalue(), incoming)
            finally:
                os.umask(previous)
            self.assertEqual(stat.S_IMODE(incoming.stat().st_mode), 0o755)
            self.assertEqual(stat.S_IMODE((incoming / "data").stat().st_mode), 0o755)
            self.assertEqual(
                stat.S_IMODE((incoming / "data/producer.json").stat().st_mode), 0o444
            )

    def test_archive_rejects_escape_duplicate_and_supplied_extra_helper(self):
        for name in ["../outside", "/root/customer", "arbitrary-helper.py"]:
            stream = io.BytesIO()
            with tarfile.open(fileobj=stream, mode="w:gz") as archive:
                item = tarfile.TarInfo(name)
                item.size = 1
                archive.addfile(item, io.BytesIO(b"x"))
            with tempfile.TemporaryDirectory() as temporary:
                data = stream.getvalue()
                incoming = Path(temporary)
                with self.subTest(name=name), self.assertRaises(ValueError):
                    SUPERVISOR.unpack(data, incoming)

    def test_reserved_exit_waits_for_owned_descendants_without_killing_any_process(
        self,
    ):
        with (
            patch.object(SUPERVISOR, "uid_processes", side_effect=[[123], []]),
            patch.object(SUPERVISOR.time, "sleep") as pause,
        ):
            SUPERVISOR.wait_for_reserved_exit()
            pause.assert_called_once_with(0.1)
        with (
            patch.object(SUPERVISOR, "uid_processes", return_value=[123]),
            patch.object(SUPERVISOR.time, "monotonic", side_effect=[0, 11]),
            self.assertRaises(RuntimeError),
        ):
            SUPERVISOR.wait_for_reserved_exit()

    def test_bounded_evidence_rejects_symlink(self):
        with tempfile.TemporaryDirectory() as temporary:
            target = Path(temporary) / "real.json"
            target.write_text(json.dumps({"ok": True}))
            link = Path(temporary) / "link.json"
            link.symlink_to(target)
            with self.assertRaises(ValueError):
                SUPERVISOR.bounded_json(link)
            self.assertEqual(SUPERVISOR.bounded_json(target), {"ok": True})


if __name__ == "__main__":
    unittest.main()
