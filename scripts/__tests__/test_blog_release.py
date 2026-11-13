import concurrent.futures
import hashlib
import importlib.util
import json
import os
import subprocess
import sys
import tempfile
import threading
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch
from urllib.request import urlopen

SCRIPT = Path(__file__).resolve().parents[1] / "blog-release.py"
spec = importlib.util.spec_from_file_location("blog_release", SCRIPT)
release = importlib.util.module_from_spec(spec)
spec.loader.exec_module(release)


def encoded(value):
    return json.dumps(
        value, ensure_ascii=False, sort_keys=True, separators=(",", ":")
    ).encode()


def sha256(value):
    return hashlib.sha256(value).hexdigest()


class LocalReleaseTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.root = Path(self.temporary.name).resolve()
        self.store = self.root / "store"
        self.store.mkdir()
        self.server = release.ThreadingHTTPServer(
            ("127.0.0.1", 0),
            release.website_handler(lambda: self.store / "current/site"),
        )
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        self.url = "http://127.0.0.1:" + str(self.server.server_port)

    def tearDown(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join()
        self.temporary.cleanup()

    def artifact(self, value, baseline=None):
        inputs = {
            "frontend_sha": value * 40,
            "content_sha": ("f" if value != "f" else "e") * 40,
            "approvals_hash": "receipt",
            "baseline_hash": None,
            "build_env_hash": "env",
        }
        identifier = sha256(encoded(inputs))
        directory = self.store / "releases" / identifier
        (directory / "site").mkdir(parents=True)
        baseline = (
            baseline
            if baseline is not None
            else {
                "sample": {
                    "published_at": "2026-11-13",
                    "slugs": {"zh-TW": "sample", "en": "sample"},
                }
            }
        )
        public = {
            "id": identifier,
            "frontend_sha": inputs["frontend_sha"],
            "content_sha": inputs["content_sha"],
            "baseline_sha256": sha256(encoded(baseline)),
        }
        site = directory / "site"
        bodies = {
            "index.html": ("Home " + value).encode(),
            "en.html": ("English home " + value).encode(),
            "blog.html": ("Article " + value).encode(),
            "en/blog.html": ("Article " + value).encode(),
            "blog/sample.html": ("Article " + value).encode(),
            "en/blog/sample.html": ("Article " + value).encode(),
            "blog-release.json": encoded(public),
            "blog-published-baseline.json": encoded(baseline),
        }
        for article in baseline.values():
            for language, slug in article["slugs"].items():
                bodies[
                    ("en/" if language == "en" else "") + "blog/" + slug + ".html"
                ] = ("Article " + value).encode()
        for relative, data in bodies.items():
            file = site / relative
            file.parent.mkdir(parents=True, exist_ok=True)
            file.write_bytes(data)
        smoke = {
            "/blog": "blog.html",
            "/en/blog": "en/blog.html",
            "/blog/sample": "blog/sample.html",
            "/en/blog/sample": "en/blog/sample.html",
            "/blog-release.json": "blog-release.json",
            "/blog-published-baseline.json": "blog-published-baseline.json",
        }
        for article in baseline.values():
            for language, slug in article["slugs"].items():
                prefix = "en/" if language == "en" else ""
                smoke["/" + prefix + "blog/" + slug] = prefix + "blog/" + slug + ".html"
        manifest = {
            "schema": 1,
            **public,
            "inputs": inputs,
            "baseline": baseline,
            "smoke": smoke,
            "files": {name: sha256(data) for name, data in bodies.items()},
        }
        (directory / "release.json").write_bytes(encoded(manifest))
        catalog_file = self.store / "trusted-artifacts.json"
        catalog = json.loads(catalog_file.read_text()) if catalog_file.exists() else {}
        catalog[identifier] = sha256(encoded(manifest))
        catalog_file.write_bytes(encoded(catalog))
        return identifier

    def activate(self, identifier, generation, url=None):
        return release.activate(
            SimpleNamespace(
                store=self.store,
                release=identifier,
                generation=generation,
                base_url=url or self.url,
            )
        )

    def test_rollback_retains_historical_identity_of_temporarily_removed_article(self):
        first = self.artifact("a")
        baseline = json.loads(
            (
                self.store / "releases" / first / "site/blog-published-baseline.json"
            ).read_text()
        )
        baseline["later"] = {
            "published_at": "2026-11-14",
            "slugs": {"zh-TW": "later", "en": "later"},
        }
        second = self.artifact("b", baseline)
        self.activate(first, 1)
        self.activate(second, 2)
        release.activate(
            SimpleNamespace(
                store=self.store,
                release=first,
                generation=3,
                base_url=self.url,
                operation="rollback",
            )
        )
        self.assertEqual(urlopen(self.url + "/blog/sample").read(), b"Article a")
        baseline["later"]["published_at"] = "2026-11-15"
        candidate = self.artifact("c", baseline)
        with self.assertRaises(release.ReleaseError) as caught:
            self.activate(candidate, 4)
        self.assertEqual(caught.exception.stage, "approval")
        self.assertEqual(
            json.loads((self.store / "active.json").read_text())["id"], first
        )

    def test_failed_restore_readback_reports_both_failures_and_retains_recovery_journal(
        self,
    ):
        first, second = self.artifact("a"), self.artifact("b")
        self.activate(first, 1)
        original = release.http_readback

        def fail_live(base, manifest):
            if base == self.url:
                raise release.ReleaseError(
                    "smoke",
                    "candidate unavailable"
                    if manifest["id"] == second
                    else "previous origin unavailable",
                )
            return original(base, manifest)

        with (
            patch.object(release, "http_readback", side_effect=fail_live),
            self.assertRaises(release.ReleaseError) as caught,
        ):
            self.activate(second, 2)
        self.assertEqual(caught.exception.stage, "recovery")
        self.assertIn("candidate unavailable", str(caught.exception))
        self.assertIn("previous origin unavailable", str(caught.exception))
        self.assertEqual(
            json.loads((self.store / "active.json").read_text())["id"], first
        )
        self.assertTrue((self.store / "pending.json").exists())
        self.assertEqual(self.activate(second, 2)["id"], second)

    def test_missing_homepage_cannot_replace_entire_website(self):
        first, second = self.artifact("a"), self.artifact("b")
        self.activate(first, 1)
        directory = self.store / "releases" / second
        (directory / "site/index.html").unlink()
        manifest = json.loads((directory / "release.json").read_text())
        del manifest["files"]["index.html"]
        (directory / "release.json").write_bytes(encoded(manifest))
        catalog = json.loads((self.store / "trusted-artifacts.json").read_text())
        catalog[second] = sha256(encoded(manifest))
        (self.store / "trusted-artifacts.json").write_bytes(encoded(catalog))
        with self.assertRaises(release.ReleaseError):
            self.activate(second, 2)
        self.assertEqual(urlopen(self.url + "/").read(), b"Home a")

    def test_published_article_cannot_disappear_in_ordinary_release(self):
        first, second = self.artifact("a"), self.artifact("b")
        self.activate(first, 1)
        # A separately approved candidate with a different article identity must not erase live URLs.
        directory = self.store / "releases" / second
        manifest = json.loads((directory / "release.json").read_text())
        baseline = {
            "replacement": {
                "published_at": "2026-11-13",
                "slugs": {"zh-TW": "sample", "en": "sample"},
            }
        }
        manifest["baseline"] = baseline
        manifest["baseline_sha256"] = sha256(encoded(baseline))
        (directory / "site/blog-published-baseline.json").write_bytes(encoded(baseline))
        public = {
            key: manifest[key]
            for key in ("id", "frontend_sha", "content_sha", "baseline_sha256")
        }
        (directory / "site/blog-release.json").write_bytes(encoded(public))
        for name in ("blog-published-baseline.json", "blog-release.json"):
            manifest["files"][name] = sha256((directory / "site" / name).read_bytes())
        (directory / "release.json").write_bytes(encoded(manifest))
        catalog = json.loads((self.store / "trusted-artifacts.json").read_text())
        catalog[second] = sha256(encoded(manifest))
        (self.store / "trusted-artifacts.json").write_bytes(encoded(catalog))
        with self.assertRaises(release.ReleaseError) as caught:
            self.activate(second, 2)
        self.assertEqual(caught.exception.stage, "approval")
        self.assertEqual(urlopen(self.url + "/blog/sample").read(), b"Article a")

    def test_atomic_release_retry_and_rollback_restore_both_source_versions(self):
        first, second = self.artifact("a"), self.artifact("b")
        self.activate(first, 1)
        self.assertEqual(urlopen(self.url + "/blog").read(), b"Article a")
        self.activate(second, 2)
        self.assertEqual(urlopen(self.url + "/blog").read(), b"Article b")
        retried = self.activate(second, 2)
        self.assertTrue(retried["reused"])
        self.assertEqual(len(list((self.store / "releases").iterdir())), 2)
        result = self.activate(first, 3)
        self.assertEqual(result["frontend_sha"], "a" * 40)
        self.assertEqual(result["content_sha"], "f" * 40)
        self.assertEqual(urlopen(self.url + "/blog").read(), b"Article a")
        self.assertEqual(
            json.loads((self.store / "active.json").read_text())["generation"], 3
        )

    def test_corrupt_artifact_cannot_replace_available_site(self):
        first, second = self.artifact("a"), self.artifact("b")
        self.activate(first, 1)
        (self.store / "releases" / second / "site/blog.html").write_text("tampered")
        with self.assertRaisesRegex(release.ReleaseError, "differ"):
            self.activate(second, 2)
        self.assertEqual(urlopen(self.url + "/blog").read(), b"Article a")

    def test_failed_post_switch_readback_restores_old_pointer_and_state(self):
        first, second = self.artifact("a"), self.artifact("b")
        self.activate(first, 1)
        original = release.http_readback

        def fail_only_live_new(base, manifest):
            if base == self.url and manifest["id"] == second:
                raise release.ReleaseError("smoke", "controlled live byte mismatch")
            return original(base, manifest)

        with (
            patch.object(release, "http_readback", side_effect=fail_only_live_new),
            self.assertRaisesRegex(release.ReleaseError, "byte mismatch"),
        ):
            self.activate(second, 3)
        self.assertEqual(urlopen(self.url + "/blog").read(), b"Article a")
        self.assertEqual(
            json.loads((self.store / "active.json").read_text())["id"], first
        )
        with self.assertRaisesRegex(release.ReleaseError, "newer generation"):
            self.activate(second, 2)
        self.activate(second, 3)
        self.assertEqual(urlopen(self.url + "/blog").read(), b"Article b")

    def test_concurrent_jobs_finish_on_highest_generation(self):
        first, second, third = (
            self.artifact("a"),
            self.artifact("b"),
            self.artifact("c"),
        )
        self.activate(first, 1)

        def job(identifier, generation):
            try:
                return self.activate(identifier, generation)
            except release.ReleaseError as error:
                return error.stage

        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as workers:
            outputs = list(
                workers.map(lambda pair: job(*pair), [(third, 3), (second, 2)])
            )
        self.assertTrue(
            all(isinstance(value, dict) or value == "superseded" for value in outputs)
        )
        self.assertEqual(
            json.loads((self.store / "active.json").read_text())["id"], third
        )
        self.assertEqual(urlopen(self.url + "/blog").read(), b"Article c")

    def test_same_generation_cannot_select_a_different_release(self):
        first, second = self.artifact("a"), self.artifact("b")
        self.activate(first, 1)
        with self.assertRaisesRegex(release.ReleaseError, "newer generation"):
            self.activate(second, 1)
        self.assertEqual(urlopen(self.url + "/blog").read(), b"Article a")

    def test_symlink_artifact_escape_is_rejected(self):
        identifier = self.artifact("a")
        directory = self.store / "releases" / identifier
        moved = self.root / "outside"
        directory.rename(moved)
        directory.symlink_to(moved)
        with self.assertRaisesRegex(release.ReleaseError, "escapes"):
            self.activate(identifier, 1)
        self.assertFalse((self.store / "current").exists())

    def test_existing_unmanaged_pointer_is_preserved(self):
        identifier = self.artifact("a")
        (self.store / "current").symlink_to("releases/" + identifier)
        with self.assertRaisesRegex(release.ReleaseError, "trusted active state"):
            self.activate(identifier, 1)
        self.assertEqual(
            (self.store / "current").readlink().as_posix(), "releases/" + identifier
        )

    def test_import_rejects_self_resigned_artifact_with_original_trusted_pin(self):
        identifier = self.artifact("a")
        source = self.store / "releases" / identifier
        file = source / "release.json"
        trusted = sha256(file.read_bytes())
        manifest = json.loads(file.read_text())
        (source / "site/blog.html").write_text("attacker content")
        manifest["files"]["blog.html"] = sha256(b"attacker content")
        file.write_bytes(encoded(manifest))
        with self.assertRaises(release.ReleaseError):
            release.import_release(
                SimpleNamespace(
                    store=self.root / "other-store",
                    artifact=source,
                    manifest_sha256=trusted,
                )
            )

    def test_committed_but_unacknowledged_activation_is_idempotently_recovered(self):
        first, second = self.artifact("a"), self.artifact("b")
        self.activate(first, 1)
        old = json.loads((self.store / "active.json").read_text())
        self.activate(second, 2)
        (self.store / "pending.json").write_bytes(
            encoded({"id": second, "generation": 2, "old": old})
        )
        self.assertTrue(self.activate(second, 2)["reused"])
        self.assertFalse((self.store / "pending.json").exists())
        self.assertEqual(urlopen(self.url + "/blog").read(), b"Article b")

    def test_first_release_baseline_is_only_missing_on_actual_marker_404(self):
        output = self.root / "baseline.json"
        with self.assertRaises(release.ReleaseError) as caught:
            release.fetch_baseline(SimpleNamespace(base_url=self.url, output=output))
        self.assertEqual(caught.exception.stage, "baseline-missing")
        self.assertFalse(output.exists())

    def test_import_never_follows_same_bytes_symlink_outside_artifact(self):
        identifier = self.artifact("a")
        source = self.store / "releases" / identifier
        trusted = sha256((source / "release.json").read_bytes())
        outside = self.root / "private.txt"
        outside.write_text("Article a")
        (source / "site/blog.html").unlink()
        (source / "site/blog.html").symlink_to(outside)
        with self.assertRaisesRegex(release.ReleaseError, "confined"):
            release.import_release(
                SimpleNamespace(
                    store=self.root / "other-store",
                    artifact=source,
                    manifest_sha256=trusted,
                )
            )
        self.assertFalse((self.root / "other-store/current").exists())

    def test_real_process_termination_after_pointer_swap_recovers_on_retry(self):
        first, second = self.artifact("a"), self.artifact("b")
        self.activate(first, 1)
        code = """import importlib.util,os,sys
from pathlib import Path
from types import SimpleNamespace
spec=importlib.util.spec_from_file_location('release',sys.argv[1]);module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
original=module.switch_pointer
def terminate(store,identifier):
 original(store,identifier)
 os._exit(97)
module.switch_pointer=terminate
module.activate(SimpleNamespace(store=Path(sys.argv[2]),release=sys.argv[3],generation=2,base_url=sys.argv[4]))
"""
        failed = subprocess.run(
            [
                sys.executable,
                "-c",
                code,
                str(SCRIPT),
                str(self.store),
                second,
                self.url,
            ],
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertEqual(failed.returncode, 97)
        self.assertTrue((self.store / "pending.json").is_file())
        self.assertEqual(
            json.loads((self.store / "active.json").read_text())["id"], first
        )
        self.assertEqual(self.activate(second, 2)["id"], second)
        self.assertEqual(urlopen(self.url + "/blog").read(), b"Article b")
        self.assertFalse((self.store / "pending.json").exists())

    def test_crash_between_pointer_and_state_is_recoverable_on_retry(self):
        first, second = self.artifact("a"), self.artifact("b")
        self.activate(first, 1)
        old = json.loads((self.store / "active.json").read_text())
        (self.store / "pending.json").write_bytes(
            encoded({"id": second, "generation": 2, "old": old})
        )
        release.switch_pointer(self.store, second)
        result = self.activate(second, 2)
        self.assertTrue(result["ok"])
        self.assertEqual(
            json.loads((self.store / "active.json").read_text())["id"], second
        )
        self.assertFalse((self.store / "pending.json").exists())
        self.assertEqual(urlopen(self.url + "/blog").read(), b"Article b")

    def test_rollback_cannot_activate_an_unverified_prepared_artifact(self):
        first, second = self.artifact("a"), self.artifact("b")
        self.activate(first, 1)
        args = SimpleNamespace(
            store=self.store,
            release=second,
            generation=2,
            base_url=self.url,
            operation="rollback",
        )
        with self.assertRaisesRegex(release.ReleaseError, "previously verified"):
            release.activate(args)
        self.assertEqual(urlopen(self.url + "/blog").read(), b"Article a")
        self.activate(second, 2)
        args.release = first
        args.generation = 3
        self.assertEqual(release.activate(args)["frontend_sha"], "a" * 40)
        self.assertEqual(urlopen(self.url + "/blog").read(), b"Article a")

    def test_import_verifies_artifact_and_rejects_changed_bytes(self):
        identifier = self.artifact("a")
        target_store = self.root / "second-store"
        args = SimpleNamespace(
            store=target_store,
            artifact=self.store / "releases" / identifier,
            manifest_sha256=sha256(
                (self.store / "releases" / identifier / "release.json").read_bytes()
            ),
        )
        result = release.import_release(args)
        self.assertEqual(result["id"], identifier)
        self.assertTrue(release.import_release(args)["reused"])
        (args.artifact / "site/blog.html").write_text("untrusted altered bytes")
        with self.assertRaises(release.ReleaseError) as caught:
            release.import_release(args)
        self.assertEqual(caught.exception.stage, "artifact")
        self.assertEqual(
            (target_store / "releases" / identifier / "site/blog.html").read_text(),
            "Article a",
        )

    def test_freshness_transport_requires_both_exact_current_source_values(self):
        executable = self.root / "gh"
        executable.write_text(
            "#!"
            + sys.executable
            + "\nimport os,sys\nkey='APPROVED' if 'BLOG_APPROVED_FRONTEND_SHA' in ' '.join(sys.argv) else 'CONTENT'\nprint(os.environ[key])\n"
        )
        executable.chmod(0o755)
        manifest = {"frontend_sha": "a" * 40, "content_sha": "b" * 40}
        with patch.dict(
            os.environ,
            {
                "PATH": str(self.root) + os.pathsep + os.environ["PATH"],
                "APPROVED": "a" * 40,
                "CONTENT": "b" * 40,
            },
        ):
            release.verify_freshness("fixture/frontend", manifest)
            os.environ["CONTENT"] = "c" * 40
            with self.assertRaises(release.ReleaseError) as caught:
                release.verify_freshness("fixture/frontend", manifest)
            self.assertEqual(caught.exception.stage, "superseded")

    def test_source_advance_during_candidate_smoke_cannot_change_pointer(self):
        first, second = self.artifact("a"), self.artifact("b")
        self.activate(first, 1)
        args = SimpleNamespace(
            store=self.store,
            release=second,
            generation=2,
            base_url=self.url,
            freshness_repository="fixture/frontend",
        )

        def policy(_repository, manifest):
            self.assertEqual(manifest["id"], second)
            raise release.ReleaseError(
                "superseded", "Source advanced during import/smoke"
            )

        with (
            patch.object(release, "verify_freshness", side_effect=policy) as check,
            self.assertRaises(release.ReleaseError) as caught,
        ):
            release.activate(args)
        check.assert_called_once()
        self.assertEqual(caught.exception.stage, "superseded")
        self.assertEqual(urlopen(self.url + "/blog").read(), b"Article a")
        self.assertEqual(
            json.loads((self.store / "active.json").read_text())["id"], first
        )

    def test_redirected_missing_marker_is_not_first_release_permission(self):
        class Redirect(release.BaseHTTPRequestHandler):
            def do_GET(self):
                if self.path == "/blog-release.json":
                    self.send_response(302)
                    self.send_header("Location", "/missing")
                    self.end_headers()
                else:
                    self.send_error(404)

            def log_message(self, *_args):
                pass

        server = release.ThreadingHTTPServer(("127.0.0.1", 0), Redirect)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        try:
            with self.assertRaises(release.ReleaseError) as caught:
                release.fetch_baseline(
                    SimpleNamespace(
                        base_url="http://127.0.0.1:" + str(server.server_port),
                        output=self.root / "unexpected.json",
                    )
                )
            self.assertNotEqual(caught.exception.stage, "baseline-missing")
            self.assertFalse((self.root / "unexpected.json").exists())
        finally:
            server.shutdown()
            server.server_close()
            thread.join()

    def test_http_adapter_serves_browser_usable_resource_types(self):
        identifier = self.artifact("a")
        self.activate(identifier, 1)
        site = self.store / "releases" / identifier / "site"
        for name, expected in [
            ("style.css", "text/css"),
            ("module.js", "text/javascript"),
            ("image.png", "image/png"),
        ]:
            (site / name).write_text("controlled resource")
            with urlopen(self.url + "/" + name) as response:
                self.assertEqual(response.headers.get_content_type(), expected)

    def test_baseline_fetch_is_bound_to_marker_and_rejects_wrong_bytes(self):
        identifier = self.artifact("a")
        self.activate(identifier, 1)
        output = self.root / "baseline.json"
        release.fetch_baseline(SimpleNamespace(base_url=self.url, output=output))
        self.assertEqual(
            json.loads(output.read_text())["sample"]["published_at"], "2026-11-13"
        )
        output.unlink()
        (
            self.store / "releases" / identifier / "site/blog-published-baseline.json"
        ).write_text('{"changed":true}')
        with self.assertRaisesRegex(release.ReleaseError, "same version"):
            release.fetch_baseline(SimpleNamespace(base_url=self.url, output=output))
        self.assertFalse(output.exists())

    def test_manifest_cannot_change_recorded_source_pair_without_new_identity(self):
        identifier = self.artifact("a")
        file = self.store / "releases" / identifier / "release.json"
        manifest = json.loads(file.read_text())
        manifest["inputs"]["frontend_sha"] = "b" * 40
        file.write_text(json.dumps(manifest))
        with self.assertRaises(release.ReleaseError) as caught:
            self.activate(identifier, 1)
        self.assertEqual(caught.exception.stage, "artifact")


class PreparePipelineTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.root = Path(self.temporary.name).resolve()
        self.frontend = self.repository("frontend")
        self.content = self.repository("content")
        self.private = self.root / "private-evidence"
        self.private.mkdir()
        self.approvals = self.private / "approvals.json"
        self.approvals.write_text("[]")
        self.build_env = self.private / "public-env.json"
        self.build_env.write_text(
            json.dumps(
                {
                    "NEXT_PUBLIC_APP_URL": "https://app.example.invalid",
                    "NEXT_PUBLIC_WEBSITE_URL": "https://website.example.invalid",
                }
            )
        )
        self.bin = self.root / "bin"
        self.bin.mkdir()
        executable = self.bin / "pnpm"
        executable.write_text(f"""#!{sys.executable}
import json,os,pathlib,sys
args=sys.argv[1:]
stage='install' if 'install' in args else ('validate' if 'validate' in args else ('configure' if 'generate:env' in args else 'build'))
failure=pathlib.Path(__file__).with_name('failure')
if failure.exists() and failure.read_text()==stage:sys.exit(9)
if stage=='validate': print(json.dumps({{'ok':True,'mode':'publish','digests':{{'sample':'d'*64}},'articles':[{{'metadata':{{'id':'sample','lang':'zh-TW','slug':'sample','published_at':'2026-11-13'}},'images':[]}},{{'metadata':{{'id':'sample','lang':'en','slug':'sample','published_at':'2026-11-13'}},'images':[]}}]}}))
elif '@daodao/website' in args:
 if 'UNRELATED_CI_SECRET' in os.environ or 'GITHUB_OUTPUT' in os.environ:sys.exit(17)
 out=pathlib.Path('apps/website/out');(out/'en/blog').mkdir(parents=True);(out/'zh-TW/blog').mkdir(parents=True)
 for name in ['zh-TW.html','en.html','zh-TW/blog.html','en/blog.html','zh-TW/blog/sample.html','en/blog/sample.html']:(out/name).write_text('Controlled fixture '+os.environ['BLOG_CONTENT_SHA'])
""")
        executable.chmod(0o755)
        self.environment = patch.dict(
            os.environ,
            {
                "PATH": str(self.bin) + os.pathsep + os.environ["PATH"],
                "BLOG_EVIDENCE_ROOT": str(self.private),
            },
        )
        self.environment.start()

    def tearDown(self):
        self.environment.stop()
        self.temporary.cleanup()

    def repository(self, name):
        root = self.root / name
        root.mkdir()
        subprocess.run(["git", "init", "-q", str(root)], check=True)
        (root / "readme").write_text(name)
        subprocess.run(["git", "-C", str(root), "add", "."], check=True)
        subprocess.run(
            [
                "git",
                "-C",
                str(root),
                "-c",
                "user.name=Fixture",
                "-c",
                "user.email=fixture@example.invalid",
                "commit",
                "-qm",
                "fixture",
            ],
            check=True,
        )
        return root

    def args(self):
        front = subprocess.check_output(
            ["git", "-C", str(self.frontend), "rev-parse", "HEAD"], text=True
        ).strip()
        content = subprocess.check_output(
            ["git", "-C", str(self.content), "rev-parse", "HEAD"], text=True
        ).strip()
        return SimpleNamespace(
            frontend_repo=str(self.frontend),
            frontend_sha=front,
            approved_frontend_sha=front,
            content_repo=str(self.content),
            content_sha=content,
            approvals=self.approvals,
            baseline=None,
            build_env=self.build_env,
            store=self.root / "store",
        )

    def test_legacy_checkout_cannot_hold_release_store(self):
        args = self.args()
        args.store = Path("/root/daodao-f2e/releases")
        with self.assertRaises(release.ReleaseError) as caught:
            release.prepare(args)
        self.assertEqual(caught.exception.stage, "input")

    def test_missing_or_unsafe_public_navigation_origins_stop_before_build(self):
        for values in [
            {},
            {
                "NEXT_PUBLIC_APP_URL": "https://:443",
                "NEXT_PUBLIC_WEBSITE_URL": "https://example.invalid",
            },
            {
                "NEXT_PUBLIC_APP_URL": "https://example.invalid:badport",
                "NEXT_PUBLIC_WEBSITE_URL": "https://example.invalid",
            },
            {
                "NEXT_PUBLIC_APP_URL": "undefined",
                "NEXT_PUBLIC_WEBSITE_URL": "https://example.invalid",
            },
            {
                "NEXT_PUBLIC_APP_URL": "https://user:pass@example.invalid",
                "NEXT_PUBLIC_WEBSITE_URL": "https://example.invalid",
            },
        ]:
            with self.subTest(values=values):
                self.build_env.write_text(json.dumps(values))
                with self.assertRaises(release.ReleaseError) as caught:
                    release.prepare(self.args())
                self.assertEqual(caught.exception.stage, "input")
                self.assertFalse((self.root / "store" / "releases").exists())

    def test_ambient_git_repository_override_cannot_redirect_pinned_checkout(self):
        args = self.args()
        with patch.dict(
            os.environ,
            {"GIT_DIR": str(self.content / ".git"), "GIT_WORK_TREE": str(self.content)},
        ):
            self.assertTrue(release.prepare(args)["ok"])

    def test_prepare_pins_commits_ignores_dirty_source_and_reuses_artifact(self):
        args = self.args()
        (self.content / "readme").write_text("uncommitted should not publish")
        prepared = release.prepare(args)
        self.assertTrue(prepared["ok"])
        self.assertEqual(prepared["manifest"]["content_sha"], args.content_sha)
        self.assertIn(
            args.content_sha,
            (
                args.store / "releases" / prepared["id"] / "site/en/blog.html"
            ).read_text(),
        )
        self.assertTrue(release.prepare(args)["reused"])
        self.assertEqual(len(list((args.store / "releases").iterdir())), 1)
        self.assertEqual(
            (self.content / "readme").read_text(), "uncommitted should not publish"
        )

    def test_unrelated_ci_credentials_and_output_file_are_not_forwarded_to_build(self):
        with patch.dict(
            os.environ,
            {
                "UNRELATED_CI_SECRET": "do-not-forward",
                "GITHUB_OUTPUT": "do-not-forward",
            },
        ):
            self.assertTrue(release.prepare(self.args())["ok"])

    def test_private_input_requires_independent_scope_and_rejects_symlinks(self):
        args = self.args()
        with (
            patch.dict(os.environ, {}, clear=True),
            self.assertRaisesRegex(release.ReleaseError, "BLOG_EVIDENCE_ROOT"),
        ):
            release.prepare(args)
        outside = self.root / "outside.json"
        outside.write_text("[]")
        alias = self.private / "alias.json"
        alias.symlink_to(outside)
        args.approvals = alias
        with self.assertRaises(release.ReleaseError) as caught:
            release.prepare(args)
        self.assertEqual(caught.exception.stage, "approval")
        self.assertFalse((args.store / "releases").exists())

    def test_unapproved_frontend_rejected_before_fetch(self):
        args = self.args()
        args.approved_frontend_sha = "0" * 40
        with self.assertRaisesRegex(release.ReleaseError, "trusted approved pin"):
            release.prepare(args)
        self.assertFalse(args.store.exists())

    def test_fetch_failure_creates_no_release(self):
        args = self.args()
        args.content_sha = "0" * 40
        with self.assertRaises(release.ReleaseError) as caught:
            release.prepare(args)
        self.assertEqual(caught.exception.stage, "fetch")
        self.assertFalse((args.store / "releases").exists())

    def test_validation_failure_creates_no_empty_release(self):
        (self.bin / "failure").write_text("validate")
        with self.assertRaises(release.ReleaseError) as caught:
            release.prepare(self.args())
        self.assertEqual(caught.exception.stage, "validate")
        self.assertFalse((self.root / "store/releases").exists())

    def test_build_failure_creates_no_empty_release(self):
        (self.bin / "failure").write_text("build")
        with self.assertRaises(release.ReleaseError) as caught:
            release.prepare(self.args())
        self.assertEqual(caught.exception.stage, "build")
        self.assertFalse((self.root / "store/releases").exists())

    def test_archive_export_filter_cannot_silently_drop_pinned_source(self):
        (self.content / ".gitattributes").write_text("readme export-ignore\n")
        subprocess.run(
            ["git", "-C", str(self.content), "add", ".gitattributes"], check=True
        )
        subprocess.run(
            [
                "git",
                "-C",
                str(self.content),
                "-c",
                "user.name=Fixture",
                "-c",
                "user.email=fixture@example.invalid",
                "commit",
                "-qm",
                "export filter",
            ],
            check=True,
        )
        with self.assertRaisesRegex(release.ReleaseError, "complete source tree"):
            release.prepare(self.args())

    def test_public_receipt_is_not_accepted_via_clone_path_trick(self):
        args = self.args()
        args.approvals = self.content / "public-approval.json"
        args.approvals.write_text("[]")
        with self.assertRaisesRegex(release.ReleaseError, "outside"):
            release.prepare(args)


if __name__ == "__main__":
    unittest.main()
