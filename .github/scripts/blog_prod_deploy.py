"""Pinned-image production Website activation with exact-image recovery.

Transport runs only this reviewed source and a bounded data bundle on the pinned
SSH host. It never resets the shared checkout or builds/recreates Product.
"""

import argparse
import contextlib
import fcntl
import hashlib
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


def validate_payload(item):
    if not isinstance(item, dict) or item.get("schema") != 1:
        raise ValueError("Unsupported publication data")
    for key in ("frontend_sha", "content_sha"):
        if not isinstance(item.get(key), str) or not COMMIT.fullmatch(item[key]):
            raise ValueError("Full lowercase source SHA required")
    if not isinstance(item.get("image"), str) or not IMAGE.fullmatch(item["image"]):
        raise ValueError("Website repository digest required")
    if (
        not isinstance(item.get("compose"), str)
        or len(item["compose"].encode()) > 128 * 1024
    ):
        raise ValueError("Bounded frozen Compose source required")
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
        if not isinstance(route, dict):
            raise TypeError("Invalid public route")
        path = route.get("path", "")
        file_path = route.get("file_path", "")
        if (
            not isinstance(file_path, str)
            or not ROUTE.fullmatch("/" + file_path)
            or file_path.startswith("/")
            or "." in file_path.split("/")
            or ".." in file_path.split("/")
            or "%" in file_path
        ):
            raise ValueError("Safe literal relative file path required")
        if (
            not isinstance(path, str)
            or not ROUTE.fullmatch(path)
            or path.startswith("//")
            or "." in path.split("/")
            or ".." in path.split("/")
            or "%" in path
            or path in observed
        ):
            raise ValueError("Only unique literal public paths allowed")
        if not isinstance(route.get("sha256"), str) or not DIGEST.fullmatch(
            route["sha256"]
        ):
            raise ValueError("Expected public bytes digest required")
        if route.get("content_type") not in (
            "application/json",
            "text/html",
            "text/plain",
            "text/css",
            "application/javascript",
            "text/javascript",
            "image/png",
            "image/jpeg",
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
        ):
            raise ValueError("Unsupported expected MIME")
        observed.add(path)
    if "/blog-release.json" not in observed:
        raise ValueError("Public version marker required")
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
        if route["path"] == "/blog-release.json":
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


def preserve_published_routes(call, previous, manifest):
    prefix = "/app/apps/website/out"
    listing = execute(
        call,
        [
            "docker",
            "exec",
            previous["id"],
            "find",
            prefix,
            "-type",
            "f",
            "-name",
            "*.html",
        ],
    )
    observed = set()
    for name in listing.splitlines():
        if not name.startswith(prefix + "/"):
            raise ValueError("Unexpected published output path")
        path = name[len(prefix) :]
        if re.fullmatch(r"/(?:zh-TW|en)/blog(?:/[^\n]+)?\.html", path):
            observed.add(path)
    expected = {"/" + route["file_path"] for route in manifest["routes"]}
    if not observed or not observed.issubset(expected):
        raise ValueError("Publication cannot remove existing Blog HTML routes")


def previous_public(read):
    pages = {path: read(path) for path in ("/blog", "/en/blog")}
    try:
        raw = read("/blog-release.json")
    except urllib.error.HTTPError as error:
        if error.code != 404:
            raise
        return pages
    try:
        marker = json.loads(raw)
    except (ValueError, UnicodeError):
        return pages  # legacy HTML soft404 is not a version marker
    if not isinstance(marker, dict) or not all(
        isinstance(marker.get(key), str) and COMMIT.fullmatch(marker[key])
        for key in ("frontend_sha", "content_sha")
    ):
        raise ValueError("Existing JSON marker has invalid source identity")
    pages["/blog-release.json"] = raw
    return pages


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
        if not (root / "pending.json").exists():
            shutil.rmtree(folder)


def journal(root, item):
    temporary = root / "pending.next"
    temporary.write_text(json.dumps(item, indent=2) + "\n")
    with temporary.open("rb") as source:
        os.fsync(source.fileno())
    temporary.replace(root / "pending.json")
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
    if (root / "pending.json").exists() or (root / "pending.json").is_symlink():
        raise ValueError("Pending activation requires explicit operator recovery")
    lock = lock_path or root / "deployment.lock"
    descriptor = os.open(lock, os.O_WRONLY | os.O_CREAT | os.O_NOFOLLOW, 0o600)
    with os.fdopen(descriptor, "w") as handle:
        fcntl.flock(handle, fcntl.LOCK_EX)
        if (root / "pending.json").exists():
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
    preserve_published_routes(call, previous, item["manifest"])
    previous_pages = previous_public(read)
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
        recovered = False
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
                    path: hashlib.sha256(data).hexdigest()
                    for path, data in previous_pages.items()
                },
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
        except (
            ValueError,
            OSError,
            subprocess.SubprocessError,
            KeyboardInterrupt,
            SystemExit,
        ) as error:
            with recovery_signals_blocked():
                report["failure_type"] = type(error).__name__
                if changed:
                    try:
                        activate(previous["image"])
                        restored = website(call)
                        report["rollback_verified"] = restored["image"] == previous[
                            "image"
                        ] and all(
                            read(path) == data for path, data in previous_pages.items()
                        )
                        recovered = report["rollback_verified"]
                    except (
                        ValueError,
                        OSError,
                        subprocess.SubprocessError,
                        KeyboardInterrupt,
                        SystemExit,
                    ) as recovery_error:
                        report["recovery_failure_type"] = type(recovery_error).__name__
                report["product_unchanged"] = (
                    container_ids(call, "prod_product") == product
                )
                (root / "last-result.json").write_text(
                    json.dumps(report, indent=2) + "\n"
                )
                if recovered or not changed:
                    execute(call, ["docker", "rm", holder])
                    (root / "pending.json").unlink()
                raise PublicationError(report) from None
        (root / "last-result.json").write_text(json.dumps(report, indent=2) + "\n")
        execute(call, ["docker", "rm", holder])
        (root / "pending.json").unlink()
    return report


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


def remote(item):
    signal.signal(signal.SIGTERM, lambda *_: (_ for _ in ()).throw(KeyboardInterrupt()))
    signal.signal(signal.SIGINT, lambda *_: (_ for _ in ()).throw(KeyboardInterrupt()))
    signal.signal(signal.SIGHUP, lambda *_: (_ for _ in ()).throw(KeyboardInterrupt()))
    signal.signal(signal.SIGALRM, lambda *_: (_ for _ in ()).throw(KeyboardInterrupt()))
    signal.alarm(600)
    try:
        report = publish(
            item, lock_path=Path("/var/lock/daodao-production-deploy.lock")
        )
    except PublicationError as error:
        print(json.dumps(error.report), flush=True)
        raise SystemExit(1) from None
    print(json.dumps(report), flush=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--image", required=True)
    parser.add_argument("--frontend-sha", required=True)
    parser.add_argument("--content-sha", required=True)
    parser.add_argument("--manifest", type=Path, required=True)
    args = parser.parse_args()
    item = {
        "schema": 1,
        "image": args.image,
        "frontend_sha": args.frontend_sha,
        "content_sha": args.content_sha,
        "manifest": json.loads(args.manifest.read_text()),
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
