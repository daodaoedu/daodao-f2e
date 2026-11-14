import importlib.util
import io
import json
import subprocess
import tarfile
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
SPEC = importlib.util.spec_from_file_location(
    "bootstrap", ROOT / ".github/scripts/blog_bootstrap/runner.py"
)
BOOT = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(BOOT)


class BootstrapTests(unittest.TestCase):
    def test_only_official_dev_manual_context_is_allowed(self):
        valid = {
            "GITHUB_REPOSITORY": "daodaoedu/daodao-f2e",
            "GITHUB_EVENT_NAME": "workflow_dispatch",
            "GITHUB_REF": "refs/heads/dev",
        }
        BOOT.check_context(valid)
        for field, value in [
            ("GITHUB_REPOSITORY", "fork/repo"),
            ("GITHUB_EVENT_NAME", "pull_request"),
            ("GITHUB_REF", "refs/heads/prod"),
        ]:
            with self.subTest(field=field), self.assertRaises(ValueError):
                BOOT.check_context({**valid, field: value})

    def test_exact_current_source_requires_successful_dev_push_ci(self):
        sha = "a" * 40
        run = {
            "name": "Linode CI",
            "head_sha": sha,
            "head_branch": "dev",
            "event": "push",
            "conclusion": "success",
        }

        def caller(current=sha, candidate=run):
            def invoke(argv, **kwargs):
                if argv[0] == "git":
                    return sha
                if argv[-1] == ".object.sha":
                    return current
                return json.dumps({"workflow_runs": [candidate]})

            return invoke

        self.assertEqual(BOOT.check_source({"GITHUB_SHA": sha}, caller()), sha)
        with self.assertRaises(ValueError):
            BOOT.check_source({"GITHUB_SHA": sha}, caller(current="b" * 40))
        for field, value in [
            ("head_sha", "b" * 40),
            ("event", "pull_request"),
            ("head_branch", "prod"),
            ("conclusion", "failure"),
        ]:
            with self.subTest(field=field), self.assertRaises(ValueError):
                BOOT.check_source(
                    {"GITHUB_SHA": sha}, caller(candidate={**run, field: value})
                )

    def test_archive_binds_exact_controller_and_regular_fixed_source(self):
        archive = BOOT.pack()
        with tarfile.open(fileobj=io.BytesIO(archive), mode="r:gz") as tar:
            self.assertEqual(
                set(tar.getnames()),
                {"blog-release.py", "sandbox.py", "probe.py", "provenance.json"},
            )
            values = {
                item.name: tar.extractfile(item).read() for item in tar.getmembers()
            }
        provenance = json.loads(values["provenance.json"])
        self.assertEqual(
            provenance["controllerSha256"], BOOT.digest(values["blog-release.py"])
        )
        self.assertEqual(
            provenance["inputHashes"],
            {
                name: BOOT.digest(value)
                for name, value in values.items()
                if name != "provenance.json"
            },
        )
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            (root / "scripts").mkdir()
            (root / ".github/scripts/blog_bootstrap").mkdir(parents=True)
            (root / "scripts/blog-release.py").symlink_to(
                ROOT / "scripts/blog-release.py"
            )
            with self.assertRaises(ValueError):
                BOOT.pack(root)

    def test_ssh_has_fixed_identity_and_no_unverified_host_fallback(self):
        with tempfile.NamedTemporaryFile() as key:
            args = BOOT.ssh_arguments(
                "192.0.2.1", key.name, "/known_hosts", "a" * 64, "print(1)"
            )
            self.assertIn("StrictHostKeyChecking=yes", args)
            self.assertIn("HostKeyAlias=daodao-blog-development", args)
            self.assertIn("IdentitiesOnly=yes", args)
            self.assertEqual(args[-2], "root@192.0.2.1")
            with self.assertRaises(ValueError):
                BOOT.ssh_arguments(
                    "host; touch /tmp/injected", key.name, "/known_hosts", "a" * 64, ""
                )

    def test_failed_ssh_reports_only_a_bounded_stage(self):
        command = ["ssh", "root@192.0.2.1", "private-command"]

        failures = [
            subprocess.CalledProcessError(
                1, command, stderr=b"token-sentinel key-sentinel"
            ),
            subprocess.TimeoutExpired(
                command, 1, stderr=b"token-sentinel key-sentinel"
            ),
            OSError("192.0.2.1 token-sentinel key-sentinel"),
        ]
        for failure in failures:

            def fail(*args, error=failure, **kwargs):
                raise error

            with (
                self.subTest(error=type(failure)),
                self.assertRaises(RuntimeError) as observed,
            ):
                BOOT.run_ssh(command, b"input", fail)
            message = str(observed.exception)
            for private in ["192.0.2.1", "private", "token-sentinel", "key-sentinel"]:
                self.assertNotIn(private, message)
            self.assertIn("no deployment claimed", message)

    def test_missing_isolation_or_cleanup_can_never_be_reported_as_pass(self):
        summary = {
            "controllerSha256": BOOT.CONTROLLER_SHA256,
            "controllerHelpSuccess": True,
            "capabilitiesZero": True,
        }
        report = {
            key: True
            for key in [
                "differentFromHostNamespaces",
                "noSandboxUidProcessesRemain",
                "ownedDirectoryRemoved",
                "namespaceProcessExited",
            ]
        }
        status = (
            "Uid: 611536 611536 611536 611536\nGid: 611536 611536 611536 611536\nGroups: \nNoNewPrivs: 1\n"
            + "\n".join(
                name + ": 0"
                for name in ["CapInh", "CapPrm", "CapEff", "CapBnd", "CapAmb"]
            )
        )
        observer = {
            "client": {
                "status": status,
                "root": "/var/tmp/daodao-blog-cloud-test-" + "a" * 32 + "/client",
                "namespaces": {key: "sandbox" for key in ["net", "mnt", "pid"]},
            }
        }
        report.update(
            returnCode=0,
            archiveSha256="a" * 64,
            payload={
                "result/summary.json": json.dumps(summary),
                "attestation/privileged-observer.json": json.dumps(observer),
            },
        )
        self.assertTrue(
            BOOT.validate_report(report, "a" * 64)["privilegedObserver"][
                "capabilitiesZero"
            ]
        )
        for field in [
            "differentFromHostNamespaces",
            "noSandboxUidProcessesRemain",
            "ownedDirectoryRemoved",
            "namespaceProcessExited",
            "archiveSha256",
        ]:
            with self.subTest(field=field), self.assertRaises(ValueError):
                BOOT.validate_report({**report, field: False}, "a" * 64)

        for before, after in [
            ("Uid: 611536 611536 611536 611536", "Uid: 0 0 0 0"),
            ("CapEff: 0", "CapEff: 1"),
            ("NoNewPrivs: 1", "NoNewPrivs: 0"),
        ]:
            changed = {
                "client": {
                    **observer["client"],
                    "status": status.replace(before, after),
                }
            }
            payload = {
                **report["payload"],
                "attestation/privileged-observer.json": json.dumps(changed),
            }
            with self.subTest(observation=after), self.assertRaises(ValueError):
                BOOT.validate_report({**report, "payload": payload}, "a" * 64)


if __name__ == "__main__":
    unittest.main()
