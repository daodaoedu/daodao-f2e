"""Keep managed website channels in step with their branch heads.

Since the Blog managed release cutover, Linode CD intentionally skips the
website for managed channels.  This helper runs after Linode CD finishes (and
on a schedule), compares the public release marker with the branch head and
dispatches the channel's managed publication workflow when the head carries
website changes.  It never publishes by itself: the dispatched workflow keeps
its own source, CI, drain, rollback and readback gates.

Exit status 1 means a human must look (publication failed repeatedly, the
marker is unreadable or the site lags beyond the allowed window).
"""

import argparse
import datetime as dt
import json
import os
import re
import subprocess
import sys
import urllib.request
from dataclasses import dataclass, field

REPOSITORY = "daodaoedu/daodao-f2e"
SHA = re.compile(r"[0-9a-f]{40}")
# Same website trigger as linode-cd.yml detect-changes.
WEBSITE_PATHS = re.compile(
    r"^(apps/website/|packages/|turbo.json|package.json|pnpm-lock.yaml"
    r"|pnpm-workspace.yaml|docker/|\.dockerignore$|\.github/workflows/linode-cd\.yml$"
    r"|\.github/scripts/blog-dev-preview\.py$)"
)
# blog-dev-bootstrap.yml run-name carries the operation; probes publish nothing.
PUBLICATION_TITLES = {
    "Blog development frontend-refresh",
    "Blog development publication-test",
}
ACTIVE = {"queued", "in_progress", "waiting", "pending", "requested"}
MAX_ATTEMPTS_PER_SHA = 2
LAG_MINUTES = 60
COMPARE_FILE_LIMIT = 300
USER_AGENT = "daodao-website-managed-sync"

CHANNELS = {
    "dev": {
        "branch": "dev",
        "marker": "https://dev.daodao.so/blog-release.json",
        "workflow": "blog-dev-bootstrap.yml",
        "publication_titles": PUBLICATION_TITLES,
        "managed_var": "BLOG_DEV_RELEASE_MANAGED",
        # dev drain waits for every unfinished legacy CD run on any branch.
        "cd_branch": None,
    },
    "prod": {
        "branch": "prod",
        "marker": "https://daodao.so/blog-release.json",
        "workflow": "blog-prod-publish.yml",
        # Every production run is a publication attempt.
        "publication_titles": None,
        "managed_var": "BLOG_PROD_RELEASE_MANAGED",
        # prod gate rejects any unfinished legacy CD run on prod.
        "cd_branch": "prod",
    },
}


@dataclass
class State:
    channel: str
    managed: bool
    head_sha: str
    marker: dict | None
    changed_files: list | None
    ci: dict | None
    legacy_cd_idle: bool
    managed_runs: list = field(default_factory=list)
    # prod only: operator content pins (BLOG_PROD_CONTENT_SHA, *_PUBLISHED_*).
    content_pins: dict = field(default_factory=dict)
    now: dt.datetime = field(default_factory=lambda: dt.datetime.now(dt.UTC))


def parse_time(value):
    return dt.datetime.fromisoformat(value.replace("Z", "+00:00"))


def website_changed(files):
    """None means the diff is unknown; treat it as a website change."""
    return files is None or any(WEBSITE_PATHS.match(name) for name in files)


def lagging_too_long(state):
    ci = state.ci or {}
    if ci.get("status") != "completed" or ci.get("conclusion") != "success":
        return False
    finished = ci.get("updated_at")
    if not finished:
        return False
    return state.now - parse_time(finished) > dt.timedelta(minutes=LAG_MINUTES)


def result(action, reason, **extra):
    return {"action": action, "reason": reason, **extra}


def decide(state):
    """Return what to do for one channel; pure so every branch is testable."""
    if not state.managed:
        return result("legacy", "channel is not managed; Linode CD owns the website")
    marker = state.marker
    if not marker or not SHA.fullmatch(str(marker.get("frontend_sha", ""))):
        return result("alert", "public release marker is unreadable")
    if marker["frontend_sha"] == state.head_sha:
        return result("up-to-date", "marker frontend_sha equals branch head")
    if not website_changed(state.changed_files):
        return result("no-website-change", "head differs only outside website paths")

    runs = [run for run in state.managed_runs if run.get("head_sha") == state.head_sha]
    if any(run.get("status") in ACTIVE for run in runs):
        return result("wait", "managed publication for head is already running")
    failed = [
        run
        for run in runs
        if run.get("status") == "completed" and run.get("conclusion") != "success"
    ]
    succeeded = [
        run
        for run in runs
        if run.get("status") == "completed" and run.get("conclusion") == "success"
    ]
    if succeeded:
        return result(
            "alert",
            "managed publication succeeded but marker does not show head",
            runs=[run.get("id") for run in succeeded],
        )
    if len(failed) >= MAX_ATTEMPTS_PER_SHA:
        return result(
            "alert",
            "managed publication for head failed repeatedly; site kept the previous release",
            runs=[run.get("id") for run in failed],
        )

    ci = state.ci or {}
    if ci.get("status") != "completed":
        return result("wait", "Linode CI for head has not completed")
    if ci.get("conclusion") != "success":
        return result(
            "blocked", "Linode CI for head did not succeed; nothing to publish"
        )
    if not state.legacy_cd_idle:
        if lagging_too_long(state):
            return result("alert", "legacy CD stayed busy past the lag window")
        return result("wait", "legacy Linode CD is still running")

    if state.channel == "dev":
        content = str(marker.get("content_sha", ""))
        if not SHA.fullmatch(content):
            return result("alert", "marker has no full content_sha to preserve")
        inputs = {"operation": "frontend-refresh", "content_sha": content}
    else:
        pins = state.content_pins
        live = marker.get("content_sha")
        if not (live and pins.get("content") == live == pins.get("published")):
            # A staged content release is an explicit operator publication;
            # automation only moves the frontend under the live articles.
            if lagging_too_long(state):
                return result(
                    "alert",
                    "prod content release is staged; publish it manually to ship the frontend",
                )
            return result("wait", "prod content pins differ from the live content")
        inputs = {"ci_run_id": str(ci["id"])}
    return result(
        "dispatch",
        "head carries website changes not on the public site",
        workflow=CHANNELS[state.channel]["workflow"],
        ref=CHANNELS[state.channel]["branch"],
        inputs=inputs,
        retry=bool(failed),
    )


def gh_api(endpoint):
    return json.loads(subprocess.check_output(["gh", "api", endpoint], text=True))


def read_marker(url, opener=urllib.request.urlopen):
    request = urllib.request.Request(
        url + "?managed-sync=1",
        # Cloudflare answers 403 to urllib's default User-Agent.
        headers={"Cache-Control": "no-cache", "User-Agent": USER_AGENT},
    )
    try:
        with opener(request, timeout=20) as response:
            if response.status != 200:
                return None
            return json.loads(response.read(64 * 1024))
    except (OSError, ValueError):
        return None


def changed_files(api, base, head):
    try:
        comparison = api(f"repos/{REPOSITORY}/compare/{base}...{head}")
    except subprocess.CalledProcessError:
        return None
    files = comparison.get("files")
    if comparison.get("status") not in ("ahead", "identical") or not isinstance(
        files, list
    ):
        return None
    if len(files) >= COMPARE_FILE_LIMIT:
        return None
    return [item.get("filename", "") for item in files]


def latest_ci(api, branch, sha):
    runs = api(
        f"repos/{REPOSITORY}/actions/workflows/linode-ci.yml/runs"
        f"?branch={branch}&head_sha={sha}&event=push&per_page=20"
    ).get("workflow_runs", [])
    runs = [run for run in runs if run.get("head_sha") == sha]
    if not runs:
        return None
    run = max(runs, key=lambda item: item.get("created_at", ""))
    return {key: run.get(key) for key in ("id", "status", "conclusion", "updated_at")}


def legacy_cd_idle(api, branch):
    query = "per_page=100" + (f"&branch={branch}" if branch else "")
    for status in sorted(ACTIVE):
        runs = api(
            f"repos/{REPOSITORY}/actions/workflows/linode-cd.yml/runs?status={status}&{query}"
        ).get("workflow_runs", [])
        if any(run.get("status") != "completed" for run in runs):
            return False
    return True


def managed_runs(api, workflow, branch, titles=None):
    runs = api(
        f"repos/{REPOSITORY}/actions/workflows/{workflow}/runs"
        f"?branch={branch}&event=workflow_dispatch&per_page=50"
    ).get("workflow_runs", [])
    return [
        {key: run.get(key) for key in ("id", "head_sha", "status", "conclusion")}
        for run in runs
        if titles is None or run.get("display_title") in titles
    ]


def collect(channel, environment, api=gh_api, marker_reader=read_marker):
    config = CHANNELS[channel]
    managed = environment.get(config["managed_var"], "").strip().lower() == "true"
    head = api(f"repos/{REPOSITORY}/git/ref/heads/{config['branch']}")["object"]["sha"]
    marker = marker_reader(config["marker"]) if managed else None
    files = None
    if (
        marker
        and SHA.fullmatch(str(marker.get("frontend_sha", "")))
        and marker["frontend_sha"] != head
    ):
        files = changed_files(api, marker["frontend_sha"], head)
    return State(
        channel=channel,
        managed=managed,
        head_sha=head,
        marker=marker,
        changed_files=files,
        ci=latest_ci(api, config["branch"], head) if managed else None,
        legacy_cd_idle=legacy_cd_idle(api, config["cd_branch"]) if managed else True,
        managed_runs=managed_runs(
            api, config["workflow"], config["branch"], config["publication_titles"]
        )
        if managed
        else [],
        content_pins={
            "content": environment.get("BLOG_PROD_CONTENT_SHA", "").strip(),
            "published": environment.get("BLOG_PROD_PUBLISHED_CONTENT_SHA", "").strip(),
        }
        if channel == "prod"
        else {},
    )


def dispatch(decision, run=subprocess.check_call):
    command = [
        "gh",
        "workflow",
        "run",
        decision["workflow"],
        "--repo",
        REPOSITORY,
        "--ref",
        decision["ref"],
    ]
    for key, value in sorted(decision["inputs"].items()):
        command += ["-f", f"{key}={value}"]
    run(command)


def summary_line(channel, state, decision):
    marker = state.marker or {}
    return (
        f"| {channel} | `{str(marker.get('frontend_sha', '?'))[:8]}` | "
        f"`{state.head_sha[:8]}` | {decision['action']} | {decision['reason']} |"
    )


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--channel", choices=sorted(CHANNELS), required=True)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    state = collect(args.channel, os.environ)
    decision = decide(state)
    if decision["action"] == "dispatch" and not args.dry_run:
        dispatch(decision)
    output = {"channel": args.channel, "head": state.head_sha, **decision}
    print(json.dumps(output, sort_keys=True))
    summary = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary:
        with open(summary, "a", encoding="utf-8") as handle:
            handle.write("| channel | site | head | action | reason |\n")
            handle.write("|---|---|---|---|---|\n")
            handle.write(summary_line(args.channel, state, decision) + "\n")
    github_output = os.environ.get("GITHUB_OUTPUT")
    if github_output:
        with open(github_output, "a", encoding="utf-8") as handle:
            handle.write(f"action={decision['action']}\n")
            handle.write("reason=" + decision["reason"].replace("\n", " ") + "\n")
    return 1 if decision["action"] == "alert" else 0


if __name__ == "__main__":
    sys.exit(main())
