"""Fixed development website adapter; never targets Product, shared proxy or production."""

import hashlib
import json
import os
import re
import stat
import subprocess
import tempfile
import uuid
from pathlib import Path

DEV_ORIGIN = "https://dev.daodao.so"
SERVICE = "dev_website"
PROJECT = "daodao-f2e"
STORE = Path("/srv/daodao-blog-dev-releases")
OPERATOR = Path("/srv/daodao-blog-dev-operator")
LEGACY = Path("/root/daodao-f2e")
BASE_COMPOSE = LEGACY / "docker-compose.yaml"
OWNED_BASE_NAME = "base-compose.yaml"
OVERLAY = OPERATOR / "compose.json"
NGINX = OPERATOR / "nginx.conf"
IMAGE = re.compile(r"^sha256:[a-f0-9]{64}$")
CONFIGURATION_LABEL = "so.daodao.dev.configuration-operation"
RELEASE = re.compile(r"^[a-f0-9]{64}$")


def validate_container(value, allow_stopped=False):
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
    if not allow_stopped and value.get("State", {}).get("Status") != "running":
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
    restored_namespace = None
    if not mounts and registry is None:
        if reference != value["Image"]:
            raise ValueError("Existing legacy website image namespace is required")
        restored_namespace = restored_legacy_namespace(value["Image"])
    return {
        "registryNamespace": registry.group(1) if registry else restored_namespace,
        "id": value["Id"],
        "image": value["Image"],
        "name": value["Name"],
        "managedMounts": bool(mounts),
        "configurationToken": labels.get(CONFIGURATION_LABEL),
    }


def restored_legacy_namespace(image):
    """Read existing root-owned restore provenance; never establish or guess it."""
    try:
        validate_directory(OPERATOR.parent.lstat(), 0)
        validate_directory(OPERATOR.lstat(), 0)
        if (
            json.loads(read_owned_file(OPERATOR / "ownership.json"))
            != ownership_marker()
        ):
            raise ValueError("Foreign operator ownership marker")
        journal = json.loads(read_owned_file(OPERATOR / "adoption.json"))
    except (OSError, json.JSONDecodeError) as error:
        raise ValueError("Restored legacy image lacks owned provenance") from error
    snapshot = journal.get("snapshot", {})
    namespace = snapshot.get("registryNamespace", "")
    if (
        journal.get("schema") != 1
        or journal.get("service") != SERVICE
        or journal.get("phase")
        not in {"prepared", "seeded", "mounting", "restored", "recovery-failed"}
        or not RELEASE.fullmatch(journal.get("producerSha256", ""))
        or snapshot.get("image") != image
        or snapshot.get("managedMounts") is not False
        or not isinstance(namespace, str)
        or not re.fullmatch(r"[a-z0-9][a-z0-9_.-]*", namespace)
    ):
        raise ValueError("Restored legacy image provenance does not match")
    return namespace


def inspect_container(call=subprocess.check_output, allow_stopped=False):
    ids = call(
        [
            "docker",
            "ps",
            "-aq" if allow_stopped else "-q",
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
        json.loads(
            call(["docker", "inspect", "--format", template, ids[0]], text=True)
        ),
        allow_stopped=allow_stopped,
    )


def overlay_payload(image, token=None):
    if not IMAGE.fullmatch(image):
        raise ValueError("An existing immutable image ID is required")
    result = {
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

    if token is not None:
        if not re.fullmatch("[a-f0-9]{32}", token):
            raise ValueError("Fixed configuration operation token required")
        result["services"][SERVICE]["labels"] = {CONFIGURATION_LABEL: token}
    return result


def compose_command(overlay=None, recreate=False):
    result = [
        "docker",
        "compose",
        "--project-directory",
        str(LEGACY),
        "--env-file",
        str(LEGACY / ".env.dev"),
        "-f",
        str(OPERATOR / OWNED_BASE_NAME),
    ]
    if overlay is not None:
        if Path(overlay) not in (OVERLAY, OPERATOR / "restore.json"):
            raise ValueError("Only owned fixed development overlays may be used")
        result += ["-f", str(overlay)]
    return (
        result
        + ["up", "-d", "--no-deps", "--wait", "--wait-timeout", "90"]
        + (["--force-recreate"] if recreate else [])
        + [SERVICE]
    )


def compose_environment(snapshot):
    # Managed dev uses the captured image digest; this only fills unrelated base interpolation.
    namespace = (
        "managed-dev-unused"
        if snapshot.get("managedMounts")
        else snapshot.get("registryNamespace")
    )
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


def saved_base_transition(expected_digest, reviewed_history):
    """Classify the owned saved compose against the reviewed source history.

    Returns the saved digest when it is an older reviewed compose that may be
    replaced by the reviewed head, or None when it already equals the head.
    Anything outside reviewed history was changed on the host and fails closed.
    """
    history = set(reviewed_history or ())
    if history and expected_digest not in history:
        raise ValueError("Reviewed head is missing from reviewed compose history")
    if not all(isinstance(item, str) and RELEASE.fullmatch(item) for item in history):
        raise ValueError("Reviewed compose history must contain fixed digests")
    saved = hashlib.sha256(read_owned_file(OPERATOR / OWNED_BASE_NAME)).hexdigest()
    if saved == expected_digest:
        return None
    if saved not in history:
        raise ValueError(
            "Saved reviewed compose differs from reviewed history; no configuration mutation"
        )
    return saved


def replace_saved_base(previous_digest, base_bytes):
    # Recheck immediately before the write so a concurrent host edit is never overwritten.
    current = hashlib.sha256(read_owned_file(OPERATOR / OWNED_BASE_NAME)).hexdigest()
    if current != previous_digest:
        raise ValueError("Saved reviewed compose changed during transition; unchanged")
    atomic_owned_write(OPERATOR / OWNED_BASE_NAME, base_bytes)


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


def managed_overlay(snapshot):
    raw = read_owned_file(OVERLAY)
    payload = json.loads(raw)
    token = (
        payload.get("services", {})
        .get(SERVICE, {})
        .get("labels", {})
        .get(CONFIGURATION_LABEL)
    )
    if payload != overlay_payload(snapshot["image"], token):
        raise ValueError("Managed compose provenance changed; unchanged")
    if token != snapshot.get("configurationToken"):
        raise ValueError("Managed configuration operation label differs; unchanged")
    return raw


def prepare_configuration(snapshot, nginx_source):
    if not snapshot["managedMounts"]:
        return snapshot
    establish_operator()
    previous_overlay = managed_overlay(snapshot)
    previous_nginx = read_owned_file(NGINX)
    if previous_nginx == nginx_source:
        return snapshot
    token = uuid.uuid4().hex
    state = {
        "schema": 1,
        "token": token,
        "snapshot": snapshot,
        "previousNginx": previous_nginx.hex(),
        "previousOverlay": previous_overlay.hex(),
        "targetNginxSha256": hashlib.sha256(nginx_source).hexdigest(),
        "targetOverlay": json.dumps(overlay_payload(snapshot["image"], token), indent=2)
        .encode()
        .hex(),
    }
    atomic_owned_write(
        OPERATOR / "configuration-transition.json", json.dumps(state).encode()
    )
    return {**snapshot, "configurationTransition": token}


def configuration_state(snapshot):
    state = json.loads(read_owned_file(OPERATOR / "configuration-transition.json"))
    original = {
        key: value
        for key, value in snapshot.items()
        if key not in {"configurationTransition", "primaryFailure", "verifiedPreimage"}
    }
    # Recovery adds diagnostics, while the captured source identity stays immutable.
    if (
        state.get("schema") != 1
        or state.get("token") != snapshot.get("configurationTransition")
        or state.get("snapshot") != original
    ):
        raise ValueError("Configuration preimage identity changed; unchanged")
    return state


def validate_nginx(snapshot, nginx_source, run):
    candidate = OPERATOR / "candidate-nginx.conf"
    atomic_owned_write(candidate, nginx_source, 0o644)
    run(
        [
            "docker",
            "run",
            "--rm",
            "--network=none",
            "--read-only",
            "--cap-drop=ALL",
            "--security-opt",
            "no-new-privileges",
            "--user",
            "100:101",
            "--tmpfs",
            "/run:uid=100,gid=101,mode=0700",
            "--tmpfs",
            "/var/cache/nginx:uid=100,gid=101,mode=0700",
            "--tmpfs",
            "/var/log/nginx:uid=100,gid=101,mode=0700",
            "--tmpfs",
            "/var/lib/nginx/tmp:uid=100,gid=101,mode=0700",
            "--tmpfs",
            "/run/nginx:uid=100,gid=101,mode=0700",
            "--mount",
            "type=bind,src="
            + str(candidate)
            + ",dst=/etc/nginx/http.d/default.conf,readonly",
            "--entrypoint",
            "nginx",
            snapshot["image"],
            "-t",
        ],
        check=True,
        capture_output=True,
        text=True,
        timeout=30,
    )


def recreate_managed(snapshot, run):
    command = compose_command(OVERLAY, recreate=True)
    prefix = command[: command.index("up")]
    result = run(
        prefix + ["config", "--format", "json"],
        env=compose_environment(snapshot),
        check=True,
        capture_output=True,
        text=True,
        timeout=30,
    )
    rendered = json.loads(result.stdout)
    if rendered.get("services", {}).get(SERVICE, {}).get("image") != snapshot["image"]:
        raise ValueError("Rendered managed image differs from captured immutable image")
    run(
        command,
        env=compose_environment(snapshot),
        check=True,
        capture_output=True,
        text=True,
        timeout=120,
    )


def apply_overlay(
    snapshot,
    expected_compose_digest,
    nginx_source,
    run=subprocess.run,
    reviewed_history=(),
):
    base_bytes = reviewed_base_compose(expected_compose_digest)
    current = inspect_container()
    if current["id"] != snapshot["id"] or current["image"] != snapshot["image"]:
        raise ValueError("Development website changed since snapshot; no mutation")
    establish_store()
    if snapshot["managedMounts"]:
        if read_owned_file(NGINX) != nginx_source and not snapshot.get(
            "configurationTransition"
        ):
            raise ValueError(
                "Managed Nginx configuration transition requires separate review; unchanged"
            )
        previous_base = saved_base_transition(expected_compose_digest, reviewed_history)
        managed_overlay(snapshot)
        if not snapshot.get("configurationTransition"):
            if previous_base is not None:
                replace_saved_base(previous_base, base_bytes)
            return current
        state = configuration_state(snapshot)
        if (
            read_owned_file(NGINX).hex() != state["previousNginx"]
            or read_owned_file(OVERLAY).hex() != state["previousOverlay"]
            or hashlib.sha256(nginx_source).hexdigest() != state["targetNginxSha256"]
        ):
            raise ValueError("Configuration transition input changed; unchanged")
        validate_nginx(snapshot, nginx_source, run)
        # Recheck all mutable preimages after the isolated syntax probe.
        if (
            inspect_container()["id"] != snapshot["id"]
            or read_owned_file(NGINX).hex() != state["previousNginx"]
            or read_owned_file(OVERLAY).hex() != state["previousOverlay"]
        ):
            raise ValueError("Configuration preimage changed during syntax probe")
        if previous_base is not None:
            replace_saved_base(previous_base, base_bytes)
        atomic_owned_write(NGINX, nginx_source, 0o644)
        atomic_owned_write(OVERLAY, bytes.fromhex(state["targetOverlay"]))
    else:
        atomic_owned_write(OPERATOR / OWNED_BASE_NAME, base_bytes)
        write_owned_overlay(snapshot["image"], nginx_source)
    if snapshot["managedMounts"]:
        recreate_managed(snapshot, run)
    else:
        run(
            compose_command(OVERLAY),
            env=compose_environment(snapshot),
            check=True,
            capture_output=True,
            text=True,
            timeout=120,
        )
    return inspect_container()


def restore_configuration(snapshot, run):
    state = configuration_state(snapshot)
    current = inspect_container(allow_stopped=True)
    if (
        current["image"] != snapshot["image"]
        or not current["managedMounts"]
        or (
            current["id"] != snapshot["id"]
            and current.get("configurationToken") != state["token"]
        )
    ):
        raise ValueError("Managed service changed outside this operation; no overwrite")
    nginx = read_owned_file(NGINX)
    overlay = read_owned_file(OVERLAY)
    if hashlib.sha256(nginx).hexdigest() not in {
        hashlib.sha256(bytes.fromhex(state["previousNginx"])).hexdigest(),
        state["targetNginxSha256"],
    } or overlay.hex() not in {state["previousOverlay"], state["targetOverlay"]}:
        raise ValueError(
            "Managed configuration changed outside this operation; no overwrite"
        )
    if (
        nginx.hex() == state["previousNginx"]
        and overlay.hex() == state["previousOverlay"]
        and current["id"] == snapshot["id"]
    ):
        return inspect_container()
    atomic_owned_write(NGINX, bytes.fromhex(state["previousNginx"]), 0o644)
    atomic_owned_write(OVERLAY, bytes.fromhex(state["previousOverlay"]))
    recreate_managed(snapshot, run)
    return inspect_container()


def restore_previous(
    snapshot, expected_compose_digest, run=subprocess.run, reviewed_history=()
):
    """Restore only the captured dev website image/mount selection; never stop the stack."""
    establish_operator()
    # An older reviewed base is the pre-transition state; a host edit is never restored onto.
    try:
        saved_base_transition(expected_compose_digest, reviewed_history)
    except ValueError as error:
        raise ValueError(
            "Saved reviewed compose differs; no restore mutation"
        ) from error
    if snapshot["managedMounts"]:
        if snapshot.get("configurationTransition"):
            return restore_configuration(snapshot, run)
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
    allowed = {
        "prepared",
        "seeded",
        "mounting",
        "public-verified",
        "restored",
        "recovery-failed",
    }
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
