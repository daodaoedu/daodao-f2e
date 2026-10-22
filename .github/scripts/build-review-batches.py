#!/usr/bin/env python3
"""Plan bounded, whole-file review inputs; omitted coverage is explicit."""
import argparse
import base64
import binascii
import hashlib
import json
import re
from pathlib import Path
import subprocess
import zlib


def git(repo, *args):
    return subprocess.check_output(['git', '-C', str(repo), *args])


def exclusion(path):
    name = Path(path).name
    if name in {'pnpm-lock.yaml', 'package-lock.json', 'yarn.lock', 'bun.lockb', 'bun.lock', 'openapi.json', 'openapi.yaml'}:
        return 'generated-or-lockfile'
    if 'generated' in Path(path).parts or path == 'packages/api/src/types.ts':
        return 'generated-code'
    if path.startswith(('plugin/out/', '.agents/skills/')):
        return 'generated-platform-mirror'
    return None


def source_lines(data):
    # Git/GitHub line anchors count LF, not Python's broader Unicode separators.
    lines = data.decode('utf-8').split('\n')
    if lines[-1] == '':
        lines.pop()
    return lines


def numbered(data):
    return ''.join(f'{i}: {line}\n' for i, line in enumerate(source_lines(data), 1))


HUNK_RE = re.compile(r'^@@ -(\d+)(?:,\d+)? \+\d+(?:,\d+)? @@')
RANGE_RE = re.compile(r'^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@')
# Surrounding lines per hunk for files too large to supply whole; 0 = only the diff's own lines.
HUNK_RADII = (20, 0)


def before_hunk_lines(diff_text):
    """Old-side lines the diff shows (context and removed), keyed by their real BEFORE line number."""
    entries, old_no, in_hunk = [], None, False
    lines = diff_text.split('\n')
    if lines and lines[-1] == '':
        lines.pop()  # trailing newline of the whole diff, not a blank context line
    for line in lines:
        match = HUNK_RE.match(line)
        if match:
            old_no, in_hunk = int(match.group(1)), True
            continue
        if not in_hunk or line.startswith('\\'):
            continue
        if line == '':
            # diff.suppressBlankEmpty prints a blank context line without its leading space
            entries.append((old_no, ''))
            old_no += 1
        elif line[0] in ' -':
            entries.append((old_no, line[1:]))
            old_no += 1
        elif line[0] != '+':
            in_hunk = False
    return entries


def hunk_window_lines(diff_text, label, data, radius):
    """Source lines around each hunk of one side, keyed by their real line number on that side."""
    lines = source_lines(data)
    wanted = set()
    for line in diff_text.split('\n'):
        match = RANGE_RE.match(line)
        if not match:
            continue
        start, count = (match.group(1), match.group(2)) if label == 'BEFORE' else (match.group(3), match.group(4))
        start, count = int(start), 1 if count is None else int(count)
        # count 0 (pure insertion/deletion on the other side) still anchors around `start`
        wanted.update(range(max(1, start - radius), min(len(lines), start + max(count, 1) - 1 + radius) + 1))
    return [(n, lines[n - 1]) for n in sorted(wanted)]


def diff_fingerprint(diff_text):
    """Identity of one file's PR diff that survives rebase / update-branch (#368).

    Blob ids, similarity scores and hunk line numbers change when the base moves even though the
    PR's own change is identical, so they are dropped. Paths, modes and every context/added/removed
    line stay, whitespace included (unlike `git patch-id`, which ignores whitespace that matters in
    YAML, Python and Markdown). A base change inside a hunk's context therefore still counts as a change.
    """
    kept = []
    for line in diff_text.split('\n'):
        if line.startswith(('index ', 'similarity index ', 'dissimilarity index ')):
            continue
        kept.append('@@' if HUNK_RE.match(line) else line)
    return hashlib.sha256('\n'.join(kept).encode('utf-8', 'surrogateescape')).hexdigest()[:32]


# Baseline of the last review, embedded by the workflow in the bot's review comment (#368).
STATE_RE = re.compile(r'<!-- daodao-ai-code-review-state:([A-Za-z0-9+/=]{1,60000}) -->')
RUN_URL_RE = re.compile(r'https://github\.com/[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+/actions/runs/\d+(?:/attempts/\d+)?')
STATE_LEVELS = ('complete', 'before-hunks', 'head-only', 'hunks')
MAX_STATE_JSON_BYTES = 512000


def valid_state_path(value):
    return (isinstance(value, str) and 0 < len(value) <= 1024 and not value.startswith('/')
            and all(part not in ('', '.', '..') for part in value.split('/'))
            and not any(c in value for c in '\\\t\r\n') and not any(ord(c) < 32 or 0xD800 <= ord(c) <= 0xDFFF for c in value))


def parse_previous_state(text):
    """Last review baseline found in a comment body, or None when absent or not well formed."""
    found = STATE_RE.findall(text or '')
    if not found:
        return None
    try:
        decoder = zlib.decompressobj()
        raw = decoder.decompress(base64.b64decode(found[-1], validate=True), MAX_STATE_JSON_BYTES)
        if decoder.unconsumed_tail:
            return None
        state = json.loads(raw)
    except (binascii.Error, zlib.error, ValueError):
        return None
    if not isinstance(state, dict) or set(state) != {'v', 'runs', 'files', 'findings'} or state['v'] != 1:
        return None
    runs, files, findings = state['runs'], state['files'], state['findings']
    if not isinstance(runs, list) or not 0 < len(runs) <= 100:
        return None
    for run in runs:
        if (not isinstance(run, dict) or set(run) != {'head', 'url'}
                or not isinstance(run['head'], str) or not re.fullmatch('[0-9a-f]{40}', run['head'])
                or not (run['url'] is None or (isinstance(run['url'], str) and RUN_URL_RE.fullmatch(run['url'])))):
            return None
    if not isinstance(files, dict) or len(files) > 5000:
        return None
    for path, entry in files.items():
        if (not valid_state_path(path) or not isinstance(entry, dict) or set(entry) != {'fp', 'level', 'run'}
                or not isinstance(entry['fp'], str) or not re.fullmatch('[0-9a-f]{32}', entry['fp'])
                or entry['level'] not in STATE_LEVELS
                or type(entry['run']) is not int or not 0 <= entry['run'] < len(runs)):
            return None
    # Findings are model output: kept only as data for files in the baseline; the runner re-validates them.
    if not isinstance(findings, list) or len(findings) > 500:
        return None
    if any(not isinstance(f, dict) or f.get('path') not in files for f in findings):
        return None
    return state


def describe(item, level, payload, unit_blobs):
    item['context_level'] = level
    item['required_bytes'] = len(payload)
    item['sources'] = [{k: v for k, v in b.items() if k not in ('header', 'content', 'data')} for b in unit_blobs]


def budget_downgrade(entry):
    """Index of the BEFORE-hunks option a complete unit may give way to when batches run out."""
    options = entry['options']
    if options[entry['choice']]['level'] != 'complete':
        return None
    return next((i for i, o in enumerate(options) if o['level'] == 'before-hunks'), None)


def pack(pending, max_batch_bytes, max_batches, max_total_bytes):
    """First-fit decreasing: biggest units first, each into the first batch with room."""
    sizes = [len(e['options'][e['choice']]['payload']) for e in pending]
    bins, used, overflow, total = [], [], {}, 0
    for index in sorted(range(len(pending)), key=lambda i: (-sizes[i], i)):
        size = sizes[index]
        if total + size > max_total_bytes:
            overflow[index] = 'total-budget-exhausted'
            continue
        slot = next((b for b, room in enumerate(used) if room + size <= max_batch_bytes), None)
        if slot is None:
            if len(bins) >= max_batches:
                overflow[index] = 'batch-count-budget-exhausted'
                continue
            bins.append([]); used.append(0); slot = len(bins) - 1
        bins[slot].append(index); used[slot] += size; total += size
    return bins, overflow


def plan(repo, base, head, out, max_batch_bytes=40000, max_batches=24, max_total_bytes=800000,
         max_source_bytes=None, previous_state=None, previous_state_invalid=False):
    # Sources over one batch are reviewed from diff hunks; this cap only bounds Git's diff allocation.
    max_source_bytes = max_source_bytes or 50 * max_batch_bytes
    out = Path(out)
    out.mkdir(parents=True, exist_ok=True)
    # A file is carried only when the previous review covered it and its PR diff is byte-identical
    # (modulo line numbers / blob ids); files that previous run left unreviewed are not in the baseline.
    baseline = (previous_state or {}).get('files', {})
    manifest = {'schema_version': 1, 'base': None, 'head': None, 'merge_base': None,
                'files': [], 'batches': [], 'errors': [], 'carried_findings': [],
                'incremental': {'baseline': 'used' if previous_state else ('invalid' if previous_state_invalid else 'none'),
                                'carried': 0},
                'budgets': {'max_batch_bytes': max_batch_bytes, 'max_batches': max_batches,
                            'max_total_bytes': max_total_bytes, 'max_source_bytes': max_source_bytes}}
    try:
        if min(max_batch_bytes, max_batches, max_total_bytes, max_source_bytes) <= 0:
            raise ValueError('budgets must be positive')
        base_sha = git(repo, 'rev-parse', '--verify', '--end-of-options', base + '^{commit}').decode().strip()
        head_sha = git(repo, 'rev-parse', '--verify', '--end-of-options', head + '^{commit}').decode().strip()
        merge = git(repo, 'merge-base', base_sha, head_sha).decode().strip()
        manifest.update(base=base_sha, head=head_sha, merge_base=merge)
        raw = git(repo, 'diff', '--name-status', '-z', '--find-renames', merge, head_sha)
        parts = raw.split(b'\0')
        records = []
        i = 0
        while i < len(parts) and parts[i]:
            status = parts[i].decode('ascii'); i += 1
            old = parts[i].decode('utf-8', 'surrogateescape'); i += 1
            new = old
            if status.startswith(('R', 'C')):
                new = parts[i].decode('utf-8', 'surrogateescape'); i += 1
            records.append((status, old, new))
        # Every reviewable file first gets its candidate units (best context first); batches are
        # packed only after all are known, so later files are not dropped by diff order (#314, f2e#1087).
        pending = []

        for status, old, path in records:
            item = {'path': path, 'old_path': old if old != path else None, 'git_status': status,
                    'status': 'unreviewed', 'file_complete': False}
            manifest['files'].append(item)
            if any(any(c in name for c in '\t\r\n\\') or any(0xD800 <= ord(c) <= 0xDFFF for c in name)
                   for name in (old, path)):
                item['reason'] = 'unsupported-git-filename'
                continue
            reason = exclusion(path) or exclusion(old)
            if reason:
                item.update(status='excluded', reason=reason)
                continue
            try:
                blobs = []
                sources = []
                if status.startswith('D') or status.startswith(('R', 'C', 'M', 'T')):
                    sources.append(('BEFORE', merge, old))
                if not status.startswith('D'):
                    sources.append(('HEAD', head_sha, path))
                oversized = False
                # A small head can replace a giant base blob. Bound BOTH sides before
                # asking Git to allocate the complete diff, even if only head context
                # will be supplied for an ordinary modification.
                preflight = list(sources)
                for _, rev, source in preflight:
                    if int(git(repo, 'cat-file', '-s', f'{rev}:{source}')) > max_source_bytes:
                        oversized = True
                        item['reason'] = 'source-exceeds-batch-budget'
                        break
                if oversized:
                    continue
                for label, rev, source in sources:
                    object_name = f'{rev}:{source}'
                    size = int(git(repo, 'cat-file', '-s', object_name))
                    if size > max_source_bytes:
                        oversized = True
                        break
                    kind = git(repo, 'cat-file', '-t', object_name).decode().strip()
                    if kind != 'blob':
                        item['reason'] = 'non-blob-object'; oversized = True; break
                    data = git(repo, 'cat-file', 'blob', object_name)
                    if b'\0' in data:
                        item['reason'] = 'binary-file'; oversized = True; break
                    try:
                        content = numbered(data)
                    except UnicodeDecodeError:
                        item['reason'] = 'non-utf8-file'; oversized = True; break
                    blobs.append({'revision': rev, 'path': source, 'sha256': hashlib.sha256(data).hexdigest(),
                                  'bytes': size, 'lines': len(source_lines(data))})
                    # JSON quoting prevents filenames from impersonating context delimiters.
                    label_text = f'\nCOMPLETE {label} FILE {json.dumps(source, ensure_ascii=True)}\n'
                    blobs[-1]['label'] = label
                    blobs[-1]['header'] = label_text
                    blobs[-1]['content'] = content
                    blobs[-1]['data'] = data
                if oversized:
                    item.setdefault('reason', 'source-exceeds-batch-budget')
                    continue
                # --literal-pathspecs prevents glob/metacharacters in Git paths selecting extra files.
                # Pin diff.suppressBlankEmpty so blank context lines keep their leading space.
                diff = git(repo, '-c', 'diff.suppressBlankEmpty=false', '--literal-pathspecs', 'diff', '--no-ext-diff', '--no-textconv',
                           '--find-renames', merge, head_sha, '--', old, path)
                try:
                    diff_text = diff.decode('utf-8')
                except UnicodeDecodeError:
                    item['reason'] = 'non-utf8-diff'; continue
                item['fingerprint'] = diff_fingerprint(diff_text)
                previous = baseline.get(path)
                if previous and previous['fp'] == item['fingerprint']:
                    run = previous_state['runs'][previous['run']]
                    item.update(status='carried', file_complete=True, context_level=previous['level'],
                                carried_from={'head': run['head'], 'url': run['url']})
                    manifest['incremental']['carried'] += 1
                    continue
                def build_unit(unit_blobs, note=''):
                    prefix = (f'\nFILE {json.dumps(path, ensure_ascii=True)} STATUS {status}\n'
                              + note + 'COMPLETE DIFF\n').encode()
                    unit = bytearray(prefix)
                    diff_part = {'start_byte': len(unit), 'end_byte': len(unit) + len(diff)}
                    unit.extend(diff)
                    sections = []
                    for blob in unit_blobs:
                        unit.extend(blob['header'].encode())
                        start_byte = len(unit)
                        unit.extend(blob['content'].encode())
                        section = {'start_byte': start_byte, 'end_byte': len(unit),
                                   'label': blob['label'], 'revision': blob['revision'],
                                   'path': blob['path'], 'line_count': blob['lines'],
                                   'sha256': blob['sha256']}
                        if blob.get('sparse'):
                            section.update(sparse=True, source_line_count=blob['source_line_count'])
                        sections.append(section)
                    return unit, diff_part, sections

                # Tiers (#314): a small edit to a large file must not be skipped just because
                # BEFORE + HEAD + diff exceed one batch. BEFORE hunks keep removed code citable
                # with its real line numbers; head-only is the last resort and says so.
                tiers = [('complete', blobs, '')]
                before = next((b for b in blobs if b['label'] == 'BEFORE'), None)
                head_blob = next((b for b in blobs if b['label'] == 'HEAD'), None)
                if before and head_blob:
                    hunk = before_hunk_lines(diff_text)
                    if hunk:
                        tiers.append(('before-hunks', [head_blob, {
                            'label': 'BEFORE', 'revision': before['revision'], 'path': before['path'],
                            'sha256': before['sha256'], 'bytes': before['bytes'], 'lines': len(hunk),
                            'sparse': True, 'source_line_count': before['lines'],
                            'header': (f'\nBEFORE HUNKS {json.dumps(before["path"], ensure_ascii=True)} '
                                       '(only lines shown in the diff, numbered with their original BEFORE line numbers)\n'),
                            'content': ''.join(f'{n}: {text}\n' for n, text in hunk)}],
                            'BEFORE SOURCE PARTIAL: only diff hunks of BEFORE are supplied below\n'))
                    tiers.append(('head-only', [head_blob],
                                  'BEFORE SOURCE OMITTED: budget; cite HEAD lines only, removed lines appear only in the diff\n'))
                # A source over one batch on its own (e.g. a 450 KB locale file) is reviewed from the
                # diff plus surrounding lines of each side; only a diff that cannot fit stays unreviewed.
                for radius in HUNK_RADII:
                    windows = []
                    for blob in blobs:
                        window = hunk_window_lines(diff_text, blob['label'], blob['data'], radius)
                        if window:
                            windows.append({
                                'label': blob['label'], 'revision': blob['revision'], 'path': blob['path'],
                                'sha256': blob['sha256'], 'bytes': blob['bytes'], 'lines': len(window),
                                'sparse': True, 'source_line_count': blob['lines'],
                                'header': (f'\n{blob["label"]} HUNKS {json.dumps(blob["path"], ensure_ascii=True)} '
                                           f'(only diff hunks plus {radius} surrounding lines, numbered with their '
                                           f'original {blob["label"]} line numbers)\n'),
                                'content': ''.join(f'{n}: {text}\n' for n, text in window)})
                    if windows:
                        tiers.append(('hunks', windows,
                                      'SOURCE PARTIAL: file exceeds budget; only listed lines around the diff are supplied\n'))
                options = []
                for level, unit_blobs, note in tiers:
                    payload, diff_section, source_sections = build_unit(unit_blobs, note)
                    if len(payload) <= max_batch_bytes:
                        options.append({'level': level, 'payload': payload, 'diff_section': diff_section,
                                        'source_sections': source_sections, 'blobs': unit_blobs})
                if not options:
                    describe(item, level, payload, unit_blobs)
                    item['reason'] = ('diff-exceeds-batch-budget' if level == 'hunks'
                                      else 'complete-file-unit-exceeds-batch-budget'); continue
                pending.append({'item': item, 'path': path, 'options': options, 'choice': 0})
            except (subprocess.CalledProcessError, ValueError, OSError) as exc:
                item.update(status='unreviewed', file_complete=False,
                            reason='file-read-error', diagnostic=str(exc))

        bins, overflow = pack(pending, max_batch_bytes, max_batches, max_total_bytes)
        # Out of batches: trade complete BEFORE text for BEFORE hunks (HEAD stays whole, removed
        # lines stay citable), biggest saving first, before leaving any file unreviewed.
        while overflow:
            savings = [(len(e['options'][e['choice']]['payload']) - len(e['options'][cheaper]['payload']),
                        -index, index, cheaper)
                       for index, e in enumerate(pending)
                       for cheaper in [budget_downgrade(e)] if cheaper is not None]
            if not savings:
                break
            _, _, index, cheaper = max(savings)
            pending[index]['choice'] = cheaper
            bins, overflow = pack(pending, max_batch_bytes, max_batches, max_total_bytes)

        for index, reason in overflow.items():
            entry = pending[index]
            option = entry['options'][entry['choice']]
            describe(entry['item'], option['level'], option['payload'], option['blobs'])
            entry['item']['reason'] = reason
        for members in bins:
            ident = f'batch-{len(manifest["batches"]) + 1:03d}'
            current, paths, units = bytearray(), [], []
            for index in sorted(members):
                entry = pending[index]
                option = entry['options'][entry['choice']]
                item, payload = entry['item'], option['payload']
                describe(item, option['level'], payload, option['blobs'])
                if entry['choice'] != 0:
                    item['budget_downgraded_from'] = entry['options'][0]['level']
                item.update(status='planned', file_complete=True, batch_id=ident)
                units.append({'path': entry['path'], 'start_byte': len(current),
                              'end_byte': len(current) + len(payload),
                              'line_count': max((b['lines'] for b in option['blobs']), default=0),
                              'source_sections': [{**section,
                                  'start_byte': section['start_byte'] + len(current),
                                  'end_byte': section['end_byte'] + len(current)}
                                  for section in option['source_sections']],
                              'diff_section': {'start_byte': option['diff_section']['start_byte'] + len(current),
                                               'end_byte': option['diff_section']['end_byte'] + len(current)}})
                current.extend(payload); paths.append(entry['path'])
            filename = ident + '.txt'
            (out / filename).write_bytes(current)
            manifest['batches'].append({'id': ident, 'payload': filename, 'bytes': len(current),
                                       'sha256': hashlib.sha256(current).hexdigest(),
                                       'paths': paths, 'units': units})
    except (subprocess.CalledProcessError, ValueError, OSError) as exc:
        manifest['errors'].append(str(exc))
    carried = {f['path'] for f in manifest['files'] if f['status'] == 'carried'}
    manifest['carried_findings'] = [f for f in (previous_state or {}).get('findings', []) if f.get('path') in carried]
    manifest['coverage_complete'] = not manifest['errors'] and all(
        f['status'] in ('planned', 'carried') for f in manifest['files'])
    (out / 'manifest.json').write_text(json.dumps(manifest, indent=2, ensure_ascii=True) + '\n')
    return manifest


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ('repo', 'base', 'head', 'out'):
        parser.add_argument('--' + name, required=True)
    parser.add_argument('--max-batch-bytes', type=int, default=40000)
    parser.add_argument('--max-batches', type=int, default=24)
    parser.add_argument('--max-total-bytes', type=int, default=800000)
    # Bot comment holding the last review's baseline (#368); omitted or unreadable means a full review.
    parser.add_argument('--previous-comment')
    args = parser.parse_args()
    previous, invalid = None, False
    if args.previous_comment:
        try:
            text = Path(args.previous_comment).read_text(encoding='utf-8')
        except (OSError, UnicodeError):
            text = ''
        previous = parse_previous_state(text)
        invalid = previous is None and bool(text.strip())
    result = plan(args.repo, args.base, args.head, args.out, args.max_batch_bytes,
                  args.max_batches, args.max_total_bytes,
                  previous_state=previous, previous_state_invalid=invalid)
    return 2 if result['errors'] else 0


if __name__ == '__main__':
    raise SystemExit(main())
