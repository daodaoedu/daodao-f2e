"""Publication validation with real files/native controller; only GH I/O is faked."""

import copy
import hashlib
import importlib.util
import json
import os
import subprocess
import sys
import tempfile
import unittest
from itertools import pairwise
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[3]
SPEC = importlib.util.spec_from_file_location(
    "publication_transport",
    ROOT / ".github/scripts/blog_bootstrap/publication_deploy.py",
)
DEPLOY = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(DEPLOY)
SOURCE = subprocess.check_output(
    ["git", "rev-parse", "HEAD"], cwd=ROOT, text=True
).strip()


def encoded(value):
    return json.dumps(value, sort_keys=True, separators=(",", ":")).encode()


def sha(value):
    return hashlib.sha256(value).hexdigest()


def fixture(root, runner_hash=None):
    """Independent release-format fixture, accepted by the unchanged native importer."""
    items = []
    for content, kind in [
        ("b" * 40, "official-A"),
        ("c" * 40, "synthetic-TEST-ONLY-B"),
    ]:
        inputs = {
            "frontend_sha": SOURCE,
            "content_sha": content,
            "approvals_hash": "test-only",
            "baseline_hash": None,
            "build_env_hash": "test-only",
            "runner_hash": runner_hash
            or sha((ROOT / "scripts/blog-release.py").read_bytes()),
        }
        identifier = sha(encoded(inputs))
        base = root / "artifacts" / identifier
        site = base / "site"
        site.mkdir(parents=True)
        baseline = {
            "article": {
                "published_at": "2026-11-13",
                "slugs": {"zh-TW": "article", "en": "article"},
            }
        }
        public = {
            "id": identifier,
            "frontend_sha": SOURCE,
            "content_sha": content,
            "baseline_sha256": sha(encoded(baseline)),
        }
        bodies = {
            "index.html": b"Home",
            "en.html": b"English home",
            "blog.html": b"List",
            "en/blog.html": b"English list",
            "blog/article.html": b"Article",
            "en/blog/article.html": b"English article",
            "blog-release.json": encoded(public),
            "blog-published-baseline.json": encoded(baseline),
        }
        for name, data in bodies.items():
            path = site / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(data)
        smoke = {
            "/blog": "blog.html",
            "/en/blog": "en/blog.html",
            "/blog/article": "blog/article.html",
            "/en/blog/article": "en/blog/article.html",
            "/blog-release.json": "blog-release.json",
            "/blog-published-baseline.json": "blog-published-baseline.json",
        }
        manifest = {
            "schema": 1,
            **public,
            "inputs": inputs,
            "baseline": baseline,
            "smoke": smoke,
            "files": {name: sha(data) for name, data in bodies.items()},
        }
        raw = encoded(manifest)
        (base / "release.json").write_bytes(raw)
        items.append(
            {
                "id": identifier,
                "manifestSha256": sha(raw),
                "frontendSha": SOURCE,
                "contentSha": content,
                "kind": kind,
            }
        )
    producer = {
        "schema": 1,
        "scope": "TEST ONLY local validation fixture",
        "frontendSha": SOURCE,
        "officialContentSha": "b" * 40,
        "syntheticContentSha": "c" * 40,
        "officialBytesUnchanged": True,
        "artifacts": items,
    }
    raw = encoded(producer)
    (root / "producer.json").write_bytes(raw)
    return producer, sha(raw)


class PublicationDeployTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        self.data = self.root / "blog-development-publication-input"
        self.data.mkdir()
        self.producer, self.expected = fixture(self.data)

    def test_generations_order_phases_attempts_and_runs_without_collisions(self):
        for run in [1, 2, 43581904390, 100000000001]:
            first = DEPLOY.generation_base(str(run), "1")
            phases = [first + n for n in [10, 20, 30, 99]]
            self.assertTrue(all(a < b for a, b in pairwise(phases)))
            self.assertLess(phases[-1], DEPLOY.generation_base(str(run), "2") + 10)
            self.assertLess(
                DEPLOY.generation_base(str(run), "99") + 99,
                DEPLOY.generation_base(str(run + 1), "1") + 10,
            )
            self.assertLess(DEPLOY.generation_base(str(run), "99") + 99, 2**53)
        for run, attempt in [
            ("0", "1"),
            ("١", "1"),
            ("１", "1"),
            ("1", "١"),
            ("1", "１"),
            ("1١", "1"),
            ("1１", "1"),
            ("1", "1١"),
            ("1", "1１"),
            ("01", "1"),
            ("-1", "1"),
            ("1", "0"),
            ("1", "100"),
            ("999999999999", "1"),
            ("1\n", "1"),
            ("$(touch bad)", "1"),
        ]:
            with self.subTest(run=run, attempt=attempt), self.assertRaises(ValueError):
                DEPLOY.generation_base(run, attempt)

    def test_final_recovery_generation_cannot_cross_exact_json_integer_boundary(self):
        # Recovery uses the final reserved phase (+99), not merely an earlier phase.
        with self.assertRaises(ValueError):
            DEPLOY.generation_base("900719925474", "9")
        self.assertLess(DEPLOY.generation_base("900719925474", "8") + 99, 2**53)

    def test_regular_read_accepts_bytes_and_rejects_links_directories_and_size(self):
        source = self.root / "bytes"
        source.write_bytes(b"12345")
        self.assertEqual(DEPLOY.regular_bytes(source, 5), b"12345")
        with self.assertRaises(ValueError):
            DEPLOY.regular_bytes(source, 4)
        link = self.root / "link"
        link.symlink_to(source)
        with self.assertRaises(ValueError):
            DEPLOY.regular_bytes(link)
        hard = self.root / "hard"
        os.link(source, hard)
        with self.assertRaises(ValueError):
            DEPLOY.regular_bytes(source)
        with self.assertRaises(ValueError):
            DEPLOY.regular_bytes(self.data)

    def test_valid_native_controller_imports_the_pinned_pair(self):
        self.assertEqual(
            DEPLOY.verify_transfer(self.data, self.expected, SOURCE), self.producer
        )

    def test_producer_rejects_tamper_foreign_source_and_invalid_pair_identity(self):
        raw = (self.data / "producer.json").read_bytes()
        for data, expected, source in [
            (raw, "0" * 64, SOURCE),
            (raw, self.expected, "d" * 40),
            (raw + b" ", self.expected, SOURCE),
        ]:
            with (
                self.subTest(expected=expected, source=source),
                self.assertRaises(ValueError),
            ):
                DEPLOY.validate_producer(data, expected, source)
        changes = [
            lambda p: p.update(officialBytesUnchanged=False),
            lambda p: p.update(frontendSha="d" * 40),
            lambda p: p["artifacts"][1].update(id=p["artifacts"][0]["id"]),
            lambda p: p["artifacts"][1].update(contentSha="b" * 40),
            lambda p: p["artifacts"][0].update(frontendSha="d" * 40),
        ]
        for change in changes:
            producer = copy.deepcopy(self.producer)
            change(producer)
            data = encoded(producer)
            expected_hash = sha(data)
            with self.subTest(producer=producer), self.assertRaises(ValueError):
                DEPLOY.validate_producer(data, expected_hash, SOURCE)

    def test_distinct_content_and_official_synthetic_kind_are_required(self):
        for alteration in ["same-content", "kind-swap"]:
            producer = copy.deepcopy(self.producer)
            if alteration == "same-content":
                producer["syntheticContentSha"] = producer["officialContentSha"]
                producer["artifacts"][1]["contentSha"] = producer["officialContentSha"]
            else:
                producer["artifacts"][0]["kind"] = "synthetic-TEST-ONLY-B"
            raw = encoded(producer)
            expected_hash = sha(raw)
            with self.subTest(alteration=alteration), self.assertRaises(ValueError):
                DEPLOY.validate_producer(raw, expected_hash, SOURCE)

    def test_preflight_rejects_linked_oversize_and_unknown_data_before_ssh(self):
        outside = self.root / "private-marker"
        outside.write_bytes(b"never-read-or-import")
        linked = self.data / "linked"
        linked.symlink_to(outside)
        with self.assertRaises(ValueError):
            DEPLOY.verify_transfer(self.data, self.expected, SOURCE)
        linked.unlink()
        hard = self.data / "hard"
        os.link(outside, hard)
        with self.assertRaises(ValueError):
            DEPLOY.verify_transfer(self.data, self.expected, SOURCE)
        hard.unlink()
        large = self.data / "oversize"
        large.touch()
        with large.open("r+b") as stream:
            stream.truncate(DEPLOY.MAX_BYTES + 1)
        with self.assertRaises(ValueError):
            DEPLOY.preflight_transfer(self.data)
        large.unlink()
        extra = self.data / "private.json"
        extra.write_text('{"not":"public data"}')
        with self.assertRaises(ValueError):
            DEPLOY.verify_transfer(self.data, self.expected, SOURCE)
        self.assertEqual(outside.read_bytes(), b"never-read-or-import")
        alias = self.root / "alias"
        alias.symlink_to(self.data, target_is_directory=True)
        with self.assertRaises(ValueError):
            DEPLOY.preflight_transfer(alias)

    def test_file_count_is_bounded_without_loading_extra_bodies(self):
        for index in range(2001):
            (self.data / f"extra-{index}").touch()
        with self.assertRaises(ValueError):
            DEPLOY.preflight_transfer(self.data)

    def test_foreign_controller_artifact_is_rejected_even_with_valid_native_json_hashes(
        self,
    ):
        foreign = self.root / "foreign-controller"
        foreign.mkdir()
        _producer, expected = fixture(foreign, "0" * 64)
        with self.assertRaisesRegex(ValueError, "source identity"):
            DEPLOY.verify_transfer(foreign, expected, SOURCE)

    def test_manifest_byte_and_path_tamper_is_rejected(self):
        item = self.producer["artifacts"][0]
        manifest_path = self.data / "artifacts" / item["id"] / "release.json"
        original = manifest_path.read_bytes()
        manifest_path.write_bytes(original + b" ")
        with self.assertRaises(ValueError):
            DEPLOY.verify_transfer(self.data, self.expected, SOURCE)
        manifest = json.loads(original)
        manifest["files"]["../../private-marker"] = sha(b"not public")
        raw = encoded(manifest)
        manifest_path.write_bytes(raw)
        self.producer["artifacts"][0]["manifestSha256"] = sha(raw)
        producer = encoded(self.producer)
        (self.data / "producer.json").write_bytes(producer)
        expected_hash = sha(producer)
        with self.assertRaises(ValueError):
            DEPLOY.verify_transfer(self.data, expected_hash, SOURCE)

    def test_tampered_site_fails_unchanged_importer(self):
        item = self.producer["artifacts"][0]
        path = self.data / "artifacts" / item["id"] / "site/blog/article.html"
        path.write_bytes(b"changed article body")
        with self.assertRaises(ValueError):
            DEPLOY.verify_transfer(self.data, self.expected, SOURCE)

    def test_bad_data_main_stops_before_drain_or_ssh(self):
        (self.data / "producer.json").write_text("{}")
        real_call = subprocess.check_output
        calls = []
        sentinel = self.root / "ssh-was-called"
        bin_dir = self.root / "bin"
        bin_dir.mkdir()
        ssh = bin_dir / "ssh"
        ssh.write_text(f'#!/bin/sh\ntouch "{sentinel}"\nexit 99\n')
        ssh.chmod(0o755)

        def external(command, **kwargs):
            calls.append(command)
            if command[0] == "git":
                return real_call(command, **kwargs)
            endpoint = command[2]
            if endpoint.endswith("/git/ref/heads/dev"):
                return SOURCE + "\n"
            if "/actions/runs?" in endpoint:
                return json.dumps(
                    {
                        "workflow_runs": [
                            {
                                "name": "Linode CI",
                                "head_sha": SOURCE,
                                "head_branch": "dev",
                                "event": "push",
                                "conclusion": "success",
                            }
                        ]
                    }
                )
            raise AssertionError("Invalid data reached drain or unrelated API")

        env = {
            "RUNNER_TEMP": str(self.root),
            "GITHUB_REPOSITORY": "daodaoedu/daodao-f2e",
            "GITHUB_EVENT_NAME": "workflow_dispatch",
            "GITHUB_REF": "refs/heads/dev",
            "GITHUB_SHA": SOURCE,
            "BLOG_DEV_RELEASE_MANAGED": "true",
            "PATH": str(bin_dir) + os.pathsep + os.environ["PATH"],
        }
        argv = [
            "publication_deploy.py",
            "--data-dir",
            str(self.data),
            "--producer-sha",
            self.expected,
        ]
        with (
            patch.dict(os.environ, env),
            patch.object(sys, "argv", argv),
            patch.object(subprocess, "check_output", side_effect=external),
            self.assertRaisesRegex(ValueError, "independent job output"),
        ):
            DEPLOY.main()
        self.assertFalse(sentinel.exists())
        self.assertFalse(any("linode-cd" in " ".join(c) for c in calls))

    def test_source_advance_during_drain_cannot_be_certified_before_ssh(self):
        bin_dir = self.root / "gh-bin"
        bin_dir.mkdir()
        advanced = self.root / "source-advanced-during-drain"
        gh = bin_dir / "gh"
        gh.write_text(
            "#!"
            + sys.executable
            + "\nimport json,pathlib,sys\n"
            + "state=pathlib.Path("
            + repr(str(advanced))
            + ")\n"
            + "source="
            + repr(SOURCE)
            + "\n"
            + 'endpoint=next(value for value in sys.argv[1:] if value.startswith("repos/"))\n'
            + 'if endpoint.endswith("/git/ref/heads/dev"): print("d"*40 if state.exists() else source)\n'
            + 'elif "/actions/runs?" in endpoint: print(json.dumps({"workflow_runs":[{"name":"Linode CI","head_sha":source,"head_branch":"dev","event":"push","conclusion":"success"}]}))\n'
            + 'elif "linode-cd.yml/runs?" in endpoint: state.touch(); print(json.dumps([{"workflow_runs":[]}]))\n'
            + 'else: raise ValueError("unexpected external API endpoint")\n'
        )
        gh.chmod(0o755)
        env = {
            **os.environ,
            "PATH": str(bin_dir) + os.pathsep + os.environ["PATH"],
            "RUNNER_TEMP": str(self.root),
            "GITHUB_REPOSITORY": "daodaoedu/daodao-f2e",
            "GITHUB_EVENT_NAME": "workflow_dispatch",
            "GITHUB_REF": "refs/heads/dev",
            "GITHUB_SHA": SOURCE,
            "BLOG_DEV_RELEASE_MANAGED": "true",
        }
        command = [
            sys.executable,
            str(ROOT / ".github/scripts/blog_bootstrap/publication_deploy.py"),
            "--verify-only",
            "--data-dir",
            str(self.data),
            "--producer-sha",
            self.expected,
        ]
        result = subprocess.run(
            command,
            cwd=ROOT,
            env=env,
            capture_output=True,
            text=True,
            check=False,
            timeout=30,
        )
        self.assertTrue(
            advanced.exists(),
            "Regression must actually advance the external source during drain",
        )
        self.assertNotEqual(
            result.returncode, 0, "Source advance cannot return verified-data success"
        )
        self.assertIn("source", result.stderr.lower())

    def test_drain_paginates_and_waits_each_captured_id_without_cancelling_other_channels(
        self,
    ):
        calls = []
        seen = {}
        pauses = []

        def external(command, **kwargs):
            calls.append(command)
            endpoint = command[-1]
            self.assertNotIn("cancel", endpoint)
            self.assertNotIn("-X", command)
            self.assertNotIn("--method", command)
            if "?" in endpoint:
                self.assertIn("--paginate", command)
                self.assertIn("--slurp", command)
                status = endpoint.split("status=", 1)[1].split("&", 1)[0]
                if sum("?" in call[-1] for call in calls) > 5:
                    return json.dumps([{"workflow_runs": []}])
                if status == "in_progress":
                    return json.dumps(
                        [
                            {
                                "workflow_runs": [
                                    {
                                        "id": 101,
                                        "status": "in_progress",
                                        "head_branch": "prod",
                                    }
                                ]
                            },
                            {
                                "workflow_runs": [
                                    {
                                        "id": 102,
                                        "status": "waiting",
                                        "head_branch": "feat/example",
                                    }
                                ]
                            },
                        ]
                    )
                return json.dumps([{"workflow_runs": []}])
            identifier = int(endpoint.rsplit("/", 1)[1])
            seen[identifier] = seen.get(identifier, 0) + 1
            return json.dumps(
                {
                    "id": identifier,
                    "status": "completed"
                    if seen[identifier] > 1
                    else "unknown-nonterminal",
                }
            )

        DEPLOY.drain_existing_cd(call=external, pause=pauses.append)
        self.assertEqual(set(seen), {101, 102})
        self.assertEqual(set(seen.values()), {2})
        self.assertTrue(pauses)
        statuses = {
            c[-1].split("status=", 1)[1].split("&", 1)[0] for c in calls if "?" in c[-1]
        }
        self.assertTrue(
            {"waiting", "requested", "pending", "queued", "in_progress"}.issubset(
                statuses
            )
        )

    def test_drain_fails_closed_for_nonterminal_identity_and_api_failure(self):
        for mode in ["nonterminal", "identity", "api"]:

            def external(command, mode=mode, **kwargs):
                if mode == "api":
                    raise subprocess.CalledProcessError(1, command)
                if "?" in command[-1]:
                    return json.dumps(
                        [{"workflow_runs": [{"id": 42, "status": "waiting"}]}]
                    )
                return json.dumps(
                    {"id": 43 if mode == "identity" else 42, "status": "unknown"}
                )

            with (
                self.subTest(mode=mode),
                self.assertRaises((ValueError, subprocess.CalledProcessError)),
            ):
                DEPLOY.drain_existing_cd(call=external, pause=lambda _seconds: None)


if __name__ == "__main__":
    unittest.main()
