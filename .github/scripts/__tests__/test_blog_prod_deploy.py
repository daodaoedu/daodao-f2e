"""Observable website-only activation, recovery and transport boundaries."""

import importlib.util
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

SCRIPT = Path(__file__).resolve().parents[1] / "blog_prod_deploy.py"
spec = importlib.util.spec_from_file_location("blog_prod_deploy", SCRIPT)
deploy = importlib.util.module_from_spec(spec)
spec.loader.exec_module(deploy)


def payload():
    return {
        "schema": 1,
        "image": "daodao/daodao-website@sha256:" + "c" * 64,
        "frontend_sha": "a" * 40,
        "content_sha": "b" * 40,
        "compose": "services:\n  prod_website:\n    image: unused\n",
        "manifest": {
            "schema": 1,
            "frontend_sha": "a" * 40,
            "content_sha": "b" * 40,
            "routes": [
                {
                    "path": "/blog-release.json",
                    "file_path": "blog-release.json",
                    "sha256": "d" * 64,
                    "content_type": "application/json",
                },
                {
                    "path": "/blog",
                    "file_path": "zh-TW/blog.html",
                    "sha256": "d" * 64,
                    "content_type": "text/html",
                },
            ],
        },
    }


class Docker:
    def __init__(self):
        self.commands = []
        self.image = "sha256:" + "1" * 64
        self.active = "old-container"
        self.product = "product-container"
        self.fail_health = False
        self.fail_recovery = False
        self.frontend = "a" * 40
        self.published_paths = ["/app/apps/website/out/zh-TW/blog.html"]

    def __call__(self, argv, **kwargs):
        self.commands.append(argv)
        output = ""
        if argv[0] == "git":
            output = self.frontend + "\trefs/heads/prod"
        elif argv[:2] == ["docker", "ps"]:
            output = (
                self.product
                if "label=com.docker.compose.service=prod_product" in argv
                else self.active
            )
        elif argv[:2] == ["docker", "inspect"]:
            output = json.dumps(
                {
                    "id": self.active,
                    "image": self.image,
                    "project": "daodao-f2e",
                    "service": "prod_website",
                }
            )
        elif argv[:2] == ["docker", "compose"] and "up" in argv:
            override = Path(argv[argv.index("-f", argv.index("-f") + 1) + 1])
            self.image = json.loads(override.read_text())["services"]["prod_website"][
                "image"
            ]
            self.active = "new-container" if "@" in self.image else "restored-container"
            if self.fail_health and "@" in self.image:
                raise subprocess.CalledProcessError(1, argv)
            if self.fail_recovery and "@" not in self.image:
                raise subprocess.CalledProcessError(1, argv)
        elif argv[:2] == ["docker", "exec"]:
            output = "\n".join(self.published_paths)
        return subprocess.CompletedProcess(argv, 0, output, "")


class DeploymentTests(unittest.TestCase):
    def test_all_handled_signals_are_queued_and_drained_during_recovery(self):
        source = """import importlib.util,signal,sys
spec=importlib.util.spec_from_file_location("deploy",sys.argv[1])
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
def interrupted(*_):
 raise KeyboardInterrupt()
signals=(signal.SIGTERM,signal.SIGINT,signal.SIGHUP,signal.SIGALRM)
for item in signals: signal.signal(item,interrupted)
with module.recovery_signals_blocked():
 for item in signals: signal.raise_signal(item)
 assert signal.sigpending().issuperset(signals)
assert not signal.sigpending().intersection(signals)
print("recovery completed")
"""
        result = subprocess.run(
            [sys.executable, "-c", source, str(SCRIPT)],
            check=False,
            capture_output=True,
            text=True,
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(result.stdout.strip(), "recovery completed")

    def test_pending_recovery_blocks_new_publication_without_commands(self):
        docker = Docker()
        with tempfile.TemporaryDirectory() as folder:
            (Path(folder) / "pending.json").write_text(
                '{"status":"activation-pending"}'
            )
            with self.assertRaises(ValueError):
                deploy.publish(
                    payload(),
                    call=docker,
                    verify=lambda *_: None,
                    read=lambda *_: b"prior",
                    root=Path(folder),
                )
        self.assertEqual(docker.commands, [])

    def test_failed_recovery_preserves_frozen_inputs_and_blocks_retry(self):
        docker = Docker()
        docker.fail_recovery = True
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)

            def mismatch(*_):
                raise ValueError("Public mismatch")

            with self.assertRaises(deploy.PublicationError) as failure:
                deploy.publish(
                    payload(),
                    call=docker,
                    verify=mismatch,
                    read=lambda *_: b"prior",
                    root=root,
                )
            self.assertFalse(failure.exception.report["rollback_verified"])
            pending = json.loads((root / "pending.json").read_text())
            self.assertEqual(pending["previous_image"], "sha256:" + "1" * 64)
            self.assertEqual(
                Path(pending["frozen_compose"]).read_text(), payload()["compose"]
            )
            self.assertFalse(
                any(cmd[:2] == ["docker", "rm"] for cmd in docker.commands)
            )
            commands_before = len(docker.commands)
            with self.assertRaises(ValueError):
                deploy.publish(
                    payload(),
                    call=docker,
                    verify=mismatch,
                    read=lambda *_: b"prior",
                    root=root,
                )
            self.assertEqual(len(docker.commands), commands_before)

    def test_activation_journal_exists_before_first_service_mutation(self):
        docker = Docker()
        observed = []
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)

            def invoke(argv, **kwargs):
                if argv[:2] == ["docker", "compose"]:
                    pending = json.loads((root / "pending.json").read_text())
                    observed.append(pending["previous_image"])
                    self.assertTrue(Path(pending["frozen_compose"]).is_file())
                return docker(argv, **kwargs)

            deploy.publish(
                payload(),
                call=invoke,
                verify=lambda *_: None,
                read=lambda *_: b"prior",
                root=root,
            )
            self.assertFalse((root / "pending.json").exists())
        self.assertEqual(observed, ["sha256:" + "1" * 64])

    def test_real_subprocess_fake_docker_restores_on_public_failure(self):
        fake_source = """import json,sys
from pathlib import Path
statefile=Path(sys.argv[1]); args=sys.argv[2:]
state=json.loads(statefile.read_text()); state["calls"].append(args)
output=""
if args[0]=="-c":
 output="a"*40+"\\trefs/heads/prod"
elif args[0]=="ps":
 output=state["product"] if "label=com.docker.compose.service=prod_product" in args else state["active"]
elif args[0]=="inspect":
 output=json.dumps({"id":state["active"],"image":state["image"],"project":"daodao-f2e","service":"prod_website"})
elif args[0]=="exec":
 output="/app/apps/website/out/zh-TW/blog.html"
elif args[0]=="compose" and "up" in args:
 override=Path(args[args.index("-f",args.index("-f")+1)+1])
 state["image"]=json.loads(override.read_text())["services"]["prod_website"]["image"]
 state["active"]="candidate" if "@" in state["image"] else "restored"
statefile.write_text(json.dumps(state)); print(output)
"""
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            fake = root / "docker.py"
            fake.write_text(fake_source)
            statefile = root / "state.json"
            statefile.write_text(
                json.dumps(
                    {
                        "image": "sha256:" + "1" * 64,
                        "product": "untouched-product",
                        "active": "old",
                        "calls": [],
                    }
                )
            )

            def invoke(argv, **kwargs):
                checked = kwargs.pop("check")
                return subprocess.run(
                    [sys.executable, str(fake), str(statefile), *argv[1:]],
                    check=checked,
                    **kwargs,
                )

            def mismatch(*_):
                raise ValueError("Actual public mismatch")

            with self.assertRaises(deploy.PublicationError) as failure:
                deploy.publish(
                    payload(),
                    call=invoke,
                    verify=mismatch,
                    read=lambda *_: b"prior",
                    root=root,
                )
            state = json.loads(statefile.read_text())
        self.assertTrue(failure.exception.report["rollback_verified"])
        self.assertEqual(state["image"], "sha256:" + "1" * 64)
        self.assertEqual(state["product"], "untouched-product")
        mutations = [call for call in state["calls"] if call[0] == "compose"]
        self.assertEqual(len(mutations), 2)
        self.assertTrue(
            all(
                call[-1] == "prod_website" and "--no-deps" in call for call in mutations
            )
        )

    def test_invalid_identity_rejected_before_any_command(self):
        for change in [
            {"image": "evil/other@sha256:" + "c" * 64},
            {"image": "daodao/daodao-website:latest"},
            {"frontend_sha": "$(echo bad)"},
            {"content_sha": "b" * 39},
        ]:
            item = payload()
            item.update(change)
            docker = Docker()
            with self.subTest(change=change), tempfile.TemporaryDirectory() as folder:
                with self.assertRaises(ValueError):
                    deploy.publish(
                        item,
                        call=docker,
                        verify=lambda *_: None,
                        read=lambda *_: b"prior",
                        root=Path(folder),
                    )
                self.assertEqual(docker.commands, [])

    def test_website_only_success_keeps_product_and_uses_digest(self):
        docker = Docker()
        with tempfile.TemporaryDirectory() as folder:
            result = deploy.publish(
                payload(),
                call=docker,
                verify=lambda *_: None,
                read=lambda *_: b"prior",
                root=Path(folder),
            )
        self.assertTrue(result["public_verified"])
        self.assertTrue(result["product_unchanged"])
        mutations = [cmd for cmd in docker.commands if cmd[:2] == ["docker", "compose"]]
        self.assertEqual(len(mutations), 1)
        self.assertEqual(mutations[0][-1], "prod_website")
        self.assertIn("--no-deps", mutations[0])
        self.assertEqual(docker.image, payload()["image"])
        self.assertFalse(
            any("prune" in cmd or "reset" in cmd for cmd in docker.commands)
        )

    def test_public_failure_restores_exact_old_image_and_remains_failure(self):
        docker = Docker()

        def failed(*_):
            raise ValueError("public bytes differ")

        with (
            tempfile.TemporaryDirectory() as folder,
            self.assertRaises(deploy.PublicationError) as failure,
        ):
            deploy.publish(
                payload(),
                call=docker,
                verify=failed,
                read=lambda *_: b"prior",
                root=Path(folder),
            )
        self.assertTrue(failure.exception.report["rollback_verified"])
        self.assertTrue(failure.exception.report["product_unchanged"])
        self.assertEqual(docker.image, "sha256:" + "1" * 64)
        self.assertFalse(failure.exception.report["public_verified"])

    def test_start_failure_and_termination_both_restore(self):
        for mode in ("health", "termination"):
            docker = Docker()
            docker.fail_health = mode == "health"

            def verify(*_, selected=mode):
                if selected == "termination":
                    raise KeyboardInterrupt()

            with self.subTest(mode=mode), tempfile.TemporaryDirectory() as folder:
                with self.assertRaises(deploy.PublicationError) as failure:
                    deploy.publish(
                        payload(),
                        call=docker,
                        verify=verify,
                        read=lambda *_: b"prior",
                        root=Path(folder),
                    )
                self.assertTrue(failure.exception.report["rollback_verified"])

    def test_invalid_manifest_paths_and_duplicate_routes_rejected(self):
        for path in (
            "https://evil.test/x",
            "//evil.test/x",
            "/../secret",
            "/x?y=1",
            "/x\n",
        ):
            item = payload()
            item["manifest"]["routes"][0]["path"] = path
            with self.subTest(path=path), self.assertRaises(ValueError):
                deploy.validate_payload(item)
        item = payload()
        item["manifest"]["routes"] *= 2
        with self.assertRaises(ValueError):
            deploy.validate_payload(item)

    def test_stale_source_rejected_inside_lock_before_docker_mutation(self):
        docker = Docker()
        docker.frontend = "f" * 40
        with tempfile.TemporaryDirectory() as folder, self.assertRaises(ValueError):
            deploy.publish(
                payload(),
                call=docker,
                verify=lambda *_: None,
                read=lambda *_: b"prior",
                root=Path(folder),
            )
        self.assertEqual(len(docker.commands), 1)
        self.assertEqual(docker.commands[0][0], "git")

    def test_avif_is_supported_by_the_shared_image_contract(self):
        item = payload()
        item["manifest"]["routes"].append(
            {
                "path": "/blog-images/cover.avif",
                "file_path": "blog-images/cover.avif",
                "sha256": "d" * 64,
                "content_type": "image/avif",
            }
        )
        self.assertEqual(deploy.validate_payload(item), item)

    def test_remote_transport_has_strict_host_binding(self):
        with tempfile.TemporaryDirectory() as folder:
            key = Path(folder) / "key"
            known = Path(folder) / "known"
            key.write_text("private")
            known.write_text("public")
            argv = deploy.ssh_arguments("127.0.0.1", key, known, "a" * 64)
        self.assertIn("StrictHostKeyChecking=yes", argv)
        self.assertIn("GlobalKnownHostsFile=/dev/null", argv)
        self.assertNotIn("StrictHostKeyChecking=no", argv)
        with self.assertRaises(ValueError):
            deploy.ssh_arguments("host; evil", key, known, "a" * 64)

    def test_published_article_cannot_be_removed(self):
        docker = Docker()
        docker.published_paths.append("/app/apps/website/out/en/blog/old-article.html")
        item = payload()
        item["manifest"]["routes"].append(
            {
                "path": "/blog",
                "file_path": "zh-TW/blog.html",
                "sha256": "d" * 64,
                "content_type": "text/html",
            }
        )
        with tempfile.TemporaryDirectory() as folder, self.assertRaises(ValueError):
            deploy.publish(
                item,
                call=docker,
                verify=lambda *_: None,
                read=lambda *_: b"prior",
                root=Path(folder),
            )
        self.assertFalse(any("up" in cmd or "pull" in cmd for cmd in docker.commands))

    def test_previous_bilingual_pages_must_both_be_restored(self):
        docker = Docker()
        calls = []

        def read(path):
            calls.append(path)
            if path == "/blog-release.json":
                return b"<html>legacy soft404</html>"
            return path.encode()

        with (
            tempfile.TemporaryDirectory() as folder,
            self.assertRaises(deploy.PublicationError) as failure,
        ):
            deploy.publish(
                payload(),
                call=docker,
                verify=lambda *_: (_ for _ in ()).throw(ValueError("mismatch")),
                read=read,
                root=Path(folder),
            )
        self.assertTrue(failure.exception.report["rollback_verified"])
        self.assertGreaterEqual(calls.count("/blog"), 2)
        self.assertGreaterEqual(calls.count("/en/blog"), 2)


if __name__ == "__main__":
    unittest.main()
