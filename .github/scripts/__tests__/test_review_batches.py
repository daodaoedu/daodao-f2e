import importlib.util
import json
from pathlib import Path
import subprocess
import tempfile
import unittest

SPEC = importlib.util.spec_from_file_location('planner', Path(__file__).resolve().parents[1] / 'build-review-batches.py')
planner = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(planner)


class ReviewBatches(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.repo = self.root / 'repo'; self.repo.mkdir()
        self.git('init', '-q'); self.git('config', 'user.email', 'test@example.org')
        self.git('config', 'user.name', 'Test')
        self.write('seed.txt', 'seed\n'); self.base = self.commit()

    def git(self, *args):
        return subprocess.check_output(['git', '-C', str(self.repo), *args]).decode().strip()

    def write(self, path, text):
        target = self.repo / path; target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(text)

    def commit(self):
        self.git('add', '--all'); self.git('commit', '-qm', 'test')
        return self.git('rev-parse', 'HEAD')

    def run_plan(self, **kwargs):
        self.out = self.root / 'output'
        return planner.plan(self.repo, self.base, self.commit(), self.out, **kwargs)

    def test_old_12000_cut_regression_keeps_complete_function_and_later_file(self):
        body = 'def large_function():\n' + ''.join(f'    value_{i} = {i}\n' for i in range(430)) + '    return "BODY_END"\n'
        self.assertGreater(len(body.encode()) * 2, 12000)
        self.write('a.py', body); self.write('z.py', 'LATER_FILE_END = True\n')
        result = self.run_plan()
        self.assertTrue(result['coverage_complete'])
        payload = ''.join((self.out / b['payload']).read_text() for b in result['batches'])
        self.assertIn('BODY_END', payload); self.assertIn('LATER_FILE_END', payload)
        self.assertTrue(all(f['file_complete'] for f in result['files']))

    def test_atomic_oversize_is_explicit(self):
        self.write('a.py', 'def huge():\n' + '    pass\n' * 1000)
        result = self.run_plan(max_batch_bytes=1000)
        self.assertFalse(result['coverage_complete']); self.assertEqual(result['files'][0]['status'], 'unreviewed')
        self.assertIn('budget', result['files'][0]['reason']); self.assertEqual(result['batches'], [])

    def test_many_files_budget_and_hashes(self):
        for i in range(12):
            self.write(f'source-{i}.py', 'content = "' + 'x' * 180 + '"\n')
        result = self.run_plan(max_batch_bytes=1400, max_batches=2, max_total_bytes=2500)
        self.assertFalse(result['coverage_complete']); self.assertEqual(len(result['batches']), 2)
        self.assertLessEqual(sum(b['bytes'] for b in result['batches']), 2500)
        for batch in result['batches']:
            data = (self.out / batch['payload']).read_bytes()
            self.assertLessEqual(len(data), 1400)
            self.assertEqual(planner.hashlib.sha256(data).hexdigest(), batch['sha256'])
        self.assertTrue(any(f['status'] == 'unreviewed' for f in result['files']))

    def test_small_head_replacing_giant_base_is_bounded_before_diff(self):
        self.write('big.py', 'x' * 100000)
        self.base = self.commit()
        self.write('big.py', 'small = True\n')
        original = planner.git
        def guarded(repo, *args):
            if args and args[0] == '--literal-pathspecs':
                self.fail('oversized base must be rejected before diff allocation')
            return original(repo, *args)
        planner.git = guarded
        self.addCleanup(setattr, planner, 'git', original)
        result = self.run_plan(max_batch_bytes=1000)
        self.assertEqual(result['files'][0]['reason'], 'source-exceeds-batch-budget')

    def test_utf8_long_line_budget_uses_bytes(self):
        self.write('中文 檔案.py', '字' * 800)
        result = self.run_plan(max_batch_bytes=2000)
        self.assertEqual(result['files'][0]['path'], '中文 檔案.py')
        self.assertEqual(result['files'][0]['status'], 'unreviewed')

    def test_delete_and_rename_have_before_source(self):
        self.write('old name.py', 'BEFORE_RENAME = True\n'); self.write('gone.py', 'DELETED_BODY = 42\n')
        self.base = self.commit()
        self.git('mv', 'old name.py', 'new 中文.py'); (self.repo / 'gone.py').unlink()
        result = self.run_plan()
        payload = ''.join((self.out / b['payload']).read_text() for b in result['batches'])
        self.assertIn('DELETED_BODY', payload)
        renamed = next(f for f in result['files'] if f['path'] == 'new 中文.py')
        self.assertEqual(len(renamed['sources']), 2)
        self.assertEqual(renamed['old_path'], 'old name.py')

    def test_binary_and_generated_have_explicit_reasons(self):
        (self.repo / 'binary.bin').write_bytes(b'abc\0def')
        self.write('pnpm-lock.yaml', 'generated\n')
        result = self.run_plan()
        files = {f['path']: f for f in result['files']}
        self.assertEqual(files['binary.bin']['reason'], 'binary-file')
        self.assertEqual(files['pnpm-lock.yaml']['status'], 'excluded')
        self.assertFalse(result['coverage_complete'])

    def test_literal_pathspec_and_newline_filename(self):
        self.write('odd[1]\nname.py', 'ONLY_THIS = 1\n')
        result = self.run_plan()
        self.assertFalse(result['coverage_complete'])
        self.assertEqual(result['files'][0]['path'], 'odd[1]\nname.py')
        self.assertEqual(result['files'][0]['reason'], 'unsupported-git-filename')

    def test_source_section_offsets_exclude_headers_and_match_line_numbers(self):
        self.write('a.py', 'FIRST = 1\n字 = 2\n')
        self.write('b.py', 'LAST = 3\n')
        result = self.run_plan()
        for batch in result['batches']:
            data = (self.out / batch['payload']).read_bytes()
            for unit in batch['units']:
                self.assertTrue(unit['source_sections'])
                for section in unit['source_sections']:
                    source = data[section['start_byte']:section['end_byte']].decode()
                    self.assertTrue(source.startswith('1: '))
                    self.assertNotIn('COMPLETE HEAD FILE', source)
                    self.assertEqual(len(source.split('\n')[:-1]), section['line_count'])
                    self.assertGreaterEqual(section['start_byte'], unit['start_byte'])
                    self.assertLessEqual(section['end_byte'], unit['end_byte'])

    def test_legacy_generated_exclusions(self):
        for path in ('nested/generated/client.ts', 'openapi.yaml', 'packages/api/src/types.ts'):
            self.write(path, 'generated = 1\n')
        result = self.run_plan()
        self.assertTrue(all(f['status'] == 'excluded' for f in result['files']))
        self.assertEqual(result['batches'], [])
        self.assertFalse(result['coverage_complete'])

    def test_per_file_git_error_does_not_drop_later_files(self):
        self.write('a.py', 'a = 1\n'); self.write('z.py', 'z = 2\n')
        original = planner.git
        def fail_first(repo, *args):
            if args[:2] == ('cat-file', '-s') and str(args[2]).endswith(':a.py'):
                raise subprocess.CalledProcessError(128, ['git', 'cat-file'])
            return original(repo, *args)
        planner.git = fail_first
        self.addCleanup(setattr, planner, 'git', original)
        result = self.run_plan()
        files = {f['path']: f for f in result['files']}
        self.assertEqual(files['a.py']['reason'], 'file-read-error')
        self.assertEqual(files['z.py']['status'], 'planned')
        self.assertFalse(result['coverage_complete'])

    def test_gitlink_and_later_source_both_reported(self):
        self.write('z.py', 'z = 1\n')
        self.git('add', 'z.py')
        self.git('update-index', '--add', '--cacheinfo', '160000', self.base, 'submodule')
        self.git('commit', '-qm', 'gitlink')
        self.out = self.root / 'output'
        result = planner.plan(self.repo, self.base, 'HEAD', self.out)
        files = {f['path']: f for f in result['files']}
        self.assertEqual(files['submodule']['reason'], 'non-blob-object')
        self.assertEqual(files['z.py']['status'], 'planned')

    def test_formfeed_unicode_separator_preserve_git_lf_lines(self):
        self.write('line.py', 'FIRST = "a\fb\u2028c"\nSECOND = 2\n')
        result = self.run_plan()
        batch = result['batches'][0]
        section = batch['units'][0]['source_sections'][0]
        data = (self.out / batch['payload']).read_bytes()
        source = data[section['start_byte']:section['end_byte']].decode()
        self.assertEqual(section['line_count'], 2)
        self.assertEqual(source, '1: FIRST = "a\fb\u2028c"\n2: SECOND = 2\n')
        self.assertEqual(planner.source_lines(b''), [])
        self.assertEqual(planner.source_lines(b'a\n\n'), ['a', ''])

    def test_backslash_filename_does_not_drop_normal_later_file(self):
        self.write('a\\b.py', 'a = 1\n')
        self.write('z.py', 'z = 1\n')
        result = self.run_plan()
        files = {f['path']: f for f in result['files']}
        self.assertEqual(files['a\\b.py']['reason'], 'unsupported-git-filename')
        self.assertEqual(files['z.py']['status'], 'planned')

    def test_modified_removed_guard_has_complete_before_and_head(self):
        self.write('guard.py', 'def guarded(x):\n    if x is None:\n        raise ValueError("missing")\n    return x\n')
        self.base = self.commit()
        self.write('guard.py', 'def guarded(x):\n    return x\n')
        result = self.run_plan()
        batch = result['batches'][0]
        sections = batch['units'][0]['source_sections']
        self.assertEqual([section['label'] for section in sections], ['BEFORE', 'HEAD'])
        data = (self.out / batch['payload']).read_bytes()
        before = data[sections[0]['start_byte']:sections[0]['end_byte']].decode()
        head = data[sections[1]['start_byte']:sections[1]['end_byte']].decode()
        self.assertIn('2:     if x is None:', before)
        self.assertNotIn('if x is None:', head)
        self.assertEqual(sections[0]['revision'], self.base)
        self.assertEqual(sections[1]['revision'], result['head'])

    def test_invalid_base_writes_error_manifest(self):
        out = self.root / 'failure'
        result = planner.plan(self.repo, 'not-a-revision', 'HEAD', out)
        self.assertFalse(result['coverage_complete']); self.assertTrue(result['errors'])
        self.assertTrue((out / 'manifest.json').exists())

    def test_invalid_budget_writes_manifest(self):
        result = planner.plan(self.repo, 'HEAD', 'HEAD', self.root / 'bad-budget', max_batch_bytes=0)
        self.assertTrue(result['errors'])
        self.assertFalse(result['coverage_complete'])
        self.assertTrue((self.root / 'bad-budget' / 'manifest.json').exists())

    def test_mode_only_change_still_contextualized(self):
        (self.repo / 'seed.txt').chmod(0o755)
        result = self.run_plan()
        self.assertTrue(result['coverage_complete'])
        data = (self.out / result['batches'][0]['payload']).read_text()
        self.assertIn('old mode', data); self.assertIn('seed', data)

    def test_immutable_revisions_and_merge_base(self):
        self.write('new.py', 'x = 1\n')
        result = self.run_plan()
        self.assertEqual(result['base'], self.base)
        self.assertEqual(result['merge_base'], self.base)
        self.assertEqual(len(result['head']), 40)


if __name__ == '__main__':
    unittest.main()
