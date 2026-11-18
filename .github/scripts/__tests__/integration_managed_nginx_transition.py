"""Exercise managed config upgrade and rollback with real APK Nginx and Compose.

Run explicitly with --image <immutable APK-Nginx image ID>. The image must include
/etc/nginx/http.d (the production Website layout), not official nginx/conf.d.
Only macOS host ownership is modeled; syntax probes, Compose, filesystem writes,
container identities and HTTP responses are real. No existing project is used.
"""

import argparse
import hashlib
import importlib.util
import json
import os
import subprocess
import tempfile
import uuid
from contextlib import ExitStack
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[3]
SPEC = importlib.util.spec_from_file_location(
    "integration_adapter", ROOT / ".github/scripts/blog_bootstrap/dev_adapter.py"
)
ADAPTER = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(ADAPTER)


def run(*args, **kwargs):
    return subprocess.run(*args, capture_output=True, text=True, check=True, **kwargs)


def docker(*args):
    return run(["docker", *args], timeout=120).stdout


def exercise(image):
    image = docker("image", "inspect", image, "--format", "{{.Id}}").strip()
    if not ADAPTER.IMAGE.fullmatch(image):
        raise ValueError("Immutable local image required")
    project = "pr1186-transition-" + uuid.uuid4().hex[:12]
    with tempfile.TemporaryDirectory(prefix="pr1186-transition-") as temporary:
        root = Path(temporary)
        root.chmod(0o755)
        operator, store, legacy = (
            root / part for part in ("operator", "store", "legacy")
        )
        operator.mkdir(mode=0o700)
        store.mkdir(mode=0o755)
        legacy.mkdir()
        (legacy / ".env.dev").write_text("")
        site = store / "releases/a/site"
        site.mkdir(parents=True)
        for directory in (store / "releases", store / "releases/a", site):
            directory.chmod(0o755)
        for filename, body in {
            "en/dev/mock-preview/lighthouse": "Lighthouse preview",
            "zh-TW/dev/mock-preview/lighthouse": "燈塔預覽",
            "zh-TW.html": "Home",
            "404.html": "Missing",
        }.items():
            target = site / filename
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(body)
            target.chmod(0o644)
        (store / "current").symlink_to("releases/a")
        (store / "active.json").write_text('{"id":"unchanged-content"}')
        original_active = (store / "active.json").read_bytes()
        original_pointer = os.readlink(store / "current")
        base = legacy / "docker-compose.yaml"
        base.write_text(
            json.dumps(
                {
                    "name": project,
                    "services": {
                        "dev_website": {
                            "image": image,
                            "pull_policy": "never",
                            "network_mode": "none",
                            "command": ["nginx", "-g", "daemon off;"],
                        }
                    },
                }
            )
        )
        digest = hashlib.sha256(base.read_bytes()).hexdigest()
        previous = b"""server {
    listen 3000;
    root /srv/blog-releases/current/site;
    default_type application/octet-stream;
    location / { try_files $uri =404; }
}
"""
        candidate = (ROOT / "docker/blog-dev/nginx.conf").read_bytes()
        if previous == candidate:
            raise ValueError("This regression requires different old/new Nginx configs")
        commands = []
        original_lstat = Path.lstat

        def owned_lstat(path):
            metadata = original_lstat(path)
            fields = list(metadata)
            fields[4] = 611536 if path == store else 0
            return os.stat_result(fields)

        def execute(command, *, check=False, **kwargs):
            commands.append(command)
            return subprocess.run(command, check=check, **kwargs)

        def inspect(*, allow_stopped=False):
            ids = docker(
                "ps",
                "-aq",
                "--filter",
                "label=com.docker.compose.project=" + project,
                "--filter",
                "label=com.docker.compose.service=dev_website",
            ).split()
            assert len(ids) == 1, ids
            value = json.loads(docker("inspect", ids[0]))[0]
            assert value["Image"] == image
            assert value["HostConfig"]["NetworkMode"] == "none"
            assert allow_stopped or value["State"]["Running"]
            mounts = {(m["Source"], m["Destination"], m["RW"]) for m in value["Mounts"]}
            assert mounts == {
                (str(store), "/srv/blog-releases", False),
                (str(operator / "nginx.conf"), "/etc/nginx/http.d/default.conf", False),
            }, mounts
            return {
                "id": value["Id"],
                "image": image,
                "managedMounts": True,
                "configurationToken": value["Config"]["Labels"].get(
                    ADAPTER.CONFIGURATION_LABEL
                ),
                "registryNamespace": None,
            }

        def request(container):
            result = subprocess.run(
                [
                    "docker",
                    "exec",
                    "-i",
                    container,
                    "nc",
                    "-w",
                    "2",
                    "127.0.0.1",
                    "3000",
                ],
                input="GET /en/dev/mock-preview/lighthouse HTTP/1.0\r\nHost: localhost\r\n\r\n",
                capture_output=True,
                text=True,
                check=True,
                timeout=10,
            )
            headers, body = result.stdout.split("\n\n", 1)
            assert "200 OK" in headers and body == "Lighthouse preview", result.stdout
            return headers.lower()

        patches = [
            patch.object(ADAPTER, key, value)
            for key, value in {
                "OPERATOR": operator,
                "STORE": store,
                "LEGACY": legacy,
                "BASE_COMPOSE": base,
                "OVERLAY": operator / "compose.json",
                "NGINX": operator / "nginx.conf",
                "PROJECT": project,
                "inspect_container": inspect,
            }.items()
        ]
        with ExitStack() as stack:
            for item in patches:
                stack.enter_context(item)
            # The host test user is not root; retain all inode/type/mode validation.
            stack.enter_context(patch.object(Path, "lstat", owned_lstat))
            stack.enter_context(patch.object(os, "geteuid", return_value=0))
            ADAPTER.atomic_owned_write(
                operator / "ownership.json",
                json.dumps(ADAPTER.ownership_marker()).encode(),
            )
            metadata = store.lstat()
            ADAPTER.atomic_owned_write(
                operator / "store-identity.json",
                json.dumps(
                    {
                        "device": metadata.st_dev,
                        "inode": metadata.st_ino,
                        "store": str(store),
                    }
                ).encode(),
            )
            ADAPTER.atomic_owned_write(
                operator / ADAPTER.OWNED_BASE_NAME, base.read_bytes()
            )
            ADAPTER.write_owned_overlay(image, previous)
            try:
                execute(
                    ADAPTER.compose_command(ADAPTER.OVERLAY),
                    check=True,
                    capture_output=True,
                    text=True,
                    timeout=120,
                )
                initial = inspect()
                assert "content-type: application/octet-stream" in request(
                    initial["id"]
                )
                print("PASS old config serves extensionless fixture as octet-stream")
                bad = ADAPTER.prepare_configuration(initial, b"not nginx syntax;")
                before_inode = (operator / "nginx.conf").stat().st_ino
                try:
                    ADAPTER.apply_overlay(
                        bad, digest, b"not nginx syntax;", run=execute
                    )
                except subprocess.CalledProcessError:
                    pass
                else:
                    raise AssertionError("Invalid syntax unexpectedly accepted")
                assert inspect()["id"] == initial["id"]
                assert (operator / "nginx.conf").read_bytes() == previous
                assert (operator / "nginx.conf").stat().st_ino == before_inode
                print(
                    "PASS invalid config rejected by same-image real nginx -t; serving container/file unchanged"
                )
                snapshot = ADAPTER.prepare_configuration(initial, candidate)
                upgraded = ADAPTER.apply_overlay(
                    snapshot, digest, candidate, run=execute
                )
                assert upgraded["id"] != initial["id"]
                assert (operator / "nginx.conf").stat().st_ino != before_inode
                assert "content-type: text/html; charset=utf-8" in request(
                    upgraded["id"]
                )
                assert (
                    upgraded["configurationToken"]
                    == snapshot["configurationTransition"]
                )
                print(
                    "PASS real atomic config replacement + Compose force-recreate serves UTF-8 HTML"
                )
                restored = ADAPTER.restore_previous(snapshot, digest, run=execute)
                assert restored["id"] != upgraded["id"]
                assert "content-type: application/octet-stream" in request(
                    restored["id"]
                )
                assert (operator / "nginx.conf").read_bytes() == previous
                assert restored["configurationToken"] is None
                assert (store / "active.json").read_bytes() == original_active
                assert os.readlink(store / "current") == original_pointer
                assert sum("--force-recreate" in command for command in commands) == 2
                print(
                    "PASS real rollback recreates original config; image and Blog pointer/content identity preserved"
                )
            finally:
                subprocess.run(
                    [
                        "docker",
                        "compose",
                        "--project-name",
                        project,
                        "-f",
                        str(base),
                        "down",
                        "--remove-orphans",
                    ],
                    capture_output=True,
                    text=True,
                    check=False,
                    timeout=120,
                )
                remaining = docker(
                    "ps",
                    "-aq",
                    "--filter",
                    "label=com.docker.compose.project=" + project,
                ).strip()
                assert not remaining, remaining
                print("PASS owned Compose project cleaned")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--image", required=True)
    exercise(parser.parse_args().image)
