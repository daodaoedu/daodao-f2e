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
import subprocess
import sys
import tarfile
import tempfile

P = pathlib.Path


def interrupted(signum, frame):
    raise SystemExit(128 + signum)


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
base = P(tempfile.mkdtemp(prefix="daodao-blog-cloud-test-", dir="/var/tmp"))
base.chmod(0o700)
# mkdtemp uses short random name; rename to fixed full UUID-shaped ownership token before any child launch.
import uuid

unique = base.with_name("daodao-blog-cloud-test-" + uuid.uuid4().hex)
base.rename(unique)
base = unique
identity = (base.stat().st_dev, base.stat().st_ino)
host_ns = {key: os.readlink("/proc/self/ns/" + key) for key in ["mnt", "net", "pid"]}
child = None
report = {
    "hostNamespaces": host_ns,
    "scope": "remote TESTONLY owned ephemeral mechanics",
    "ownedPath": str(base),
    "archiveSha256": sys.argv[1],
}
try:
    incoming = base / "input"
    incoming.mkdir()
    with tarfile.open(fileobj=io.BytesIO(archive), mode="r:gz") as tar:
        members = tar.getmembers()
        assert len(members) < 2000 and sum(m.size for m in members) < 300 * 1024 * 1024
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
            str(base),
        ],
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
    assert (
        base.parent == P("/var/tmp")
        and re.fullmatch("daodao-blog-cloud-test-[a-f0-9]{32}", base.name)
        and not base.is_symlink()
        and base.stat().st_uid == 0
        and (base.stat().st_dev, base.stat().st_ino) == identity
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
    shutil.rmtree(base)
    report["ownedDirectoryRemoved"] = not base.exists()
    report["namespaceProcessExited"] = child is None or child.poll() is not None
print(json.dumps(report))
if report.get("returnCode") != 0:
    sys.exit(1)
