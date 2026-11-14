"""Capless development publication client. Only fixed dev HTTPS or owned loopback bootstrap."""

import hashlib
import importlib.util
import json
import os
import ssl
import subprocess
import sys
import threading
import time
from http.server import ThreadingHTTPServer
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlsplit
from urllib.request import HTTPRedirectHandler, build_opener

STORE = Path("/store")
OUT = Path("/evidence")
DEV_ORIGIN = "https://dev.daodao.so"
CONFIG = {}
PRODUCER = {}
BASE = 0


class RejectRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


HTTP = build_opener(RejectRedirect())


def allowed_origin(origin):
    if origin == DEV_ORIGIN:
        return
    parsed = urlsplit(origin)
    if (
        parsed.scheme != "https"
        or parsed.hostname != "127.0.0.1"
        or not parsed.port
        or parsed.path
        or parsed.query
        or parsed.fragment
        or parsed.username
        or parsed.password
    ):
        raise ValueError("Only fixed dev HTTPS or owned loopback TLS may be contacted")


def controller_module():
    path = Path("/code/blog-release.py")
    if hashlib.sha256(path.read_bytes()).hexdigest() != CONFIG["controllerSha256"]:
        raise ValueError("Controller source binding differs")
    spec = importlib.util.spec_from_file_location("site_release", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def invoke(name, operation, identifier, generation, origin=DEV_ORIGIN, expected=0):
    allowed_origin(origin)
    command = [
        sys.executable,
        "-I",
        "-S",
        "/code/blog-release.py",
        operation,
        "--store",
        str(STORE),
        "--release",
        identifier,
        "--generation",
        str(generation),
        "--base-url",
        origin,
    ]
    ca = (
        "/local-cert.pem"
        if origin.startswith("https://127.0.0.1:") and origin != "https://127.0.0.1:1"
        else "/system-ca.pem"
    )
    process = subprocess.run(
        command,
        env={"PATH": "/usr/bin", "SSL_CERT_FILE": ca, "BLOG_RELEASE_BASE_URL": origin},
        capture_output=True,
        text=True,
        timeout=180,
        check=False,
    )
    (OUT / (name + ".json")).write_text(process.stdout)
    if process.returncode != expected:
        raise RuntimeError("Development controller operation failed: " + name)
    return json.loads(process.stdout)


def import_pair():
    for item in PRODUCER["artifacts"]:
        process = subprocess.run(
            [
                sys.executable,
                "-I",
                "-S",
                "/code/blog-release.py",
                "import",
                "--store",
                str(STORE),
                "--artifact",
                "/input/data/artifacts/" + item["id"],
                "--manifest-sha256",
                item["manifestSha256"],
            ],
            env={"PATH": "/usr/bin"},
            capture_output=True,
            text=True,
            timeout=180,
            check=False,
        )
        if process.returncode != 0:
            raise RuntimeError("Validated artifact import failed")
        (OUT / ("import-" + item["id"] + ".json")).write_text(process.stdout)


def request(path, origin=DEV_ORIGIN, timeout=15):
    allowed_origin(origin)
    try:
        response = HTTP.open(origin + quote(path, safe="/?=&"), timeout=timeout)
    except HTTPError as error:
        response = error
    with response:
        return response.status, response.read(), dict(response.headers)


def marker():
    status, body, _headers = request("/blog-release.json")
    if status != 200:
        raise ValueError("Public development marker is unavailable")
    return json.loads(body)


def noindex_headers(headers):
    lowered = {name.lower(): value for name, value in headers.items()}
    if (
        "noindex" not in lowered.get("x-robots-tag", "").lower()
        or "nofollow" not in lowered.get("x-robots-tag", "").lower()
        or "no-store" not in lowered.get("cache-control", "").lower()
    ):
        raise ValueError("Fresh development response lacks noindex/no-store policy")


def check_mime(filename, headers):
    actual = (
        {key.lower(): value for key, value in headers.items()}.get("content-type", "")
        .split(";", 1)[0]
        .strip()
        .lower()
    )
    suffix = Path(filename).suffix
    expected = {
        ".html": {"text/html"},
        ".js": {"application/javascript", "text/javascript"},
        ".css": {"text/css"},
        ".png": {"image/png"},
        ".txt": {"text/plain"},
    }
    if suffix in expected and actual not in expected[suffix]:
        raise ValueError("Public development MIME differs: " + filename)


def full(identifier, label):
    manifest = json.loads(
        (STORE / "releases" / identifier / "release.json").read_text()
    )
    observations = []
    for filename, expected in manifest["files"].items():
        route = "/" + filename
        if filename == "404.html":
            route = "/404.html"
        status, body, headers = request(route)
        expected_status = 404 if filename == "404.html" else 200
        if status != expected_status or hashlib.sha256(body).hexdigest() != expected:
            raise ValueError("Public development bytes differ: " + filename)
        if filename.endswith(".html") or filename in (
            "blog-release.json",
            "blog-published-baseline.json",
        ):
            noindex_headers(headers)
        check_mime(filename, headers)
        normalized = {name.lower(): value for name, value in headers.items()}
        observations.append(
            {
                "file": filename,
                "route": route,
                "status": status,
                "sha256": expected,
                "cache": normalized.get("cf-cache-status"),
                "robots": normalized.get("x-robots-tag"),
                "cacheControl": normalized.get("cache-control"),
                "contentType": normalized.get("content-type"),
            }
        )
    for route, filename in manifest["smoke"].items():
        status, body, headers = request(route)
        if (
            status != 200
            or hashlib.sha256(body).hexdigest() != manifest["files"][filename]
        ):
            raise ValueError("Public development route differs: " + route)
        noindex_headers(headers)
    (OUT / (label + ".json")).write_text(
        json.dumps(
            {"id": identifier, "files": observations, "routes": manifest["smoke"]},
            indent=2,
        )
    )
    return manifest


def loopback_operation(identifier, operation, generation):
    module = controller_module()
    server = ThreadingHTTPServer(
        ("127.0.0.1", 0), module.website_handler(lambda: STORE / "current/site")
    )
    context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    context.minimum_version = ssl.TLSVersion.TLSv1_2
    context.load_cert_chain("/local-cert.pem", "/local-key.pem")
    server.socket = context.wrap_socket(server.socket, server_side=True)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        origin = "https://127.0.0.1:" + str(server.server_port)
        result = invoke(
            "owned-loopback-" + operation,
            operation,
            identifier,
            generation,
            origin,
        )
        return {
            "ok": True,
            "phase": operation,
            "id": result["id"],
            "scope": "owned loopback TLS bootstrap only; not public site proof",
        }
    finally:
        server.shutdown()
        server.server_close()
        thread.join()


def verify_removed_and_private(before, after):
    removed = sorted(
        path
        for path in set(after["files"]) - set(before["files"])
        if path.startswith("blog-images/")
    )
    if not removed:
        raise ValueError("Synthetic B did not provide a distinct removed-image branch")
    for filename in removed:
        status, _body, headers = request("/" + filename)
        if status != 404:
            raise ValueError("Removed development image remains public")
        noindex_headers(headers)
    for path in [
        "/active.json",
        "/generation.json",
        "/pending.json",
        "/release.json",
        "/.release.lock",
        "/input/provenance.json",
    ]:
        status, _body, headers = request(path)
        if status != 404:
            raise ValueError("Private state route is visible")
        noindex_headers(headers)
    return removed


def publish_synthetic(a, b, before):
    failed = invoke(
        "induced-readback-failure",
        "activate",
        b,
        BASE + 20,
        "https://127.0.0.1:1",
        1,
    )
    if failed["stage"] != "recovery" or marker()["id"] != a:
        raise ValueError("Failed publication did not preserve public official A")
    if invoke("public-b", "activate", b, BASE + 20)["id"] != b:
        raise ValueError("Synthetic B retry failed")
    if invoke("public-b-retry", "activate", b, BASE + 20).get("reused") is not True:
        raise ValueError("Same-generation retry was not idempotent")
    after = full(b, "public-b-all-files")
    for image in set(after["files"]) - set(before["files"]):
        if image.startswith("blog-images/"):
            status, body, headers = request("/" + image)
            if (
                status != 200
                or hashlib.sha256(body).hexdigest() != after["files"][image]
            ):
                raise ValueError("Fresh synthetic image did not publish exact bytes")
            noindex_headers(headers)
    if (
        invoke("stale-a", "activate", a, BASE + 10, expected=1)["stage"] != "superseded"
        or marker()["id"] != b
    ):
        raise ValueError("Stale publication replaced public B")
    return after


def cached_asset_observation(manifest):
    candidates = sorted(name for name in manifest["files"] if name.endswith(".js"))
    if not candidates:
        raise ValueError("Actual prepared website has no JavaScript asset to observe")
    filename = candidates[0]
    observations = []
    for suffix in ["", "?dev-cache-proof=" + str(BASE)]:
        status, body, headers = request("/" + filename + suffix)
        if (
            status != 200
            or hashlib.sha256(body).hexdigest() != manifest["files"][filename]
        ):
            raise ValueError("Cached asset observation bytes differ")
        check_mime(filename, headers)
        lowered = {key.lower(): value for key, value in headers.items()}
        observations.append(
            {
                "file": filename,
                "nonceRequest": bool(suffix),
                "status": status,
                "sha256": manifest["files"][filename],
                "headers": {
                    key: lowered.get(key)
                    for key in [
                        "content-type",
                        "cf-cache-status",
                        "age",
                        "cache-control",
                        "x-robots-tag",
                    ]
                },
            }
        )
    return observations


def public_matrix():
    a, b = [item["id"] for item in PRODUCER["artifacts"]]
    verified_a = False
    finished = False
    try:
        if invoke("public-a", "activate", a, BASE + 10)["id"] != a:
            raise ValueError("Official A was not activated")
        before = full(a, "public-a-all-files")
        verified_a = True
        cache_observations = cached_asset_observation(before)
        after = publish_synthetic(a, b, before)
        if invoke("paired-rollback-a", "rollback", a, BASE + 30)["id"] != a:
            raise ValueError("Paired rollback failed")
        full(a, "public-a-rollback-all-files")
        removed = verify_removed_and_private(before, after)
        finished = True
        return {
            "ok": True,
            "phase": "public-matrix",
            "origin": DEV_ORIGIN,
            "officialId": a,
            "syntheticId": b,
            "finalId": a,
            "officialFiles": len(before["files"]),
            "historicalAssetCacheObservations": cache_observations,
            "syntheticFiles": len(after["files"]),
            "failurePreservedA": True,
            "idempotentRetry": True,
            "staleRejected": True,
            "pairedRollback": True,
            "removedImages404": removed,
            "private404": True,
            "scope": "actual public DEV website engineering test; not production/editorial approval",
        }
    finally:
        if verified_a and not finished:
            invoke("failure-recover-official-a", "rollback", a, BASE + 90)


def wait_for_seeded_public_a(identifier):
    deadline = time.monotonic() + 75
    while time.monotonic() < deadline:
        try:
            status, body, _headers = request("/blog-release.json", timeout=3)
            if status == 200 and json.loads(body)["id"] == identifier:
                return
        except (OSError, ValueError, KeyError, URLError):
            pass
        time.sleep(1)
    raise ValueError("Development proxy did not settle to the seeded official artifact")


def public_permissions():
    spec = importlib.util.spec_from_file_location(
        "trusted_dev_permissions", "/code/dev_adapter.py"
    )
    adapter = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(adapter)
    adapter.STORE = STORE
    controller = controller_module()
    for item in PRODUCER["artifacts"]:
        adapter.public_site_permissions(item["id"], controller.stored_release)


def verified_preimage():
    controller = controller_module()
    active = json.loads((STORE / "active.json").read_text())
    previous = active["id"]
    manifest = controller.stored_release(STORE, previous)
    verified = controller._active_state(STORE, manifest, "activate")
    controller._check_active_pointer(STORE, verified)
    status, body, _headers = request("/blog-release.json?dev-preimage=" + str(BASE))
    expected = {
        key: manifest[key]
        for key in ["id", "frontend_sha", "content_sha", "baseline_sha256"]
    }
    if status != 200 or json.loads(body) != expected:
        raise ValueError("Public marker and trusted active preimage differ; unchanged")
    full(previous, "verified-managed-preimage")
    manifest_sha = hashlib.sha256(
        (STORE / "releases" / previous / "release.json").read_bytes()
    ).hexdigest()
    return {
        "ok": True,
        "phase": "import-only",
        "previousId": previous,
        "previousFrontendSha": manifest["frontend_sha"],
        "previousContentSha": manifest["content_sha"],
        "previousManifestSha256": manifest_sha,
    }


def recover_previous(previous):
    controller_module().stored_release(STORE, previous)
    recovered = loopback_operation(previous, "rollback", BASE + 99)
    public_verified = False
    try:
        full(previous, "supervised-recovery-all-files")
        public_verified = True
    except (OSError, ValueError, URLError):
        pass
    return {
        "ok": True,
        "phase": "recover",
        "recoveredId": recovered["id"],
        "localRecoveryVerified": True,
        "publicRecoveryVerified": public_verified,
    }


def main():
    global CONFIG, PRODUCER, BASE
    CONFIG = json.loads(Path("/input/provenance.json").read_text())
    PRODUCER = json.loads(Path("/input/data/producer.json").read_text())
    BASE = int(os.environ["DEV_GENERATION_BASE"])
    status = {
        key: value
        for line in Path("/proc/self/status").read_text().splitlines()
        if ":" in line
        for key, value in [line.split(":", 1)]
    }
    if (
        os.getuid() != 611536
        or os.getgroups()
        or status["NoNewPrivs"].strip() != "1"
        or any(
            int(status[name].strip(), 16)
            for name in ["CapInh", "CapPrm", "CapEff", "CapBnd", "CapAmb"]
        )
    ):
        raise ValueError("Development client is not capless")
    print(json.dumps({"ready": True, "uid": os.getuid()}), flush=True)
    if sys.stdin.readline().strip() != "observed-capless":
        raise ValueError("Privileged observer did not acknowledge confinement")
    phase = os.environ["DEV_PHASE"]
    import_pair()
    public_permissions()
    if phase == "public-matrix" and os.environ.get("DEV_WAIT_FOR_SEEDED_A") == "true":
        wait_for_seeded_public_a(PRODUCER["artifacts"][0]["id"])
    if phase == "seed":
        result = loopback_operation(
            PRODUCER["artifacts"][0]["id"], "activate", BASE + 10
        )
    elif phase == "import-only":
        result = verified_preimage()
    elif phase == "recover":
        previous = os.environ["DEV_RECOVERY_ID"]
        result = recover_previous(previous)
    else:
        result = public_matrix()
    (OUT / "summary.json").write_text(json.dumps(result, indent=2))
    print(json.dumps(result), flush=True)


if __name__ == "__main__":
    main()
