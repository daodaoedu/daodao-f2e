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



RUNNER_SPEC = importlib.util.spec_from_file_location('runner_for_tiers', Path(__file__).resolve().parents[1] / 'run-review-batches.py')
runner = importlib.util.module_from_spec(RUNNER_SPEC)
RUNNER_SPEC.loader.exec_module(runner)


class LargeFileTiers(unittest.TestCase):
    """#314：完整單位放不下時，大檔小改仍要排進批次，且 BEFORE 證據可引用。"""

    setUp = ReviewBatches.setUp
    git = ReviewBatches.git
    write = ReviewBatches.write
    commit = ReviewBatches.commit
    run_plan = ReviewBatches.run_plan

    def big_file(self, marker):
        # ~25 KB: 300 lines × ~85 bytes, like plugin/hooks/pre-pr-gate.sh
        return ''.join(f'line_{i:03d} = "{marker}" + "{"x" * 60}"\n' for i in range(300))

    def test_one_line_change_to_25kb_file_is_reviewed_with_before_hunks(self):
        self.write('gate.sh', self.big_file('v1') + 'check_security_gate\n')
        self.base = self.commit()
        self.write('gate.sh', self.big_file('v1'))  # the safety check line is deleted
        result = self.run_plan()
        item = result['files'][0]
        self.assertEqual(item['status'], 'planned')
        self.assertEqual(item['context_level'], 'before-hunks')
        payload = (self.out / result['batches'][0]['payload']).read_text()
        self.assertIn('BEFORE HUNKS', payload)
        self.assertIn('301: check_security_gate', payload)  # original BEFORE line number
        self.assertTrue(result['coverage_complete'])

    def test_rewrite_falls_back_to_head_only(self):
        self.write('skill.md', self.big_file('old'))
        self.base = self.commit()
        self.write('skill.md', 'short new body\n')
        result = self.run_plan(max_batch_bytes=30000)
        item = result['files'][0]
        self.assertEqual(item['status'], 'planned')
        self.assertEqual(item['context_level'], 'head-only')
        payload = (self.out / result['batches'][0]['payload']).read_text()
        self.assertIn('BEFORE SOURCE OMITTED', payload)
        self.assertNotIn('BEFORE HUNKS', payload)

    def test_small_change_keeps_complete_context(self):
        self.write('small.py', 'a = 1\nb = 2\n')
        self.base = self.commit()
        self.write('small.py', 'a = 1\nb = 3\n')
        result = self.run_plan()
        self.assertEqual(result['files'][0]['context_level'], 'complete')

    def test_blank_context_lines_keep_before_numbers_when_suppress_blank_empty(self):
        # diff.suppressBlankEmpty=true prints blank context lines as "" instead of " "
        self.git('config', 'diff.suppressBlankEmpty', 'true')
        head = self.big_file('v1')
        before = head.replace('line_150', '\ncheck_security_gate\nline_150', 1)  # blank context, then the check
        self.write('gate.sh', before)
        self.base = self.commit()
        expected = before.split('\n').index('check_security_gate') + 1
        self.write('gate.sh', head.replace('line_150', '\nline_150', 1))  # only the check line is deleted
        result = self.run_plan()
        payload = (self.out / result['batches'][0]['payload']).read_text()
        self.assertEqual(result['files'][0]['context_level'], 'before-hunks')
        self.assertIn(f'{expected}: check_security_gate', payload)

    def run_runner(self, result, finding):
        def caller(model, request):
            body = {'batch_id': result['batches'][0]['id'], 'reviewed_paths': result['batches'][0]['paths'],
                    'findings': [finding], 'limitations': []}
            return {'choices': [{'finish_reason': 'stop', 'message': {'content': json.dumps(body)}}]}
        return runner.run(self.out / 'manifest.json', self.root / 'review', policy='Trusted policy',
                          context='Context pack', caller=caller)

    def test_runner_accepts_before_citation_from_hunks_and_rejects_lines_outside(self):
        self.write('gate.sh', self.big_file('v1') + 'check_security_gate\n')
        self.base = self.commit()
        self.write('gate.sh', self.big_file('v1'))
        result = self.run_plan()
        ok = {'path': 'gate.sh', 'side': 'BEFORE', 'line': 301, 'severity': 'P1',
              'description': '刪掉安全檢查', 'evidence': 'check_security_gate'}
        status = self.run_runner(result, ok)
        self.assertEqual(status['successful_batches'], 1)
        self.assertEqual(len(status['findings']), 1)
        self.assertTrue(any('gate.sh' in x and 'before-hunks' in x for x in status['limitations']))
        outside = dict(ok, line=5, evidence='line_004')  # BEFORE line 5 is not in any hunk
        status = self.run_runner(result, outside)
        self.assertEqual(status['successful_batches'], 0)
        self.assertEqual(status['findings'], [])

    def test_render_lists_unreviewed_source_files_at_top(self):
        status = {'complete': False, 'successful_batches': 0, 'planned_batches': 1, 'reviewed_paths': [],
                  'findings': [], 'errors': [], 'limitations': [],
                  'unreviewed': [{'path': 'plugin/hooks/pre-pr-gate.sh', 'reason': 'complete-file-unit-exceeds-batch-budget'},
                                 {'path': 'plugin/out/x/SKILL.md', 'reason': 'generated-platform-mirror'}]}
        body = runner.render(status)
        head = body.split('### 問題')[0]
        self.assertIn('1 個非產物檔案未審查', head)
        self.assertIn('pre-pr-gate.sh', head)
        self.assertNotIn('plugin/out/x/SKILL.md', head)


class OversizedFileHunks(unittest.TestCase):
    """#314 後續：單檔本身超過 max_batch_bytes（如 f2e en.json 452 KB）改一行，仍以 diff＋前後文審查。"""

    setUp = ReviewBatches.setUp
    git = ReviewBatches.git
    write = ReviewBatches.write
    commit = ReviewBatches.commit
    run_plan = ReviewBatches.run_plan

    def locale(self, changed=None):
        # ~60 KB: 700 lines × ~85 bytes, over the 40 KB batch on its own
        return ''.join(f'  "key_{i:03d}": "{changed if i == 350 and changed else "v1"} {"x" * 60}",\n'
                       for i in range(700))

    def test_one_line_change_to_file_over_batch_budget_is_reviewed_with_hunks(self):
        self.write('en.json', self.locale())
        self.base = self.commit()
        self.write('en.json', self.locale('v2'))
        result = self.run_plan()
        item = result['files'][0]
        self.assertEqual(item['status'], 'planned', item.get('reason'))
        self.assertEqual(item['context_level'], 'hunks')
        payload = (self.out / result['batches'][0]['payload']).read_text()
        self.assertLessEqual(len(payload.encode()), 40000)
        self.assertIn('HEAD HUNKS', payload)
        self.assertIn('BEFORE HUNKS', payload)
        self.assertIn('351:   "key_350": "v2', payload)   # changed line under its real HEAD number
        self.assertIn('340:   "key_339"', payload)        # surrounding lines beyond the diff's own 3
        self.assertNotIn('"key_010"', payload)            # far-away lines are not supplied
        self.assertTrue(result['coverage_complete'])

    def test_rewrite_of_file_over_batch_budget_is_explicit_when_diff_cannot_fit(self):
        self.write('en.json', self.locale())
        self.base = self.commit()
        self.write('en.json', self.locale().replace('v1', 'v2'))
        result = self.run_plan()
        item = result['files'][0]
        self.assertEqual(item['status'], 'unreviewed')
        self.assertEqual(item['reason'], 'diff-exceeds-batch-budget')
        self.assertFalse(result['coverage_complete'])

    def test_runner_accepts_head_citation_inside_hunks_and_rejects_outside(self):
        self.write('en.json', self.locale())
        self.base = self.commit()
        self.write('en.json', self.locale('v2'))
        result = self.run_plan()
        run = LargeFileTiers.run_runner
        ok = {'path': 'en.json', 'side': 'HEAD', 'line': 351, 'severity': 'P2',
              'description': '翻譯錯誤', 'evidence': '"key_350": "v2'}
        status = run(self, result, ok)
        self.assertEqual(status['successful_batches'], 1)
        self.assertEqual(len(status['findings']), 1)
        self.assertTrue(any('en.json' in x and 'hunks' in x for x in status['limitations']))
        self.assertFalse(status['complete'])
        outside = dict(ok, line=11, evidence='"key_010"')  # HEAD line 11 is not supplied
        status = run(self, result, outside)
        self.assertEqual(status['successful_batches'], 0)


class BatchCountCoverage(unittest.TestCase):
    """#314 後續：檔案多的 PR（f2e#1087 47 檔）不能因批次數用完就丟掉後面三分之二的檔案。"""

    setUp = ReviewBatches.setUp
    git = ReviewBatches.git
    write = ReviewBatches.write
    commit = ReviewBatches.commit
    run_plan = ReviewBatches.run_plan

    def mid_file(self, marker):
        # ~14 KB: complete unit (BEFORE + HEAD) ≈ 30 KB, so only one fits a 40 KB batch;
        # before-hunks ≈ 16 KB, so two fit.
        return ''.join(f'line_{i:03d} = "{marker}" + "{"x" * 60}"\n' for i in range(160))

    def test_many_mid_size_edits_downgrade_before_running_out_of_batches(self):
        for i in range(10):
            self.write(f'src/file_{i}.py', self.mid_file('v1'))
        self.base = self.commit()
        for i in range(10):
            self.write(f'src/file_{i}.py', self.mid_file('v1') + 'added_line = True\n')
        result = self.run_plan(max_batches=5)
        unreviewed = [(f['path'], f.get('reason')) for f in result['files'] if f['status'] != 'planned']
        self.assertEqual(unreviewed, [])
        self.assertLessEqual(len(result['batches']), 5)
        self.assertTrue(all(b['bytes'] <= 40000 for b in result['batches']))
        self.assertIn('before-hunks', {f['context_level'] for f in result['files']})
        self.assertTrue(result['coverage_complete'])

    def test_batches_are_packed_by_size_not_diff_order(self):
        # Diff order a,b,c,d with units ≈ 24/19/15/19 KB needs 3 sequential batches but fits 2.
        for name, lines in (('a.txt', 187), ('b.txt', 148), ('c.txt', 117), ('d.txt', 148)):
            self.write(name, ''.join(f'{name}-{i:04d}-{"x" * 50}\n' for i in range(lines)))
        result = self.run_plan(max_batches=2)
        self.assertEqual([f['status'] for f in result['files']], ['planned'] * 4,
                         [(f['path'], f.get('reason'), f.get('required_bytes')) for f in result['files']])
        self.assertEqual(len(result['batches']), 2)
        self.assertEqual({f['context_level'] for f in result['files']}, {'complete'})
        self.assertTrue(all(b['bytes'] <= 40000 for b in result['batches']))

    def test_runner_accepts_reordered_packed_batches(self):
        for name, lines in (('a.txt', 187), ('b.txt', 148), ('c.txt', 117), ('d.txt', 148)):
            self.write(name, ''.join(f'{name}-{i:04d}-{"x" * 50}\n' for i in range(lines)))
        result = self.run_plan(max_batches=2)
        manifest = self.out / 'manifest.json'
        spec = importlib.util.spec_from_file_location('runner_pack', Path(__file__).resolve().parents[1] / 'run-review-batches.py')
        runner = importlib.util.module_from_spec(spec); spec.loader.exec_module(runner)
        def call(model, request):
            batch = json.loads(json.loads(request)['messages'][1]['content'])['batch']
            return {'choices': [{'finish_reason': 'stop', 'message': {'content': json.dumps(
                {'batch_id': batch['batch_id'], 'reviewed_paths': batch['paths'], 'findings': [], 'limitations': []})}}]}
        status = runner.run(manifest, self.root / 'review-out', policy='p', context='c', caller=call)
        self.assertEqual(status['reviewed_paths'], ['a.txt', 'b.txt', 'c.txt', 'd.txt'])
        self.assertTrue(status['complete'])


RUN_1 = 'https://github.com/daodaoedu/daodao-f2e/actions/runs/1001'
RUN_2 = 'https://github.com/daodaoedu/daodao-f2e/actions/runs/1002'
RUN_3 = 'https://github.com/daodaoedu/daodao-f2e/actions/runs/1003'


class IncrementalReview(unittest.TestCase):
    """#368：synchronize 只審上次審查後 PR diff 有變的檔；rebase／update-branch 沒改到 PR diff 就不呼叫模型。"""

    setUp = ReviewBatches.setUp
    git = ReviewBatches.git
    write = ReviewBatches.write
    commit = ReviewBatches.commit

    def far_file(self, marker):
        return ''.join(f'far_{i:03d} = "{marker}"\n' for i in range(80))

    def start_pr(self):
        """main: a.py, b.py, far.py；PR branch 改 a.py、b.py。"""
        self.write('lib/a.py', 'def a():\n    return 1\n')
        self.write('lib/b.py', 'def b():\n    return 2\n')
        self.write('far.py', self.far_file('v1'))
        self.main = self.git('rev-parse', '--abbrev-ref', 'HEAD')
        self.base = self.commit()
        self.git('checkout', '-q', '-b', 'feature')
        self.write('lib/a.py', 'def a():\n    return 10\n')
        self.write('lib/b.py', 'def b():\n    return 20\n')
        return self.commit()

    def advance_main_and_rebase(self, path='far.py', text=None):
        """main 改一個 PR 沒碰的檔，PR rebase 上去：PR 自身 diff 不變。"""
        self.git('checkout', '-q', self.main)
        self.write(path, text if text is not None else self.far_file('v2'))
        self.base = self.commit()
        self.git('checkout', '-q', 'feature')
        self.git('rebase', '-q', self.main)
        return self.git('rev-parse', 'HEAD')

    def plan(self, head, name, previous=None):
        out = self.root / name
        return planner.plan(self.repo, self.base, head, out, previous_state=previous), out

    def review(self, plan_dir, name, run_url, fail_paths=(), findings=None):
        calls = []

        def call(model, request):
            batch = json.loads(json.loads(request)['messages'][1]['content'])['batch']
            calls.append(sorted(batch['paths']))
            if set(batch['paths']) & set(fail_paths):
                return {'choices': [{'finish_reason': 'length', 'message': {'content': ''}}]}
            body = {'batch_id': batch['batch_id'], 'reviewed_paths': batch['paths'],
                    'findings': [f for f in (findings or []) if f['path'] in batch['paths']], 'limitations': []}
            return {'choices': [{'finish_reason': 'stop', 'message': {'content': json.dumps(body)}}]}
        out = self.root / name
        status = runner.run(plan_dir / 'manifest.json', out, policy='Trusted policy', context='Context pack',
                            caller=call, run_url=run_url)
        marker = (out / 'review-state-marker.txt').read_text()
        return status, marker, calls, (out / 'review-body.md').read_text()

    def baseline(self, marker):
        # The workflow hands the planner the whole bot comment; the marker sits after the report.
        return planner.parse_previous_state('## Code Review\n\n報告內容\n\n' + marker + '\n')

    def statuses(self, manifest):
        return {f['path']: f['status'] for f in manifest['files']}

    def test_first_review_without_baseline_reviews_every_file(self):
        head = self.start_pr()
        manifest, _ = self.plan(head, 'plan-1')
        self.assertEqual(self.statuses(manifest), {'lib/a.py': 'planned', 'lib/b.py': 'planned'})
        self.assertEqual(manifest['incremental']['baseline'], 'none')

    def test_rebase_with_unchanged_pr_diff_calls_no_model(self):
        head = self.start_pr()
        manifest, plan_dir = self.plan(head, 'plan-1')
        status, marker, calls, _ = self.review(plan_dir, 'out-1', RUN_1)
        self.assertTrue(status['complete'])
        self.assertEqual(calls, [['lib/a.py', 'lib/b.py']])
        rebased = self.advance_main_and_rebase()
        self.assertNotEqual(rebased, head)
        manifest, plan_dir = self.plan(rebased, 'plan-2', self.baseline(marker))
        self.assertEqual(self.statuses(manifest), {'lib/a.py': 'carried', 'lib/b.py': 'carried'})
        self.assertEqual(manifest['batches'], [])
        self.assertEqual(manifest['incremental']['baseline'], 'used')
        self.assertTrue(manifest['coverage_complete'])
        status, marker2, calls, body = self.review(plan_dir, 'out-2', RUN_2)
        self.assertEqual(calls, [])
        self.assertTrue(status['complete'])
        self.assertEqual(status['unreviewed'], [])
        self.assertEqual(sorted(c['path'] for c in status['carried']), ['lib/a.py', 'lib/b.py'])
        self.assertIn('diff 未變', body)
        self.assertIn(RUN_1, body)
        # The carried baseline still points at the run that actually reviewed the files.
        again = self.baseline(marker2)
        self.assertEqual({p: again['runs'][f['run']]['url'] for p, f in again['files'].items()},
                         {'lib/a.py': RUN_1, 'lib/b.py': RUN_1})

    def test_partial_push_only_reviews_changed_files(self):
        head = self.start_pr()
        _, plan_dir = self.plan(head, 'plan-1')
        _, marker, _, _ = self.review(plan_dir, 'out-1', RUN_1)
        self.write('lib/b.py', 'def b():\n    return 200\n')
        head = self.commit()
        manifest, plan_dir = self.plan(head, 'plan-2', self.baseline(marker))
        self.assertEqual(self.statuses(manifest), {'lib/a.py': 'carried', 'lib/b.py': 'planned'})
        status, marker2, calls, body = self.review(plan_dir, 'out-2', RUN_2)
        self.assertEqual(calls, [['lib/b.py']])
        self.assertTrue(status['complete'])
        self.assertEqual(status['reviewed_paths'], ['lib/b.py'])
        reviewed, carried = body.split('沿用上次審查', 1)
        self.assertIn('lib/b.py', reviewed)
        self.assertIn('lib/a.py', carried)
        again = self.baseline(marker2)
        self.assertEqual({p: again['runs'][f['run']]['url'] for p, f in again['files'].items()},
                         {'lib/a.py': RUN_1, 'lib/b.py': RUN_2})

    def test_file_left_unreviewed_last_time_is_reviewed_again_even_if_unchanged(self):
        head = self.start_pr()
        _, plan_dir = self.plan(head, 'plan-1')
        # Two files fit one batch; force separate batches so only b.py fails.
        manifest, plan_dir = planner.plan(self.repo, self.base, head, self.root / 'plan-1b', max_batch_bytes=400), self.root / 'plan-1b'
        self.assertEqual(len(manifest['batches']), 2)
        status, marker, _, _ = self.review(plan_dir, 'out-1', RUN_1, fail_paths=['lib/b.py'])
        self.assertEqual([u['path'] for u in status['unreviewed']], ['lib/b.py'])
        rebased = self.advance_main_and_rebase()
        manifest, plan_dir = self.plan(rebased, 'plan-2', self.baseline(marker))
        self.assertEqual(self.statuses(manifest), {'lib/a.py': 'carried', 'lib/b.py': 'planned'})
        status, _, calls, _ = self.review(plan_dir, 'out-2', RUN_2)
        self.assertEqual(calls, [['lib/b.py']])
        self.assertTrue(status['complete'])

    def test_base_change_inside_the_hunk_context_is_reviewed_again(self):
        self.write('lib/a.py', 'import os\n\ndef a():\n    return 1\n')
        self.main = self.git('rev-parse', '--abbrev-ref', 'HEAD')
        self.base = self.commit()
        self.git('checkout', '-q', '-b', 'feature')
        self.write('lib/a.py', 'import os\n\ndef a():\n    return 10\n')
        head = self.commit()
        _, plan_dir = self.plan(head, 'plan-1')
        _, marker, _, _ = self.review(plan_dir, 'out-1', RUN_1)
        rebased = self.advance_main_and_rebase('lib/a.py', 'import sys\n\ndef a():\n    return 1\n')
        manifest, _ = self.plan(rebased, 'plan-2', self.baseline(marker))
        self.assertEqual(self.statuses(manifest), {'lib/a.py': 'planned'})

    def test_findings_on_carried_files_stay_visible(self):
        head = self.start_pr()
        _, plan_dir = self.plan(head, 'plan-1')
        finding = {'path': 'lib/a.py', 'side': 'HEAD', 'line': 2, 'severity': 'P2',
                   'description': '回傳值改變', 'evidence': 'return 10'}
        _, marker, _, _ = self.review(plan_dir, 'out-1', RUN_1, findings=[finding])
        rebased = self.advance_main_and_rebase()
        _, plan_dir = self.plan(rebased, 'plan-2', self.baseline(marker))
        status, marker2, calls, body = self.review(plan_dir, 'out-2', RUN_2)
        self.assertEqual(calls, [])
        self.assertIn('回傳值改變', body)
        self.assertEqual(len(self.baseline(marker2)['findings']), 1)

    def test_partial_context_level_stays_a_limitation_when_carried(self):
        head = self.start_pr()
        _, plan_dir = self.plan(head, 'plan-1')
        _, marker, _, _ = self.review(plan_dir, 'out-1', RUN_1)
        state = self.baseline(marker)
        state['files']['lib/a.py']['level'] = 'head-only'
        rebased = self.advance_main_and_rebase()
        _, plan_dir = self.plan(rebased, 'plan-2', state)
        status, _, _, _ = self.review(plan_dir, 'out-2', RUN_2)
        self.assertFalse(status['complete'])
        self.assertTrue(any(x.startswith('部分脈絡') and 'lib/a.py' in x for x in status['limitations']))

    def test_garbage_or_tampered_baseline_is_ignored(self):
        prefix = '<!-- daodao-ai-code-review-state:'
        self.assertIsNone(planner.parse_previous_state('no marker here'))
        self.assertIsNone(planner.parse_previous_state(prefix + '!!!not-base64 -->'))
        head = self.start_pr()
        _, plan_dir = self.plan(head, 'plan-1')
        _, marker, _, _ = self.review(plan_dir, 'out-1', RUN_1)
        good = self.baseline(marker)
        for broken in ({**good, 'v': 99},
                       {**good, 'files': {'../etc/passwd': next(iter(good['files'].values()))}},
                       {**good, 'files': {p: {**f, 'fp': 'not-hex'} for p, f in good['files'].items()}},
                       {**good, 'runs': [{'head': 'x', 'url': 'javascript:alert(1)'}]}):
            with self.subTest(broken=str(broken)[:60]):
                self.assertIsNone(planner.parse_previous_state(runner.state_marker(broken)))
        self.assertIsNotNone(planner.parse_previous_state(runner.state_marker(good)))


if __name__ == '__main__':
    unittest.main()
