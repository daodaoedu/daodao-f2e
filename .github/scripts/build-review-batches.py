#!/usr/bin/env python3
"""Plan bounded, whole-file review inputs; omitted coverage is explicit."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess


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


def plan(repo, base, head, out, max_batch_bytes=40000, max_batches=12, max_total_bytes=400000):
    out = Path(out)
    out.mkdir(parents=True, exist_ok=True)
    manifest = {'schema_version': 1, 'base': None, 'head': None, 'merge_base': None,
                'files': [], 'batches': [], 'errors': [],
                'budgets': {'max_batch_bytes': max_batch_bytes, 'max_batches': max_batches,
                            'max_total_bytes': max_total_bytes}}
    try:
        if min(max_batch_bytes, max_batches, max_total_bytes) <= 0:
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
        total = 0
        current = bytearray()
        current_paths = []
        current_units = []

        def flush():
            nonlocal current, current_paths, current_units, total
            if not current:
                return
            ident = f'batch-{len(manifest["batches"]) + 1:03d}'
            filename = ident + '.txt'
            (out / filename).write_bytes(current)
            manifest['batches'].append({'id': ident, 'payload': filename, 'bytes': len(current),
                                       'sha256': hashlib.sha256(current).hexdigest(),
                                       'paths': current_paths[:], 'units': current_units[:]})
            total += len(current)
            current = bytearray(); current_paths = []; current_units = []

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
                    if int(git(repo, 'cat-file', '-s', f'{rev}:{source}')) > max_batch_bytes:
                        oversized = True
                        item['reason'] = 'source-exceeds-batch-budget'
                        break
                if oversized:
                    continue
                for label, rev, source in sources:
                    object_name = f'{rev}:{source}'
                    size = int(git(repo, 'cat-file', '-s', object_name))
                    if size > max_batch_bytes:
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
                if oversized:
                    item.setdefault('reason', 'source-exceeds-batch-budget')
                    continue
                # --literal-pathspecs prevents glob/metacharacters in Git paths selecting extra files.
                diff = git(repo, '--literal-pathspecs', 'diff', '--no-ext-diff', '--no-textconv',
                           '--find-renames', merge, head_sha, '--', old, path)
                try:
                    diff_text = diff.decode('utf-8')
                except UnicodeDecodeError:
                    item['reason'] = 'non-utf8-diff'; continue
                prefix = (f'\nFILE {json.dumps(path, ensure_ascii=True)} STATUS {status}\n'
                          + 'COMPLETE DIFF\n').encode()
                payload = bytearray(prefix)
                diff_section = {'start_byte': len(payload), 'end_byte': len(payload) + len(diff)}
                payload.extend(diff)
                source_sections = []
                for blob in blobs:
                    payload.extend(blob['header'].encode())
                    start_byte = len(payload)
                    payload.extend(blob['content'].encode())
                    source_sections.append({'start_byte': start_byte, 'end_byte': len(payload),
                                            'label': blob['label'], 'revision': blob['revision'],
                                            'path': blob['path'], 'line_count': blob['lines'],
                                            'sha256': blob['sha256']})
                item['required_bytes'] = len(payload)
                item['sources'] = [{k: v for k, v in b.items() if k not in ('header', 'content')} for b in blobs]
                if len(payload) > max_batch_bytes:
                    item['reason'] = 'complete-file-unit-exceeds-batch-budget'; continue
                if total + len(current) + len(payload) > max_total_bytes:
                    item['reason'] = 'total-budget-exhausted'; continue
                if current and len(current) + len(payload) > max_batch_bytes:
                    flush()
                if len(manifest['batches']) >= max_batches:
                    item['reason'] = 'batch-count-budget-exhausted'; continue
                batch_id = f'batch-{len(manifest["batches"]) + 1:03d}'
                item.update(status='planned', file_complete=True, batch_id=batch_id)
                current_units.append({'path': path, 'start_byte': len(current),
                                      'end_byte': len(current) + len(payload),
                                      'line_count': max((b['lines'] for b in blobs), default=0),
                                      'source_sections': [{**section,
                                          'start_byte': section['start_byte'] + len(current),
                                          'end_byte': section['end_byte'] + len(current)}
                                          for section in source_sections],
                                      'diff_section': {'start_byte': diff_section['start_byte'] + len(current),
                                                       'end_byte': diff_section['end_byte'] + len(current)}})
                current.extend(payload); current_paths.append(path)
            except (subprocess.CalledProcessError, ValueError, OSError) as exc:
                item.update(status='unreviewed', file_complete=False,
                            reason='file-read-error', diagnostic=str(exc))
        flush()
    except (subprocess.CalledProcessError, ValueError, OSError) as exc:
        manifest['errors'].append(str(exc))
    manifest['coverage_complete'] = not manifest['errors'] and all(
        f['status'] == 'planned' for f in manifest['files'])
    (out / 'manifest.json').write_text(json.dumps(manifest, indent=2, ensure_ascii=True) + '\n')
    return manifest


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ('repo', 'base', 'head', 'out'):
        parser.add_argument('--' + name, required=True)
    parser.add_argument('--max-batch-bytes', type=int, default=40000)
    parser.add_argument('--max-batches', type=int, default=12)
    parser.add_argument('--max-total-bytes', type=int, default=400000)
    args = parser.parse_args()
    result = plan(args.repo, args.base, args.head, args.out, args.max_batch_bytes,
                  args.max_batches, args.max_total_bytes)
    return 2 if result['errors'] else 0


if __name__ == '__main__':
    raise SystemExit(main())
