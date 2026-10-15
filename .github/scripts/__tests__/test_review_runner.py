import hashlib
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

SCRIPT = Path(__file__).resolve().parents[1] / 'run-review-batches.py'
spec = importlib.util.spec_from_file_location('runner', SCRIPT)
runner = importlib.util.module_from_spec(spec)
spec.loader.exec_module(runner)


class RunnerTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        self.manifest = {'schema_version': 1, 'head': 'a' * 40, 'files': [], 'batches': [], 'errors': []}
        self.add_batch('batch-001', 'code.py')
        self.write()

    def tearDown(self):
        self.tmp.cleanup()

    def add_batch(self, ident, path):
        raw = b'FILE code.py\nCOMPLETE DIFF\n+fixed()\nCOMPLETE HEAD FILE\n1: fixed()\n'
        name = ident + '.txt'
        (self.root / name).write_bytes(raw)
        self.manifest['batches'].append({'id': ident, 'payload': name, 'bytes': len(raw), 'sha256': hashlib.sha256(raw).hexdigest(), 'paths': [path], 'units': [{'path': path, 'start_byte': 0, 'end_byte': len(raw), 'line_count': 1, 'source_sections': [{'start_byte': raw.index(b'1: fixed()'), 'end_byte': len(raw), 'line_count': 1, 'label': 'HEAD'}]}]})
        self.manifest['files'].append({'path': path, 'status': 'planned', 'file_complete': True, 'batch_id': ident, 'sources': [{'lines': 1}]})

    def write(self):
        self.path = self.root / 'manifest.json'
        self.path.write_text(json.dumps(self.manifest))

    def response(self, ident='batch-001', paths=None, findings=None, limitations=None, finish='stop'):
        result = {'batch_id': ident, 'reviewed_paths': paths if paths is not None else ['code.py'], 'findings': findings or [], 'limitations': limitations or []}
        return {'choices': [{'finish_reason': finish, 'message': {'content': json.dumps(result)}}]}

    def run_review(self, caller):
        return runner.run(self.path, self.root / 'out', policy='Trusted policy', context='Context pack', caller=caller)

    def finding(self, **overrides):
        item = {'path': 'code.py', 'side': 'HEAD', 'line': 1, 'severity': 'P1', 'description': 'Concrete defect', 'evidence': 'fixed()'}
        item.update(overrides)
        return item

    def test_complete_workflow_owns_marker(self):
        status = self.run_review(lambda *args: self.response(findings=[self.finding()]))
        self.assertTrue(status['complete'])
        self.assertEqual(len(status['findings']), 1)
        body = (self.root / 'out/review-body.md').read_text()
        self.assertNotIn('<!-- daodao-ai-code-review', body)
        self.assertEqual(status['head_sha'], 'a' * 40)
        self.assertNotIn('✅ 沒有發現明顯問題', body)

    def test_fallback_only_once(self):
        calls = []
        def call(model, request):
            calls.append(model)
            return self.response(finish='length') if len(calls) == 1 else self.response()
        status = self.run_review(call)
        self.assertTrue(status['complete'])
        self.assertEqual(calls, [runner.PRIMARY, runner.FALLBACK])

    def test_invalid_outputs_never_publish_findings(self):
        for response in [self.response(paths=[]), self.response(findings=[self.finding(path='foreign.py')]), self.response(findings=[self.finding(line=2)]), self.response(findings=[self.finding(line=True)]), self.response(findings=[self.finding(side='unknown')]), self.response(findings=[self.finding(side='BEFORE')]), self.response(findings=[self.finding(evidence='nonexistent()')]), self.response(findings=[self.finding(evidence='COMPLETE DIFF')]), self.response(finish='length')]:
            with self.subTest(response=response):
                status = self.run_review(lambda *args: response)
                self.assertFalse(status['complete'])
                self.assertEqual(status['findings'], [])
                self.assertEqual(status['successful_batches'], 0)

    def test_evidence_must_match_reported_line(self):
        raw = b'HEADER\n1: first()\n2: second()\n'
        batch = self.manifest['batches'][0]
        (self.root / batch['payload']).write_bytes(raw)
        batch.update(bytes=len(raw), sha256=hashlib.sha256(raw).hexdigest())
        batch['units'][0].update(end_byte=len(raw), line_count=2, source_sections=[{'start_byte': 7, 'end_byte': len(raw), 'line_count': 2, 'label': 'HEAD'}])
        self.manifest['files'][0]['sources'][0]['lines'] = 2
        self.write()
        status = self.run_review(lambda *args: self.response(findings=[self.finding(line=1, evidence='second()')]))
        self.assertFalse(status['complete'])
        self.assertEqual(status['findings'], [])
        status = self.run_review(lambda *args: self.response(findings=[self.finding(line=1, evidence='first()\nsecond()')]))
        self.assertTrue(status['complete'])

    def test_before_evidence_requires_explicit_revision_side(self):
        raw = b'1: removed()\n1: fixed()\n'
        batch = self.manifest['batches'][0]
        (self.root / batch['payload']).write_bytes(raw)
        batch.update(bytes=len(raw), sha256=hashlib.sha256(raw).hexdigest())
        batch['units'][0].update(end_byte=len(raw), source_sections=[
            {'start_byte': 0, 'end_byte': 13, 'line_count': 1, 'label': 'BEFORE'},
            {'start_byte': 13, 'end_byte': len(raw), 'line_count': 1, 'label': 'HEAD'}])
        self.manifest['files'][0]['git_status'] = 'R100'
        self.write()
        status = self.run_review(lambda *args: self.response(findings=[self.finding(evidence='removed()')]))
        self.assertFalse(status['complete'])
        self.assertEqual(status['findings'], [])
        status = self.run_review(lambda *args: self.response(findings=[self.finding(evidence='fixed()')]))
        self.assertTrue(status['complete'])
        status = self.run_review(lambda *args: self.response(findings=[self.finding(side='BEFORE', evidence='removed()')]))
        self.assertTrue(status['complete'])
        self.assertIn('&#40;BEFORE&#41;', (self.root / 'out/review-body.md').read_text())

    def test_lf_only_source_numbering(self):
        raw = '1: first()\f middle()\u2028 last()\n2: second()\n'.encode()
        batch = self.manifest['batches'][0]
        (self.root / batch['payload']).write_bytes(raw)
        batch.update(bytes=len(raw), sha256=hashlib.sha256(raw).hexdigest())
        batch['units'][0].update(end_byte=len(raw), line_count=2, source_sections=[
            {'start_byte': 0, 'end_byte': len(raw), 'line_count': 2, 'label': 'HEAD'}])
        self.manifest['files'][0]['sources'][0]['lines'] = 2
        self.write()
        status = self.run_review(lambda *args: self.response(findings=[self.finding(line=1, evidence='middle()\u2028 last()')]))
        self.assertTrue(status['complete'])
        status = self.run_review(lambda *args: self.response(findings=[self.finding(line=2, evidence='second()')]))
        self.assertTrue(status['complete'])

    def test_untrusted_markdown_neutralized(self):
        text = runner.safe_markdown('@everyone [link](https://evil.invalid) ![image](https://evil.invalid) `code`')
        self.assertNotIn('@everyone', text)
        self.assertNotIn('[link]', text)
        self.assertNotIn('![image]', text)
        self.assertNotIn('`code`', text)
        self.assertIn('&#64;everyone', text)

    def test_oversized_supplement_does_not_abort_batches(self):
        context = self.root / 'context.md'
        context.write_text('x' * 24001)
        policy = self.root / 'policy.md'
        policy.write_text('policy')
        args = ['runner', '--manifest', str(self.path), '--out', str(self.root / 'out'), '--policy', str(policy), '--context', str(context)]
        with patch('sys.argv', args), patch.dict(runner.os.environ, {'CLOUDFLARE_ACCOUNT_ID': 'a' * 32, 'CLOUDFLARE_API_TOKEN': 'test'}), patch.object(runner, 'call_http', return_value=self.response()) as call:
            self.assertEqual(runner.main(), 0)
        call.assert_called_once()
        status = json.loads((self.root / 'out/status.json').read_text())
        self.assertEqual(status['successful_batches'], 1)
        self.assertFalse(status['complete'])
        self.assertIn('context: supplementary input unavailable or over budget; not truncated', status['limitations'])

    def test_missing_side_is_not_guessed(self):
        finding = self.finding()
        finding.pop('side')
        status = self.run_review(lambda *args: self.response(findings=[finding]))
        self.assertFalse(status['complete'])
        self.assertEqual(status['findings'], [])

    def test_serialized_request_contains_entire_batch_payload(self):
        self.add_batch('batch-002', 'other.py')
        # Put two complete files and both revision sides in a single provider batch.
        first = b'FILE code.py\nCOMPLETE DIFF\n-first()\n+fixed()\nCOMPLETE BEFORE FILE\n1: first()\nCOMPLETE HEAD FILE\n1: fixed()\n'
        later = b'FILE other.py\nCOMPLETE DIFF\n+later()\nCOMPLETE HEAD FILE\n1: later()\n'
        raw = first + later
        batch = self.manifest['batches'][0]
        (self.root / batch['payload']).write_bytes(raw)
        old_start = first.index(b'1: first()')
        old_end = old_start + len(b'1: first()\n')
        head_start = first.index(b'1: fixed()')
        later_start = len(first) + later.index(b'1: later()')
        batch.update(bytes=len(raw), sha256=hashlib.sha256(raw).hexdigest(), paths=['code.py', 'other.py'], units=[
            {'path': 'code.py', 'start_byte': 0, 'end_byte': len(first), 'source_sections': [
                {'label': 'BEFORE', 'start_byte': old_start, 'end_byte': old_end, 'line_count': 1},
                {'label': 'HEAD', 'start_byte': head_start, 'end_byte': len(first), 'line_count': 1}]},
            {'path': 'other.py', 'start_byte': len(first), 'end_byte': len(raw), 'source_sections': [
                {'label': 'HEAD', 'start_byte': later_start, 'end_byte': len(raw), 'line_count': 1}]}])
        self.manifest['batches'] = [batch]
        self.manifest['files'][1]['batch_id'] = 'batch-001'
        self.write()
        def call(model, request):
            content = json.loads(json.loads(request)['messages'][1]['content'])
            self.assertEqual(content['batch']['complete_file_context'], raw.decode())
            for required in ('COMPLETE DIFF', 'COMPLETE BEFORE FILE', 'COMPLETE HEAD FILE', 'first()', 'fixed()', 'FILE other.py', 'later()'):
                self.assertIn(required, content['batch']['complete_file_context'])
            return self.response(paths=['code.py', 'other.py'])
        self.assertTrue(self.run_review(call)['complete'])

    def test_transport_header_exception_never_discloses_token(self):
        token = 'DUMMY_PRIVATE_TOKEN\ninvalid'
        status = runner.run(self.path, self.root / 'out', policy='policy', context='context', account='a' * 32, token=token)
        self.assertFalse(status['complete'])
        for file in ('status.json', 'review-body.md'):
            content = (self.root / 'out' / file).read_text()
            self.assertNotIn('DUMMY_PRIVATE_TOKEN', content)
            self.assertNotIn('DUMMY_PRIVATE_TOKEN\\ninvalid', content)
            self.assertIn('transport_failed' if file == 'status.json' else 'transport&#95;failed', content)

    def test_invalid_utf8_unreviewed_path_preserves_valid_batch(self):
        invalid_path = b'invalid-\xff.py'.decode('utf-8', 'surrogateescape')
        self.manifest['files'].append({'path': invalid_path, 'status': 'unreviewed', 'reason': 'unsupported-git-filename'})
        self.write()
        status = self.run_review(lambda *args: self.response())
        self.assertFalse(status['complete'])
        self.assertEqual(status['successful_batches'], 1)
        self.assertEqual(status['reviewed_paths'], ['code.py'])
        saved = json.loads((self.root / 'out/status.json').read_text())
        self.assertEqual(saved['unreviewed'][0]['path'], invalid_path)
        body = (self.root / 'out/review-body.md').read_text()
        self.assertIn('udcff', body)

    def test_response_artifact_failure_is_not_success(self):
        original = Path.write_text
        def write(path, content, *args, **kwargs):
            if path.name.endswith('.response.json'):
                raise OSError('cannot save response')
            return original(path, content, *args, **kwargs)
        with patch.object(Path, 'write_text', write):
            status = self.run_review(lambda *args: self.response(findings=[self.finding()]))
        self.assertFalse(status['complete'])
        self.assertEqual(status['successful_batches'], 0)
        self.assertEqual(status['findings'], [])

    def test_malformed_json_or_schema_incomplete(self):
        for content in ['not JSON', '{}', '```json\n{}\n```']:
            response = {'choices': [{'finish_reason': 'stop', 'message': {'content': content}}]}
            status = self.run_review(lambda *args: response)
            self.assertFalse(status['complete'])

    def test_payload_sha_mismatch_no_network(self):
        (self.root / 'batch-001.txt').write_text('replaced')
        status = self.run_review(lambda *args: self.fail('must not call model'))
        self.assertFalse(status['complete'])
        self.assertIn('SHA mismatch', status['errors'][0])

    def test_missing_complete_context(self):
        self.manifest['files'][0]['file_complete'] = False
        self.write()
        status = self.run_review(lambda *args: self.fail('must not call model'))
        self.assertFalse(status['complete'])

    def test_file_excluded_explicit_not_reviewed(self):
        self.manifest['files'].append({'path': 'lock.json', 'status': 'excluded', 'reason': 'generated'})
        self.write()
        status = self.run_review(lambda *args: self.response())
        self.assertFalse(status['complete'])
        self.assertEqual(status['unreviewed'][0]['path'], 'lock.json')

    def test_model_limits_preserved(self):
        status = self.run_review(lambda *args: self.response(limitations=['External dependency not supplied']))
        self.assertFalse(status['complete'])
        self.assertEqual(status['successful_batches'], 1)

    def test_missing_context_or_policy_incomplete(self):
        status = runner.run(self.path, self.root / 'out', caller=lambda *args: self.response())
        self.assertFalse(status['complete'])
        self.assertEqual(len(status['limitations']), 2)

    def test_no_credentials_incomplete(self):
        status = runner.run(self.path, self.root / 'out')
        self.assertFalse(status['complete'])
        self.assertIn('credentials unavailable', status['errors'][0])

    def test_request_budget_no_cutting(self):
        status = runner.run(self.path, self.root / 'out', context='x' * 140000, caller=lambda *args: self.fail('must not call model'))
        self.assertFalse(status['complete'])
        self.assertIn('no source was truncated', status['errors'][0])

    def test_batch_budget_no_extra_calls(self):
        for i in range(2, 14):
            self.add_batch(f'batch-{i:03}', f'code{i}.py')
        self.write()
        calls = []
        def call(model, request):
            data = json.loads(request)
            batch = json.loads(data['messages'][1]['content'])['batch']
            calls.append(batch['batch_id'])
            return self.response(ident=batch['batch_id'], paths=batch['paths'])
        status = self.run_review(call)
        self.assertEqual(len(calls), 12)
        self.assertFalse(status['complete'])

    def test_invalid_account_never_requests(self):
        with patch.object(runner.urllib.request, 'urlopen') as mocked:
            with self.assertRaises(ValueError):
                runner.call_http(runner.PRIMARY, b'{}', '../evil', 'secret')
            mocked.assert_not_called()

    def test_response_format_only_primary(self):
        payload = {'batch_id': 'batch-001', 'paths': ['code.py'], 'files': []}
        self.assertIn('response_format', json.loads(runner.make_request(runner.PRIMARY, payload, '', '', '')))
        self.assertNotIn('response_format', json.loads(runner.make_request(runner.FALLBACK, payload, '', '', '')))

    def test_timeout_redacts_http_error(self):
        def call(*args):
            raise TimeoutError('secret bearer token')
        status = self.run_review(call)
        self.assertFalse(status['complete'])
        self.assertNotIn('secret', json.dumps(status))

    def test_crossbatch_partial_success(self):
        self.add_batch('batch-002', 'other.py')
        self.write()
        def call(model, request):
            batch = json.loads(json.loads(request)['messages'][1]['content'])['batch']
            return self.response() if batch['batch_id'] == 'batch-001' else self.response(paths=[])
        status = self.run_review(call)
        self.assertFalse(status['complete'])
        self.assertEqual(status['reviewed_paths'], ['code.py'])
        self.assertEqual(status['unreviewed'][0]['path'], 'other.py')


if __name__ == '__main__':
    unittest.main()
