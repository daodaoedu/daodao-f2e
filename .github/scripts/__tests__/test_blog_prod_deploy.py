"""Observable website-only activation, recovery and transport boundaries."""

import hashlib
import http.client
import importlib.util
import json
import os
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
        "baseline_content_sha": "0daa4231bb2072657c807813e960919b982f9d8e",
        "allow_legacy_bootstrap": True,
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
        self.holder_running = False
        self.holder_start_succeeds = True
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
            if argv[3] == "{{.State.Running}}":
                return subprocess.CompletedProcess(
                    argv, 0, str(self.holder_running).lower(), ""
                )
            output = json.dumps(
                {
                    "id": self.active,
                    "image": self.image,
                    "project": "daodao-f2e",
                    "service": "prod_website",
                }
            )
        elif argv[:2] == ["docker", "run"]:
            self.holder_running = self.holder_start_succeeds
        elif argv[:2] == ["docker", "rm"]:
            self.holder_running = False
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
            if argv[3] == "test":
                root = argv[-1]
                exists = any(
                    path == root or path.startswith(root + "/")
                    for path in self.published_paths
                )
                return subprocess.CompletedProcess(argv, 0 if exists else 1, "", "")
            roots = argv[argv.index("inventory") + 1 :]
            output = "\n".join(
                "regular file|" + path
                for path in self.published_paths
                if any(path == root or path.startswith(root + "/") for root in roots)
            )
        return subprocess.CompletedProcess(argv, 0, output, "")


class DeploymentTests(unittest.TestCase):
    def test_failed_recovery_retains_a_running_inert_holder(self):
        docker = Docker()
        docker.fail_recovery = True
        item = payload()

        def mismatch(*_):
            raise ValueError("Public bytes differ")

        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            with self.assertRaises(deploy.PublicationError) as failure:
                deploy.publish(
                    item,
                    call=docker,
                    verify=mismatch,
                    read=lambda *_: b"old bytes",
                    root=root,
                )
            self.assertFalse(failure.exception.report["rollback_verified"])
            self.assertTrue((root / "pending.json").exists())
        self.assertTrue(docker.holder_running)
        launch = next(
            command for command in docker.commands if command[:2] == ["docker", "run"]
        )
        self.assertIn("--read-only", launch)
        self.assertEqual(launch[launch.index("--network") + 1], "none")
        self.assertEqual(launch[launch.index("--cap-drop") + 1], "ALL")
        self.assertEqual(
            launch[launch.index("--security-opt") + 1], "no-new-privileges"
        )
        self.assertEqual(launch[launch.index("--entrypoint") + 1], "/bin/sh")
        self.assertEqual(launch[-2:], ["-c", "while :; do sleep 3600; done"])

    def test_holder_must_be_running_before_website_activation(self):
        docker = Docker()
        docker.holder_start_succeeds = False
        item = payload()
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            with self.assertRaises(ValueError):
                deploy.publish(
                    item,
                    call=docker,
                    verify=lambda *_: None,
                    read=lambda *_: b"old bytes",
                    root=root,
                )
        self.assertFalse(
            any(command[:2] == ["docker", "compose"] for command in docker.commands)
        )
        self.assertFalse(docker.holder_running)

    def test_paired_regular_rsc_sidecars_do_not_block_html_or_image_verification(self):
        docker = Docker()
        docker.published_paths.extend(
            [
                "/app/apps/website/out/zh-TW/blog.txt",
                "/app/apps/website/out/en/blog/guide.html",
                "/app/apps/website/out/en/blog/guide.txt",
            ]
        )
        item = payload()
        item["manifest"]["routes"].append(
            {
                "path": "/en/blog/guide",
                "file_path": "en/blog/guide.html",
                "sha256": "d" * 64,
                "content_type": "text/html",
            }
        )
        captured = []

        def read(path, content_type=None):
            captured.append(path)
            return b"old bytes"

        with tempfile.TemporaryDirectory() as temporary:
            result = deploy.publish(
                item,
                call=docker,
                verify=lambda *_: None,
                read=read,
                root=Path(temporary),
            )
        self.assertTrue(result["public_verified"])
        self.assertIn("/en/blog/guide", captured)
        self.assertFalse(any(path.endswith(".txt") for path in captured))

    def test_orphan_and_symlink_sidecars_remain_rejected(self):
        prefix = "/app/apps/website/out"
        for sidecar in (
            "regular file|" + prefix + "/en/blog/orphan.txt",
            "symbolic link|" + prefix + "/zh-TW/blog.txt",
            "regular file|" + prefix + "/blog-images/unrelated.txt",
        ):
            listing = "regular file|" + prefix + "/zh-TW/blog.html\n" + sidecar
            with self.subTest(sidecar=sidecar), self.assertRaises(ValueError):
                deploy.parse_public_inventory(listing, prefix)

    def test_rollback_reads_all_routes_even_after_first_mismatch(self):
        requested = []
        expected = hashlib.sha256(b"old bytes").hexdigest()
        snapshot = {
            path: {"sha256": expected, "content_type": "text/html"}
            for path in ("/blog/first", "/blog/second", "/en/blog/third")
        }

        def read(path, content_type=None):
            requested.append(path)
            return b"wrong bytes" if path == "/blog/first" else b"old bytes"

        self.assertFalse(deploy.verify_previous_public(read, snapshot))
        self.assertEqual(requested, list(snapshot))

    def test_public_manifest_uses_only_fixed_regular_file_in_runner_temp(self):
        item = payload()["manifest"]
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            fixed = root / "blog-prod-public-manifest.json"
            fixed.write_text(json.dumps(item))
            (root / "other.json").write_text('{"untrusted":"alternate"}')
            self.assertEqual(deploy.load_public_manifest({"RUNNER_TEMP": folder}), item)

    def test_public_manifest_rejects_symlink_hardlink_special_and_oversized(self):
        for kind in ("symlink", "hardlink", "fifo", "oversize"):
            with self.subTest(kind=kind), tempfile.TemporaryDirectory() as folder:
                root = Path(folder)
                fixed = root / "blog-prod-public-manifest.json"
                source = root / "source.json"
                source.write_text("{}")
                if kind == "symlink":
                    fixed.symlink_to(source)
                elif kind == "hardlink":
                    os.link(source, fixed)
                elif kind == "fifo":
                    os.mkfifo(fixed)
                else:
                    fixed.write_bytes(b"x" * (deploy.MAX_BUNDLE + 1))
                environment = {"RUNNER_TEMP": folder}
                with self.assertRaises(ValueError):
                    deploy.load_public_manifest(environment)

    def test_public_manifest_rejects_relative_or_symlink_runner_root(self):
        relative = {"RUNNER_TEMP": "relative"}
        with self.assertRaises(ValueError):
            deploy.load_public_manifest(relative)
        with tempfile.TemporaryDirectory() as folder:
            link = Path(folder) / "alias"
            link.symlink_to(Path(folder), target_is_directory=True)
            environment = {"RUNNER_TEMP": str(link)}
            with self.assertRaises(ValueError):
                deploy.load_public_manifest(environment)

    def test_system_exit_preserves_original_code_after_verified_recovery(self):
        docker = Docker()
        original = SystemExit(23)

        def terminate(*_):
            raise original

        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            item = payload()
            prepared_argument_1 = lambda *_: b"old bytes"
            with self.assertRaises(SystemExit) as failure:
                deploy.publish(
                    item,
                    call=docker,
                    verify=terminate,
                    read=prepared_argument_1,
                    root=root,
                )
            self.assertIs(failure.exception, original)
            self.assertEqual(failure.exception.code, 23)
            report = json.loads((root / "last-result.json").read_text())
            self.assertTrue(report["rollback_verified"])
            self.assertFalse((root / "pending.json").exists())
        self.assertEqual(docker.image, "sha256:" + "1" * 64)

    def test_article_update_may_replace_digest_image_url_while_retaining_html(self):
        docker = Docker()
        docker.published_paths.append(
            "/app/apps/website/out/blog-images/oldhash/photo.png"
        )
        item = payload()
        item["manifest"]["routes"].append(
            {
                "path": "/blog-images/newhash/photo.png",
                "file_path": "blog-images/newhash/photo.png",
                "sha256": "d" * 64,
                "content_type": "image/png",
            }
        )
        captured = []

        def read(path, content_type=None):
            captured.append((path, content_type))
            return b"old public bytes"

        with tempfile.TemporaryDirectory() as folder:
            result = deploy.publish(
                item, call=docker, verify=lambda *_: None, read=read, root=Path(folder)
            )
        self.assertTrue(result["public_verified"])
        self.assertIn(("/blog-images/oldhash/photo.png", "image/png"), captured)

    def test_existing_inventory_rejects_links_special_files_and_escaping_paths(self):
        for listing in (
            "symbolic link|/app/apps/website/out/zh-TW/blog.html",
            "fifo|/app/apps/website/out/zh-TW/blog.html",
            "regular file|/app/apps/website/out/zh-TW/blog/../private.html",
            "regular file|/outside/blog.html",
            "\n".join(["regular file|/app/apps/website/out/zh-TW/blog.html"] * 3001),
        ):
            docker = Docker()

            def invoke(argv, supplied=listing, current=docker, **kwargs):
                if argv[:2] == ["docker", "exec"] and argv[3] == "sh":
                    return subprocess.CompletedProcess(argv, 0, supplied, "")
                return current(argv, **kwargs)

            with self.subTest(listing=listing[:80]):
                prepared_argument_1 = payload()
                with self.assertRaises(ValueError):
                    deploy.preserve_published_routes(
                        invoke, {"id": "old"}, prepared_argument_1["manifest"]
                    )

    def test_old_snapshot_hashes_every_route_and_passes_expected_mime(self):
        calls = []

        def read(path, content_type=None):
            calls.append((path, content_type))
            return path.encode()

        snapshot = deploy.previous_public(
            read,
            {"/en/blog/old": "text/html", "/blog-images/old.png": "image/png"},
            payload(),
        )
        self.assertIn(("/en/blog/old", "text/html"), calls)
        self.assertIn(("/blog-images/old.png", "image/png"), calls)
        self.assertTrue(deploy.verify_previous_public(read, snapshot))
        self.assertEqual(
            set(snapshot), {"/blog", "/en/blog", "/en/blog/old", "/blog-images/old.png"}
        )

    def test_managed_baseline_needs_no_legacy_bootstrap_permission(self):
        item = payload()
        item["allow_legacy_bootstrap"] = False
        docker = Docker()

        def read(path, content_type=None):
            if path == "/blog-release.json":
                return json.dumps(
                    {
                        "frontend_sha": "e" * 40,
                        "content_sha": item["baseline_content_sha"],
                    }
                ).encode()
            return b"old bytes"

        with tempfile.TemporaryDirectory() as folder:
            result = deploy.publish(
                item, call=docker, verify=lambda *_: None, read=read, root=Path(folder)
            )
        self.assertTrue(result["public_verified"])

    def test_incomplete_http_read_after_activation_runs_verified_rollback(self):
        docker = Docker()

        def interrupted_response(*_):
            raise http.client.IncompleteRead(b"partial", 5)

        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            prepared_argument_1 = payload()
            prepared_argument_2 = lambda *_: b"old bytes"
            with self.assertRaises(deploy.PublicationError) as failure:
                deploy.publish(
                    prepared_argument_1,
                    call=docker,
                    verify=interrupted_response,
                    read=prepared_argument_2,
                    root=root,
                )
            self.assertTrue(failure.exception.report["rollback_verified"])
            self.assertFalse((root / "pending.json").exists())
        self.assertEqual(docker.image, "sha256:" + "1" * 64)

    def test_old_article_or_image_corruption_cannot_verify_rollback(self):
        for broken_path in ("/en/blog/old-article", "/blog-images/old.png"):
            docker = Docker()
            docker.published_paths.extend(
                [
                    "/app/apps/website/out/en/blog/old-article.html",
                    "/app/apps/website/out/blog-images/old.png",
                ]
            )
            item = payload()
            item["manifest"]["routes"].extend(
                [
                    {
                        "path": "/en/blog/old-article",
                        "file_path": "en/blog/old-article.html",
                        "sha256": "d" * 64,
                        "content_type": "text/html",
                    },
                    {
                        "path": "/blog-images/newhash/old.png",
                        "file_path": "blog-images/newhash/old.png",
                        "sha256": "d" * 64,
                        "content_type": "image/png",
                    },
                ]
            )
            requested = []

            def read(
                path,
                content_type=None,
                damaged=broken_path,
                observed=requested,
                current=docker,
            ):
                observed.append((path, content_type))
                if current.active == "restored-container" and path == damaged:
                    return b"wrong old article or image bytes"
                return b"old public bytes"

            def mismatch(*_):
                raise ValueError("Candidate public verification failed")

            with (
                self.subTest(broken=broken_path),
                tempfile.TemporaryDirectory() as folder,
            ):
                root = Path(folder)
                with self.assertRaises(deploy.PublicationError) as failure:
                    deploy.publish(
                        item, call=docker, verify=mismatch, read=read, root=root
                    )
                self.assertFalse(failure.exception.report["rollback_verified"])
                self.assertTrue((root / "pending.json").exists())
                self.assertTrue(any((path == broken_path for path, _ in requested)))
                self.assertFalse(
                    any(cmd[:2] == ["docker", "rm"] for cmd in docker.commands)
                )

    def test_managed_marker_must_match_frozen_baseline_before_activation(self):
        docker = Docker()

        def read(path, content_type=None):
            if path == "/blog-release.json":
                return json.dumps(
                    {"frontend_sha": "e" * 40, "content_sha": "f" * 40}
                ).encode()
            return b"old page"

        with tempfile.TemporaryDirectory() as folder:
            prepared_argument_1 = payload()
            prepared_argument_2 = lambda *_: None
            prepared_argument_3 = Path(folder)
            with self.assertRaises(ValueError):
                deploy.publish(
                    prepared_argument_1,
                    call=docker,
                    verify=prepared_argument_2,
                    read=read,
                    root=prepared_argument_3,
                )
        self.assertFalse(any("up" in command for command in docker.commands))

    def test_legacy_seed_needs_explicit_flag_and_known_accepted_content(self):
        for changes in (
            {"allow_legacy_bootstrap": False},
            {"baseline_content_sha": "f" * 40},
        ):
            item = payload()
            item.update(changes)
            docker = Docker()
            with self.subTest(changes=changes), tempfile.TemporaryDirectory() as folder:
                prepared_argument_1 = lambda *_: None
                prepared_argument_2 = lambda *_: b"legacy soft404"
                prepared_argument_3 = Path(folder)
                with self.assertRaises(ValueError):
                    deploy.publish(
                        item,
                        call=docker,
                        verify=prepared_argument_1,
                        read=prepared_argument_2,
                        root=prepared_argument_3,
                    )
                self.assertFalse(any("up" in command for command in docker.commands))

    def test_all_handled_signals_are_queued_and_drained_during_recovery(self):
        source = 'import importlib.util,signal,sys\nspec=importlib.util.spec_from_file_location("deploy",sys.argv[1])\nmodule=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)\ndef interrupted(*_):\n raise KeyboardInterrupt()\nsignals=(signal.SIGTERM,signal.SIGINT,signal.SIGHUP,signal.SIGALRM)\nfor item in signals: signal.signal(item,interrupted)\nwith module.recovery_signals_blocked():\n for item in signals: signal.raise_signal(item)\n assert signal.sigpending().issuperset(signals)\nassert not signal.sigpending().intersection(signals)\nprint("recovery completed")\n'
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
            prepared_argument_1 = payload()
            prepared_argument_2 = lambda *_: None
            prepared_argument_3 = lambda *_: b"prior"
            prepared_argument_4 = Path(folder)
            with self.assertRaises(ValueError):
                deploy.publish(
                    prepared_argument_1,
                    call=docker,
                    verify=prepared_argument_2,
                    read=prepared_argument_3,
                    root=prepared_argument_4,
                )
        self.assertEqual(docker.commands, [])

    def test_failed_recovery_preserves_frozen_inputs_and_blocks_retry(self):
        docker = Docker()
        docker.fail_recovery = True
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)

            def mismatch(*_):
                raise ValueError("Public mismatch")

            prepared_argument_1 = payload()
            prepared_argument_2 = lambda *_: b"prior"
            with self.assertRaises(deploy.PublicationError) as failure:
                deploy.publish(
                    prepared_argument_1,
                    call=docker,
                    verify=mismatch,
                    read=prepared_argument_2,
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
            prepared_argument_1 = payload()
            prepared_argument_2 = lambda *_: b"prior"
            with self.assertRaises(ValueError):
                deploy.publish(
                    prepared_argument_1,
                    call=docker,
                    verify=mismatch,
                    read=prepared_argument_2,
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
        fake_source = 'import json,sys\nfrom pathlib import Path\nstatefile=Path(sys.argv[1]); args=sys.argv[2:]\nstate=json.loads(statefile.read_text()); state["calls"].append(args)\noutput=""\nif args[0]=="-c":\n output="a"*40+"\\trefs/heads/prod"\nelif args[0]=="ps":\n output=state["product"] if "label=com.docker.compose.service=prod_product" in args else state["active"]\nelif args[0]=="inspect":\n output="true" if args[2]=="{{.State.Running}}" else json.dumps({"id":state["active"],"image":state["image"],"project":"daodao-f2e","service":"prod_website"})\nelif args[0]=="exec":\n if args[2]=="test":\n  statefile.write_text(json.dumps(state))\n  sys.exit(0 if args[-1]=="/app/apps/website/out/zh-TW/blog.html" else 1)\n output="regular file|/app/apps/website/out/zh-TW/blog.html"\nelif args[0]=="compose" and "up" in args:\n override=Path(args[args.index("-f",args.index("-f")+1)+1])\n state["image"]=json.loads(override.read_text())["services"]["prod_website"]["image"]\n state["active"]="candidate" if "@" in state["image"] else "restored"\nstatefile.write_text(json.dumps(state)); print(output)\n'
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

            prepared_argument_1 = payload()
            prepared_argument_2 = lambda *_: b"prior"
            with self.assertRaises(deploy.PublicationError) as failure:
                deploy.publish(
                    prepared_argument_1,
                    call=invoke,
                    verify=mismatch,
                    read=prepared_argument_2,
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
                prepared_argument_1 = lambda *_: None
                prepared_argument_2 = lambda *_: b"prior"
                prepared_argument_3 = Path(folder)
                with self.assertRaises(ValueError):
                    deploy.publish(
                        item,
                        call=docker,
                        verify=prepared_argument_1,
                        read=prepared_argument_2,
                        root=prepared_argument_3,
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

        with tempfile.TemporaryDirectory() as folder:
            prepared_argument_1 = payload()
            prepared_argument_2 = lambda *_: b"prior"
            prepared_argument_3 = Path(folder)
            with self.assertRaises(deploy.PublicationError) as failure:
                deploy.publish(
                    prepared_argument_1,
                    call=docker,
                    verify=failed,
                    read=prepared_argument_2,
                    root=prepared_argument_3,
                )
        self.assertTrue(failure.exception.report["rollback_verified"])
        self.assertTrue(failure.exception.report["product_unchanged"])
        self.assertEqual(docker.image, "sha256:" + "1" * 64)
        self.assertFalse(failure.exception.report["public_verified"])

    def test_start_failure_and_termination_both_restore(self):
        for mode in ("health", "termination"):
            docker = Docker()
            docker.fail_health = mode == "health"
            original = KeyboardInterrupt()

            def verify(*_, selected=mode, interruption=original):
                if selected == "termination":
                    raise interruption

            with self.subTest(mode=mode), tempfile.TemporaryDirectory() as folder:
                root = Path(folder)
                item = payload()
                expected = (
                    KeyboardInterrupt
                    if mode == "termination"
                    else deploy.PublicationError
                )
                prepared_argument_1 = lambda *_: b"prior"
                with self.assertRaises(expected) as failure:
                    deploy.publish(
                        item,
                        call=docker,
                        verify=verify,
                        read=prepared_argument_1,
                        root=root,
                    )
                report = json.loads((root / "last-result.json").read_text())
                self.assertTrue(report["rollback_verified"])
                if mode == "termination":
                    self.assertIs(failure.exception, original)

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
        with tempfile.TemporaryDirectory() as folder:
            prepared_argument_1 = payload()
            prepared_argument_2 = lambda *_: None
            prepared_argument_3 = lambda *_: b"prior"
            prepared_argument_4 = Path(folder)
            with self.assertRaises(ValueError):
                deploy.publish(
                    prepared_argument_1,
                    call=docker,
                    verify=prepared_argument_2,
                    read=prepared_argument_3,
                    root=prepared_argument_4,
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
        with tempfile.TemporaryDirectory() as folder:
            prepared_argument_1 = lambda *_: None
            prepared_argument_2 = lambda *_: b"prior"
            prepared_argument_3 = Path(folder)
            with self.assertRaises(ValueError):
                deploy.publish(
                    item,
                    call=docker,
                    verify=prepared_argument_1,
                    read=prepared_argument_2,
                    root=prepared_argument_3,
                )
        self.assertFalse(any("up" in cmd or "pull" in cmd for cmd in docker.commands))

    def test_previous_bilingual_pages_must_both_be_restored(self):
        docker = Docker()
        calls = []

        def read(path, _content_type=None):
            calls.append(path)
            if path == "/blog-release.json":
                return b"<html>legacy soft404</html>"
            return path.encode()

        with tempfile.TemporaryDirectory() as folder:
            prepared_argument_1 = payload()
            prepared_argument_2 = lambda *_: (_ for _ in ()).throw(
                ValueError("mismatch")
            )
            prepared_argument_3 = Path(folder)
            with self.assertRaises(deploy.PublicationError) as failure:
                deploy.publish(
                    prepared_argument_1,
                    call=docker,
                    verify=prepared_argument_2,
                    read=read,
                    root=prepared_argument_3,
                )
        self.assertTrue(failure.exception.report["rollback_verified"])
        self.assertGreaterEqual(calls.count("/blog"), 2)
        self.assertGreaterEqual(calls.count("/en/blog"), 2)


if __name__ == "__main__":
    unittest.main()
