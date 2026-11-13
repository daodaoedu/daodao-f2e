#!/usr/bin/env python3
"""Pinned website artifacts and atomic filesystem release adapter (not a cloud deploy)."""

import argparse
import fcntl
import hashlib
import json
import os
import re
import shutil
import ssl
import stat
import subprocess
import sys
import tempfile
import threading
import time
import uuid
from contextlib import contextmanager, nullcontext
from dataclasses import dataclass
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path, PurePosixPath
from typing import ClassVar
from urllib.error import HTTPError
from urllib.parse import unquote, urlsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener

SHA = re.compile(r"^[a-f0-9]{40}$")
RELEASE = re.compile(r"^[a-f0-9]{64}$")
RELEASE_MANIFEST = "release.json"
BLOG_ROUTE = "/blog"
RELEASE_MARKER_ROUTE = "/blog-release.json"
BASELINE_ROUTE = "/blog-published-baseline.json"
PUBLIC_MARKER_FILE = "blog-release.json"
PUBLISHED_BASELINE_FILE = "blog-published-baseline.json"
ACTIVE_STATE_FILE = "active.json"
FRONTEND_SOURCE_URL = "https://github.com/daodaoedu/daodao-f2e.git"
CONTENT_SOURCE_URL = "https://github.com/daodaoedu/daodao-blog.git"


class ReleaseError(Exception):
    def __init__(self, stage, message):
        self.stage = stage
        super().__init__(message)


class RejectRedirect(HTTPRedirectHandler):
    def redirect_request(self, request, fp, code, message, headers, newurl):
        return None


# A redirected 404 must never become first-release permission, and smoke must not contact a redirect target.
HTTP = build_opener(RejectRedirect())


def canonical(value):
    return json.dumps(
        value, ensure_ascii=False, sort_keys=True, separators=(",", ":")
    ).encode()


def digest(value):
    return hashlib.sha256(value).hexdigest()


def sha(value):
    if not SHA.fullmatch(value):
        raise ReleaseError("input", "Expected a full lowercase 40-character Git SHA")
    return value


def safe_relative(value):
    path = PurePosixPath(value)
    if (
        not value
        or path.is_absolute()
        or any(part in ("..", ".") for part in value.split("/"))
        or "\\" in value
    ):
        raise ReleaseError("artifact", "Unsafe artifact path")
    return path


def atomic_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(path.name + "." + uuid.uuid4().hex)
    temporary.write_bytes(canonical(value))
    os.replace(temporary, path)


def release_store(path):
    resolved = path.resolve()
    if resolved == Path("/root/daodao-f2e") or resolved.is_relative_to(
        Path("/root/daodao-f2e")
    ):
        raise ReleaseError(
            "input",
            "Release store must be outside the legacy checkout and its git-clean scope",
        )
    return resolved


@contextmanager
def locked(store):
    store.mkdir(parents=True, exist_ok=True)
    with (store / ".release.lock").open("a") as handle:
        fcntl.flock(handle, fcntl.LOCK_EX)
        yield


def tooling_environment():
    keys = {
        "PATH",
        "HOME",
        "TMPDIR",
        "TMP",
        "TEMP",
        "LANG",
        "LC_ALL",
        "TZ",
        "SSL_CERT_FILE",
        "SSL_CERT_DIR",
    }
    return {
        **{key: value for key, value in os.environ.items() if key in keys},
        "GIT_TERMINAL_PROMPT": "0",
        "GIT_NO_REPLACE_OBJECTS": "1",
        "GIT_CONFIG_GLOBAL": os.devnull,
        "GIT_CONFIG_NOSYSTEM": "1",
    }


def command(stage, arguments, cwd, env, log):
    if env is None:
        env = tooling_environment()
    try:
        result = subprocess.run(
            arguments,
            cwd=cwd,
            env=env,
            text=True,
            capture_output=True,
            check=False,
            timeout=1800,
        )
    except subprocess.TimeoutExpired as error:
        raise ReleaseError(
            stage, "Command exceeded its execution deadline; prior release unchanged"
        ) from error
    with log.open("a") as output:
        output.write(
            f"\n[{stage}] exit={result.returncode}\n{result.stdout}\n{result.stderr}\n"
        )
    if result.returncode:
        raise ReleaseError(
            stage,
            f"Command failed (exit {result.returncode}); inspect private log {log.name}",
        )
    return result.stdout


def _source_location(repo):
    if "://" not in repo:
        try:
            path = Path(repo).resolve(strict=True)
        except OSError as error:
            raise ReleaseError(
                "fetch", "Local source repository is unavailable"
            ) from error
        if not path.is_dir():
            raise ReleaseError("fetch", "Local source repository does not exist")
        return str(path), False
    parsed = urlsplit(repo)
    try:
        valid_port = parsed.port
    except ValueError as error:
        raise ReleaseError("fetch", "Invalid source HTTPS URL") from error
    if (
        parsed.scheme != "https"
        or not parsed.hostname
        or parsed.username
        or parsed.password
        or parsed.query
        or parsed.fragment
        or (valid_port is not None and valid_port < 1)
    ):
        raise ReleaseError("fetch", "Remote repos must use credential-free HTTPS URLs")
    if repo == FRONTEND_SOURCE_URL:
        return FRONTEND_SOURCE_URL, True
    if repo == CONTENT_SOURCE_URL:
        return CONTENT_SOURCE_URL, True
    raise ReleaseError("fetch", "Remote source is outside the two release repositories")


@contextmanager
def _git_source(repo, parent, log):
    source, remote = _source_location(repo)
    if not remote:
        yield source
        return
    with tempfile.TemporaryDirectory(prefix="blog-objects-", dir=parent) as temporary:
        objects = Path(temporary) / "objects.git"
        command(
            "fetch",
            ["git", "clone", "--bare", "--no-hardlinks", "--", source, str(objects)],
            None,
            None,
            log,
        )
        yield str(objects)


def _git_tree(source, revision):
    raw = subprocess.check_output(
        ["git", "ls-tree", "-rz", revision], cwd=source, env=tooling_environment()
    )
    entries = {}
    for entry in filter(None, raw.split(b"\0")):
        fields, name = entry.split(b"\t", 1)
        mode, kind, object_id = fields.decode().split()
        relative = name.decode()
        parts = safe_relative(relative).parts
        if (
            kind != "blob"
            or mode not in ("100644", "100755")
            or any(part.casefold() == ".git" for part in parts)
        ):
            raise ReleaseError(
                "fetch",
                "Source tree contains unsupported symlinks/submodules or Git metadata",
            )
        entries[relative] = (sha(object_id), mode)
    return entries


def _write_git_blob(process, target, object_id, mode):
    process.stdin.write((object_id + "\n").encode())
    process.stdin.flush()
    header = process.stdout.readline(256).decode().split()
    if (
        len(header) != 3
        or header[0] != object_id
        or header[1] != "blob"
        or not header[2].isdigit()
    ):
        raise ReleaseError("fetch", "Git did not return the exact pinned blob")
    remaining = int(header[2])
    target.parent.mkdir(parents=True, exist_ok=True)
    with target.open("xb") as output:
        while remaining:
            chunk = process.stdout.read(min(remaining, 1024 * 1024))
            if not chunk:
                raise ReleaseError("fetch", "Pinned Git blob ended prematurely")
            output.write(chunk)
            remaining -= len(chunk)
    if process.stdout.read(1) != b"\n":
        raise ReleaseError("fetch", "Invalid Git blob framing")
    target.chmod(0o755 if mode == "100755" else 0o644)


def _materialize_git_tree(source, entries, destination, log):
    destination.mkdir()
    with log.open("ab") as errors:
        process = subprocess.Popen(
            ["git", "cat-file", "--batch"],
            cwd=source,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=errors,
            env=tooling_environment(),
        )
        try:
            for relative, (object_id, mode) in entries.items():
                _write_git_blob(process, destination / relative, object_id, mode)
            process.stdin.close()
            if process.wait(timeout=30):
                raise ReleaseError("fetch", "Git source materialization failed")
        finally:
            if process.poll() is None:
                process.terminate()
                process.wait(timeout=30)
            process.stdin.close()
            process.stdout.close()


def checkout(repo, revision, destination, log):
    revision = sha(revision)
    with _git_source(repo, destination.parent, log) as source:
        object_type = command(
            "fetch", ["git", "cat-file", "-t", revision], source, None, log
        ).strip()
        if object_type != "commit":
            raise ReleaseError("fetch", "Requested object is not a commit")
        # Git cat-file reports the requested object ID without recomputing its digest.
        # Native fsck verifies pinned object bytes before any source is materialized.
        command(
            "fetch",
            ["git", "fsck", "--strict", "--no-reflogs", revision],
            source,
            None,
            log,
        )
        entries = _git_tree(source, revision)
        _materialize_git_tree(source, entries, destination, log)
        return command(
            "fetch",
            ["git", "show", "-s", "--format=%ct", revision],
            source,
            None,
            log,
        ).strip()


def tree_hashes(root):
    result = {}
    for path in sorted(root.rglob("*")):
        if path.is_symlink():
            raise ReleaseError(
                "artifact", "Symlinks are not allowed inside a website artifact"
            )
        if path.is_file():
            relative = path.relative_to(root).as_posix()
            safe_relative(relative)
            result[relative] = digest(path.read_bytes())
    return result


def route_file(site, route):
    if not isinstance(route, str) or not route.startswith("/"):
        raise ReleaseError("build", "Expected an absolute website route")
    relative = route.strip("/")
    if relative:
        safe_relative(relative)
    candidates = [relative, relative + ".html", relative + "/index.html"]
    if not relative:
        candidates = ["index.html", "zh-TW.html", "zh-TW/index.html"]
    if route.startswith(BLOG_ROUTE):
        candidates += ["zh-TW/" + value for value in candidates]
    root = site.resolve()
    entries = {file.relative_to(root).as_posix(): file for file in root.rglob("*")}
    for candidate in candidates:
        file = entries.get(safe_relative(candidate).as_posix()) if candidate else None
        if file is None:
            continue
        if file.is_symlink() or not file.resolve().is_relative_to(root):
            raise ReleaseError("build", "Static route escapes the approved website")
        if file.is_file():
            return file.relative_to(root).as_posix()
    raise ReleaseError("build", f"Missing static output for route {route}")


def _manifest_identity(manifest):
    if (
        not isinstance(manifest, dict)
        or manifest.get("schema") != 1
        or not RELEASE.fullmatch(manifest["id"])
    ):
        raise ValueError("Invalid release manifest")
    sha(manifest["frontend_sha"])
    sha(manifest["content_sha"])
    if digest(canonical(manifest["inputs"])) != manifest["id"] or any(
        manifest["inputs"].get(key) != manifest[key]
        for key in ("frontend_sha", "content_sha")
    ):
        raise ValueError("Release ID does not bind the recorded source inputs")


def _manifest_public_markers(site, manifest):
    public = json.loads((site / PUBLIC_MARKER_FILE).read_text())
    if public != {
        key: manifest[key]
        for key in ("id", "frontend_sha", "content_sha", "baseline_sha256")
    }:
        raise ValueError("Public version marker differs from release manifest")
    if (
        digest((site / PUBLISHED_BASELINE_FILE).read_bytes())
        != manifest["baseline_sha256"]
        or digest(canonical(manifest["baseline"])) != manifest["baseline_sha256"]
    ):
        raise ValueError("Published baseline differs from version marker")


def _manifest_routes(site, manifest, files):
    baseline, smoke = manifest["baseline"], manifest["smoke"]
    if not isinstance(baseline, dict) or not baseline or not isinstance(smoke, dict):
        raise ValueError(
            "Release requires a nonempty published article baseline and smoke routes"
        )
    required = {BLOG_ROUTE, "/en/blog", RELEASE_MARKER_ROUTE, BASELINE_ROUTE}
    for article in baseline.values():
        required.update(
            ("/blog/" + article["slugs"]["zh-TW"], "/en/blog/" + article["slugs"]["en"])
        )
    # Verify homepage bytes even when an older registered manifest omitted their routes.
    for route in ("/", "/en"):
        smoke[route] = route_file(site, route)
    if not required.issubset(smoke):
        raise ValueError("Required article/list/version smoke routes missing")
    for route, relative in smoke.items():
        if (
            not isinstance(route, str)
            or not route.startswith("/")
            or relative not in files
        ):
            raise ValueError("Invalid smoke route/file mapping")
        safe_relative(relative)


def verify_release(directory):
    if (
        directory.is_symlink()
        or not directory.is_dir()
        or (directory / "site").is_symlink()
    ):
        raise ReleaseError("artifact", "Release must be a regular immutable directory")
    try:
        manifest = json.loads((directory / RELEASE_MANIFEST).read_text())
        _manifest_identity(manifest)
        files = tree_hashes(directory / "site")
        if not files or files != manifest["files"]:
            raise ValueError("Website artifact bytes differ from the recorded hashes")
        _manifest_public_markers(directory / "site", manifest)
        _manifest_routes(directory / "site", manifest, files)
        return manifest
    except (ReleaseError, KeyError, OSError, ValueError, TypeError) as error:
        raise ReleaseError("artifact", str(error)) from error


def catalog(store):
    file = store / "trusted-artifacts.json"
    values = json.loads(file.read_text()) if file.exists() else {}
    if not isinstance(values, dict) or any(
        not RELEASE.fullmatch(key) or not RELEASE.fullmatch(value)
        for key, value in values.items()
    ):
        raise ReleaseError("artifact", "Invalid trusted artifact catalog")
    return values


def register_artifact(store, identifier, manifest_hash):
    values = catalog(store)
    values[identifier] = manifest_hash
    atomic_json(store / "trusted-artifacts.json", values)


def stored_release(store, identifier):
    if not RELEASE.fullmatch(identifier):
        raise ReleaseError("artifact", "Invalid stored release identity")
    target = store / "releases" / identifier
    if (store / "releases").is_symlink() or not target.resolve().is_relative_to(
        store / "releases"
    ):
        raise ReleaseError("artifact", "Release path escapes the trusted store")
    expected = catalog(store).get(identifier)
    if not expected or digest((target / RELEASE_MANIFEST).read_bytes()) != expected:
        raise ReleaseError(
            "artifact", "Stored manifest differs from trusted producer evidence"
        )
    manifest = verify_release(target)
    if manifest["id"] != identifier:
        raise ReleaseError("artifact", "Stored release identity mismatch")
    return manifest


def caller_input(path, evidence_root):
    absolute = Path(os.path.abspath(path))
    try:
        relative = absolute.relative_to(evidence_root).as_posix()
    except ValueError as error:
        raise ReleaseError(
            "approval", "Input is outside the independently configured evidence root"
        ) from error
    descriptor = os.open(evidence_root, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW)
    try:
        with confined_file(descriptor, relative) as source:
            data = source.read(16 * 1024 * 1024 + 1)
        if len(data) > 16 * 1024 * 1024:
            raise ReleaseError("approval", "Private input exceeds supported size")
        return data
    except (OSError, ReleaseError) as error:
        raise ReleaseError(
            "approval", "Unable to read private input within trusted evidence root"
        ) from error
    finally:
        os.close(descriptor)


@dataclass(frozen=True)
class ReleaseRequest:
    frontend_sha: str
    content_sha: str
    approval_bytes: bytes
    baseline_bytes: bytes | None
    public_environment: dict
    inputs: dict
    identifier: str


@dataclass(frozen=True)
class WebsiteBuild:
    frontend: Path
    content: Path
    private: Path
    approvals: Path
    baseline: Path | None
    environment: dict
    executable: str
    log: Path


def _private_inputs(args):
    configured = os.environ.get("BLOG_EVIDENCE_ROOT")
    if not configured:
        raise ReleaseError(
            "approval",
            "Trusted caller BLOG_EVIDENCE_ROOT is required; never derive it from input paths",
        )
    root = Path(configured).resolve(strict=True)
    if "://" not in args.content_repo:
        public = Path(args.content_repo).resolve()
        if root.is_relative_to(public) or public.is_relative_to(root):
            raise ReleaseError(
                "approval", "Trusted evidence root must be disjoint from public content"
            )
    approvals = caller_input(args.approvals, root)
    baseline = caller_input(args.baseline, root) if args.baseline else None
    return root, approvals, baseline


def _public_environment(args, private_root):
    values = (
        json.loads(caller_input(args.build_env, private_root)) if args.build_env else {}
    )
    if not isinstance(values, dict) or any(
        not key.startswith("NEXT_PUBLIC_") or not isinstance(value, str)
        for key, value in values.items()
    ):
        raise ReleaseError(
            "input",
            "Build environment accepts only explicit NEXT_PUBLIC_* string values",
        )
    for key in ("NEXT_PUBLIC_APP_URL", "NEXT_PUBLIC_WEBSITE_URL"):
        _public_origin(values.get(key, ""), key)
    return values


def _public_origin(value, key):
    try:
        origin = urlsplit(value)
        _ = origin.port
    except ValueError as error:
        raise ReleaseError("input", "Invalid public navigation origin") from error
    invalid = (
        origin.scheme != "https"
        or not origin.hostname
        or any(character.isspace() for character in origin.netloc)
        or origin.username
        or origin.password
        or origin.query
        or origin.fragment
        or origin.path not in ("", "/")
    )
    if invalid:
        raise ReleaseError(
            "input",
            f"Build environment requires an explicit credential-free HTTPS origin for {key}",
        )


def _release_request(args):
    frontend_sha, content_sha = sha(args.frontend_sha), sha(args.content_sha)
    if frontend_sha != sha(args.approved_frontend_sha):
        raise ReleaseError(
            "approval", "Frontend SHA is not the caller-provided trusted approved pin"
        )
    root, approval_bytes, baseline_bytes = _private_inputs(args)
    environment = _public_environment(args, root)
    inputs = {
        "frontend_sha": frontend_sha,
        "content_sha": content_sha,
        "approvals_hash": digest(approval_bytes),
        "baseline_hash": digest(baseline_bytes) if baseline_bytes is not None else None,
        "build_env_hash": digest(canonical(environment)),
        "runner_hash": digest(Path(__file__).read_bytes()),
    }
    return ReleaseRequest(
        frontend_sha,
        content_sha,
        approval_bytes,
        baseline_bytes,
        environment,
        inputs,
        digest(canonical(inputs)),
    )


def _build_environment(request, content, private, approvals, baseline, timestamp):
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
        "NODE_EXTRA_CA_CERTS",
        "NPM_CONFIG_CACHE",
    }
    inherited = {key: value for key, value in os.environ.items() if key in allowed}
    environment = {
        **inherited,
        **request.public_environment,
        "NEXT_OUTPUT": "export",
        "BLOG_CONTENT_DIR": str(content),
        "BLOG_CONTENT_MODE": "publish",
        "BLOG_APPROVALS_FILE": str(approvals),
        "BLOG_EVIDENCE_ROOT": str(private),
        "BLOG_CONTENT_SHA": request.content_sha,
        "BLOG_FRONTEND_SHA": request.frontend_sha,
        "BLOG_BUILD_ID": request.identifier[:32],
        "SOURCE_DATE_EPOCH": timestamp,
    }
    if baseline:
        environment["BLOG_PUBLISHED_BASELINE_FILE"] = str(baseline)
    return environment


def _prepare_sources(args, request, workspace, executable, log):
    frontend, content, private = (
        workspace / "frontend",
        workspace / "content",
        workspace / "private",
    )
    private.mkdir(mode=0o700)
    approvals = private / "approvals.json"
    approvals.write_bytes(request.approval_bytes)
    baseline = None
    if request.baseline_bytes is not None:
        baseline = private / "baseline.json"
        baseline.write_bytes(request.baseline_bytes)
    timestamp = checkout(args.frontend_repo, request.frontend_sha, frontend, log)
    checkout(args.content_repo, request.content_sha, content, log)
    environment = _build_environment(
        request, content, private, approvals, baseline, timestamp
    )
    return WebsiteBuild(
        frontend, content, private, approvals, baseline, environment, executable, log
    )


def _install_website(build):
    command(
        "install",
        [
            build.executable,
            "install",
            "--frozen-lockfile",
            "--filter",
            "@daodao/website...",
            "--filter",
            "@daodao/blog-content",
        ],
        build.frontend,
        build.environment,
        build.log,
    )
    command(
        "configure",
        [build.executable, "--filter", "@daodao/config", "generate:env"],
        build.frontend,
        build.environment,
        build.log,
    )


def _validation_result(output):
    try:
        result = json.loads(output[output.index("{") :])
    except ValueError as error:
        raise ReleaseError(
            "validate", "Validator did not return its JSON result"
        ) from error
    if (
        not isinstance(result, dict)
        or not result.get("ok")
        or result.get("mode") != "publish"
        or not result.get("articles")
    ):
        raise ReleaseError(
            "validate",
            "Publish-mode validator did not return nonempty approved content",
        )
    return result


def _build_website(build):
    _install_website(build)
    arguments = [
        build.executable,
        "--filter",
        "@daodao/blog-content",
        "validate",
        "--root",
        str(build.content),
        "--mode",
        "publish",
        "--approvals",
        str(build.approvals),
    ]
    if build.baseline:
        arguments += ["--baseline", str(build.baseline)]
    validated = _validation_result(
        command("validate", arguments, build.frontend, build.environment, build.log)
    )
    if build.baseline and set(json.loads(build.baseline.read_bytes())) - {
        article["metadata"]["id"] for article in validated["articles"]
    }:
        raise ReleaseError(
            "approval",
            "Published articles cannot disappear in an ordinary publication; explicit unpublish policy is not implemented",
        )
    command(
        "build",
        [build.executable, "--filter", "@daodao/website", "build"],
        build.frontend,
        build.environment,
        build.log,
    )
    site = build.frontend / "apps/website/out"
    if not site.is_dir():
        raise ReleaseError("build", "Static website output is missing")
    return validated, site


def _confined_digest(root, relative):
    descriptor = os.open(root, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW)
    try:
        with confined_file(descriptor, relative) as source:
            return hashlib.file_digest(source, "sha256").hexdigest()
    finally:
        os.close(descriptor)


def _image_route(site, content, image, pair_digest):
    relative = "blog-images/" + pair_digest + "/" + image["path"]
    safe_relative(relative)
    if _confined_digest(site, relative) != _confined_digest(content, image["path"]):
        raise ReleaseError("build", "Published image differs from approved content")
    return relative


def _publication_maps(site, content, validated):
    smoke = {
        route: route_file(site, route) for route in ("/", "/en", BLOG_ROUTE, "/en/blog")
    }
    baseline = {}
    for article in validated["articles"]:
        metadata = article["metadata"]
        article_id, language = metadata["id"], metadata["lang"]
        route = ("/en/blog/" if language == "en" else "/blog/") + metadata["slug"]
        smoke[route] = route_file(site, route)
        baseline.setdefault(
            article_id, {"published_at": metadata["published_at"], "slugs": {}}
        )["slugs"][language] = metadata["slug"]
        for image in article.get("images", []):
            relative = _image_route(
                site, content, image, validated["digests"][article_id]
            )
            smoke["/" + relative] = relative
    return smoke, baseline


def _release_manifest(site, content, validated, request):
    smoke, baseline = _publication_maps(site, content, validated)
    baseline_bytes = canonical(baseline)
    (site / PUBLISHED_BASELINE_FILE).write_bytes(baseline_bytes)
    public = {
        "id": request.identifier,
        "frontend_sha": request.frontend_sha,
        "content_sha": request.content_sha,
        "baseline_sha256": digest(baseline_bytes),
    }
    (site / PUBLIC_MARKER_FILE).write_bytes(canonical(public))
    smoke.update(
        {
            BASELINE_ROUTE: PUBLISHED_BASELINE_FILE,
            RELEASE_MARKER_ROUTE: PUBLIC_MARKER_FILE,
        }
    )
    return {
        "schema": 1,
        **public,
        "inputs": request.inputs,
        "digests": validated["digests"],
        "baseline": baseline,
        "files": tree_hashes(site),
        "smoke": smoke,
    }


def _artifact_result(store, manifest, reused):
    file = store / "releases" / manifest["id"] / RELEASE_MANIFEST
    return {
        "ok": True,
        "stage": "prepared",
        "id": manifest["id"],
        "reused": reused,
        "manifest": manifest,
        "manifest_sha256": digest(file.read_bytes()),
    }


def _cached_artifact(store, request):
    destination = store / "releases" / request.identifier
    with locked(store):
        if not destination.exists() or request.identifier not in catalog(store):
            return None
        manifest = stored_release(store, request.identifier)
        if manifest["inputs"] != request.inputs:
            raise ReleaseError("artifact", "Release identity collision")
        return _artifact_result(store, manifest, True)


def _store_artifact(store, site, manifest):
    staging = store / ("stage-" + uuid.uuid4().hex)
    destination = store / "releases" / manifest["id"]
    staging.mkdir()
    try:
        shutil.copytree(site, staging / "site")
        (staging / RELEASE_MANIFEST).write_bytes(canonical(manifest))
        verify_release(staging)
        with locked(store):
            destination.parent.mkdir(exist_ok=True)
            if destination.exists():
                existing = verify_release(destination)
                if (
                    existing["inputs"] != manifest["inputs"]
                    or existing["files"] != manifest["files"]
                ):
                    raise ReleaseError(
                        "artifact",
                        "Concurrent artifact differs for the same pinned inputs",
                    )
                manifest = existing
            else:
                os.rename(staging, destination)
            register_artifact(
                store,
                manifest["id"],
                digest((destination / RELEASE_MANIFEST).read_bytes()),
            )
    finally:
        if staging.exists():
            shutil.rmtree(staging)
    return manifest


def prepare(args):
    request = _release_request(args)
    store = release_store(args.store)
    store.mkdir(parents=True, exist_ok=True)
    cached = _cached_artifact(store, request)
    if cached:
        return cached
    executable = shutil.which("pnpm")
    if not executable:
        raise ReleaseError("tools", "pnpm unavailable; no build attempted")
    (store / "logs").mkdir(exist_ok=True)
    log = store / "logs" / (request.identifier + "-" + uuid.uuid4().hex + ".log")
    with tempfile.TemporaryDirectory(prefix="blog-release-") as workspace:
        build = _prepare_sources(
            args, request, Path(workspace).resolve(), executable, log
        )
        validated, site = _build_website(build)
        manifest = _store_artifact(
            store, site, _release_manifest(site, build.content, validated, request)
        )
    return _artifact_result(store, manifest, False)


def website_handler(site_provider):
    class Handler(SimpleHTTPRequestHandler):
        extensions_map: ClassVar[dict[str, str]] = {
            **SimpleHTTPRequestHandler.extensions_map,
            ".js": "text/javascript",
            ".mjs": "text/javascript",
        }

        def translate_path(self, path):
            site = site_provider().resolve()
            try:
                route = unquote(urlsplit(path).path)
                relative = route_file(site, route)
                return str(site / relative)
            except (OSError, ValueError, ReleaseError):
                return str(site / (".missing-" + uuid.uuid4().hex))

        def end_headers(self):
            self.send_header("X-Content-Type-Options", "nosniff")
            super().end_headers()

        def log_message(self, *_args):
            # Smoke logs must not expose requested URLs or private deployment paths.
            return None

    return Handler


def trusted_origin(requested):
    configured = os.environ.get("BLOG_RELEASE_BASE_URL", "")
    if not configured:
        raise ReleaseError(
            "network-policy",
            "Trusted caller BLOG_RELEASE_BASE_URL is required; a request cannot authorize its own origin",
        )
    try:
        parsed = urlsplit(configured)
        port = parsed.port
    except ValueError as error:
        raise ReleaseError(
            "network-policy", "Invalid configured release origin"
        ) from error
    invalid = (
        parsed.scheme not in ("https", "http")
        or not parsed.hostname
        or parsed.username
        or parsed.password
        or parsed.query
        or parsed.fragment
        or parsed.path not in ("", "/")
        or any(character.isspace() for character in configured)
        or (port is not None and port < 1)
    )
    if invalid or (
        parsed.scheme == "http" and parsed.hostname not in ("127.0.0.1", "::1")
    ):
        raise ReleaseError(
            "network-policy",
            "Configured release origin must use HTTPS, except literal loopback HTTP for controlled tests",
        )
    if not isinstance(requested, str) or requested.rstrip("/") != configured.rstrip(
        "/"
    ):
        raise ReleaseError(
            "network-policy",
            "Requested origin is outside the independently configured release capability",
        )
    return configured.rstrip("/")


def _readback_file(base_url, route, expected, identifier):
    target = (
        base_url
        + route
        + "?blog_release_readback="
        + identifier
        + "-"
        + uuid.uuid4().hex
    )
    request = Request(
        target, headers={"Accept-Encoding": "identity", "Cache-Control": "no-cache"}
    )
    try:
        with HTTP.open(request, timeout=10) as response:
            if response.status != 200 or response.geturl() != target:
                raise ValueError("Unexpected response or redirect")
            received = hashlib.sha256()
            deadline = time.monotonic() + 30
            while chunk := response.read1(1024 * 1024):
                received.update(chunk)
                if time.monotonic() > deadline:
                    raise ValueError("Readback deadline exceeded")
            if received.hexdigest() != expected:
                raise ValueError(f"Wrong deployed bytes at {route}")
    except (OSError, ValueError) as error:
        if isinstance(error, HTTPError):
            error.close()
        raise ReleaseError("smoke", str(error)) from error


def _readback_origin(base_url, manifest):
    for route, relative in manifest["smoke"].items():
        _readback_file(base_url, route, manifest["files"][relative], manifest["id"])


def http_readback(base_url, manifest):
    _readback_origin(trusted_origin(base_url), manifest)


def switch_pointer(store, release_id):
    temporary = store / ("current-" + uuid.uuid4().hex)
    temporary.symlink_to(Path("releases") / release_id)
    os.replace(temporary, store / "current")


def _journal_was_committed(store, base_url, pending, state, pointer, target):
    committed = (
        state
        and state["id"] == pending["id"]
        and state["generation"] == pending["generation"]
        and pointer.resolve() == target.resolve()
    )
    if not committed:
        return False
    try:
        http_readback(base_url, stored_release(store, pending["id"]))
    except ReleaseError:
        return False
    return True


def recover_pending(store, base_url):
    file = store / "pending.json"
    if not file.exists():
        return
    pending = json.loads(file.read_text())
    identifier = pending["id"]
    old = pending["old"]
    if not RELEASE.fullmatch(identifier) or (old and not RELEASE.fullmatch(old["id"])):
        raise ReleaseError("state", "Invalid interrupted activation journal")
    state_file = store / ACTIVE_STATE_FILE
    state = json.loads(state_file.read_text()) if state_file.exists() else None
    pointer = store / "current"
    target = store / "releases" / identifier
    if _journal_was_committed(store, base_url, pending, state, pointer, target):
        file.unlink()
        return
    allowed = {target.resolve()}
    if old:
        allowed.add((store / "releases" / old["id"]).resolve())
    if (pointer.exists() or pointer.is_symlink()) and pointer.resolve() not in allowed:
        raise ReleaseError(
            "state", "Interrupted activation pointer is not a journaled version"
        )
    if old:
        previous = stored_release(store, old["id"])
        switch_pointer(store, old["id"])
        atomic_json(state_file, old)
        http_readback(base_url, previous)
    else:
        pointer.unlink(missing_ok=True)
        state_file.unlink(missing_ok=True)
    file.unlink()


def verify_freshness(repository, manifest):
    if not re.fullmatch(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+", repository):
        raise ReleaseError("input", "Invalid freshness policy repository")
    try:
        approved = subprocess.check_output(
            [
                "gh",
                "api",
                "repos/"
                + repository
                + "/environments/development/variables/BLOG_APPROVED_FRONTEND_SHA",
                "--jq",
                ".value",
            ],
            text=True,
            timeout=30,
        ).strip()
        content = subprocess.check_output(
            [
                "gh",
                "api",
                "repos/daodaoedu/daodao-blog/git/ref/heads/main",
                "--jq",
                ".object.sha",
            ],
            text=True,
            timeout=30,
        ).strip()
    except (OSError, subprocess.SubprocessError) as error:
        raise ReleaseError(
            "superseded", "Freshness policy could not be verified"
        ) from error
    if approved != manifest["frontend_sha"] or content != manifest["content_sha"]:
        raise ReleaseError(
            "superseded", "Source head or protected approval pin has advanced"
        )


def _assert_published_identity(previous, candidate, retain_current):
    if retain_current and set(previous) - set(candidate):
        raise ReleaseError(
            "approval", "Published articles cannot disappear in an ordinary publication"
        )
    for article_id, prior in previous.items():
        if article_id in candidate and candidate[article_id] != prior:
            raise ReleaseError(
                "approval",
                "Previously published dates/slugs differ from verified release history",
            )


def _active_state(store, manifest, operation):
    file = store / ACTIVE_STATE_FILE
    old = json.loads(file.read_text()) if file.exists() else None
    if old:
        if not RELEASE.fullmatch(old.get("id", "")):
            raise ReleaseError("state", "Invalid active release identity")
        current = stored_release(store, old["id"])
        _assert_published_identity(
            current["baseline"], manifest["baseline"], operation != "rollback"
        )
        for historical in old.get("history", []):
            previous = stored_release(store, historical)
            _assert_published_identity(
                previous["baseline"], manifest["baseline"], False
            )
    if operation == "rollback" and (
        not old or manifest["id"] not in old.get("history", [])
    ):
        raise ReleaseError(
            "approval", "Rollback target was not a previously verified active release"
        )
    return old


def _check_active_pointer(store, old):
    pointer = store / "current"
    if pointer.exists() or pointer.is_symlink():
        if not old or pointer.resolve() != (store / "releases" / old["id"]).resolve():
            raise ReleaseError(
                "state", "Current pointer does not match the trusted active state"
            )
    elif old:
        raise ReleaseError("state", "Recorded active release has no current pointer")


def _accept_generation(store, old, identifier, generation):
    file = store / "generation.json"
    current_generation = old["generation"] if old else 0
    owner = old["id"] if old else None
    water = (
        json.loads(file.read_text())
        if file.exists()
        else {"generation": current_generation, "id": owner}
    )
    if generation < water["generation"] or (
        generation == water["generation"] and water["id"] != identifier
    ):
        raise ReleaseError(
            "superseded", "A newer generation already owns this deployment"
        )
    atomic_json(file, {"generation": generation, "id": identifier})


def _check_freshness(args, manifest):
    repository = getattr(args, "freshness_repository", None)
    if repository and getattr(args, "operation", "activate") != "rollback":
        verify_freshness(repository, manifest)


def _reuse_active(args, store, old, manifest):
    _check_freshness(args, manifest)
    http_readback(args.base_url, manifest)
    if args.generation > old["generation"]:
        atomic_json(store / ACTIVE_STATE_FILE, {**old, "generation": args.generation})
    return {
        "ok": True,
        "stage": "active",
        "id": args.release,
        "reused": True,
        "generation": max(old["generation"], args.generation),
        "adapter": "filesystem-http",
    }


def _smoke_candidate(site, manifest):
    candidate = ThreadingHTTPServer(("127.0.0.1", 0), website_handler(lambda: site))
    thread = threading.Thread(target=candidate.serve_forever, daemon=True)
    thread.start()
    try:
        _readback_origin("http://127.0.0.1:" + str(candidate.server_port), manifest)
    finally:
        candidate.shutdown()
        candidate.server_close()
        thread.join()


def _restore_previous(store, old, base_url):
    if old:
        switch_pointer(store, old["id"])
        atomic_json(store / ACTIVE_STATE_FILE, old)
        http_readback(base_url, stored_release(store, old["id"]))
    else:
        (store / "current").unlink(missing_ok=True)
        (store / ACTIVE_STATE_FILE).unlink(missing_ok=True)


def _activation_state(old, identifier, generation):
    history = old.get("history", []) if old else []
    return {
        "id": identifier,
        "generation": generation,
        "previous": old["id"] if old else None,
        "history": list(dict.fromkeys([*history, identifier])),
    }


def _commit_activation(args, store, old, manifest):
    journal = store / "pending.json"
    atomic_json(
        journal, {"id": args.release, "generation": args.generation, "old": old}
    )
    switch_pointer(store, args.release)
    try:
        http_readback(args.base_url, manifest)
        atomic_json(
            store / ACTIVE_STATE_FILE,
            _activation_state(old, args.release, args.generation),
        )
        journal.unlink()
    except Exception as candidate_error:
        try:
            _restore_previous(store, old, args.base_url)
        except (
            ReleaseError,
            OSError,
            ValueError,
            TypeError,
            KeyError,
        ) as recovery_error:
            # Retain the journal until recovery succeeds; do not mask either failure.
            raise ReleaseError(
                "recovery",
                f"Candidate failed: {candidate_error}; restoring prior version could not be verified: {recovery_error}",
            ) from candidate_error
        journal.unlink(missing_ok=True)
        raise
    return {
        "ok": True,
        "stage": "active",
        "id": args.release,
        "generation": args.generation,
        "previous": old["id"] if old else None,
        "adapter": "filesystem-http",
        "frontend_sha": manifest["frontend_sha"],
        "content_sha": manifest["content_sha"],
    }


def activate(args):
    if not RELEASE.fullmatch(args.release) or args.generation < 1:
        raise ReleaseError("input", "Release ID and positive generation required")
    trusted_origin(args.base_url)
    store = release_store(args.store)
    with locked(store):
        recover_pending(store, args.base_url)
        manifest = stored_release(store, args.release)
        old = _active_state(store, manifest, getattr(args, "operation", "activate"))
        _check_active_pointer(store, old)
        _accept_generation(store, old, args.release, args.generation)
        if old and old["id"] == args.release:
            return _reuse_active(args, store, old, manifest)
        _smoke_candidate(store / "releases" / args.release / "site", manifest)
        _check_freshness(args, manifest)
        return _commit_activation(args, store, old, manifest)


def confined_file(root_fd, relative):
    parts = safe_relative(relative).parts
    directory = os.dup(root_fd)
    try:
        for part in parts[:-1]:
            child = os.open(
                part, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW, dir_fd=directory
            )
            os.close(directory)
            directory = child
        descriptor = os.open(parts[-1], os.O_RDONLY | os.O_NOFOLLOW, dir_fd=directory)
        info = os.fstat(descriptor)
        if not stat.S_ISREG(info.st_mode) or info.st_nlink != 1:
            os.close(descriptor)
            raise ReleaseError(
                "artifact", "Artifact requires independent regular files"
            )
        return os.fdopen(descriptor, "rb")
    except OSError as error:
        raise ReleaseError(
            "artifact", "Unable to read artifact through confined no-follow descriptors"
        ) from error
    finally:
        os.close(directory)


def transfer_artifact_files(root_fd, files, site=None):
    for relative, expected in files.items():
        safe_relative(relative)
        target = site / relative if site is not None else None
        if target is not None:
            target.parent.mkdir(parents=True, exist_ok=True)
        copied = hashlib.sha256()
        with (
            confined_file(root_fd, "site/" + relative) as incoming,
            target.open("wb") if target is not None else nullcontext() as output,
        ):
            while chunk := incoming.read(1024 * 1024):
                if output is not None:
                    output.write(chunk)
                copied.update(chunk)
        if copied.hexdigest() != expected:
            raise ReleaseError("artifact", "Artifact changed during confined import")


def import_release(args):
    source = args.artifact.resolve()
    store = release_store(args.store)
    if not RELEASE.fullmatch(args.manifest_sha256):
        raise ReleaseError("artifact", "Trusted producer manifest hash required")
    descriptor = os.open(source, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW)
    staging = None
    try:
        with confined_file(descriptor, RELEASE_MANIFEST) as file:
            manifest_bytes = file.read(16 * 1024 * 1024 + 1)
        if (
            len(manifest_bytes) > 16 * 1024 * 1024
            or digest(manifest_bytes) != args.manifest_sha256
        ):
            raise ReleaseError(
                "artifact", "Imported manifest differs from the trusted producer pin"
            )
        manifest = json.loads(manifest_bytes)
        identifier = manifest["id"]
        if (
            not isinstance(identifier, str)
            or not RELEASE.fullmatch(identifier)
            or not isinstance(manifest["files"], dict)
        ):
            raise ReleaseError("artifact", "Invalid imported manifest identity/files")
        with locked(store):
            destination = store / "releases" / identifier
            if destination.exists():
                if (
                    digest((destination / RELEASE_MANIFEST).read_bytes())
                    != args.manifest_sha256
                ):
                    raise ReleaseError(
                        "artifact", "Existing release differs for this identity"
                    )
                verify_release(destination)
                transfer_artifact_files(descriptor, manifest["files"])
                register_artifact(store, identifier, args.manifest_sha256)
                return {
                    "ok": True,
                    "stage": "imported",
                    "id": identifier,
                    "reused": True,
                }
            staging = store / ("import-" + uuid.uuid4().hex)
            (staging / "site").mkdir(parents=True)
            (staging / RELEASE_MANIFEST).write_bytes(manifest_bytes)
            transfer_artifact_files(descriptor, manifest["files"], staging / "site")
            verify_release(staging)
            destination.parent.mkdir(exist_ok=True)
            os.rename(staging, destination)
            register_artifact(store, identifier, args.manifest_sha256)
        return {"ok": True, "stage": "imported", "id": identifier, "reused": False}
    finally:
        os.close(descriptor)
        if staging is not None and staging.exists():
            shutil.rmtree(staging)


def fetch_baseline(args):
    base_url = trusted_origin(args.base_url)
    try:
        marker_url = base_url + RELEASE_MARKER_ROUTE
        try:
            with HTTP.open(marker_url, timeout=10) as response:
                if response.geturl() != marker_url:
                    raise ValueError("Unexpected baseline marker redirect")
                marker = json.loads(response.read(65537))
        except HTTPError as error:
            error.close()
            if error.code == 404:
                raise ReleaseError(
                    "baseline-missing", "No prior release marker exists"
                ) from error
            raise
        baseline_url = base_url + BASELINE_ROUTE
        with HTTP.open(baseline_url, timeout=10) as response:
            if response.geturl() != baseline_url:
                raise ValueError("Unexpected baseline redirect")
            data = response.read(4 * 1024 * 1024 + 1)
        if len(data) > 4 * 1024 * 1024:
            raise ValueError("Baseline exceeds supported size")
        if not RELEASE.fullmatch(marker["id"]):
            raise ValueError("Invalid prior release identity")
        if digest(data) != marker["baseline_sha256"]:
            raise ValueError("Baseline and release marker are not the same version")
        sha(marker["frontend_sha"])
        sha(marker["content_sha"])
        # The shared validator owns baseline shape validation; this step binds transport bytes only.
        json.loads(data)
        args.output.write_bytes(data)
    except (OSError, ValueError, KeyError) as error:
        if isinstance(error, HTTPError):
            error.close()
        raise ReleaseError("baseline", str(error)) from error
    return {"ok": True, "stage": "baseline", "release": marker["id"]}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="operation", required=True)
    build = commands.add_parser("prepare")
    for name in (
        "frontend-repo",
        "frontend-sha",
        "approved-frontend-sha",
        "content-repo",
        "content-sha",
    ):
        build.add_argument("--" + name, required=True)
    build.add_argument("--approvals", type=Path, required=True)
    build.add_argument("--baseline", type=Path)
    build.add_argument("--build-env", type=Path)
    build.add_argument("--store", type=Path, required=True)
    for name in ("activate", "rollback"):
        deploy = commands.add_parser(name)
        deploy.add_argument("--store", type=Path, required=True)
        deploy.add_argument("--release", required=True)
        deploy.add_argument("--generation", type=int, required=True)
        deploy.add_argument("--base-url", required=True)
        deploy.add_argument(
            "--freshness-repository",
            help="Trusted policy repository; check source/pin inside activation lock immediately before pointer swap",
        )
    importer = commands.add_parser("import")
    importer.add_argument("--store", type=Path, required=True)
    importer.add_argument("--artifact", type=Path, required=True)
    importer.add_argument("--manifest-sha256", required=True)
    fetch = commands.add_parser("fetch-baseline")
    fetch.add_argument("--base-url", required=True)
    fetch.add_argument("--output", type=Path, required=True)
    serve = commands.add_parser("serve")
    serve.add_argument("--store", type=Path, required=True)
    serve.add_argument("--port", type=int, default=8536)
    serve.add_argument("--tls-cert", type=Path, required=True)
    serve.add_argument("--tls-key", type=Path, required=True)
    serve.add_argument("--host", choices=("127.0.0.1",), default="127.0.0.1")
    args = parser.parse_args()
    try:
        if args.operation == "prepare":
            result = prepare(args)
        elif args.operation in ("activate", "rollback"):
            result = activate(args)
        elif args.operation == "import":
            result = import_release(args)
        elif args.operation == "fetch-baseline":
            result = fetch_baseline(args)
        else:
            tls = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
            tls.minimum_version = ssl.TLSVersion.TLSv1_2
            tls.load_cert_chain(args.tls_cert, args.tls_key)
            server = ThreadingHTTPServer(
                ("127.0.0.1", args.port),
                website_handler(lambda: args.store / "current/site"),
            )
            server.socket = tls.wrap_socket(server.socket, server_side=True)
            print(
                json.dumps(
                    {
                        "stage": "serving",
                        "port": server.server_port,
                        "adapter": "filesystem-https",
                    }
                ),
                flush=True,
            )
            server.serve_forever()
            return 0
        print(json.dumps(result, ensure_ascii=False))
        return 0
    except (ReleaseError, OSError, ValueError, TypeError, KeyError) as error:
        print(
            json.dumps(
                {
                    "ok": False,
                    "stage": getattr(error, "stage", args.operation),
                    "error": str(error),
                }
            )
        )
        return 1


if __name__ == "__main__":
    sys.exit(main())
