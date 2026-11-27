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


def write_producer(base, mode=None):
    # The real transfer always carries the hash-bound producer under data/.
    producer = {"schema": 1} if mode is None else {"schema": 1, "mode": mode}
    (base / "input/data").mkdir(parents=True)
    (base / "input/data/producer.json").write_text(json.dumps(producer))


def managed_adapter(managed=True):
    return SimpleNamespace(
        inspect_container=Mock(return_value={"managedMounts": managed}),
        classify_adoption=Mock(return_value="managed" if managed else "legacy"),
        verify_base_compose=Mock(),
        establish_store=Mock(),
        record_journal=Mock(),
        prepare_configuration=lambda snapshot, source: snapshot,
        apply_overlay=Mock(),
        restore_previous=Mock(),
    )


CONFIG = {"baseComposeSha256": "b" * 64, "producerSha256": "c" * 64}


class FrontendRefreshSupervisorTests(unittest.TestCase):
    """daodao#563: refresh publishes only official A and reuses recovery."""

    def run_refresh(self, phase, managed=True):
        adapter = managed_adapter(managed)
        with tempfile.TemporaryDirectory() as temporary:
            base = Path(temporary)
            (base / "input").mkdir()
            (base / "input/nginx.conf").write_bytes(b"reviewed")
            write_producer(base, "refresh")
            with (
                patch.object(SUPERVISOR, "phase", phase),
                patch.object(SUPERVISOR.signal, "signal"),
                patch.object(SUPERVISOR, "uid_processes", return_value=[]),
            ):
                return adapter, SUPERVISOR.execute_adapter(adapter, base, CONFIG)

    def test_refresh_runs_single_public_refresh_instead_of_matrix(self):
        calls = []

        def phase(base, config, operation, **kwargs):
            calls.append(operation)
            if operation == "import-only":
                return {"summary": {"previousId": "a" * 64}}
            return {"summary": {"ok": True, "finalId": "d" * 64}}

        _adapter, report = self.run_refresh(phase)
        self.assertEqual(calls, ["import-only", "public-refresh"])
        self.assertTrue(report["ok"])

    def test_failed_refresh_recovers_verified_preimage(self):
        calls = []

        def phase(base, config, operation, **kwargs):
            calls.append((operation, kwargs.get("recovery")))
            if operation == "import-only":
                return {"summary": {"previousId": "a" * 64}}
            if operation == "public-refresh":
                raise RuntimeError("public readback failed")
            return {"summary": {"localRecoveryVerified": True}}

        with self.assertRaises(RuntimeError):
            self.run_refresh(phase)
        self.assertEqual(calls[-1], ("recover", "a" * 64))
        self.assertNotIn("public-matrix", [name for name, _ in calls])

    def test_refresh_never_performs_initial_cutover(self):
        phase = Mock()
        with self.assertRaisesRegex(ValueError, "already-managed"):
            self.run_refresh(phase, managed=False)
        phase.assert_not_called()

    def test_unknown_mode_is_rejected(self):
        with tempfile.TemporaryDirectory() as temporary:
            base = Path(temporary)
            (base / "input").mkdir()
            write_producer(base, "matrix-lite")
            with self.assertRaisesRegex(ValueError, "Unknown"):
                SUPERVISOR.publication_mode(base)


class PublicationSupervisorTests(unittest.TestCase):
    def managed_failure(self, failure):
        failure.diagnostic = {
            "phase": "public-matrix",
            "errorType": type(failure).__name__,
            "message": "Public development bytes differ: en.txt",
        }
        snapshot = {"managedMounts": True}
        adapter = SimpleNamespace(
            inspect_container=Mock(return_value=snapshot),
            classify_adoption=Mock(return_value="managed"),
            verify_base_compose=Mock(),
            establish_store=Mock(),
            record_journal=Mock(),
            prepare_configuration=lambda snapshot, source: snapshot,
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
            write_producer(base)
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
                self.assertEqual(journal["primaryFailure"], failure.diagnostic)
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
            prepare_configuration=lambda snapshot, source: snapshot,
            apply_overlay=Mock(),
            restore_previous=Mock(),
        )
        with tempfile.TemporaryDirectory() as temporary:
            base = Path(temporary)
            (base / "input").mkdir()
            (base / "input/nginx.conf").write_bytes(b"reviewed")
            write_producer(base)
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
                {
                    "baseComposeSha256": "b" * 64,
                    "producerSha256": "c" * 64,
                    "reviewedBaseComposeSha256s": ["b" * 64, "e" * 64],
                },
                snapshot,
                {"summary": {"id": "a" * 64}},
                True,
            )
        adapter.restore_previous.assert_called_once_with(
            snapshot, "b" * 64, reviewed_history=["b" * 64, "e" * 64]
        )
        state, _producer, outcome = adapter.record_journal.call_args.args
        self.assertTrue(state["legacyContainerRestored"])
        self.assertFalse(state["recovery"]["localRecoveryVerified"])
        self.assertEqual(outcome, "recovery-failed")

    def test_managed_config_restore_precedes_public_recovery_and_failure_stays_failed(
        self,
    ):
        for restore_fails in (False, True):
            with self.subTest(restore_fails=restore_fails):
                events = []

                def restore(
                    *args, events=events, restore_fails=restore_fails, **kwargs
                ):
                    events.append("configuration")
                    if restore_fails:
                        raise ValueError("external container replaced operation")

                adapter = SimpleNamespace(
                    restore_previous=restore, record_journal=Mock()
                )
                snapshot = {"managedMounts": True, "configurationTransition": "d" * 32}

                def recover(
                    *args, events=events, restore_fails=restore_fails, **kwargs
                ):
                    events.append("release")
                    return {
                        "summary": {
                            "localRecoveryVerified": True,
                            "publicRecoveryVerified": not restore_fails,
                        }
                    }

                with patch.object(SUPERVISOR, "phase", side_effect=recover):
                    SUPERVISOR.recover_snapshot(
                        adapter,
                        Path("/owned"),
                        {"baseComposeSha256": "b" * 64, "producerSha256": "c" * 64},
                        snapshot,
                        {"summary": {"previousId": "a" * 64}},
                        True,
                    )
                self.assertEqual(events, ["configuration", "release"])
                state, _, outcome = adapter.record_journal.call_args.args
                self.assertEqual(state["configurationRestored"], not restore_fails)
                self.assertEqual(
                    outcome, "recovery-failed" if restore_fails else "restored"
                )

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
