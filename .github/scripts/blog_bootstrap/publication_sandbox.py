"""DEV publication confinement. Content and publisher execute only after capability drop."""

import ctypes
import hashlib
import json
import os
import pathlib
import re
import select
import shutil
import stat
import subprocess
import sys

PYTHON = "/usr/bin/python3.10"
P = pathlib.Path
ACTOR = 611536
SERVER = 611537


def run(*args, **kw):
    return subprocess.run(args, check=True, **kw)


def digest(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()


def mount(source, target, readonly=False):
    target.parent.mkdir(parents=True, exist_ok=True)
    if source.is_dir():
        target.mkdir(exist_ok=True)
    elif not target.exists():
        target.touch()
    run("mount", "--bind", str(source), str(target))
    if readonly:
        run("mount", "-o", "remount,bind,ro,nosuid,nodev", str(target))


def copy_runtime(root):
    binary = P(PYTHON)
    std = P("/usr/lib/python3.10")
    items = {binary}
    # Stdlib only; no site/dist packages, host /etc, /run or customer mounts.
    for f in std.rglob("*"):
        if (
            f.is_file()
            and not f.is_symlink()
            and not any(
                x in f.parts for x in ["__pycache__", "site-packages", "dist-packages"]
            )
        ):
            items.add(f)
    dynamic = [binary, *std.glob("lib-dynload/*.so")]
    for f in dynamic:
        output = subprocess.run(
            ["ldd", str(f)], capture_output=True, text=True, check=True
        ).stdout
        for name in re.findall(r"(?:=>\s*)?(/[^\s()]+)", output):
            items.update([P(name), P(name).resolve()])
    # Preserve loader path expected by ELF, plus resolved copies for system symlinks.
    items.add(P("/lib64/ld-linux-x86-64.so.2"))
    for f in sorted(items):
        target = root / str(f).lstrip("/")
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(f, target)
        target.chmod(0o555 if f == binary or f.name.startswith("ld-linux") else 0o444)
    return len(items)


def confined(root, uid):
    def preexec():
        os.setsid()
        os.chroot(root)
        os.chdir("/")
        os.umask(0o077)
        lib = ctypes.CDLL(None, use_errno=True)
        for cap in range(64):
            result = lib.prctl(
                24, cap, 0, 0, 0
            )  # PR_CAPBSET_DROP; unsupported cap EINVAL is harmless.
            if result and ctypes.get_errno() != 22:
                raise OSError(ctypes.get_errno(), "cap drop")
        if lib.prctl(38, 1, 0, 0, 0):
            raise OSError("no_new_privs")
        os.setgroups([])
        os.setgid(uid)
        os.setuid(uid)

    return preexec


import ipaddress
import socket

PHASES = {"seed", "import-only", "public-matrix", "recover"}


def validate_base(base):
    assert base.name == "namespace" and base.parent.parent == P("/root")
    assert re.fullmatch("daodao-blog-bootstrap-private-[a-f0-9]{32}", base.parent.name)
    for directory in [base.parent, base]:
        metadata = directory.lstat()
        assert stat.S_ISDIR(metadata.st_mode) and metadata.st_uid == 0
        assert stat.S_IMODE(metadata.st_mode) == 0o700


def child(root):
    assert root.name == "client"
    validate_base(root.parent)
    phase = os.environ["DEV_PHASE"]
    generation = os.environ["DEV_GENERATION_BASE"]
    assert phase in PHASES and re.fullmatch("[0-9]{1,16}", generation)
    waiting = os.environ.get("DEV_WAIT_FOR_SEEDED_A", "false")
    recovery = os.environ.get("DEV_RECOVERY_ID", "")
    assert not recovery or re.fullmatch("[a-f0-9]{64}", recovery)
    confined(root, 611536)()
    os.execve(
        PYTHON,
        [PYTHON, "-I", "-S", "/code/site_client.py"],
        {
            "PATH": "/usr/bin",
            "SSL_CERT_FILE": "/system-ca.pem",
            "DEV_PHASE": phase,
            "DEV_GENERATION_BASE": generation,
            "DEV_WAIT_FOR_SEEDED_A": waiting,
            "DEV_RECOVERY_ID": recovery,
        },
    )


def system_hosts(base):
    addresses = {
        item[4][0]
        for item in socket.getaddrinfo(
            "dev.daodao.so", 443, family=socket.AF_INET, type=socket.SOCK_STREAM
        )
    }
    assert addresses
    entries = [
        str(ipaddress.ip_address(value)) + " dev.daodao.so" for value in addresses
    ]
    hosts = base / "public-hosts"
    hosts.write_text("127.0.0.1 localhost\n" + "\n".join(sorted(entries)) + "\n")
    switch = base / "public-nsswitch"
    switch.write_text("hosts: files\n")
    hosts.chmod(0o444)
    switch.chmod(0o444)
    return hosts, switch


def local_seed_certificate(base):
    key, cert = base / "local-key.pem", base / "local-cert.pem"
    run(
        "openssl",
        "req",
        "-x509",
        "-newkey",
        "rsa:2048",
        "-nodes",
        "-keyout",
        str(key),
        "-out",
        str(cert),
        "-days",
        "1",
        "-subj",
        "/CN=127.0.0.1",
        "-addext",
        "subjectAltName=IP:127.0.0.1",
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    key.chmod(0o400)
    os.chown(key, 611536, 611536)
    cert.chmod(0o444)
    return cert, key


def client_mounts(base, root):
    for directory in [
        "code",
        "proc",
        "dev",
        "evidence",
        "tmp",
        "input",
        "store",
        "etc",
    ]:
        (root / directory).mkdir(exist_ok=True)
    for filename in [
        "code/blog-release.py",
        "code/site_client.py",
        "code/dev_adapter.py",
        "dev/null",
        "dev/urandom",
        "system-ca.pem",
        "local-cert.pem",
        "local-key.pem",
        "etc/hosts",
        "etc/nsswitch.conf",
    ]:
        (root / filename).touch()
    for directory in [root, *(path for path in root.rglob("*") if path.is_dir())]:
        directory.chmod(0o755)
    run("mount", "--bind", str(root), str(root))
    run("mount", "-o", "remount,bind,ro,nosuid,nodev", str(root))
    for name in ["blog-release.py", "site_client.py", "dev_adapter.py"]:
        mount(base / "input" / name, root / "code" / name, True)
    mount(base / "input", root / "input", True)
    mount(P("/srv/daodao-blog-dev-releases"), root / "store")
    mount(base / "result", root / "evidence")
    mount(P("/dev/null"), root / "dev/null")
    mount(P("/dev/urandom"), root / "dev/urandom")
    ca = P("/etc/ssl/certs/ca-certificates.crt").resolve(strict=True)
    assert ca.is_file()
    mount(ca, root / "system-ca.pem", True)
    hosts, switch = system_hosts(base)
    mount(hosts, root / "etc/hosts", True)
    mount(switch, root / "etc/nsswitch.conf", True)
    cert, key = local_seed_certificate(base)
    mount(cert, root / "local-cert.pem", True)
    mount(key, root / "local-key.pem", True)
    run(
        "mount",
        "-t",
        "proc",
        "-o",
        "ro,nosuid,nodev,noexec,hidepid=2",
        "proc",
        str(root / "proc"),
    )
    run(
        "mount",
        "-t",
        "tmpfs",
        "-o",
        "size=64m,mode=0700,uid=611536,gid=611536,nosuid,nodev",
        "tmpfs",
        str(root / "tmp"),
    )


def observe_client(process, root):
    assert select.select([process.stdout], [], [], 30)[0], "client startup timeout"
    ready = json.loads(process.stdout.readline())
    assert ready == {"ready": True, "uid": 611536}
    status = P(f"/proc/{process.pid}/status").read_text()
    fields = {
        key: value
        for line in status.splitlines()
        if ":" in line
        for key, value in [line.split(":", 1)]
    }
    assert set(fields["Uid"].split()) == {"611536"} and set(fields["Gid"].split()) == {
        "611536"
    }
    assert fields["Groups"].strip() == "" and fields["NoNewPrivs"].strip() == "1"
    assert all(
        int(fields[key].strip(), 16) == 0
        for key in ["CapInh", "CapPrm", "CapEff", "CapBnd", "CapAmb"]
    )
    assert os.readlink(f"/proc/{process.pid}/root") == str(root)
    return {
        "uid": 611536,
        "gid": 611536,
        "capabilitiesZero": True,
        "noNewPrivs": True,
        "ownedChrootVerified": True,
        "namespaces": {
            key: os.readlink(f"/proc/{process.pid}/ns/{key}")
            for key in ["mnt", "pid", "net"]
        },
    }


def inside(base):
    assert os.geteuid() == 0
    validate_base(base)
    run("mount", "--make-rprivate", "/")
    run("mount", "-t", "proc", "-o", "nosuid,nodev,noexec", "proc", "/proc")
    root = base / "client"
    root.mkdir()
    copy_runtime(root)
    for name in ["libnss_files.so.2"]:
        library = P("/lib/x86_64-linux-gnu") / name
        if library.exists():
            target = root / str(library).lstrip("/")
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(library, target)
            target.chmod(0o444)
    result = base / "result"
    result.mkdir()
    os.chown(result, 611536, 611536)
    client_mounts(base, root)
    process = subprocess.Popen(
        [sys.executable, "-I", "-S", __file__, "--child"],
        cwd=root,
        env={
            "PATH": "/usr/bin",
            "DEV_PHASE": os.environ["DEV_PHASE"],
            "DEV_GENERATION_BASE": os.environ["DEV_GENERATION_BASE"],
            "DEV_WAIT_FOR_SEEDED_A": os.environ.get("DEV_WAIT_FOR_SEEDED_A", "false"),
            "DEV_RECOVERY_ID": os.environ.get("DEV_RECOVERY_ID", ""),
        },
        close_fds=True,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
    try:
        observer = observe_client(process, root)
        (base / "observer.json").write_text(json.dumps(observer))
        out, errors = process.communicate(input="observed-capless\n", timeout=600)
        descriptor = os.open(
            result / "console.log",
            os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW,
            0o600,
        )
        with os.fdopen(descriptor, "w") as console:
            console.write(out + "\n" + errors)
        assert process.returncode == 0, "capless publication client failed"
    finally:
        if process.poll() is None:
            process.kill()
            process.wait(timeout=5)


if __name__ == "__main__":
    assert len(sys.argv) == 2
    if sys.argv[1] == "--child":
        child(P.cwd())
    else:
        assert sys.argv[1] == "--inside"
        inside(P.cwd())
