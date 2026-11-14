"""Select legacy dev website ownership from trusted job vars; never query a token API.

The job-context snapshot is not a live lock. Cutover requires setting the variable
and draining every pre-existing dev CD run before the managed pointer is exposed.
"""

import argparse
import json
import os
from pathlib import Path


def decide(branch, requested, managed):
    dev = branch == "dev"
    managed_dev = dev and managed.lower() not in ("", "false")
    return {
        "website": requested and not managed_dev,
        "dev": dev,
        "managed": managed_dev,
        "reason": (
            "dev website belongs to managed Blog release; legacy website skipped"
            if managed_dev
            else "legacy website decision preserved"
        ),
        "policy_source": "repository vars job-context snapshot; cutover drain required",
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--branch", required=True)
    parser.add_argument("--requested", choices=("true", "false"), required=True)
    args = parser.parse_args()
    result = decide(
        args.branch,
        args.requested == "true",
        os.environ.get("BLOG_DEV_RELEASE_MANAGED", ""),
    )
    with Path(os.environ["GITHUB_OUTPUT"]).open("a") as output:
        output.writelines(
            f"{key}={str(result[key]).lower()}\n"
            for key in ("website", "dev", "managed")
        )
    print(json.dumps(result))


if __name__ == "__main__":
    main()
