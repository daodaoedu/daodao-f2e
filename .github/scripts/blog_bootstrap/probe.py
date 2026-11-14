"""Runs after privilege removal; no article, manifest or receipt is created."""

import hashlib
import json
import os
import pathlib
import subprocess
import sys
import time

P = pathlib.Path
status = dict(
    line.split(":", 1)
    for line in P("/proc/self/status").read_text().splitlines()
    if ":" in line
)
assert os.getuid() == 611536 and os.getgid() == 611536
assert all(
    int(status[key].strip(), 16) == 0
    for key in ["CapInh", "CapPrm", "CapEff", "CapBnd", "CapAmb"]
)
assert status["NoNewPrivs"].strip() == "1"
assert set(os.environ) <= {"PATH", "LC_CTYPE"}
assert os.getgroups() == []
for location in ["/root", "/etc", "/run", "/var/run/docker.sock"]:
    assert not P(location).exists()
try:
    P("/code/forbidden-write").write_text("no")
except OSError:
    pass
else:
    raise RuntimeError("read-only source mount accepted a write")
import socket

connection = socket.socket()
connection.settimeout(1)
try:
    connection.connect(("192.0.2.1", 9))
except OSError:
    pass
else:
    raise RuntimeError("sandbox unexpectedly has network egress")
finally:
    connection.close()
print(json.dumps({"ready": True, "uid": os.getuid()}), flush=True)
assert sys.stdin.readline().strip() == "observed-capless"
r = subprocess.run(
    [sys.executable, "-I", "-S", "/code/blog-release.py", "--help"],
    capture_output=True,
    text=True,
    check=True,
    timeout=15,
)
assert "prepare" in r.stdout and "rollback" in r.stdout
summary = {
    "ok": True,
    "scope": "development controller help probe only; no build, article approval or deployment",
    "controllerSha256": hashlib.sha256(
        P("/code/blog-release.py").read_bytes()
    ).hexdigest(),
    "uid": os.getuid(),
    "capabilitiesZero": True,
    "noNewPrivs": True,
    "controllerHelpSuccess": True,
}
P("/evidence/summary.json").write_text(json.dumps(summary, indent=2))
print(json.dumps(summary), flush=True)
time.sleep(1)
