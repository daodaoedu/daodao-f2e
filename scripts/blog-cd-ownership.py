#!/usr/bin/env python3
"""Recheck legacy website ownership immediately before a deployment; fail closed."""

import argparse
import json
import re
import subprocess


def decide(requested, pages, readable):
    if not requested:
        return {"website": False, "reason": "website build not requested/successful"}
    if not readable:
        return {
            "website": False,
            "reason": "ownership policy unavailable; website skipped",
        }
    values = [
        entry.get("value")
        for page in pages
        for entry in page.get("variables", [])
        if entry.get("name") == "BLOG_RELEASE_MANAGED"
    ]
    if len(values) > 1 or (values and values[0] != "false"):
        return {
            "website": False,
            "reason": "website owned by pinned Blog release pipeline",
        }
    return {
        "website": True,
        "reason": "legacy ownership explicitly false or not configured before cutover",
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", required=True)
    parser.add_argument("--requested", choices=("true", "false"), required=True)
    args = parser.parse_args()
    if not re.fullmatch(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+", args.repo):
        parser.error("Invalid repository")
    try:
        result = subprocess.run(
            [
                "gh",
                "api",
                "--paginate",
                "--slurp",
                "repos/" + args.repo + "/actions/variables?per_page=100",
            ],
            capture_output=True,
            text=True,
            check=False,
        )
        pages = json.loads(result.stdout) if result.returncode == 0 else []
        valid = (
            result.returncode == 0
            and isinstance(pages, list)
            and all(
                isinstance(page, dict) and isinstance(page.get("variables"), list)
                for page in pages
            )
        )
    except (OSError, ValueError):
        pages = []
        valid = False
    print(
        json.dumps(
            {**decide(args.requested == "true", pages, valid), "policy_readable": valid}
        )
    )


if __name__ == "__main__":
    main()
