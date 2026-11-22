"""Record immutable Blog publication bytes and disable edge HTML transforms."""

import argparse
import hashlib
import json
import mimetypes
import re
from pathlib import Path
from urllib.parse import quote


def prepare(root, frontend, content, release):
    if not all(re.fullmatch(r"[a-f0-9]{40}", value) for value in (frontend, content)):
        raise ValueError("Full frontend and content SHAs required")
    if not re.fullmatch(r"[a-zA-Z0-9-]{1,180}", release):
        raise ValueError("Invalid release identity")
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
        if not path.is_file():
            continue
        name = path.relative_to(root).as_posix()
        if not (
            name == "blog-release.json"
            or name.startswith("blog-images/")
            or re.fullmatch(r"(?:zh-TW|en)/blog(?:/.*)?\.html", name)
        ):
            continue
        data = path.read_bytes()
        mime = mimetypes.guess_type(name)[0] or "application/octet-stream"
        entry = {
            "sha256": hashlib.sha256(data).hexdigest(),
            "content_type": mime,
            "file_path": name,
        }
        if not name.endswith(".html"):
            routes["/" + quote(name, safe="/-._~")] = entry
        if name.endswith(".html"):
            pretty = name[:-5].removesuffix("/index")
            routes["/" + quote(pretty, safe="/-._~")] = entry
            if pretty.startswith("zh-TW/"):
                routes["/" + quote(pretty[6:], safe="/-._~")] = entry
    return {
        "schema": 1,
        **marker,
        "routes": [{"path": path, **entry} for path, entry in sorted(routes.items())],
    }


def configure_nginx(path):
    source = path.read_text()
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
    source = source.replace('"public, immutable"', '"public, immutable, no-transform"')
    path.write_text(source)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--frontend-sha", required=True)
    parser.add_argument("--content-sha", required=True)
    parser.add_argument("--release-id", required=True)
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--nginx", type=Path, required=True)
    args = parser.parse_args()
    manifest = prepare(args.out, args.frontend_sha, args.content_sha, args.release_id)
    configure_nginx(args.nginx)
    args.manifest.write_text(json.dumps(manifest, sort_keys=True) + "\n")


if __name__ == "__main__":
    main()
