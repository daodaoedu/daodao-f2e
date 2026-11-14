"""Fixed root transport for reviewed DEV-only publication; no caller-selected host paths."""

import grp
import hashlib
import importlib.util
import io
import json
import os
import pwd
import re
import shutil
import signal
import stat
import subprocess
import sys
import tarfile
import tempfile
import time
import uuid
from pathlib import Path

MAX_BYTES = 300 * 1024 * 1024
CONTROLLER = "4929785774e7799a6b51090ded6542c958b4df1e244db1b7cc9170461e02f962"
PROVENANCE_NAME = "provenance.json"
RECOVERY_ERRORS = (
    OSError,
    ValueError,
    RuntimeError,
    KeyError,
    TypeError,
    subprocess.SubprocessError,
)
SOURCE_NAMES = {
    "blog-release.py",
    "nginx.conf",
    "base-compose.yaml",
    "publication_sandbox.py",
    "site_client.py",
    "dev_adapter.py",
}


def owned_directory(path, identity=None):
    value = path.lstat()
    if (
        not stat.S_ISDIR(value.st_mode)
        or value.st_uid != 0
        or stat.S_IMODE(value.st_mode) != 0o700
    ):
        raise ValueError("Private root directory invariant failed")
    if identity is not None and (value.st_dev, value.st_ino) != identity:
        raise ValueError("Private directory identity changed")
    return value.st_dev, value.st_ino


def uid_processes():
    result = []
    for path in Path("/proc").iterdir():
        if not path.name.isdigit():
            continue
        try:
            lines = (path / "status").read_text().splitlines()
        except (FileNotFoundError, ProcessLookupError):
            continue
        if any(
            line.startswith("Uid:") and "611536" in line.split()[1:] for line in lines
        ):
            result.append(int(path.name))
    return result


def wait_for_reserved_exit():
    deadline = time.monotonic() + 10
    while uid_processes():
        if time.monotonic() >= deadline:
            raise RuntimeError(
                "Owned sandbox processes did not exit within cleanup budget"
            )
        time.sleep(0.1)


def extract_member(archive, member, incoming, observed):
    name = Path(member.name)
    if (
        not member.isfile()
        or name.is_absolute()
        or ".." in name.parts
        or member.name in observed
    ):
        raise ValueError("Only distinct regular confined archive files accepted")
    if member.name not in SOURCE_NAMES | {
        PROVENANCE_NAME
    } and not member.name.startswith("data/"):
        raise ValueError("Unexpected privileged publication input")
    observed.add(member.name)
    target = incoming / name
    target.parent.mkdir(parents=True, exist_ok=True)
    with (
        archive.extractfile(member) as source,
        target.open("xb") as destination,
    ):
        shutil.copyfileobj(source, destination)
    target.chmod(0o444)


def unpack(data, incoming):
    observed = set()
    with tarfile.open(fileobj=io.BytesIO(data), mode="r:gz") as archive:
        members = archive.getmembers()
        if len(members) > 2010 or sum(member.size for member in members) > MAX_BYTES:
            raise ValueError("Publication archive exceeds bounds")
        for member in members:
            extract_member(archive, member, incoming, observed)
    incoming.chmod(0o755)
    for path in incoming.rglob("*"):
        if path.is_dir():
            path.chmod(0o755)
    config = json.loads((incoming / PROVENANCE_NAME).read_text())
    if observed != set(config["inputHashes"]) | {PROVENANCE_NAME}:
        raise ValueError("Publication archive inventory differs")
    for name, digest in config["inputHashes"].items():
        if hashlib.sha256((incoming / name).read_bytes()).hexdigest() != digest:
            raise ValueError("Publication input hash differs")
    if (
        config["controllerSha256"] != CONTROLLER
        or config["inputHashes"]["blog-release.py"] != CONTROLLER
    ):
        raise ValueError("Unchanged reviewed publisher required")
    if (
        hashlib.sha256((incoming / "data/producer.json").read_bytes()).hexdigest()
        != config["producerSha256"]
    ):
        raise ValueError("Producer binding differs")
    return config


def bounded_json(path):
    value = path.lstat()
    if (
        not stat.S_ISREG(value.st_mode)
        or value.st_nlink != 1
        or value.st_size > 8 * 1024 * 1024
    ):
        raise ValueError("Invalid bounded publication evidence")
    descriptor = os.open(path, os.O_RDONLY | os.O_NOFOLLOW)
    with os.fdopen(descriptor, "rb") as source:
        opened = os.fstat(source.fileno())
        if (opened.st_dev, opened.st_ino) != (value.st_dev, value.st_ino):
            raise ValueError("Evidence identity changed")
        return json.load(source)


def phase(base, config, name, seeded=False, recovery=""):
    if name not in {"seed", "import-only", "public-matrix", "recover"}:
        raise ValueError("Unknown fixed development operation")
    for folder in ["client", "result"]:
        location = base / folder
        if location.exists():
            shutil.rmtree(location)
    process = subprocess.Popen(
        [
            "unshare",
            "--mount",
            "--pid",
            "--fork",
            "--kill-child=SIGKILL",
            "/usr/bin/python3",
            "-I",
            "-S",
            str(base / "input/publication_sandbox.py"),
            "--inside",
        ],
        cwd=base,
        env={
            "PATH": "/usr/sbin:/usr/bin:/sbin:/bin",
            "DEV_PHASE": name,
            "DEV_GENERATION_BASE": str(config["generationBase"]),
            "DEV_WAIT_FOR_SEEDED_A": str(seeded).lower(),
            "DEV_RECOVERY_ID": recovery,
        },
        stdin=subprocess.DEVNULL,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        close_fds=True,
        start_new_session=True,
    )
    try:
        process.communicate(
            timeout={
                "seed": 180,
                "import-only": 300,
                "public-matrix": 660,
                "recover": 360,
            }[name]
        )
        if process.returncode:
            raise RuntimeError("Capless development publication phase failed: " + name)
    finally:
        if process.poll() is None:
            os.killpg(process.pid, signal.SIGKILL)
            process.wait(timeout=10)
    observer = bounded_json(base / "observer.json")
    host = {key: os.readlink("/proc/self/ns/" + key) for key in ["mnt", "pid", "net"]}
    if (
        not all(observer["namespaces"][key] != host[key] for key in ["mnt", "pid"])
        or observer["namespaces"]["net"] != host["net"]
    ):
        raise ValueError("Expected isolated mounts/PID and intentional host networking")
    if observer["uid"] != 611536 or not all(
        observer[key] is True
        for key in ["capabilitiesZero", "noNewPrivs", "ownedChrootVerified"]
    ):
        raise ValueError("Privileged capless observer invariant failed")
    proof_names = [
        "verified-managed-preimage",
        "public-a-all-files",
        "public-b-all-files",
        "public-a-rollback-all-files",
        "supervised-recovery-all-files",
    ]
    readbacks = {}
    for label in proof_names:
        path = base / "result" / (label + ".json")
        if path.exists():
            readbacks[label] = bounded_json(path)
    return {
        "summary": bounded_json(base / "result/summary.json"),
        "observer": observer,
        "readbacks": readbacks,
    }


def publish(base, config):
    source = base / "input/dev_adapter.py"
    spec = importlib.util.spec_from_file_location("reviewed_dev_adapter", source)
    adapter = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(adapter)
    return execute_adapter(adapter, base, config)


def recover_snapshot(adapter, base, config, snapshot, initial, mounting):
    key = "previousId" if snapshot["managedMounts"] else "id"
    previous = initial["summary"][key]
    if not re.fullmatch("[a-f0-9]{64}", previous):
        raise ValueError("Verified recovery identity missing")
    recovery = {"localRecoveryVerified": False, "publicRecoveryVerified": False}
    restored_container = snapshot["managedMounts"]
    try:
        recovered = phase(base, config, "recover", recovery=previous)
        recovery = recovered["summary"]
    except RECOVERY_ERRORS:
        recovery["stage"] = "capless-recovery-failed"
    finally:
        if mounting and not snapshot["managedMounts"]:
            try:
                adapter.restore_previous(snapshot, config["baseComposeSha256"])
                restored_container = True
            except RECOVERY_ERRORS:
                recovery["legacyRestoreFailed"] = True
    state = {
        **snapshot,
        "recovery": recovery,
        "legacyContainerRestored": restored_container
        if not snapshot["managedMounts"]
        else None,
    }
    completed = recovery.get("localRecoveryVerified") is True and restored_container
    adapter.record_journal(
        state, config["producerSha256"], "restored" if completed else "recovery-failed"
    )


def execute_adapter(adapter, base, config):
    snapshot = {**adapter.inspect_container(), "ownedOperationParent": str(base.parent)}
    adoption = adapter.classify_adoption(snapshot)
    adapter.verify_base_compose(config["baseComposeSha256"])
    adapter.establish_store()
    adapter.record_journal(snapshot, config["producerSha256"], "prepared")
    initial = phase(
        base, config, "import-only" if snapshot["managedMounts"] else "seed"
    )
    verified_key = "verifiedPreimage" if snapshot["managedMounts"] else "verifiedSeed"
    snapshot = {**snapshot, verified_key: initial["summary"]}
    adapter.record_journal(snapshot, config["producerSha256"], "seeded")
    mounting = False
    try:
        mounting = True
        adapter.record_journal(snapshot, config["producerSha256"], "mounting")
        adapter.apply_overlay(
            snapshot,
            config["baseComposeSha256"],
            (base / "input/nginx.conf").read_bytes(),
        )
        actual = phase(
            base, config, "public-matrix", seeded=not snapshot["managedMounts"]
        )
        adapter.record_journal(snapshot, config["producerSha256"], "public-verified")
        return {
            "ok": True,
            "adoption": adoption,
            "initial": initial,
            "public": actual,
            "persistentStoreRetained": True,
        }
    except BaseException:
        for number in [signal.SIGHUP, signal.SIGTERM, signal.SIGINT]:
            signal.signal(number, signal.SIG_IGN)
        wait_for_reserved_exit()
        recover_snapshot(adapter, base, config, snapshot, initial, mounting)
        raise


def interrupted(signum, _frame):
    raise SystemExit(128 + signum)


def main():
    os.umask(0o077)
    if (
        os.geteuid() != 0
        or len(sys.argv) != 2
        or not re.fullmatch("[a-f0-9]{64}", sys.argv[1])
    ):
        raise ValueError("Fixed digest-pinned root transport required")
    for lookup in [pwd.getpwuid, grp.getgrgid]:
        try:
            lookup(611536)
        except KeyError:
            pass
        else:
            raise ValueError("Reserved sandbox UID/GID is allocated")
    if uid_processes():
        raise ValueError("Reserved sandbox UID is already active")
    for number in [signal.SIGHUP, signal.SIGTERM, signal.SIGINT]:
        signal.signal(number, interrupted)
    data = sys.stdin.buffer.read(MAX_BYTES + 1)
    if len(data) > MAX_BYTES or hashlib.sha256(data).hexdigest() != sys.argv[1]:
        raise ValueError("Transport digest differs")
    anchor = Path("/root")
    metadata = anchor.lstat()
    if (
        not stat.S_ISDIR(metadata.st_mode)
        or metadata.st_uid != 0
        or metadata.st_mode & 0o022
    ):
        raise ValueError("Protected root anchor required")
    parent = Path(tempfile.mkdtemp(prefix="daodao-blog-bootstrap-private-", dir=anchor))
    parent.chmod(0o700)
    unique = parent.with_name("daodao-blog-bootstrap-private-" + uuid.uuid4().hex)
    parent.rename(unique)
    parent = unique
    parent_identity = owned_directory(parent)
    base = parent / "namespace"
    base.mkdir(mode=0o700)
    identity = owned_directory(base)
    report = {}
    try:
        incoming = base / "input"
        incoming.mkdir(mode=0o700)
        config = unpack(data, incoming)
        report = publish(base, config)
    finally:
        for number in [signal.SIGHUP, signal.SIGTERM, signal.SIGINT]:
            signal.signal(number, signal.SIG_IGN)
        wait_for_reserved_exit()
        owned_directory(parent, parent_identity)
        owned_directory(base, identity)
        shutil.rmtree(parent)
        report["temporaryCleanupVerified"] = not parent.exists()
    report["archiveSha256"] = sys.argv[1]
    print(json.dumps(report))


if __name__ == "__main__":
    main()
