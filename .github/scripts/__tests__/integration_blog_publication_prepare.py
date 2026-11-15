"""Actual native Git snapshot + shared Node validator. Run after frozen validator install."""

import importlib.util
import json
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
SPEC = importlib.util.spec_from_file_location(
    "prepare_dev", ROOT / ".github/scripts/blog_bootstrap/prepare_publication.py"
)
PREPARE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(PREPARE)

with tempfile.TemporaryDirectory() as temporary:
    root = Path(temporary)
    source = root / "official-fixture"
    source.mkdir()
    localized = {"zh-TW": "Fixture", "en": "Fixture"}
    (source / "authors.json").write_text(
        json.dumps([{"id": "daodao-team", "name": localized, "bio": localized}])
    )
    (source / "topics.json").write_text(
        json.dumps([{"id": "learning-facilitation", "name": localized}])
    )
    PREPARE.add_synthetic_fixture(source)
    revision = PREPARE.synthetic_repository(source)
    snapshot = root / "native-snapshot"
    PREPARE.controller().checkout(
        str(source), revision, snapshot, root / "native-fetch.log"
    )
    assert not (snapshot / ".git").exists(), (
        "native checkout must not be mistaken for a Git repository"
    )
    result = PREPARE.draft_digests(snapshot, root)
    assert set(result) == {"development-rollback-fixture"}
    assert len(result["development-rollback-fixture"]) == 64
    print(
        json.dumps(
            {
                "ok": True,
                "nativeSnapshotHasGit": False,
                "sharedValidatorPassed": True,
                "digest": result["development-rollback-fixture"],
            }
        )
    )
