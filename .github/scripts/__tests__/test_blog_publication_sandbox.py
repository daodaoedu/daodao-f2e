import importlib.util
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
SPEC = importlib.util.spec_from_file_location(
    "publication_sandbox",
    ROOT / ".github/scripts/blog_bootstrap/publication_sandbox.py",
)
SANDBOX = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(SANDBOX)


class PublicationSandboxTests(unittest.TestCase):
    def test_generation_preserves_ascii_only_capability(self):
        self.assertEqual(
            SANDBOX.validate_generation("4359285040900100"), "4359285040900100"
        )
        for value in ["１２３", "١٢٣", "123\n", "--store=/foreign", "", "1" * 17]:
            with self.subTest(value=value), self.assertRaises(ValueError):
                SANDBOX.validate_generation(value)


if __name__ == "__main__":
    unittest.main()
