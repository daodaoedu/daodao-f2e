"""Stage an explicit dev-only draft snapshot for the normal website build."""

import os
import re
import shutil
import stat
import subprocess
import sys
import tempfile
from pathlib import Path

CHECKOUT = ".blog-dev-preview-source"
PUBLIC_ROOTS = (
    ("authors.json", False),
    ("topics.json", False),
    ("articles", True),
    ("images", True),
)


def selected_pin(environment):
    if environment.get("BRANCH_NAME") != "dev":
        return None
    pin = environment.get("BLOG_DEV_PREVIEW_CONTENT_SHA", "")
    if not pin:
        return None
    if not re.fullmatch(r"[0-9a-f]{40}", pin):
        raise ValueError(
            "BLOG_DEV_PREVIEW_CONTENT_SHA must be a full lowercase commit SHA"
        )
    return pin


def directory(environment, name):
    value = environment.get(name, "")
    if not value or "\n" in value or "\r" in value:
        raise ValueError(f"Missing or invalid {name}")
    result = Path(value).resolve(strict=True)
    if not result.is_dir():
        raise ValueError(f"{name} must be an existing directory")
    return result


def prepare(environment, pin):
    workspace = directory(environment, "GITHUB_WORKSPACE")
    temporary = directory(environment, "RUNNER_TEMP")
    if temporary.is_relative_to(workspace):
        raise ValueError("Preview snapshot must be outside the frontend Docker context")
    source = workspace / CHECKOUT
    if source.is_symlink() or not source.is_dir() or source.resolve() != source:
        raise ValueError("Preview checkout must be a regular workspace directory")
    actual = subprocess.run(
        [
            "git",
            "-c",
            "core.hooksPath=/dev/null",
            "-C",
            str(source),
            "rev-parse",
            "--verify",
            "HEAD",
        ],
        capture_output=True,
        text=True,
        check=True,
        timeout=10,
    ).stdout.strip()
    if actual != pin:
        raise ValueError("Preview checkout does not match the selected commit")
    roots = []
    for name, is_directory in PUBLIC_ROOTS:
        candidate = source / name
        try:
            mode = candidate.lstat().st_mode
        except FileNotFoundError:
            if name == "images":
                continue
            raise ValueError(f"Missing preview {name}") from None
        valid_type = stat.S_ISDIR(mode) if is_directory else stat.S_ISREG(mode)
        if not valid_type:
            raise ValueError(
                f"Preview {name} must be a regular {'directory' if is_directory else 'file'}"
            )
        roots.append((candidate, is_directory))
    snapshot = Path(tempfile.mkdtemp(prefix="daodao-blog-preview-", dir=temporary))
    try:
        for candidate, is_directory in roots:
            target = snapshot / candidate.name
            if is_directory:
                # Nested links remain links so the shared content validator can reject them.
                shutil.copytree(candidate, target, symlinks=True)
            else:
                shutil.copyfile(candidate, target, follow_symlinks=False)
    except Exception:
        shutil.rmtree(snapshot)
        raise
    values = {
        "BLOG_CONTENT_DIR": str(snapshot),
        "BLOG_CONTENT_MODE": "draft",
        "NEXT_PUBLIC_WEBSITE_URL": "https://dev.daodao.so",
        "BLOG_APPROVALS_FILE": "",
        "BLOG_PUBLISHED_BASELINE_FILE": "",
        "BLOG_EVIDENCE_ROOT": "",
    }
    with Path(environment["GITHUB_ENV"]).open("a") as output:
        output.writelines(f"{key}={value}\n" for key, value in values.items())
    print(f"Dev draft preview content: {pin}")


def main():
    if len(sys.argv) != 2 or sys.argv[1] not in ("select", "prepare"):
        raise ValueError("Expected select or prepare")
    pin = selected_pin(os.environ)
    if sys.argv[1] == "select":
        with Path(os.environ["GITHUB_OUTPUT"]).open("a") as output:
            output.write(
                "enabled=false\n"
                if pin is None
                else f"enabled=true\ncontent-sha={pin}\n"
            )
    elif pin is not None:
        prepare(os.environ, pin)


if __name__ == "__main__":
    try:
        main()
    except (ValueError, OSError, subprocess.SubprocessError) as error:
        print(str(error), file=sys.stderr)
        sys.exit(1)
