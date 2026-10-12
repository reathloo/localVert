import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from zipfile import ZipFile


ROOT = Path(__file__).resolve().parents[1]
PACKAGER = ROOT / "scripts" / "package_extension.py"


class PackageTests(unittest.TestCase):
    def test_package_is_repeatable_and_excludes_development_files(self):
        with tempfile.TemporaryDirectory() as directory:
            first = Path(directory) / "first.zip"
            second = Path(directory) / "second.zip"
            for output in (first, second):
                subprocess.run([sys.executable, str(PACKAGER), "--output", str(output)], cwd=ROOT, check=True, capture_output=True)
            self.assertEqual(first.read_bytes(), second.read_bytes())
            with ZipFile(first) as archive:
                names = set(archive.namelist())
                self.assertEqual(archive.testzip(), None)
                self.assertIn("manifest.json", names)
                self.assertIn("src/main.js", names)
                self.assertIn("assets/icons/icon-128.png", names)
                self.assertIn("vendor/pdfjs/pdf.worker.mjs", names)
                self.assertIn("vendor/generated/media-vendor.js", names)
                self.assertIn("vendor/generated/tiff-vendor.js", names)
                self.assertIn("src/media-conversion.js", names)
                self.assertIn("src/zip.js", names)
                self.assertIn("src/upload-field.js", names)
                self.assertIn("src/file-drop.js", names)
                self.assertFalse(any(name.startswith(("tests/", "assets/icon-concepts/", "dist/")) for name in names))
                self.assertEqual(archive.read("manifest.json"), (ROOT / "manifest.json").read_bytes())


if __name__ == "__main__":
    unittest.main()
