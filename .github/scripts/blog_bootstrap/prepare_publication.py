"""Real website-only development builds; private engineering receipts are not editorial approval."""

import argparse
import base64
import hashlib
import importlib.util
import json
import os
import re
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
CONTENT_REPOSITORY = "https://github.com/daodaoedu/daodao-blog.git"
DEFAULT_CONTENT = "0daa4231bb2072657c807813e960919b982f9d8e"
PUBLIC_ENV = {
    "NEXT_PUBLIC_APP_URL": "https://app-dev.daodao.so",
    "NEXT_PUBLIC_WEBSITE_URL": "https://dev.daodao.so",
    "NEXT_PUBLIC_PRODUCT_URL": "https://app-dev.daodao.so",
    "NEXT_PUBLIC_API_URL": "https://server-dev.daodao.so/api/v1",
}
SHA = re.compile(r"^[a-f0-9]{40}$")
FIXTURE_ID = "development-rollback-fixture"


@dataclass(frozen=True)
class DevelopmentBuild:
    frontend_sha: str
    private: Path
    store: Path
    actor: str
    run_url: str


def controller():
    source = ROOT / "scripts/blog-release.py"
    if (
        hashlib.sha256(source.read_bytes()).hexdigest()
        != "4929785774e7799a6b51090ded6542c958b4df1e244db1b7cc9170461e02f962"
    ):
        raise ValueError("Reviewed controller changed")
    spec = importlib.util.spec_from_file_location("development_release", source)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def safe_environment(content=None, private=None):
    allowed = {
        "PATH",
        "HOME",
        "TMPDIR",
        "TMP",
        "TEMP",
        "CI",
        "LANG",
        "LC_ALL",
        "TZ",
        "PNPM_HOME",
        "XDG_CACHE_HOME",
        "XDG_DATA_HOME",
        "SSL_CERT_FILE",
        "SSL_CERT_DIR",
    }
    result = {key: value for key, value in os.environ.items() if key in allowed}
    result.update(PUBLIC_ENV)
    if content:
        result["BLOG_CONTENT_DIR"] = str(content)
    if private:
        result["BLOG_EVIDENCE_ROOT"] = str(private)
    return result


def draft_digests(content, private, run=subprocess.check_output):
    result = json.loads(
        run(
            [
                "pnpm",
                "--silent",
                "--filter",
                "@daodao/blog-content",
                "validate",
                "--root",
                str(content),
                "--mode",
                "draft",
            ],
            cwd=ROOT,
            env=safe_environment(content, private),
            text=True,
        )
    )
    if result.get("ok") is not True or not result.get("digests"):
        raise ValueError("Shared draft validator rejected content")
    return result["digests"]


def engineering_receipt(digests, actor, run_url):
    if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9-]{0,38}(?:\[bot\])?", actor):
        raise ValueError("Actual authenticated manual actor is required")
    if not re.fullmatch(
        r"https://github.com/daodaoedu/daodao-f2e/actions/runs/[0-9]+", run_url
    ):
        raise ValueError("Actual official engineering run URL is required")
    return [
        {
            "id": identifier,
            "digest": digest,
            "reviewer": "development-engineering:" + actor,
            "evidence": run_url
            + "; user-authorized DEV engineering test only; NOT formal editorial or production approval",
        }
        for identifier, digest in sorted(digests.items())
    ]


def add_synthetic_fixture(destination):
    """Only a separate local test repository is changed; official article bytes stay intact."""
    image = destination / "images" / "development-rollback-fixture.png"
    image.parent.mkdir(exist_ok=True)
    image.write_bytes(
        base64.b64decode(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j4z8AAAAASUVORK5CYII="
        )
    )
    for language in ("zh-TW", "en"):
        folder = (
            destination / "articles" / ("zh-tw" if language == "zh-TW" else language)
        )
        folder.mkdir(parents=True, exist_ok=True)
        path = folder / (FIXTURE_ID + ".md")
        if path.exists():
            raise ValueError("Synthetic fixture ID already exists")
        metadata = {
            "id": FIXTURE_ID,
            "lang": language,
            "slug": FIXTURE_ID,
            "title": "TEST ONLY development rollback fixture",
            "description": "Synthetic development-only fixture for publication rollback and removed-image verification.",
            "author_id": "daodao-team",
            "published_at": "2026-11-13",
            "topic": "learning-facilitation",
            "tags": ["TEST ONLY"],
            "cover": {
                "path": "images/development-rollback-fixture.png",
                "alt": "TEST ONLY development rollback image",
            },
            "cta": {"kind": "beta_application", "target_id": "beta-interest"},
            "sources": [],
        }
        # JSON is a YAML subset accepted by the single shared frontmatter validator.
        path.write_text(
            "---\n"
            + json.dumps(metadata, ensure_ascii=False, indent=2)
            + "\n---\n\nTEST ONLY. This synthetic fixture is not an official article or editorial approval.\n"
        )


def synthetic_repository(destination):
    commands = [
        ["git", "init", "-q", "-b", "development-test"],
        ["git", "add", "."],
        [
            "git",
            "-c",
            "user.name=Development engineering fixture",
            "-c",
            "user.email=development-fixture@example.invalid",
            "-c",
            "commit.gpgsign=false",
            "-c",
            "core.hooksPath=/dev/null",
            "commit",
            "-qm",
            "TEST ONLY local rollback variant; never push",
        ],
    ]
    for command in commands:
        subprocess.run(
            command,
            cwd=destination,
            env=safe_environment(),
            check=True,
            capture_output=True,
        )
    return subprocess.check_output(
        ["git", "rev-parse", "HEAD"], cwd=destination, text=True
    ).strip()


def prepare_one(
    name, content_repo, content_sha, build, baseline=None, draft_source=None
):
    private, store = build.private, build.store
    frontend_sha, actor, run_url = build.frontend_sha, build.actor, build.run_url
    digests = draft_digests(draft_source or content_repo, private)
    receipt = private / (name + "-engineering-authorization.json")
    receipt.write_text(
        json.dumps(engineering_receipt(digests, actor, run_url), indent=2)
    )
    receipt.chmod(0o600)
    public = private / "development-public-environment.json"
    public.write_text(json.dumps(PUBLIC_ENV))
    public.chmod(0o600)
    command = [
        sys.executable,
        str(ROOT / "scripts/blog-release.py"),
        "prepare",
        "--frontend-repo",
        str(ROOT),
        "--frontend-sha",
        frontend_sha,
        "--approved-frontend-sha",
        frontend_sha,
        "--content-repo",
        str(content_repo),
        "--content-sha",
        content_sha,
        "--approvals",
        str(receipt),
        "--build-env",
        str(public),
        "--store",
        str(store),
    ]
    if baseline:
        command += ["--baseline", str(baseline)]
    process = subprocess.run(
        command,
        env=safe_environment(content_repo, private),
        capture_output=True,
        text=True,
        timeout=1800,
        check=False,
    )
    (private / (name + "-prepare.log")).write_text(
        process.stdout + "\n" + process.stderr
    )
    if process.returncode:
        raise RuntimeError(
            "Website-only development prepare failed; no SSH credentials or site mutation"
        )
    result = json.loads(process.stdout)
    if result.get("ok") is not True:
        raise ValueError("Controller did not produce a validated website artifact")
    return result


def prepare_pair(workspace, content_sha, frontend_sha, actor, run_url):
    if not SHA.fullmatch(content_sha) or not SHA.fullmatch(frontend_sha):
        raise ValueError("Full immutable official content/frontend SHAs required")
    workspace.mkdir(mode=0o700)
    private = workspace / "private"
    private.mkdir(mode=0o700)
    source_a = workspace / "official-content"
    source_b = workspace / "synthetic-content"
    tool = controller()
    log = private / "source-fetch.log"
    tool.checkout(CONTENT_REPOSITORY, content_sha, source_a, log)
    tool.checkout(CONTENT_REPOSITORY, content_sha, source_b, log)
    original = {
        str(path.relative_to(source_b)): hashlib.sha256(path.read_bytes()).hexdigest()
        for path in source_b.rglob("*")
        if path.is_file()
    }
    add_synthetic_fixture(source_b)
    if any(
        hashlib.sha256((source_b / name).read_bytes()).hexdigest() != value
        for name, value in original.items()
    ):
        raise ValueError(
            "Official content bytes changed while adding the isolated fixture"
        )
    synthetic_sha = synthetic_repository(source_b)
    store = workspace / "prepared-store"
    build = DevelopmentBuild(frontend_sha, private, store, actor, run_url)
    a = prepare_one(
        "official-a", CONTENT_REPOSITORY, content_sha, build, draft_source=source_a
    )
    baseline = private / "baseline-a.json"
    baseline.write_text(
        (store / "releases" / a["id"] / "site/blog-published-baseline.json").read_text()
    )
    baseline.chmod(0o600)
    b = prepare_one("synthetic-b", source_b, synthetic_sha, build, baseline)
    return {
        "schema": 1,
        "scope": "DEV engineering test; official A plus separate synthetic B; not editorial/production",
        "frontendSha": frontend_sha,
        "officialContentSha": content_sha,
        "syntheticContentSha": synthetic_sha,
        "officialBytesUnchanged": True,
        "artifacts": [a, b],
    }


def export_transfer(workspace, prepared):
    tool = controller()
    transfer = workspace / "transfer"
    transfer.mkdir(mode=0o700)
    descriptions = []
    for index, result in enumerate(prepared["artifacts"]):
        identifier = result["id"]
        manifest = tool.stored_release(workspace / "prepared-store", identifier)
        source = workspace / "prepared-store/releases" / identifier
        raw = (source / "release.json").read_bytes()
        manifest_sha = hashlib.sha256(raw).hexdigest()
        if manifest_sha != result["manifest_sha256"]:
            raise ValueError("Prepared manifest changed before transfer")
        destination = transfer / "artifacts" / identifier
        (destination / "site").mkdir(parents=True)
        (destination / "release.json").write_bytes(raw)
        for relative, expected in manifest["files"].items():
            entry = source / "site" / tool.safe_relative(relative)
            if entry.is_symlink() or not entry.is_file() or entry.stat().st_nlink != 1:
                raise ValueError(
                    "Only validated regular public artifact data may transfer"
                )
            data = entry.read_bytes()
            if hashlib.sha256(data).hexdigest() != expected:
                raise ValueError("Prepared public bytes changed before transfer")
            target = destination / "site" / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(data)
        descriptions.append(
            {
                "id": identifier,
                "manifestSha256": manifest_sha,
                "frontendSha": manifest["frontend_sha"],
                "contentSha": manifest["content_sha"],
                "fileCount": len(manifest["files"]),
                "kind": "official-A" if index == 0 else "synthetic-TEST-ONLY-B",
            }
        )
    controller()  # Recheck unchanged controller after both package-script builds.
    producer = {**prepared, "artifacts": descriptions}
    data = json.dumps(producer, sort_keys=True, separators=(",", ":")).encode()
    (transfer / "producer.json").write_bytes(data)
    return hashlib.sha256(data).hexdigest()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--content-sha", default=DEFAULT_CONTENT)
    args = parser.parse_args()
    spec = importlib.util.spec_from_file_location(
        "bootstrap_guard", ROOT / ".github/scripts/blog_bootstrap/runner.py"
    )
    guard = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(guard)
    guard.check_context(os.environ)
    frontend = guard.check_source(os.environ)
    workspace = Path(os.environ["RUNNER_TEMP"]) / "blog-development-publication"
    result = prepare_pair(
        workspace,
        args.content_sha,
        frontend,
        os.environ["GITHUB_ACTOR"],
        "https://github.com/daodaoedu/daodao-f2e/actions/runs/"
        + os.environ["GITHUB_RUN_ID"],
    )
    producer_sha = export_transfer(workspace, result)
    with Path(os.environ["GITHUB_OUTPUT"]).open("a") as output:
        output.write("producer_sha=" + producer_sha + "\n")
    print(
        json.dumps(
            {
                "ok": True,
                "producerSha256": producer_sha,
                "officialContentSha": args.content_sha,
                "frontendSha": frontend,
            }
        )
    )


if __name__ == "__main__":
    main()
