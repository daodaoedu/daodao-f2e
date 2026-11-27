"""Fresh-checkout, data-only manual development publication transport."""

import argparse
import hashlib
import importlib.util
import io
import json
import os
import re
import stat
import subprocess
import sys
import tarfile
import tempfile
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
SHA = re.compile(r"^[a-f0-9]{64}$")
COMMIT = re.compile(r"^[a-f0-9]{40}$")
MAX_BYTES = 300 * 1024 * 1024


def module(name):
    path = ROOT / ".github/scripts/blog_bootstrap" / (name + ".py")
    spec = importlib.util.spec_from_file_location("development_" + name, path)
    result = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(result)
    return result


def generation_base(run_id, attempt):
    if not re.fullmatch(r"[1-9]\d{0,11}", run_id, flags=re.ASCII) or not re.fullmatch(
        r"[1-9]\d?", attempt, flags=re.ASCII
    ):
        raise ValueError("Actual workflow run ID/attempt required")
    result = int(run_id) * 10000 + int(attempt) * 100
    if result + 99 >= 2**53:
        raise ValueError("Generation is outside exact JSON integer range")
    return result


def regular_bytes(path, limit=MAX_BYTES):
    metadata = path.lstat()
    if (
        not stat.S_ISREG(metadata.st_mode)
        or metadata.st_nlink != 1
        or metadata.st_size > limit
    ):
        raise ValueError("Only bounded regular non-linked transfer files are accepted")
    descriptor = os.open(path, os.O_RDONLY | os.O_NOFOLLOW)
    with os.fdopen(descriptor, "rb") as source:
        opened = os.fstat(source.fileno())
        if (opened.st_dev, opened.st_ino) != (metadata.st_dev, metadata.st_ino):
            raise ValueError("Transfer file identity changed")
        data = source.read(limit + 1)
        if len(data) > limit:
            raise ValueError("Transfer grew beyond bounds")
        return data


def preflight_transfer(data_root):
    if data_root.is_symlink() or not data_root.is_dir():
        raise ValueError("Transfer root must be an owned regular directory")
    observed = set()
    total = 0
    for path in data_root.rglob("*"):
        metadata = path.lstat()
        if stat.S_ISDIR(metadata.st_mode):
            continue
        if not stat.S_ISREG(metadata.st_mode) or metadata.st_nlink != 1:
            raise ValueError(
                "Transfer cannot contain symlinks, hardlinks or special files"
            )
        total += metadata.st_size
        observed.add(str(path.relative_to(data_root)))
        if total > MAX_BYTES or len(observed) > 2000:
            raise ValueError("Transfer exceeds data-only bounds")
    return observed


def validate_artifact_identity(item, index, source_sha, expected_content):
    if item.get("kind") != ["official-A", "synthetic-TEST-ONLY-B"][index]:
        raise ValueError("Official/synthetic provenance labels differ")
    if not SHA.fullmatch(item.get("id", "")) or not SHA.fullmatch(
        item.get("manifestSha256", "")
    ):
        raise ValueError("Pinned artifact identity required")
    if (
        item.get("frontendSha") != source_sha
        or item.get("contentSha") != expected_content[index]
    ):
        raise ValueError("Artifact source pair differs from producer")


def producer_mode(producer):
    mode = producer.get("mode", "test")
    if mode not in ("test", "refresh"):
        raise ValueError("Unknown development publication mode")
    return mode


def validate_refresh_producer(producer, source_sha):
    if "syntheticContentSha" in producer or not COMMIT.fullmatch(
        producer.get("officialContentSha", "")
    ):
        raise ValueError("Frontend refresh carries only the official content source")
    items = producer.get("artifacts", [])
    if len(items) != 1:
        raise ValueError("Frontend refresh requires exactly one official artifact")
    validate_artifact_identity(
        items[0], 0, source_sha, [producer["officialContentSha"]]
    )
    return producer


def validate_producer(data, expected_sha, source_sha, mode="test"):
    if (
        not SHA.fullmatch(expected_sha)
        or hashlib.sha256(data).hexdigest() != expected_sha
    ):
        raise ValueError("Preparation producer does not match independent job output")
    producer = json.loads(data)
    if (
        producer.get("schema") != 1
        or producer.get("frontendSha") != source_sha
        or producer.get("officialBytesUnchanged") is not True
    ):
        raise ValueError("Preparation source/provenance differs")
    if producer_mode(producer) != mode:
        raise ValueError("Preparation mode differs from the requested operation")
    if mode == "refresh":
        return validate_refresh_producer(producer, source_sha)
    if not COMMIT.fullmatch(
        producer.get("officialContentSha", "")
    ) or not COMMIT.fullmatch(producer.get("syntheticContentSha", "")):
        raise ValueError("Immutable content source pairs required")
    if producer["officialContentSha"] == producer["syntheticContentSha"]:
        raise ValueError("Synthetic B must have a distinct content commit")
    items = producer.get("artifacts", [])
    if len(items) != 2 or items[0].get("id") == items[1].get("id"):
        raise ValueError("Distinct official A and synthetic B required")
    expected_content = [producer["officialContentSha"], producer["syntheticContentSha"]]
    for index, item in enumerate(items):
        validate_artifact_identity(item, index, source_sha, expected_content)
    return producer


def verify_transfer(data_root, expected_sha, source_sha, mode="test"):
    observed = preflight_transfer(data_root)
    producer = validate_producer(
        regular_bytes(data_root / "producer.json", 1024 * 1024),
        expected_sha,
        source_sha,
        mode,
    )
    expected = {"producer.json"}
    for item in producer["artifacts"]:
        root = data_root / "artifacts" / item["id"]
        raw = regular_bytes(root / "release.json", 2 * 1024 * 1024)
        if hashlib.sha256(raw).hexdigest() != item["manifestSha256"]:
            raise ValueError("Received manifest differs from pinned producer")
        manifest = json.loads(raw)
        if (
            manifest.get("id") != item["id"]
            or manifest.get("frontend_sha") != source_sha
            or manifest.get("content_sha") != item["contentSha"]
            or manifest.get("inputs", {}).get("runner_hash")
            != module("runner").CONTROLLER_SHA256
        ):
            raise ValueError("Received manifest source identity differs")
        expected.add("artifacts/" + item["id"] + "/release.json")
        with tempfile.TemporaryDirectory(prefix="dev-verify-") as temporary:
            result = subprocess.run(
                [
                    sys.executable,
                    str(ROOT / "scripts/blog-release.py"),
                    "import",
                    "--store",
                    str(Path(temporary) / "store"),
                    "--artifact",
                    str(root),
                    "--manifest-sha256",
                    item["manifestSha256"],
                ],
                capture_output=True,
                check=False,
                timeout=120,
            )
            if result.returncode != 0:
                raise ValueError("Unchanged controller rejected transferred artifact")
        for name in manifest["files"]:
            relative = Path(name)
            if relative.is_absolute() or ".." in relative.parts:
                raise ValueError("Escaping artifact path")
            expected.add("artifacts/" + item["id"] + "/site/" + name)
    if observed != expected:
        raise ValueError("Transfer contains extra or private files")
    return producer


def drain_existing_cd(call=subprocess.check_output, pause=time.sleep):
    prefix = "repos/daodaoedu/daodao-f2e/actions/workflows/linode-cd.yml/runs"
    active = set()
    for status in ["waiting", "requested", "pending", "queued", "in_progress"]:
        pages = json.loads(
            call(
                [
                    "gh",
                    "api",
                    "--paginate",
                    "--slurp",
                    prefix + "?status=" + status + "&per_page=100",
                ],
                text=True,
            )
        )
        for page in pages:
            active.update(
                run["id"]
                for run in page["workflow_runs"]
                if run["status"] != "completed"
            )
    for _attempt in range(60):
        if not active:
            return
        pause(3)
        completed = set()
        for identifier in active:
            run = json.loads(
                call(
                    [
                        "gh",
                        "api",
                        "repos/daodaoedu/daodao-f2e/actions/runs/" + str(identifier),
                    ],
                    text=True,
                )
            )
            if run["id"] != identifier:
                raise ValueError("Legacy CD identity changed; no host mutation")
            if run["status"] == "completed":
                completed.add(identifier)
        active -= completed
    raise ValueError("Preexisting legacy CD is still active; no host mutation")


HISTORY_LIMIT = 200
BLOB = re.compile(r"^[a-f0-9]{40}$")


def reviewed_compose_history(head_bytes, call=subprocess.run):
    """sha256 of every docker-compose.yaml version reachable from the trusted checkout.

    The host may replace its saved managed base only when the saved copy is one of
    these reviewed versions. Without history only the head is accepted (fail closed).
    """
    digests = {hashlib.sha256(head_bytes).hexdigest()}

    def git(*arguments):
        return call(
            ["git", "-C", str(ROOT), *arguments],
            check=True,
            capture_output=True,
            timeout=120,
        ).stdout

    try:
        if git("rev-parse", "--is-shallow-repository").strip() == b"true":
            raise ValueError("shallow checkout")
        log = git(
            "log",
            "--full-history",
            "--format=",
            "--raw",
            "--no-abbrev",
            "-n",
            str(HISTORY_LIMIT),
            "HEAD",
            "--",
            "docker-compose.yaml",
        ).decode()
        blobs = set()
        for line in log.splitlines():
            fields = line.split("\t", 1)[0].split()
            blobs.update(
                item
                for item in fields[2:4]
                if BLOB.fullmatch(item) and set(item) != {"0"}
            )
        for blob in sorted(blobs):
            digests.add(hashlib.sha256(git("cat-file", "blob", blob)).hexdigest())
    except (
        subprocess.CalledProcessError,
        subprocess.TimeoutExpired,
        OSError,
        ValueError,
    ):
        print(
            "Reviewed compose history unavailable; only the reviewed head compose is accepted",
            file=sys.stderr,
        )
        return [hashlib.sha256(head_bytes).hexdigest()]
    return sorted(digests)


def package(data_root, producer_sha, generation, history=reviewed_compose_history):
    names = ["publication_sandbox.py", "site_client.py", "dev_adapter.py"]
    files = {
        "blog-release.py": ROOT / "scripts/blog-release.py",
        "nginx.conf": ROOT / "docker/blog-dev/nginx.conf",
        "base-compose.yaml": ROOT / "docker-compose.yaml",
    }
    files.update(
        {name: ROOT / ".github/scripts/blog_bootstrap" / name for name in names}
    )
    contents = {name: regular_bytes(path) for name, path in files.items()}
    contents.update(
        {
            "data/" + str(path.relative_to(data_root)): regular_bytes(path)
            for path in data_root.rglob("*")
            if path.is_file()
        }
    )
    provenance = {
        "schema": 1,
        "controllerSha256": module("runner").CONTROLLER_SHA256,
        "producerSha256": producer_sha,
        "generationBase": generation,
        "baseComposeSha256": hashlib.sha256(contents["base-compose.yaml"]).hexdigest(),
        "reviewedBaseComposeSha256s": history(contents["base-compose.yaml"]),
        "inputHashes": {
            name: hashlib.sha256(data).hexdigest() for name, data in contents.items()
        },
    }
    contents["provenance.json"] = json.dumps(provenance, sort_keys=True).encode()
    stream = io.BytesIO()
    with tarfile.open(fileobj=stream, mode="w:gz") as archive:
        for name, data in sorted(contents.items()):
            item = tarfile.TarInfo(name)
            item.size = len(data)
            item.mode = 0o444
            archive.addfile(item, io.BytesIO(data))
    return stream.getvalue(), provenance


REMOTE_ERROR = re.compile(
    r"^([A-Za-z_][A-Za-z0-9_.]{0,80}(?:Error|Exception|Exit|Interrupt)):?(?: (.*))?$"
)
SAFE_MESSAGE = re.compile(r"^[A-Za-z0-9 ;:,._()'/-]{1,240}$")


def remote_failure_summary(error):
    """Bounded host-side failure class/message; never echoes raw stderr."""
    if isinstance(error, subprocess.TimeoutExpired):
        return "SSH transport timed out"
    if isinstance(error, OSError):
        return "SSH transport could not start (" + type(error).__name__ + ")"
    stderr = error.stderr or b""
    if isinstance(stderr, bytes):
        stderr = stderr.decode("utf-8", "replace")
    lines = [line.strip() for line in stderr.splitlines() if line.strip()]
    for line in reversed(lines[-20:]):
        match = REMOTE_ERROR.fullmatch(line)
        if match:
            name, message = match.group(1), (match.group(2) or "").strip()
            # Fixed adapter messages pass; anything else (paths, hex, tokens) is withheld.
            if (
                message
                and SAFE_MESSAGE.fullmatch(message)
                and not re.search(r"[A-Za-z0-9+/=_-]{32,}", message)
            ):
                return "remote " + name + ": " + message
            return "remote " + name + " (message withheld)"
    return "exit status " + str(error.returncode) + "; no recognizable remote error"


def publication_ssh(command, archive):
    try:
        return subprocess.run(
            command,
            input=archive,
            capture_output=True,
            check=True,
            close_fds=True,
            timeout=1500,
        )
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired, OSError) as error:
        raise RuntimeError(
            "Development publication SSH failed ("
            + remote_failure_summary(error)
            + "); no successful publication claimed"
        ) from None


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data-dir", required=True)
    parser.add_argument("--producer-sha", required=True)
    parser.add_argument("--verify-only", action="store_true")
    parser.add_argument("--mode", choices=["test", "refresh"], default="test")
    args = parser.parse_args()
    guard = module("runner")
    guard.check_context(os.environ)
    source = guard.check_source(os.environ)
    if os.environ.get("BLOG_DEV_RELEASE_MANAGED") != "true":
        raise ValueError("Development legacy website ownership guard is not active")
    expected_root = (
        Path(os.environ["RUNNER_TEMP"]) / "blog-development-publication-input"
    )
    if Path(args.data_dir) != expected_root:
        raise ValueError("Only the fixed private downloaded data directory is accepted")
    producer = verify_transfer(expected_root, args.producer_sha, source, args.mode)
    drain_existing_cd()
    if guard.check_source(os.environ) != source:
        raise ValueError("Trusted development source changed during deployment drain")
    if args.verify_only:
        print(
            json.dumps(
                {"ok": True, "stage": "verified-data-before-SSH", "frontendSha": source}
            )
        )
        return
    archive, provenance = package(
        expected_root,
        args.producer_sha,
        generation_base(os.environ["GITHUB_RUN_ID"], os.environ["GITHUB_RUN_ATTEMPT"]),
    )
    supervisor = regular_bytes(
        ROOT / ".github/scripts/blog_bootstrap/publication_supervisor.py"
    ).decode()
    with tempfile.TemporaryDirectory() as temporary:
        hosts = Path(temporary) / "known_hosts"
        hosts.write_text(
            guard.ALIAS
            + " "
            + (ROOT / ".github/known-hosts/linode-dev.pub").read_text().strip()
            + "\n"
        )
        command = guard.ssh_arguments(
            os.environ["BLOG_SSH_HOST"],
            os.environ["BLOG_SSH_KEY_FILE"],
            hosts,
            hashlib.sha256(archive).hexdigest(),
            supervisor,
        )
        result = publication_ssh(command, archive)
    report = json.loads(result.stdout)
    if (
        report.get("ok") is not True
        or report.get("archiveSha256") != hashlib.sha256(archive).hexdigest()
        or report.get("temporaryCleanupVerified") is not True
    ):
        raise ValueError("Actual development publication/cleanup was not verified")
    print(
        json.dumps(
            {
                "ok": True,
                "mode": args.mode,
                "scope": "actual DEV website frontend refresh; not production/editorial"
                if args.mode == "refresh"
                else "actual DEV website engineering publication and rollback; not production/editorial",
                "sourceSha": source,
                "producerSha256": args.producer_sha,
                "inputHashes": provenance["inputHashes"],
                "artifacts": producer["artifacts"],
                "result": report,
            }
        )
    )


if __name__ == "__main__":
    main()
