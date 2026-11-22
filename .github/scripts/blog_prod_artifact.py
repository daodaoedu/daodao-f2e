"""Record immutable Blog publication bytes and disable edge HTML transforms."""

import argparse
import hashlib
import json
import mimetypes
import os
import re
import stat
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[2]
QUOTE_SAFE = "/-._~"
MANIFEST_NAME = "blog-prod-public-manifest.json"


def route_paths(name):
    if not name.endswith(".html"):
        return ["/" + quote(name, safe=QUOTE_SAFE)]
    pretty = name[:-5].removesuffix("/index")
    paths = ["/" + quote(pretty, safe=QUOTE_SAFE)]
    if pretty.startswith("zh-TW/"):
        paths.append("/" + quote(pretty[6:], safe=QUOTE_SAFE))
    return paths


def manifest_entry(root, path):
    if not path.is_file():
        return None
    name = path.relative_to(root).as_posix()
    if not (
        name == "blog-release.json"
        or name.startswith("blog-images/")
        or re.fullmatch(r"(?:zh-TW|en)/blog(?:/.*)?\.html", name)
    ):
        return None
    return name, {
        "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
        "content_type": mimetypes.guess_type(name)[0] or "application/octet-stream",
        "file_path": name,
    }


def prepare(root, frontend, content, release):
    if not all(re.fullmatch(r"[a-f0-9]{40}", value) for value in (frontend, content)):
        raise ValueError("Full frontend and content SHAs required")
    if not re.fullmatch(r"[a-zA-Z0-9-]{1,180}", release):
        raise ValueError("Invalid release identity")
    if root.is_symlink() or not root.is_dir():
        raise ValueError("A regular export directory is required")
    root = root.resolve(strict=True)
    files = list(root.rglob("*"))
    if any(path.is_symlink() for path in files):
        raise ValueError("Public output must not contain symlinks")
    if not all((root / f"{locale}/blog.html").is_file() for locale in ("zh-TW", "en")):
        raise ValueError("Both bilingual Blog indexes are required")
    marker = {"frontend_sha": frontend, "content_sha": content, "release_id": release}
    marker_path = root / "blog-release.json"
    marker_path.write_text(json.dumps(marker, sort_keys=True) + "\n")
    routes = {}
    for path in [*files, marker_path]:
        item = manifest_entry(root, path)
        if item is None:
            continue
        name, entry = item
        routes.update({route: entry for route in route_paths(name)})
    return {
        "schema": 1,
        **marker,
        "routes": [{"path": path, **entry} for path, entry in sorted(routes.items())],
    }


def configure_nginx(source):
    if source.count("server {") != 1:
        raise ValueError("Expected the reviewed single-server website config")
    source = source.replace(
        "server {",
        'server {\n    add_header Cache-Control "no-store, no-transform" always;\n'
        "    location = /blog-release.json {\n"
        '        add_header Cache-Control "no-store, no-transform" always;\n'
        "        try_files $uri =404;\n    }",
        1,
    )
    # Child asset locations override server headers; retain immutable caching but forbid transforms.
    return source.replace('"public, immutable"', '"public, immutable, no-transform"')


def check_source(path, directory=False):
    if path.is_symlink() or path.resolve(strict=True) != path:
        raise ValueError("Fixed publication paths must not traverse symlinks")
    valid = path.is_dir() if directory else path.is_file()
    if not valid:
        raise ValueError("Fixed publication sources have an invalid file type")


def runner_manifest(environment):
    configured = environment.get("RUNNER_TEMP", "")
    if not configured or "\n" in configured or "\r" in configured:
        raise ValueError("Trusted RUNNER_TEMP is required")
    temporary = Path(configured)
    if not temporary.is_absolute() or temporary.is_symlink():
        raise ValueError("RUNNER_TEMP must be an absolute regular directory")
    temporary = temporary.resolve(strict=True)
    if (
        not temporary.is_dir()
        or temporary.is_relative_to(ROOT)
        or temporary.stat().st_uid != os.getuid()
    ):
        raise ValueError("RUNNER_TEMP must be owned and outside the build context")
    manifest = temporary / MANIFEST_NAME
    if manifest.is_symlink() or (manifest.exists() and not manifest.is_file()):
        raise ValueError("Publication manifest must be a regular runner file")
    return manifest


def fixed_paths(environment):
    output = ROOT / "apps/website/out"
    nginx = ROOT / "docker/production/nginx.conf"
    check_source(output, directory=True)
    check_source(nginx)
    return output, nginx, runner_manifest(environment)


def write_fixed_file(path, source):
    descriptor = os.open(
        path, os.O_WRONLY | os.O_CREAT | os.O_TRUNC | os.O_NOFOLLOW, 0o600
    )
    with os.fdopen(descriptor, "w") as output:
        if not stat.S_ISREG(os.fstat(output.fileno()).st_mode):
            raise ValueError("A regular publication file is required")
        output.write(source)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--frontend-sha", required=True)
    parser.add_argument("--content-sha", required=True)
    parser.add_argument("--release-id", required=True)
    args = parser.parse_args()
    output, nginx, manifest_path = fixed_paths(os.environ)
    configuration = configure_nginx(nginx.read_text())
    manifest = prepare(output, args.frontend_sha, args.content_sha, args.release_id)
    write_fixed_file(nginx, configuration)
    write_fixed_file(manifest_path, json.dumps(manifest, sort_keys=True) + "\n")


if __name__ == "__main__":
    main()
