"""Dev-only trusted SSH transport for the controller help probe."""

import hashlib
import io
import ipaddress
import json
import os
import shlex
import subprocess
import tarfile
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
CONTROLLER_SHA256 = "4929785774e7799a6b51090ded6542c958b4df1e244db1b7cc9170461e02f962"
ALIAS = "daodao-blog-development"


def digest(data):
    return hashlib.sha256(data).hexdigest()


def check_context(environment):
    required = {
        "GITHUB_REPOSITORY": "daodaoedu/daodao-f2e",
        "GITHUB_EVENT_NAME": "workflow_dispatch",
        "GITHUB_REF": "refs/heads/dev",
    }
    if any(environment.get(key) != value for key, value in required.items()):
        raise ValueError("Only the official development manual workflow may use SSH")


def check_source(environment, call=subprocess.check_output):
    sha = environment["GITHUB_SHA"]
    actual = call(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip()
    current = call(
        [
            "gh",
            "api",
            "repos/daodaoedu/daodao-f2e/git/ref/heads/dev",
            "--jq",
            ".object.sha",
        ],
        text=True,
    ).strip()
    if sha != actual or sha != current:
        raise ValueError(
            "Development source advanced or checkout differs from the workflow source"
        )
    endpoint = (
        "repos/daodaoedu/daodao-f2e/actions/runs?head_sha="
        + sha
        + "&event=push&branch=dev&status=success&per_page=100"
    )
    runs = json.loads(call(["gh", "api", endpoint], text=True))["workflow_runs"]
    if not any(
        run["name"] == "Linode CI"
        and run["head_sha"] == sha
        and run["head_branch"] == "dev"
        and run["event"] == "push"
        and run["conclusion"] == "success"
        for run in runs
    ):
        raise ValueError("The exact development source needs successful push Linode CI")
    return sha


def pack(root=ROOT):
    folder = root / ".github/scripts/blog_bootstrap"
    files = {"blog-release.py": root / "scripts/blog-release.py"}
    files.update({name: folder / name for name in ("sandbox.py", "probe.py")})
    if any(path.is_symlink() or not path.is_file() for path in files.values()):
        raise ValueError("Probe inputs must be regular source files")
    contents = {name: path.read_bytes() for name, path in files.items()}
    if digest(contents["blog-release.py"]) != CONTROLLER_SHA256:
        raise ValueError("Reviewed controller source changed")
    provenance = {
        "controllerSha256": CONTROLLER_SHA256,
        "inputHashes": {name: digest(data) for name, data in contents.items()},
    }
    contents["provenance.json"] = json.dumps(provenance).encode()
    output = io.BytesIO()
    with tarfile.open(fileobj=output, mode="w:gz") as archive:
        for name, data in sorted(contents.items()):
            item = tarfile.TarInfo(name)
            item.size = len(data)
            item.mode = 0o444
            archive.addfile(item, io.BytesIO(data))
    return output.getvalue()


def ssh_arguments(host, key, known_hosts, archive_sha, supervisor):
    ipaddress.ip_address(host)
    if not Path(key).is_file() or Path(key).is_symlink():
        raise ValueError("Existing SSH identity file required")
    command = "/usr/bin/python3 -I -S -c " + shlex.quote(supervisor) + " " + archive_sha
    return [
        "ssh",
        "-F",
        "/dev/null",
        "-i",
        str(key),
        "-o",
        "IdentitiesOnly=yes",
        "-o",
        "BatchMode=yes",
        "-o",
        "ClearAllForwardings=yes",
        "-o",
        "ConnectTimeout=15",
        "-o",
        "StrictHostKeyChecking=yes",
        "-o",
        "HostKeyAlias=" + ALIAS,
        "-o",
        "UserKnownHostsFile=" + str(known_hosts),
        "-o",
        "GlobalKnownHostsFile=/dev/null",
        "root@" + host,
        command,
    ]


def validate_report(report, archive_sha):
    for key in (
        "differentFromHostNamespaces",
        "noSandboxUidProcessesRemain",
        "ownedDirectoryRemoved",
        "namespaceProcessExited",
    ):
        if report.get(key) is not True:
            raise ValueError("Remote isolation or cleanup not verified: " + key)
    if report.get("returnCode") != 0 or report.get("archiveSha256") != archive_sha:
        raise ValueError("Remote invocation failed or input binding differs")
    summary = json.loads(report["payload"]["result/summary.json"])
    if (
        summary.get("controllerSha256") != CONTROLLER_SHA256
        or summary.get("controllerHelpSuccess") is not True
        or summary.get("capabilitiesZero") is not True
    ):
        raise ValueError("Controller help probe not verified")
    observer = json.loads(report["payload"]["attestation/privileged-observer.json"])[
        "client"
    ]
    fields = {
        key: value
        for line in observer["status"].splitlines()
        if ":" in line
        for key, value in [line.split(":", 1)]
    }
    if set(fields["Uid"].split()) != {"611536"} or fields["NoNewPrivs"].strip() != "1":
        raise ValueError(
            "Privileged observer did not verify the dedicated capless process"
        )
    if any(
        int(fields[key].strip(), 16) != 0
        for key in ["CapInh", "CapPrm", "CapEff", "CapBnd", "CapAmb"]
    ):
        raise ValueError("Privileged observer found capabilities")
    summary["privilegedObserver"] = {
        "uid": 611536,
        "capabilitiesZero": True,
        "noNewPrivs": True,
        "namespacesDifferentFromHost": True,
        "ownedChrootVerified": True,
    }
    return summary


def run_ssh(command, archive, invoke=subprocess.run):
    try:
        return invoke(
            command,
            input=archive,
            capture_output=True,
            check=True,
            close_fds=True,
            timeout=340,
        )
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired, OSError):
        raise RuntimeError(
            "Development probe SSH transport failed; no deployment claimed"
        ) from None


def main():
    check_context(os.environ)
    source = check_source(os.environ)
    archive = pack()
    folder = ROOT / ".github/scripts/blog_bootstrap"
    supervisor = folder / "supervisor.py"
    if supervisor.is_symlink():
        raise ValueError("Supervisor must be trusted regular source")
    with tempfile.TemporaryDirectory() as temporary:
        hosts = Path(temporary) / "known_hosts"
        key = (ROOT / ".github/known-hosts/linode-dev.pub").read_text().strip()
        hosts.write_text(ALIAS + " " + key + "\n")
        command = ssh_arguments(
            os.environ["BLOG_SSH_HOST"],
            os.environ["BLOG_SSH_KEY_FILE"],
            hosts,
            digest(archive),
            supervisor.read_text(),
        )
        result = run_ssh(command, archive)
    report = json.loads(result.stdout)
    summary = validate_report(report, digest(archive))
    with tarfile.open(fileobj=io.BytesIO(archive), mode="r:gz") as packed:
        input_hashes = json.load(packed.extractfile("provenance.json"))["inputHashes"]
    summary.update(
        inputHashes=input_hashes,
        supervisorSha256=digest(supervisor.read_bytes()),
        sourceSha=source,
        archiveSha256=digest(archive),
        isolationAndCleanupVerified=True,
    )
    output = Path(os.environ["RUNNER_TEMP"]) / "blog-bootstrap-proof"
    output.mkdir(exist_ok=True)
    (output / "summary.json").write_text(json.dumps(summary, indent=2))
    print(json.dumps(summary))


if __name__ == "__main__":
    main()
