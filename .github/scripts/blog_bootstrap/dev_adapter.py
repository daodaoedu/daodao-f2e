"""Fixed development website adapter; never targets Product, shared proxy or production."""

import hashlib
import json
import os
import re
import stat
import subprocess
import tempfile
from pathlib import Path

DEV_ORIGIN = "https://dev.daodao.so"
SERVICE = "dev_website"
PROJECT = "daodao-f2e"
STORE = Path("/srv/daodao-blog-dev-releases")
OPERATOR = Path("/srv/daodao-blog-dev-operator")
LEGACY = Path("/root/daodao-f2e")
BASE_COMPOSE = LEGACY / "docker-compose.yaml"
OVERLAY = OPERATOR / "compose.json"
NGINX = OPERATOR / "nginx.conf"
IMAGE = re.compile(r"^sha256:[a-f0-9]{64}$")
RELEASE = re.compile(r"^[a-f0-9]{64}$")


def validate_container(value):
    labels = value.get("Config", {}).get("Labels", {})
    if (
        labels.get("com.docker.compose.service") != SERVICE
        or labels.get("com.docker.compose.project") != PROJECT
    ):
        raise ValueError("Exactly the existing development website service is required")
    if set(value.get("NetworkSettings", {}).get("Networks", {})) != {
        "dev-daodao-network"
    }:
        raise ValueError(
            "Development website must retain its dedicated existing network"
        )
    if not IMAGE.fullmatch(value.get("Image", "")):
        raise ValueError("Existing immutable image ID is required")
    if value.get("State", {}).get("Status") != "running":
        raise ValueError("Existing development website is not running")
    mounts = value.get("Mounts", [])
    permitted = {
        (str(STORE), "/srv/blog-releases"),
        (str(NGINX), "/etc/nginx/http.d/default.conf"),
    }
    observed_mounts = set()
    for mount in mounts:
        if (
            mount.get("Source"),
            mount.get("Destination"),
        ) not in permitted or mount.get("RW"):
            raise ValueError("Foreign or writable development website mount")
        observed_mounts.add((mount["Source"], mount["Destination"]))
    if mounts and observed_mounts != permitted:
        raise ValueError("Managed website must have both exact owned read-only mounts")
    reference = value.get("Config", {}).get("Image", "")
    registry = re.fullmatch(
        r"(?:docker.io/)?([a-z0-9][a-z0-9_.-]*)/daodao-website:[A-Za-z0-9_.-]+",
        reference,
    )
    if not mounts and registry is None:
        raise ValueError("Existing legacy website image namespace is required")
    return {
        "registryNamespace": registry.group(1) if registry else None,
        "id": value["Id"],
        "image": value["Image"],
        "name": value["Name"],
        "managedMounts": bool(mounts),
    }


def inspect_container(call=subprocess.check_output):
    ids = call(
        [
            "docker",
            "ps",
            "-q",
            "--filter",
            "label=com.docker.compose.service=" + SERVICE,
            "--filter",
            "label=com.docker.compose.project=" + PROJECT,
        ],
        text=True,
    ).split()
    if len(ids) != 1:
        raise ValueError(
            "Exactly one existing development website container is required"
        )
    template = '{"Id":{{json .Id}},"Name":{{json .Name}},"Image":{{json .Image}},"Config":{"Image":{{json .Config.Image}},"Labels":{{json .Config.Labels}}},"State":{"Status":{{json .State.Status}}},"NetworkSettings":{"Networks":{{json .NetworkSettings.Networks}}},"Mounts":{{json .Mounts}}}'
    return validate_container(
        json.loads(call(["docker", "inspect", "--format", template, ids[0]], text=True))
    )


def overlay_payload(image):
    if not IMAGE.fullmatch(image):
        raise ValueError("An existing immutable image ID is required")
    return {
        "services": {
            SERVICE: {
                "image": image,
                "volumes": [
                    str(STORE) + ":/srv/blog-releases:ro",
                    str(NGINX) + ":/etc/nginx/http.d/default.conf:ro",
                ],
            }
        }
    }


def compose_command(overlay=None):
    result = [
        "docker",
        "compose",
        "--project-directory",
        str(LEGACY),
        "--env-file",
        str(LEGACY / ".env.dev"),
        "-f",
        str(OPERATOR / "base-compose.yaml"),
    ]
    if overlay is not None:
        if Path(overlay) not in (OVERLAY, OPERATOR / "restore.json"):
            raise ValueError("Only owned fixed development overlays may be used")
        result += ["-f", str(overlay)]
    return result + ["up", "-d", "--no-deps", "--wait", "--wait-timeout", "90", SERVICE]


def compose_environment(snapshot):
    namespace = snapshot.get("registryNamespace")
    if not namespace or not re.fullmatch(r"[a-z0-9][a-z0-9_.-]*", namespace):
        raise ValueError("Captured public image namespace is required")
    environment = {
        key: value
        for key, value in os.environ.items()
        if key in {"PATH", "HOME", "XDG_CONFIG_HOME"}
    }
    environment.update(DOCKER_HUB_USERNAME=namespace, IMAGE_TAG="dev", COMMIT_SHA="")
    return environment


def validate_directory(metadata, owner):
    if not stat.S_ISDIR(metadata.st_mode) or metadata.st_uid != owner:
        raise ValueError("Owned directory identity is invalid")
    if stat.S_IMODE(metadata.st_mode) & 0o022:
        raise ValueError("Owned directory is publicly writable")


def reviewed_base_compose(expected_digest):
    metadata = BASE_COMPOSE.lstat()
    if not stat.S_ISREG(metadata.st_mode) or metadata.st_nlink != 1:
        raise ValueError("Legacy compose must be a regular non-linked source file")
    descriptor = os.open(BASE_COMPOSE, os.O_RDONLY | os.O_NOFOLLOW)
    with os.fdopen(descriptor, "rb") as source:
        data = source.read()
    if hashlib.sha256(data).hexdigest() != expected_digest:
        raise ValueError(
            "Legacy base compose differs from reviewed source; no container mutation"
        )
    return data


def verify_base_compose(expected_digest):
    return reviewed_base_compose(expected_digest)


def ownership_marker():
    return {
        "schema": 1,
        "scope": "development website only",
        "service": SERVICE,
        "origin": DEV_ORIGIN,
        "store": str(STORE),
    }


def atomic_owned_write(path, data, mode=0o600):
    if path.parent != OPERATOR:
        raise ValueError("Only fixed owned operator files may be written")
    validate_directory(OPERATOR.lstat(), 0)
    if path.exists() or path.is_symlink():
        metadata = path.lstat()
        if (
            not stat.S_ISREG(metadata.st_mode)
            or metadata.st_uid != 0
            or metadata.st_nlink != 1
        ):
            raise ValueError("Foreign operator file; no overwrite")
    descriptor, temporary = tempfile.mkstemp(prefix="owned-write-", dir=OPERATOR)
    try:
        os.fchmod(descriptor, mode)
        with os.fdopen(descriptor, "wb") as output:
            output.write(data)
            output.flush()
            os.fsync(output.fileno())
        os.replace(temporary, path)
    finally:
        Path(temporary).unlink(missing_ok=True)


def establish_operator():
    if os.geteuid() != 0:
        raise ValueError("Trusted root transport is required")
    validate_directory(OPERATOR.parent.lstat(), 0)
    marker = OPERATOR / "ownership.json"
    if OPERATOR.exists() or OPERATOR.is_symlink():
        validate_directory(OPERATOR.lstat(), 0)
        metadata = marker.lstat()
        if (
            not stat.S_ISREG(metadata.st_mode)
            or metadata.st_uid != 0
            or metadata.st_nlink != 1
        ):
            raise ValueError("Existing operator provenance is unsafe")
        if json.loads(marker.read_text()) != ownership_marker():
            raise ValueError(
                "Existing operator directory is not this adapter's owned state"
            )
        return False
    OPERATOR.mkdir(mode=0o700)
    atomic_owned_write(marker, json.dumps(ownership_marker()).encode())
    return True


def establish_store():
    store_exists = STORE.exists() or STORE.is_symlink()
    if store_exists and not (OPERATOR.exists() or OPERATOR.is_symlink()):
        raise ValueError("Preexisting store has no owned operator provenance")
    establish_operator()
    identity_file = OPERATOR / "store-identity.json"
    if store_exists:
        metadata = STORE.lstat()
        validate_directory(metadata, 611536)
        identity_metadata = identity_file.lstat()
        if (
            not stat.S_ISREG(identity_metadata.st_mode)
            or identity_metadata.st_uid != 0
            or identity_metadata.st_nlink != 1
        ):
            raise ValueError("Store identity provenance is unsafe")
        expected = json.loads(identity_file.read_text())
        if expected != {
            "device": metadata.st_dev,
            "inode": metadata.st_ino,
            "store": str(STORE),
        }:
            raise ValueError("Owned persistent store identity changed")
        return False
    STORE.mkdir(mode=0o711)
    os.chown(STORE, 611536, 611536)
    metadata = STORE.lstat()
    atomic_owned_write(
        identity_file,
        json.dumps(
            {"device": metadata.st_dev, "inode": metadata.st_ino, "store": str(STORE)}
        ).encode(),
    )
    return True


def verified_public_entries(site, manifest):
    expected = set(manifest["files"])
    observed = set()
    for path in site.rglob("*"):
        if path.is_symlink():
            raise ValueError("Public site cannot contain symlinks")
        metadata = path.lstat()
        if stat.S_ISDIR(metadata.st_mode):
            continue
        if not stat.S_ISREG(metadata.st_mode) or metadata.st_nlink != 1:
            raise ValueError("Public output must be regular non-linked data")
        relative = str(path.relative_to(site))
        if (
            relative not in expected
            or hashlib.sha256(path.read_bytes()).hexdigest()
            != manifest["files"][relative]
        ):
            raise ValueError("Public site differs from validated manifest")
        observed.add(relative)
    if observed != expected:
        raise ValueError("Public site is missing validated output")
    return observed


def public_site_permissions(release_id, verify):
    if not RELEASE.fullmatch(release_id):
        raise ValueError("Fixed validated release ID required")
    release = STORE / "releases" / release_id
    manifest = verify(STORE, release_id)
    site = release / "site"
    observed = verified_public_entries(site, manifest)
    for path in [STORE, STORE / "releases", release]:
        path.chmod(0o711)
    site.chmod(0o755)
    for path in site.rglob("*"):
        path.chmod(0o755 if path.is_dir() else 0o644)
    return len(observed)


def read_owned_file(path):
    if path.parent != OPERATOR:
        raise ValueError("Only owned operator files may be read")
    metadata = path.lstat()
    if (
        not stat.S_ISREG(metadata.st_mode)
        or metadata.st_uid != 0
        or metadata.st_nlink != 1
    ):
        raise ValueError("Operator provenance is not a regular root-owned file")
    descriptor = os.open(path, os.O_RDONLY | os.O_NOFOLLOW)
    with os.fdopen(descriptor, "rb") as source:
        opened = os.fstat(source.fileno())
        if (opened.st_dev, opened.st_ino) != (metadata.st_dev, metadata.st_ino):
            raise ValueError("Operator file identity changed")
        return source.read()


def write_owned_overlay(image, nginx_source):
    establish_operator()
    atomic_owned_write(NGINX, nginx_source, 0o644)
    atomic_owned_write(OVERLAY, json.dumps(overlay_payload(image), indent=2).encode())


def apply_overlay(snapshot, expected_compose_digest, nginx_source, run=subprocess.run):
    base_bytes = reviewed_base_compose(expected_compose_digest)
    current = inspect_container()
    if current["id"] != snapshot["id"] or current["image"] != snapshot["image"]:
        raise ValueError("Development website changed since snapshot; no mutation")
    establish_store()
    if snapshot["managedMounts"]:
        if read_owned_file(NGINX) != nginx_source:
            raise ValueError(
                "Managed Nginx configuration transition requires separate review; unchanged"
            )
        if json.loads(read_owned_file(OVERLAY)) != overlay_payload(snapshot["image"]):
            raise ValueError("Managed compose provenance changed; unchanged")
        return current
    atomic_owned_write(OPERATOR / "base-compose.yaml", base_bytes)
    write_owned_overlay(snapshot["image"], nginx_source)
    run(
        compose_command(OVERLAY),
        env=compose_environment(snapshot),
        check=True,
        capture_output=True,
        text=True,
        timeout=120,
    )
    return inspect_container()


def restore_previous(snapshot, expected_compose_digest, run=subprocess.run):
    """Restore only the captured dev website image/mount selection; never stop the stack."""
    establish_operator()
    saved_base = read_owned_file(OPERATOR / "base-compose.yaml")
    if hashlib.sha256(saved_base).hexdigest() != expected_compose_digest:
        raise ValueError("Saved reviewed compose differs; no restore mutation")
    if snapshot["managedMounts"]:
        current = inspect_container()
        if current["image"] != snapshot["image"] or not current["managedMounts"]:
            raise ValueError(
                "Managed service changed outside this operation; no automatic overwrite"
            )
        return current
    else:
        if not IMAGE.fullmatch(snapshot["image"]):
            raise ValueError("Captured immutable development image required")
        payload = {"services": {SERVICE: {"image": snapshot["image"], "volumes": []}}}
    restore = OPERATOR / "restore.json"
    atomic_owned_write(restore, json.dumps(payload, indent=2).encode())
    run(
        compose_command(restore),
        env=compose_environment(snapshot),
        check=True,
        capture_output=True,
        text=True,
        timeout=120,
    )
    return inspect_container()


def legacy_markers_absent(container_id, run=subprocess.run):
    if not re.fullmatch(r"[a-f0-9]{64}", container_id):
        raise ValueError("Captured development container identity required")
    command = [
        "docker",
        "exec",
        container_id,
        "sh",
        "-c",
        "test ! -e /app/apps/website/out/blog-release.json && test ! -e /app/apps/website/out/blog-published-baseline.json",
    ]
    result = run(command, check=False, capture_output=True, text=True, timeout=15)
    return result.returncode == 0


def classify_adoption(snapshot, marker_check=legacy_markers_absent):
    if snapshot["managedMounts"]:
        if (
            not (STORE / "active.json").is_file()
            or not (STORE / "current").is_symlink()
        ):
            raise ValueError(
                "Managed website has no verified active release; refusing fallback"
            )
        return "managed"
    if not marker_check(snapshot["id"]):
        raise ValueError(
            "Legacy website contains release markers; explicit recovery required"
        )
    if STORE.exists() and not (OPERATOR / "ownership.json").is_file():
        raise ValueError("Preexisting unowned store cannot become a first publication")
    return "legacy-bootstrap"


def record_journal(snapshot, producer_sha, phase):
    if not re.fullmatch(r"[a-f0-9]{64}", producer_sha):
        raise ValueError("Pinned preparation producer digest required")
    allowed = {"prepared", "seeded", "mounting", "public-verified", "restored"}
    if phase not in allowed:
        raise ValueError("Unknown adoption journal phase")
    payload = {
        "schema": 1,
        "service": SERVICE,
        "producerSha256": producer_sha,
        "snapshot": snapshot,
        "phase": phase,
    }
    atomic_owned_write(
        OPERATOR / "adoption.json", json.dumps(payload, indent=2).encode()
    )
