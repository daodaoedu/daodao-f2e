"""Pinned-image production Website activation with exact-image recovery.

Transport runs only this reviewed source and a bounded data bundle on the pinned
SSH host. It never resets the shared checkout or builds/recreates Product.
"""

import argparse
import contextlib
import fcntl
import hashlib
import http.client
import ipaddress
import json
import os
import re
import shlex
import shutil
import signal
import stat
import subprocess
import tempfile
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2] if "__file__" in globals() else Path("/")
ORIGIN = "https://daodao.so"
MAX_BUNDLE = 4 * 1024 * 1024
MAX_BODY = 8 * 1024 * 1024
MAX_OLD_PUBLIC_BYTES = 64 * 1024 * 1024
MIME_JSON = "application/json"
MIME_HTML = "text/html"
MIME_JPEG = "image/jpeg"
MARKER_PATH = "/blog-release.json"
PENDING_FILE = "pending.json"
PUBLIC_MANIFEST = "blog-prod-public-manifest.json"
INVALID_FILE = "Safe literal relative file path required"
INVALID_PATH = "Only unique literal public paths allowed"
LEGACY_CONTENT_SHA = "0daa4231bb2072657c807813e960919b982f9d8e"
OLD_ROOTS = ("zh-TW/blog.html", "zh-TW/blog", "en/blog.html", "en/blog", "blog-images")
INVENTORY = 'set -o pipefail; find "$@" ! -type d -exec stat -c "%F|%n" {} \\; | head -c 4194305'
IMAGE_MIME = {
    "png": "image/png",
    "jpg": MIME_JPEG,
    "jpeg": MIME_JPEG,
    "webp": "image/webp",
    "avif": "image/avif",
    "gif": "image/gif",
}
COMMIT = re.compile(r"[a-f0-9]{40}", re.ASCII)
DIGEST = re.compile(r"[a-f0-9]{64}", re.ASCII)
IMAGE = re.compile(
    r"[a-z0-9][a-z0-9_-]{0,63}/daodao-website@sha256:[a-f0-9]{64}", re.ASCII
)
OLD_IMAGE = re.compile(r"sha256:[a-f0-9]{64}", re.ASCII)
PROJECT = re.compile(r"[a-z0-9][a-z0-9_-]{0,62}", re.ASCII)
ROUTE = re.compile(r"/[A-Za-z0-9_./%~-]*", re.ASCII)
INSPECT = (
    '{"id":{{json .Id}},"image":{{json .Image}},'
    '"project":{{json (index .Config.Labels "com.docker.compose.project")}},'
    '"service":{{json (index .Config.Labels "com.docker.compose.service")}}}'
)


class PublicationError(RuntimeError):
    def __init__(self, report):
        self.report = report
        super().__init__("Production publication failed; inspect recovery report")


def validate_source_identity(item):
    if not isinstance(item, dict) or item.get("schema") != 1:
        raise ValueError("Unsupported publication data")
    for key in ("frontend_sha", "content_sha", "baseline_content_sha"):
        if not isinstance(item.get(key), str) or not COMMIT.fullmatch(item[key]):
            raise ValueError("Full lowercase source SHA required")
    if not isinstance(item.get("allow_legacy_bootstrap"), bool):
        raise TypeError("Explicit legacy bootstrap policy required")
    if not isinstance(item.get("image"), str) or not IMAGE.fullmatch(item["image"]):
        raise ValueError("Website repository digest required")
    if (
        not isinstance(item.get("compose"), str)
        or len(item["compose"].encode()) > 128 * 1024
    ):
        raise ValueError("Bounded frozen Compose source required")


def validate_relative_file(file_path):
    if not isinstance(file_path, str) or file_path.startswith("/"):
        raise ValueError(INVALID_FILE)
    if not ROUTE.fullmatch("/" + file_path) or "%" in file_path:
        raise ValueError(INVALID_FILE)
    if {".", ".."}.intersection(file_path.split("/")):
        raise ValueError(INVALID_FILE)


def validate_public_path(path, observed):
    if not isinstance(path, str) or not ROUTE.fullmatch(path):
        raise ValueError(INVALID_PATH)
    if path.startswith("//") or "%" in path or path in observed:
        raise ValueError(INVALID_PATH)
    if {".", ".."}.intersection(path.split("/")):
        raise ValueError(INVALID_PATH)


SUPPORTED_MIME = {
    MIME_JSON,
    MIME_HTML,
    "text/plain",
    "text/css",
    "application/javascript",
    "text/javascript",
    "image/png",
    MIME_JPEG,
    "image/webp",
    "image/avif",
    "image/svg+xml",
    "image/gif",
    "image/x-icon",
    "font/woff",
    "font/woff2",
    "application/xml",
    "text/xml",
    "application/octet-stream",
}


def validate_route(route, observed):
    if not isinstance(route, dict):
        raise TypeError("Invalid public route")
    validate_relative_file(route.get("file_path", ""))
    validate_public_path(route.get("path", ""), observed)
    if not isinstance(route.get("sha256"), str) or not DIGEST.fullmatch(
        route["sha256"]
    ):
        raise ValueError("Expected public bytes digest required")
    if (
        not isinstance(route.get("content_type"), str)
        or route["content_type"] not in SUPPORTED_MIME
    ):
        raise ValueError("Unsupported expected MIME")
    observed.add(route["path"])


def validate_manifest(item):
    manifest = item.get("manifest")
    if not isinstance(manifest, dict) or manifest.get("schema") != 1:
        raise ValueError("Public verification manifest required")
    if any(manifest.get(key) != item[key] for key in ("frontend_sha", "content_sha")):
        raise ValueError("Public source identity differs")
    routes = manifest.get("routes")
    if not isinstance(routes, list) or not 1 <= len(routes) <= 3000:
        raise ValueError("Bounded public route inventory required")
    observed = set()
    for route in routes:
        validate_route(route, observed)
    if MARKER_PATH not in observed:
        raise ValueError("Public version marker required")


def validate_payload(item):
    validate_source_identity(item)
    validate_manifest(item)
    return item


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def read_public(path, content_type=None):
    request = urllib.request.Request(
        ORIGIN + path + "?blog_verify=" + str(time.time_ns()),
        headers={
            "User-Agent": "DaoDao-Blog-Production-Readback/1.0",
            "Cache-Control": "no-cache",
            "Accept-Encoding": "identity",
        },
    )
    with urllib.request.build_opener(NoRedirect()).open(
        request, timeout=20
    ) as response:
        if (
            response.status != 200
            or response.geturl().split("?", 1)[0] != ORIGIN + path
        ):
            raise ValueError("Public response status/origin differs")
        if content_type and response.headers.get_content_type() != content_type:
            raise ValueError("Public MIME differs")
        data = response.read(MAX_BODY + 1)
        if len(data) > MAX_BODY:
            raise ValueError("Public response exceeds bound")
        return data


def verify_public(manifest):
    for route in manifest["routes"]:
        data = read_public(route["path"], route["content_type"])
        if hashlib.sha256(data).hexdigest() != route["sha256"]:
            raise ValueError("Public bytes differ")
        if route["path"] == MARKER_PATH:
            marker = json.loads(data)
            if any(
                marker.get(key) != manifest[key]
                for key in ("frontend_sha", "content_sha")
            ):
                raise ValueError("Public version identity differs")


def execute(call, argv, environment=None):
    kwargs = {"check": True, "text": True, "capture_output": True, "timeout": 180}
    if environment is not None:
        kwargs["env"] = environment
    result = call(argv, **kwargs)
    return result.stdout.strip()


def container_ids(call, service):
    return execute(
        call,
        [
            "docker",
            "ps",
            "-a",
            "--filter",
            "label=com.docker.compose.service=" + service,
            "--format",
            "{{.ID}}",
        ],
    )


def check_current_source(call, frontend_sha):
    output = execute(
        call,
        [
            "git",
            "-c",
            "credential.helper=",
            "-c",
            "core.hooksPath=/dev/null",
            "ls-remote",
            "--exit-code",
            "https://github.com/daodaoedu/daodao-f2e.git",
            "refs/heads/prod",
        ],
        environment={
            "PATH": "/usr/bin:/bin",
            "GIT_CONFIG_NOSYSTEM": "1",
            "GIT_CONFIG_GLOBAL": "/dev/null",
            "GIT_TERMINAL_PROMPT": "0",
        },
    )
    if output.split() != [frontend_sha, "refs/heads/prod"]:
        raise ValueError("Production source advanced while awaiting deployment")


def website(call):
    names = container_ids(call, "prod_website").splitlines()
    if len(names) != 1:
        raise ValueError("Exactly one existing production Website required")
    item = json.loads(
        execute(call, ["docker", "inspect", "--format", INSPECT, names[0]])
    )
    if (
        not OLD_IMAGE.fullmatch(item.get("image", ""))
        or not PROJECT.fullmatch(item.get("project", ""))
        or item.get("service") != "prod_website"
    ):
        raise ValueError("Existing Website ownership/image is invalid")
    return item


def existing_blog_roots(call, identifier, prefix):
    roots = []
    for relative in OLD_ROOTS:
        candidate = prefix + "/" + relative
        probe = call(
            ["docker", "exec", identifier, "test", "-e", candidate],
            check=False,
            text=True,
            capture_output=True,
            timeout=30,
        )
        if probe.returncode == 0:
            roots.append(candidate)
        elif probe.returncode != 1:
            raise ValueError("Cannot inventory the existing public Blog roots")
    if not roots:
        raise ValueError("Existing public Blog roots required")
    return roots


def parse_inventory_path(line, prefix):
    kind, separator, name = line.partition("|")
    if not separator or kind not in ("regular file", "regular empty file"):
        raise ValueError("Existing public inventory must contain regular files")
    if not name.startswith(prefix + "/"):
        raise ValueError("Unexpected published output path")
    path = name[len(prefix) :]
    if not ROUTE.fullmatch(path) or "%" in path or "//" in path:
        raise ValueError("Unsafe existing public path")
    if {".", ".."}.intersection(path.split("/")):
        raise ValueError("Unsafe existing public path")
    return path


def parse_public_inventory(listing, prefix):
    if len(listing.encode()) > MAX_BUNDLE or len(listing.splitlines()) > 3000:
        raise ValueError("Existing public inventory exceeds bounds")
    observed = set()
    routes = {}
    for line in listing.splitlines():
        path = parse_inventory_path(line, prefix)
        public_routes = old_public_routes(path)
        if MIME_HTML in public_routes.values():
            observed.add(path)
        routes.update(public_routes)
    return observed, routes


def preserve_published_routes(call, previous, manifest):
    prefix = "/app/apps/website/out"
    roots = existing_blog_roots(call, previous["id"], prefix)
    listing = execute(
        call,
        ["docker", "exec", previous["id"], "sh", "-c", INVENTORY, "inventory", *roots],
    )
    observed, routes = parse_public_inventory(listing, prefix)
    expected = {"/" + route["file_path"] for route in manifest["routes"]}
    if not observed or not observed.issubset(expected):
        raise ValueError("Publication cannot remove existing Blog HTML routes")
    return routes


def old_public_routes(path):
    if re.fullmatch(r"/(?:zh-TW|en)/blog(?:/[A-Za-z0-9_./~-]+)?\.html", path):
        public = (
            path.removesuffix("/index.html")
            if path.endswith("/index.html")
            else path.removesuffix(".html")
        )
        routes = {public: MIME_HTML}
        if public.startswith("/zh-TW/"):
            routes[public.removeprefix("/zh-TW")] = MIME_HTML
        return routes
    if path.startswith("/blog-images/") and path.rsplit(".", 1)[-1] in IMAGE_MIME:
        return {path: IMAGE_MIME[path.rsplit(".", 1)[-1]]}
    raise ValueError("Unsupported existing public Blog file")


def previous_public(read, routes, item):
    routes = {**routes, "/blog": MIME_HTML, "/en/blog": MIME_HTML}
    pages = {}
    total = 0
    for path, content_type in sorted(routes.items()):
        data = read(path, content_type)
        total += len(data)
        if len(data) > MAX_BODY or total > MAX_OLD_PUBLIC_BYTES:
            raise ValueError("Existing public bytes exceed capture bounds")
        pages[path] = {
            "sha256": hashlib.sha256(data).hexdigest(),
            "content_type": content_type,
        }
    try:
        raw = read(MARKER_PATH)
    except urllib.error.HTTPError as error:
        if error.code != 404:
            raise
        validate_legacy_seed(item)
        return pages
    try:
        marker = json.loads(raw)
    except ValueError:
        validate_legacy_seed(item)
        return pages  # legacy HTML soft404 is not a version marker
    if not isinstance(marker, dict) or not all(
        isinstance(marker.get(key), str) and COMMIT.fullmatch(marker[key])
        for key in ("frontend_sha", "content_sha")
    ):
        raise ValueError("Existing JSON marker has invalid source identity")
    if marker["content_sha"] != item["baseline_content_sha"]:
        raise ValueError("Live production content differs from the frozen baseline")
    if read(MARKER_PATH, MIME_JSON) != raw:
        raise ValueError("Existing version marker changed during baseline capture")
    pages[MARKER_PATH] = {
        "sha256": hashlib.sha256(raw).hexdigest(),
        "content_type": MIME_JSON,
    }
    return pages


def validate_legacy_seed(item):
    if (
        not item["allow_legacy_bootstrap"]
        or item["baseline_content_sha"] != LEGACY_CONTENT_SHA
    ):
        raise ValueError(
            "Legacy bootstrap requires explicit policy and accepted content baseline"
        )


def verify_previous_public(read, snapshot):
    verified = True
    for path, expected in snapshot.items():
        actual = hashlib.sha256(read(path, expected["content_type"])).hexdigest()
        matches = actual == expected["sha256"]
        verified = verified and matches
    return verified


@contextlib.contextmanager
def recovery_signals_blocked():
    blocked = {signal.SIGTERM, signal.SIGINT, signal.SIGHUP, signal.SIGALRM}
    previous = signal.pthread_sigmask(signal.SIG_BLOCK, blocked)
    signal.alarm(0)
    try:
        yield
    finally:
        while signal.sigpending().intersection(blocked):
            signal.sigwait(signal.sigpending().intersection(blocked))
        signal.pthread_sigmask(signal.SIG_SETMASK, previous)


@contextlib.contextmanager
def release_workspace(root):
    folder = Path(tempfile.mkdtemp(prefix="release-", dir=root))
    try:
        yield folder
    finally:
        # A failed or killed activation retains its exact frozen recovery inputs.
        if not (root / PENDING_FILE).exists():
            shutil.rmtree(folder)


def journal(root, item):
    temporary = root / "pending.next"
    temporary.write_text(json.dumps(item, indent=2) + "\n")
    with temporary.open("rb") as source:
        os.fsync(source.fileno())
    temporary.replace(root / PENDING_FILE)
    descriptor = os.open(root, os.O_RDONLY)
    try:
        os.fsync(descriptor)
    finally:
        os.close(descriptor)


def publish(
    item,
    call=subprocess.run,
    verify=verify_public,
    read=read_public,
    root=Path("/srv/daodao-blog-production"),
    lock_path=None,
):
    validate_payload(item)
    if root.is_symlink():
        raise ValueError("Publication state must not be a symlink")
    root.mkdir(mode=0o700, parents=True, exist_ok=True)
    if root.stat().st_uid != os.getuid() or stat.S_IMODE(root.stat().st_mode) & 0o077:
        raise ValueError("Publication state must be private and owned")
    if (root / PENDING_FILE).exists() or (root / PENDING_FILE).is_symlink():
        raise ValueError("Pending activation requires explicit operator recovery")
    lock = lock_path or root / "deployment.lock"
    descriptor = os.open(lock, os.O_WRONLY | os.O_CREAT | os.O_NOFOLLOW, 0o600)
    with os.fdopen(descriptor, "w") as handle:
        fcntl.flock(handle, fcntl.LOCK_EX)
        if (root / PENDING_FILE).exists():
            raise ValueError("Pending activation requires explicit operator recovery")
        return publish_locked(item, call, verify, read, root)


def activate_website(
    call,
    project,
    compose,
    override,
    image,
    environment,
    project_directory="/root/daodao-f2e",
):
    if not PROJECT.fullmatch(project) or not (
        IMAGE.fullmatch(image) or OLD_IMAGE.fullmatch(image)
    ):
        raise ValueError("Invalid Website activation identity")
    override.write_text(json.dumps({"services": {"prod_website": {"image": image}}}))
    argv = [
        "docker",
        "compose",
        "--project-directory",
        str(project_directory),
        "-p",
        project,
        "-f",
        str(compose),
        "-f",
        str(override),
        "up",
        "-d",
        "--no-deps",
        "--wait",
        "--wait-timeout",
        "90",
        "prod_website",
    ]
    execute(call, argv, environment=environment)


def publish_locked(item, call, verify, read, root):
    check_current_source(call, item["frontend_sha"])
    previous = website(call)
    product = container_ids(call, "prod_product")
    if not product:
        raise ValueError("Existing Product identity required")
    previous_routes = preserve_published_routes(call, previous, item["manifest"])
    previous_pages = previous_public(read, previous_routes, item)
    report = {
        "frontend_sha": item["frontend_sha"],
        "content_sha": item["content_sha"],
        "image": item["image"],
        "previous_image": previous["image"],
        "public_verified": False,
        "rollback_verified": False,
        "product_unchanged": False,
    }
    with release_workspace(root) as folder:
        compose = folder / "compose.yaml"
        override = folder / "image.json"
        compose.write_text(item["compose"])
        with compose.open("rb") as source:
            os.fsync(source.fileno())
        holder = "daodao-blog-rollback-" + folder.name
        execute(
            call,
            [
                "docker",
                "create",
                "--name",
                holder,
                "--network",
                "none",
                "--label",
                "daodao.blog.rollback=owned",
                previous["image"],
            ],
        )
        changed = False
        journal(
            root,
            {
                "status": "activation-pending",
                "frontend_sha": item["frontend_sha"],
                "content_sha": item["content_sha"],
                "image": item["image"],
                "previous_image": previous["image"],
                "project": previous["project"],
                "frozen_compose": str(compose),
                "frozen_compose_sha256": hashlib.sha256(
                    item["compose"].encode()
                ).hexdigest(),
                "rollback_holder": holder,
                "previous_public_sha256": {
                    path: data["sha256"] for path, data in previous_pages.items()
                },
                "previous_public": previous_pages,
            },
        )
        environment = dict(
            os.environ,
            DOCKER_HUB_USERNAME=item["image"].split("/", 1)[0],
            IMAGE_TAG="prod",
            COMMIT_SHA="",
        )

        def activate(image):
            activate_website(
                call, previous["project"], compose, override, image, environment
            )

        recovery = {
            "activate": activate,
            "previous": previous,
            "call": call,
            "read": read,
            "snapshot": previous_pages,
            "report": report,
            "product": product,
            "root": root,
            "holder": holder,
        }
        try:
            execute(call, ["docker", "pull", item["image"]])
            check_current_source(call, item["frontend_sha"])
            changed = True
            activate(item["image"])
            verify(item["manifest"])
            report["product_unchanged"] = container_ids(call, "prod_product") == product
            if not report["product_unchanged"]:
                raise ValueError("Product identity changed")
            report["public_verified"] = True
        except (KeyboardInterrupt, SystemExit) as error:
            recover_after_failure(error, changed, recovery)
            raise
        except (
            ValueError,
            OSError,
            subprocess.SubprocessError,
            http.client.HTTPException,
        ) as error:
            recover_after_failure(error, changed, recovery)
            raise PublicationError(report) from None
        (root / "last-result.json").write_text(json.dumps(report, indent=2) + "\n")
        execute(call, ["docker", "rm", holder])
        (root / PENDING_FILE).unlink()
    return report


def recover_after_failure(error, changed, context):
    report = context["report"]
    call, root = context["call"], context["root"]
    with recovery_signals_blocked():
        report["failure_type"] = type(error).__name__
        recovered = restore_previous(context) if changed else False
        report["product_unchanged"] = (
            container_ids(call, "prod_product") == context["product"]
        )
        write_report(root, report)
        if recovered or not changed:
            execute(call, ["docker", "rm", context["holder"]])
            (root / PENDING_FILE).unlink()


def write_report(root, report):
    (root / "last-result.json").write_text(json.dumps(report, indent=2) + "\n")


def restore_previous(context):
    previous, report = context["previous"], context["report"]
    try:
        context["activate"](previous["image"])
        restored = website(context["call"])
        report["rollback_verified"] = restored["image"] == previous[
            "image"
        ] and verify_previous_public(context["read"], context["snapshot"])
        return report["rollback_verified"]
    except (KeyboardInterrupt, SystemExit) as error:
        report["recovery_failure_type"] = type(error).__name__
        write_report(context["root"], report)
        raise
    except (
        ValueError,
        OSError,
        subprocess.SubprocessError,
        http.client.HTTPException,
    ) as error:
        report["recovery_failure_type"] = type(error).__name__
        return False


BOOTSTRAP = """import hashlib,json,sys
raw=sys.stdin.buffer.read(4194305)
if len(raw)>4194304 or hashlib.sha256(raw).hexdigest()!=sys.argv[1]:
 raise ValueError('Transfer binding failed')
bundle=json.loads(raw)
scope={'__name__':'blog_prod_remote'}
exec(compile(bundle['source'],'reviewed-blog-prod-deploy.py','exec'),scope)
scope['remote'](bundle['data'])
"""


def ssh_arguments(host, key, known_hosts, digest):
    ipaddress.ip_address(host)
    if not DIGEST.fullmatch(digest):
        raise ValueError("Transfer digest required")
    for path in (key, known_hosts):
        if Path(path).is_symlink() or not Path(path).is_file():
            raise ValueError("Existing regular SSH files required")
    return [
        "ssh",
        "-F",
        "/dev/null",
        "-i",
        str(key),
        "-o",
        "IdentitiesOnly=yes",
        "-o",
        "BatchMode=yes",
        "-o",
        "ClearAllForwardings=yes",
        "-o",
        "ConnectTimeout=15",
        "-o",
        "ServerAliveInterval=15",
        "-o",
        "ServerAliveCountMax=3",
        "-o",
        "StrictHostKeyChecking=yes",
        "-o",
        "HostKeyAlias=daodao-blog-production",
        "-o",
        "UserKnownHostsFile=" + str(known_hosts),
        "-o",
        "GlobalKnownHostsFile=/dev/null",
        "root@" + host,
        "/usr/bin/python3 -I -S -c " + shlex.quote(BOOTSTRAP) + " " + digest,
    ]


def interrupt_publication(_signum, _frame):
    raise KeyboardInterrupt()


def remote(item):
    for handled in (signal.SIGTERM, signal.SIGINT, signal.SIGHUP, signal.SIGALRM):
        signal.signal(handled, interrupt_publication)
    signal.alarm(600)
    try:
        report = publish(
            item, lock_path=Path("/var/lock/daodao-production-deploy.lock")
        )
    except PublicationError as error:
        print(json.dumps(error.report), flush=True)
        raise SystemExit(1) from None
    print(json.dumps(report), flush=True)


def load_public_manifest(environment):
    configured = Path(environment.get("RUNNER_TEMP", ""))
    if (
        not configured.is_absolute()
        or configured.is_symlink()
        or not configured.is_dir()
    ):
        raise ValueError("Existing trusted runner temporary directory required")
    root = configured.resolve(strict=True)
    path = root / PUBLIC_MANIFEST
    metadata = path.lstat()
    if (
        not stat.S_ISREG(metadata.st_mode)
        or metadata.st_nlink != 1
        or metadata.st_size > MAX_BUNDLE
    ):
        raise ValueError("Public manifest must be a bounded regular non-linked file")
    descriptor = os.open(path, os.O_RDONLY | os.O_NOFOLLOW)
    with os.fdopen(descriptor, "rb") as source:
        opened = os.fstat(source.fileno())
        if (opened.st_dev, opened.st_ino) != (metadata.st_dev, metadata.st_ino):
            raise ValueError("Public manifest changed during opening")
        data = source.read(MAX_BUNDLE + 1)
    if len(data) > MAX_BUNDLE:
        raise ValueError("Public manifest exceeds read bounds")
    return json.loads(data)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--image", required=True)
    parser.add_argument("--frontend-sha", required=True)
    parser.add_argument("--content-sha", required=True)
    parser.add_argument("--baseline-content-sha", required=True)
    parser.add_argument("--allow-legacy-bootstrap", choices=("0", "1"), default="0")
    args = parser.parse_args()
    item = {
        "schema": 1,
        "image": args.image,
        "frontend_sha": args.frontend_sha,
        "content_sha": args.content_sha,
        "baseline_content_sha": args.baseline_content_sha,
        "allow_legacy_bootstrap": args.allow_legacy_bootstrap == "1",
        "manifest": load_public_manifest(os.environ),
        "compose": (ROOT / "docker-compose.yaml").read_text(),
    }
    validate_payload(item)
    bundle = json.dumps({"source": Path(__file__).read_text(), "data": item}).encode()
    if len(bundle) > MAX_BUNDLE:
        raise ValueError("Transfer exceeds bound")
    with tempfile.TemporaryDirectory(prefix="blog-prod-ssh-") as folder:
        known = Path(folder) / "known_hosts"
        public_key = (ROOT / ".github/known-hosts/linode-dev.pub").read_text().strip()
        known.write_text("daodao-blog-production " + public_key + "\n")
        argv = ssh_arguments(
            os.environ["BLOG_SSH_HOST"],
            Path(os.environ["BLOG_SSH_KEY_FILE"]),
            known,
            hashlib.sha256(bundle).hexdigest(),
        )
        result = subprocess.run(
            argv, input=bundle, capture_output=True, timeout=900, check=False
        )
        if result.returncode:
            if result.stdout:
                print(result.stdout.decode(), end="")
            raise ValueError(
                "Production SSH operation failed; recovery status is separate"
            )
        report = json.loads(result.stdout)
        if (
            report.get("frontend_sha") != args.frontend_sha
            or report.get("content_sha") != args.content_sha
            or report.get("image") != args.image
            or not report.get("public_verified")
            or not report.get("product_unchanged")
        ):
            raise ValueError("Remote publication report differs")
        print(json.dumps(report))


if __name__ == "__main__":
    main()
