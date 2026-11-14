"""Reviewed root-only transport/bootstrap; receives a digest-pinned regular-file archive."""

import grp
import hashlib
import io
import json
import os
import pathlib
import pwd
import re
import shutil
import signal
import stat
import subprocess
import sys
import tarfile
import tempfile

P = pathlib.Path


def interrupted(signum, frame):
    raise SystemExit(128 + signum)


def validate_directory(metadata, private=False, expected_identity=None):
    if not stat.S_ISDIR(metadata.st_mode) or metadata.st_uid != 0:
        raise ValueError("Owned directory must be a regular root-owned directory")
    permissions = stat.S_IMODE(metadata.st_mode)
    if permissions & 0o022 or (private and permissions != 0o700):
        raise ValueError("Owned directory permissions are unsafe")
    if (
        expected_identity is not None
        and (metadata.st_dev, metadata.st_ino) != expected_identity
    ):
        raise ValueError("Owned directory identity changed")


if __name__ == "__main__":
    for signum in [signal.SIGTERM, signal.SIGHUP, signal.SIGINT]:
        signal.signal(signum, interrupted)
    assert (
        os.geteuid() == 0
        and len(sys.argv) == 2
        and re.fullmatch("[a-f0-9]{64}", sys.argv[1])
    )
    for uid in [611536, 611537]:
        for lookup in [pwd.getpwuid, grp.getgrgid]:
            try:
                lookup(uid)
            except KeyError:
                pass
            else:
                raise RuntimeError("test UID/GID already allocated")
    for proc in P("/proc").iterdir():
        if not proc.name.isdigit():
            continue
        try:
            status = (proc / "status").read_text()
        except (FileNotFoundError, ProcessLookupError):
            continue
        for line in status.splitlines():
            if line.startswith(("Uid:", "Gid:")):
                assert not set(map(int, line.split()[1:])) & {611536, 611537}, (
                    "test UID/GID in use"
                )
    archive = sys.stdin.buffer.read(300 * 1024 * 1024 + 1)
    assert (
        len(archive) <= 300 * 1024 * 1024
        and hashlib.sha256(archive).hexdigest() == sys.argv[1]
    )
    anchor = P("/root")
    anchor_metadata = anchor.lstat()
    validate_directory(anchor_metadata)
    private_parent = P(
        tempfile.mkdtemp(prefix="daodao-blog-bootstrap-private-", dir=anchor)
    )
    private_parent.chmod(0o700)
    import uuid

    unique = private_parent.with_name(
        "daodao-blog-bootstrap-private-" + uuid.uuid4().hex
    )
    private_parent.rename(unique)
    private_parent = unique
    parent_identity = (private_parent.stat().st_dev, private_parent.stat().st_ino)
    base = private_parent / "namespace"
    base.mkdir(mode=0o700)
    identity = (base.stat().st_dev, base.stat().st_ino)
    host_ns = {
        key: os.readlink("/proc/self/ns/" + key) for key in ["mnt", "net", "pid"]
    }
    child = None
    report = {
        "hostNamespaces": host_ns,
        "scope": "remote TESTONLY owned ephemeral mechanics",
        "ownedPath": str(base),
        "ownedParentPath": str(private_parent),
        "archiveSha256": sys.argv[1],
    }
    try:
        incoming = base / "input"
        incoming.mkdir()
        with tarfile.open(fileobj=io.BytesIO(archive), mode="r:gz") as tar:
            members = tar.getmembers()
            assert (
                len(members) < 2000 and sum(m.size for m in members) < 300 * 1024 * 1024
            )
            seen = set()
            for m in members:
                parts = P(m.name).parts
                assert (
                    m.isfile()
                    and not m.issym()
                    and not m.islnk()
                    and not P(m.name).is_absolute()
                    and ".." not in parts
                    and m.name not in seen
                    and len(parts) > 0
                )
                seen.add(m.name)
                target = incoming / m.name
                target.parent.mkdir(parents=True, exist_ok=True)
                with tar.extractfile(m) as source, target.open("xb") as output:
                    shutil.copyfileobj(source, output)
                target.chmod(0o444)
        config = json.loads((incoming / "provenance.json").read_text())
        expected = set(config["inputHashes"]) | {"provenance.json"}
        assert seen == expected
        for name, digest in config["inputHashes"].items():
            assert hashlib.sha256((incoming / name).read_bytes()).hexdigest() == digest
        assert (
            hashlib.sha256((incoming / "blog-release.py").read_bytes()).hexdigest()
            == config["controllerSha256"]
        )
        child = subprocess.Popen(
            [
                "unshare",
                "--mount",
                "--net",
                "--pid",
                "--fork",
                "--kill-child=SIGKILL",
                "/usr/bin/python3",
                "-I",
                "-S",
                str(incoming / "sandbox.py"),
                "--inside",
            ],
            cwd=base,
            env={"PATH": "/usr/sbin:/usr/bin:/sbin:/bin"},
            close_fds=True,
            stdin=subprocess.DEVNULL,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            start_new_session=True,
            text=True,
        )
        try:
            stdout, stderr = child.communicate(timeout=300)
        except subprocess.TimeoutExpired:
            os.killpg(child.pid, signal.SIGKILL)
            stdout, stderr = child.communicate(timeout=5)
            raise
        report.update(returnCode=child.returncode, stdout=stdout, stderr=stderr)
        payload = {}
        for folder in ["result", "attestation"]:
            location = base / folder
            if location.exists():
                for f in location.iterdir():
                    if (
                        f.is_file()
                        and not f.is_symlink()
                        and f.suffix in [".json", ".log"]
                        and f.stat().st_size < 4 * 1024 * 1024
                    ):
                        payload[folder + "/" + f.name] = f.read_text()
        report["payload"] = payload
        if "attestation/privileged-observer.json" in payload:
            observer = json.loads(payload["attestation/privileged-observer.json"])
            for role in ["client"]:
                assert all(
                    observer[role]["namespaces"][key] != host_ns[key] for key in host_ns
                ), "host namespace escaped"
            report["differentFromHostNamespaces"] = True
        report["caSha256"] = (
            hashlib.sha256((base / "test-ca.pem").read_bytes()).hexdigest()
            if (base / "test-ca.pem").exists()
            else None
        )
    finally:
        for signum in [signal.SIGTERM, signal.SIGHUP, signal.SIGINT]:
            signal.signal(signum, signal.SIG_IGN)
        if child is not None and child.poll() is None:
            os.killpg(child.pid, signal.SIGKILL)
            child.wait(timeout=5)
        assert private_parent.parent == anchor and re.fullmatch(
            "daodao-blog-bootstrap-private-[a-f0-9]{32}", private_parent.name
        )
        assert base.parent == private_parent and base.name == "namespace"
        for location, expected_identity in [
            (private_parent, parent_identity),
            (base, identity),
        ]:
            metadata = location.lstat()
            validate_directory(
                metadata, private=True, expected_identity=expected_identity
            )
        remaining = []
        for proc in P("/proc").iterdir():
            if not proc.name.isdigit():
                continue
            try:
                status = (proc / "status").read_text()
            except (FileNotFoundError, ProcessLookupError):
                continue
            for line in status.splitlines():
                if line.startswith("Uid:") and set(map(int, line.split()[1:])) & {
                    611536,
                    611537,
                }:
                    remaining.append(int(proc.name))
        assert not remaining, "sandbox UID process survived namespace exit"
        report["noSandboxUidProcessesRemain"] = True
        assert {key: os.readlink("/proc/self/ns/" + key) for key in host_ns} == host_ns
        shutil.rmtree(private_parent)
        report["ownedDirectoryRemoved"] = (
            not private_parent.exists() and not base.exists()
        )
        report["namespaceProcessExited"] = child is None or child.poll() is not None
    print(json.dumps(report))
    if report.get("returnCode") != 0:
        sys.exit(1)
