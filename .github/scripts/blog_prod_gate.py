"""Authorize exact production CI and freeze private Blog release inputs."""

import argparse
import hashlib
import importlib.util
import json
import os
import re
import stat
import subprocess
import sys
import tempfile
from pathlib import Path

REPOSITORY = "daodaoedu/daodao-f2e"
PREFIX = f"repos/{REPOSITORY}"
CI_PATH = ".github/workflows/linode-ci.yml"
ROOT = Path(__file__).resolve().parents[2]
MAX_SNAPSHOT_BYTES = 1024 * 1024


def preview_helper():
    spec = importlib.util.spec_from_file_location(
        "blog_dev_preview", Path(__file__).with_name("blog-dev-preview.py")
    )
    helper = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(helper)
    return helper


def full_sha(value):
    if not isinstance(value, str) or not re.fullmatch(r"[a-f0-9]{40}", value):
        raise ValueError("A full lowercase commit SHA is required")
    return value


def positive_id(value):
    if not isinstance(value, str) or not re.fullmatch(r"[1-9]\d*", value, re.ASCII):
        raise ValueError("CI run ID must be a positive decimal integer")
    return int(value)


def canonical(value):
    return json.dumps(value, sort_keys=True, separators=(",", ":")).encode()


def digest(value):
    return hashlib.sha256(value).hexdigest()


def context(environment):
    required = {
        "GITHUB_REPOSITORY": REPOSITORY,
        "GITHUB_EVENT_NAME": "workflow_dispatch",
        "GITHUB_REF": "refs/heads/prod",
        "BLOG_PROD_RELEASE_MANAGED": "true",
    }
    if any(environment.get(key) != value for key, value in required.items()):
        raise ValueError(
            "Only the official managed production manual workflow is allowed"
        )
    expected_content = environment.get("BLOG_PROD_EXPECTED_CONTENT_SHA", "")
    if expected_content and full_sha(expected_content) != environment.get("BLOG_PROD_CONTENT_SHA"):
        raise ValueError("Prepared content differs from the scheduled revision")
    return (
        full_sha(environment.get("GITHUB_SHA")),
        full_sha(environment.get("BLOG_PROD_CONTENT_SHA")),
        full_sha(environment.get("BLOG_PROD_PUBLISHED_CONTENT_SHA")),
    )


def official_repository(value):
    return (
        isinstance(value, dict)
        and value.get("full_name") == REPOSITORY
        and value.get("fork") is False
    )


def require_idle_legacy_cd(api):
    """Reject every unfinished production legacy deployment across all pages."""
    for page in range(1, 1001):
        endpoint = (
            f"{PREFIX}/actions/workflows/linode-cd.yml/runs"
            f"?branch=prod&per_page=100&page={page}"
        )
        result = api(endpoint)
        runs = result.get("workflow_runs")
        if not isinstance(runs, list) or len(runs) > 100:
            raise ValueError("Cannot establish legacy deployment quiescence")
        for run in runs:
            if not isinstance(run, dict) or run.get("status") != "completed":
                raise ValueError("A legacy production deployment has not completed")
        if len(runs) < 100:
            return
    raise ValueError("Legacy deployment inventory exceeded its bounded scan")


def authorize(environment, ci_run_id, checkout_sha, api):
    """Return bound release data only after every current source/CI check passes."""
    frontend, content, baseline_content = context(environment)
    run_id = positive_id(ci_run_id)
    approvals = preview_helper().production_approvals(environment)
    if checkout_sha != frontend:
        raise ValueError("Frontend checkout differs from the workflow revision")
    current = api(f"{PREFIX}/git/ref/heads/prod")
    if current.get("object", {}).get("sha") != frontend:
        raise ValueError("Production source advanced; start a new release")
    workflow = api(f"{PREFIX}/actions/workflows/linode-ci.yml")
    workflow_id = workflow.get("id")
    if (
        type(workflow_id) is not int
        or workflow_id <= 0
        or workflow.get("path") != CI_PATH
        or workflow.get("state") != "active"
    ):
        raise ValueError("Canonical production CI workflow is unavailable")
    # Read the run itself, not a cached list or the workflow's display name.
    run = api(f"{PREFIX}/actions/runs/{run_id}")
    if (
        run.get("id") != run_id
        or run.get("workflow_id") != workflow_id
        or run.get("path") != CI_PATH
        or not official_repository(run.get("repository"))
        or not official_repository(run.get("head_repository"))
        or run.get("head_branch") != "prod"
        or run.get("head_sha") != frontend
        or run.get("event") not in ("push", "workflow_dispatch")
        or run.get("status") != "completed"
        or run.get("conclusion") != "success"
        or type(run.get("run_attempt")) is not int
        or run["run_attempt"] <= 0
    ):
        raise ValueError("The exact official production revision needs successful CI")
    require_idle_legacy_cd(api)
    approvals_digest = digest(canonical(approvals))
    return {
        "schema_version": 1,
        "frontend_sha": frontend,
        "content_sha": content,
        "baseline_content_sha": baseline_content,
        "ci_run_id": run_id,
        "ci_run_attempt": run["run_attempt"],
        "approvals": approvals,
        "approvals_sha256": approvals_digest,
        "release_id": f"blog-{frontend}-{content}-{approvals_digest[:16]}",
    }


def check_snapshot(snapshot, environment, checkout_sha, api):
    if not isinstance(snapshot, dict):
        raise TypeError("Release snapshot must be an object")
    current = authorize(
        environment, str(snapshot.get("ci_run_id", "")), checkout_sha, api
    )
    if current != snapshot:
        raise ValueError("Release inputs or CI attempt changed; start a new release")
    return snapshot


def private_runner_directory(environment):
    helper = preview_helper()
    workspace = helper.directory(environment, "GITHUB_WORKSPACE")
    temporary = helper.directory(environment, "RUNNER_TEMP")
    if temporary.is_relative_to(workspace):
        raise ValueError("Release snapshot must remain outside the frontend workspace")
    return temporary


def write_snapshot(snapshot, environment):
    temporary = private_runner_directory(environment)
    directory = Path(tempfile.mkdtemp(prefix="blog-prod-release-", dir=temporary))
    path = directory / "release.json"
    with path.open("xb") as output:
        os.chmod(path, 0o600)
        output.write(canonical(snapshot))
    return path


def read_snapshot(path, environment, expected_sha256=None):
    temporary = private_runner_directory(environment)
    path = Path(path)
    if (
        not path.is_absolute()
        or path.is_symlink()
        or path.resolve(strict=True) != path
        or not path.is_relative_to(temporary)
        or not path.is_file()
        or path.stat().st_uid != os.getuid()
        or stat.S_IMODE(path.stat().st_mode) != 0o600
        or stat.S_IMODE(path.parent.stat().st_mode) != 0o700
        or path.stat().st_size > MAX_SNAPSHOT_BYTES
    ):
        raise ValueError("A private regular runner snapshot is required")
    data = path.read_bytes()
    if expected_sha256 is not None and (
        not re.fullmatch(r"[a-f0-9]{64}", expected_sha256)
        or digest(data) != expected_sha256
    ):
        raise ValueError("Release snapshot hash differs from the authorized input")
    return json.loads(data)


def public_outputs(snapshot, path):
    values = {
        "frontend-sha": snapshot["frontend_sha"],
        "content-sha": snapshot["content_sha"],
        "baseline-content-sha": snapshot["baseline_content_sha"],
        "release-id": snapshot["release_id"],
        "snapshot": str(path),
        "snapshot-sha256": digest(path.read_bytes()),
    }
    if any("\n" in value or "\r" in value for value in values.values()):
        raise ValueError("Invalid output value")
    return "".join(f"{key}={value}\n" for key, value in values.items())


def github_api(endpoint):
    result = subprocess.run(
        ["gh", "api", "--hostname", "github.com", endpoint],
        check=True,
        capture_output=True,
        text=True,
        timeout=30,
    )
    return json.loads(result.stdout)


def checkout_revision(environment):
    root = preview_helper().directory(environment, "GITHUB_WORKSPACE")
    result = subprocess.run(
        ["git", "-c", "core.hooksPath=/dev/null", "rev-parse", "--verify", "HEAD"],
        cwd=root,
        check=True,
        capture_output=True,
        text=True,
        timeout=10,
    )
    return full_sha(result.stdout.strip())


def checked_baseline_checkout(snapshot, environment):
    workspace = preview_helper().directory(environment, "GITHUB_WORKSPACE")
    source = workspace / ".blog-prod-published-source"
    if source.is_symlink() or not source.is_dir() or source.resolve() != source:
        raise ValueError("Published baseline checkout must be a regular directory")
    actual = subprocess.run(
        ["git", "-c", "core.hooksPath=/dev/null", "rev-parse", "--verify", "HEAD"],
        cwd=source,
        check=True,
        capture_output=True,
        text=True,
        timeout=10,
    ).stdout.strip()
    if actual != snapshot["baseline_content_sha"]:
        raise ValueError("Published baseline checkout differs from the frozen revision")
    return source


def validation_directory(path):
    if (
        not isinstance(path, Path)
        or not path.is_absolute()
        or path.is_symlink()
        or not path.is_dir()
        or path.resolve(strict=True) != path
    ):
        raise ValueError("Validation inputs require canonical regular directories")
    return path


def private_validation_input(path, evidence, name):
    fixed = evidence / name
    if (
        path != fixed
        or fixed.is_symlink()
        or not fixed.is_file()
        or fixed.resolve(strict=True) != fixed
        or fixed.stat().st_uid != os.getuid()
        or stat.S_IMODE(fixed.stat().st_mode) != 0o600
        or stat.S_IMODE(evidence.stat().st_mode) != 0o700
    ):
        raise ValueError("Validation evidence must use its private fixed runner path")
    return fixed


def shared_validation(content, evidence, mode="draft", approvals=None, baseline=None):
    """Invoke the actual shared CLI without pnpm's presentation/logging wrapper."""
    if mode == "draft":
        selected_mode = "draft"
    elif mode == "publish":
        selected_mode = "publish"
    else:
        raise ValueError("Unknown shared validation mode")
    content = validation_directory(content)
    evidence = validation_directory(evidence)
    command = [
        "node",
        str(ROOT / "packages/blog-content/node_modules/tsx/dist/cli.mjs"),
        str(ROOT / "packages/blog-content/src/cli.ts"),
        "--root",
        str(content),
        "--mode",
        selected_mode,
    ]
    if approvals is not None:
        approvals_file = private_validation_input(approvals, evidence, "approvals.json")
        command += ["--approvals", str(approvals_file)]
    if baseline is not None:
        baseline_file = private_validation_input(
            baseline, evidence, "published-baseline.json"
        )
        command += ["--baseline", str(baseline_file)]
    child_environment = {
        key: os.environ[key]
        for key in ("PATH", "HOME", "SystemRoot")
        if key in os.environ
    }
    child_environment.update(
        BLOG_CONTENT_DIR=str(content), BLOG_EVIDENCE_ROOT=str(evidence), NO_COLOR="1"
    )
    result = subprocess.run(
        command,
        cwd=ROOT,
        env=child_environment,
        check=False,
        capture_output=True,
        text=True,
        timeout=120,
    )
    if len(result.stdout.encode()) > 16 * 1024 * 1024:
        raise ValueError("Shared content validation report exceeds its bound")
    if not result.stdout.strip():
        raise ValueError("Shared content validator runtime failed")
    try:
        report = json.loads(result.stdout)
    except json.JSONDecodeError:
        raise ValueError(
            "Shared content validator returned an invalid report"
        ) from None
    if not isinstance(report, dict):
        raise TypeError("Shared content validator returned an invalid report")
    if report.get("ok") is not True:
        raise ValueError("Shared content validation rejected the release")
    if result.returncode:
        raise ValueError("Shared content validator runtime failed")
    return report


def published_baseline(report):
    baseline = {}
    for article in report["articles"]:
        metadata = article["metadata"]
        entry = baseline.setdefault(
            metadata["id"],
            {
                "published_at": metadata["published_at"],
                "slugs": {},
            },
        )
        entry["slugs"][metadata["lang"]] = metadata["slug"]
    if not baseline or any(
        set(entry["slugs"]) != {"zh-TW", "en"} for entry in baseline.values()
    ):
        raise ValueError("Trusted shared report must contain complete published pairs")
    return baseline


def stage_snapshot(snapshot, environment):
    """Keep runner-generated scope objects authoritative, never re-read output data."""
    helper = preview_helper()
    old_source = checked_baseline_checkout(snapshot, environment)
    source, temporary = helper.checked_checkout(environment, snapshot["content_sha"])
    old_content = helper.snapshot_public_content(old_source, temporary)
    content = helper.snapshot_public_content(source, temporary)
    evidence = Path(tempfile.mkdtemp(prefix="blog-prod-evidence-", dir=temporary))
    approvals_file = evidence / "approvals.json"
    with approvals_file.open("xb") as output:
        os.chmod(approvals_file, 0o600)
        output.write(canonical(snapshot["approvals"]))
    old_report = shared_validation(old_content, evidence)
    baseline = published_baseline(old_report)
    baseline_file = evidence / "published-baseline.json"
    with baseline_file.open("xb") as output:
        os.chmod(baseline_file, 0o600)
        output.write(canonical(baseline))
    report = shared_validation(
        content,
        evidence,
        mode="publish",
        approvals=approvals_file,
        baseline=baseline_file,
    )
    if not set(baseline).issubset(
        {article["metadata"]["id"] for article in report["articles"]}
    ):
        raise ValueError("A publication cannot remove or replace existing article IDs")
    values = {
        "BLOG_CONTENT_DIR": str(content),
        "BLOG_CONTENT_MODE": "publish",
        "BLOG_APPROVALS_FILE": str(approvals_file),
        "BLOG_PUBLISHED_BASELINE_FILE": str(baseline_file),
        "BLOG_EVIDENCE_ROOT": str(evidence),
    }
    with Path(environment["GITHUB_ENV"]).open("a") as output:
        output.writelines(f"{key}={value}\n" for key, value in values.items())


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    operations = parser.add_subparsers(dest="operation", required=True)
    prepare = operations.add_parser("prepare")
    prepare.add_argument("--ci-run-id", required=True)
    for operation in ("check", "stage"):
        action = operations.add_parser(operation)
        action.add_argument("--snapshot", required=True)
        action.add_argument("--snapshot-sha256", required=True)
    args = parser.parse_args()
    environment = os.environ
    checkout = checkout_revision(environment)
    if args.operation == "prepare":
        snapshot = authorize(environment, args.ci_run_id, checkout, github_api)
        path = write_snapshot(snapshot, environment)
        with Path(environment["GITHUB_OUTPUT"]).open("a") as output:
            output.write(public_outputs(snapshot, path))
    else:
        snapshot = read_snapshot(args.snapshot, environment, args.snapshot_sha256)
        check_snapshot(snapshot, environment, checkout, github_api)
        if args.operation == "stage":
            stage_snapshot(snapshot, environment)
    print("Production release gate passed")


if __name__ == "__main__":
    try:
        main()
    except (TypeError, ValueError, OSError, subprocess.SubprocessError):
        # Never echo approvals, request payloads or API response bodies to logs.
        print("Production release gate rejected the request", file=sys.stderr)
        sys.exit(1)

