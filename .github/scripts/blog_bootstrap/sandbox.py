"""ROOT BOOTSTRAP, TEST ONLY. Never import content or controller before confinement."""

import ctypes
import hashlib
import json
import os
import pathlib
import re
import select
import shutil
import subprocess
import sys

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
    binary = P("/usr/bin/python3.10")
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
        os.umask(0o022)
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


if len(sys.argv) == 3 and sys.argv[1] == "--child":
    child_root = P(sys.argv[2])
    assert child_root.name == "client" and child_root.parent.parent == P("/var/tmp")
    assert re.fullmatch("daodao-blog-cloud-test-[a-f0-9]{32}", child_root.parent.name)
    confined(child_root, 611536)()
    os.execve(
        "/usr/bin/python3.10",
        ["/usr/bin/python3.10", "-I", "-S", "/code/probe.py"],
        {"PATH": "/usr/bin"},
    )
assert len(sys.argv) == 3 and sys.argv[1] == "--inside"
base = P(sys.argv[2])
assert base.parent == P("/var/tmp") and re.fullmatch(
    "daodao-blog-cloud-test-[a-f0-9]{32}", base.name
)
run("mount", "--make-rprivate", "/")
run("mount", "-t", "proc", "-o", "nosuid,nodev,noexec", "proc", "/proc")
run("ip", "link", "set", "lo", "up")
assert not subprocess.check_output(["ip", "route", "show"], text=True).strip()
root = base / "client"
root.mkdir()
copy_runtime(root)
result = base / "result"
result.mkdir()
os.chown(result, 611536, 611536)
attestation = base / "attestation"
attestation.mkdir(mode=0o700)
for name in ["code", "proc", "dev", "evidence", "tmp"]:
    (root / name).mkdir(exist_ok=True)
for name in ["code/blog-release.py", "code/probe.py", "dev/null"]:
    (root / name).touch()
run("mount", "--bind", str(root), str(root))
run("mount", "-o", "remount,bind,ro,nosuid,nodev", str(root))
mount(base / "input/blog-release.py", root / "code/blog-release.py", True)
mount(base / "input/probe.py", root / "code/probe.py", True)
mount(result, root / "evidence")
mount(P("/dev/null"), root / "dev/null")
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
    "size=16m,mode=0700,uid=611536,gid=611536,nosuid,nodev",
    "tmpfs",
    str(root / "tmp"),
)
child = subprocess.Popen(
    [sys.executable, "-I", "-S", __file__, "--child", str(root)],
    env={"PATH": "/usr/bin"},
    close_fds=True,
    stdin=subprocess.PIPE,
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True,
)
try:
    assert select.select([child.stdout], [], [], 30)[0], "probe startup timeout"
    first_line = child.stdout.readline()
    assert json.loads(first_line) == {"ready": True, "uid": 611536}
    status = P(f"/proc/{child.pid}/status").read_text()
    fields = dict(line.split(":", 1) for line in status.splitlines() if ":" in line)
    assert set(fields["Uid"].split()) == {"611536"}
    assert set(fields["Gid"].split()) == {"611536"}
    assert fields["Groups"].strip() == ""
    assert fields["NoNewPrivs"].strip() == "1"
    assert all(
        int(fields[key].strip(), 16) == 0
        for key in ["CapInh", "CapPrm", "CapEff", "CapBnd", "CapAmb"]
    )
    assert os.readlink(f"/proc/{child.pid}/root") == str(root)
    observer = {
        "client": {
            "status": status,
            "root": os.readlink(f"/proc/{child.pid}/root"),
            "namespaces": {
                key: os.readlink(f"/proc/{child.pid}/ns/{key}")
                for key in ["net", "mnt", "pid"]
            },
        }
    }
    (attestation / "privileged-observer.json").write_text(json.dumps(observer))
    out, err = child.communicate(input="observed-capless\n", timeout=30)
    (result / "console.log").write_text(first_line + out + "\n" + err)
    assert child.returncode == 0
finally:
    if child.poll() is None:
        child.kill()
        child.wait(timeout=5)
