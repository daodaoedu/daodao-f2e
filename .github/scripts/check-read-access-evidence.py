#!/usr/bin/env python3
"""Check declared evidence structure, never execution truth or task applicability."""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

ROLES = ('本人', '同範圍成員', '範圍外使用者', '已退出或移除', '未登入')
FIELDS = ('入口與服務', '固定資料', '資料庫驗證', '快取撤權', '期限邊界')
HEADER = ('角色', '預期', '實際', '資料斷言', '結果', '證據')
PLACEHOLDER = re.compile(r'<[^>]*(?:[^\x00-\x7f]|file:line)[^>]*>|\b(?:TODO|TBD)\b|待補|未填|待驗|尚未執行', re.I)
STATUS = re.compile(r'(?<!\d)[1-5]\d\d(?!\d)')


def visible_lines(text: str) -> list[str]:
    """Remove comments and fenced examples; neither counts as executed evidence."""
    text = re.sub(r'<!--[\s\S]*?-->', '', text)
    result: list[str] = []
    fence: str | None = None
    for line in text.splitlines():
        match = re.match(r'^\s*(`{3,}|~{3,})', line)
        if match:
            token = match.group(1)
            if fence is None:
                fence = token
            elif token[0] == fence[0] and len(token) >= len(fence):
                fence = None
            continue
        if fence is None:
            result.append(line.strip())
    return result


def section(lines: list[str], title: str, level: int) -> list[str]:
    """Return exactly one named heading's body, bounded by peer/ancestor headings."""
    positions = [i for i, line in enumerate(lines) if line == '#' * level + ' ' + title]
    if len(positions) != 1:
        return []
    start = positions[0] + 1
    end = next((i for i in range(start, len(lines)) if re.match(r'^#{1,' + str(level) + r'}\s', lines[i])), len(lines))
    return lines[start:end]


def concrete(text: str) -> bool:
    """Require meaningful filled content, not a placeholder or a check mark alone."""
    stripped = text.strip().strip('`').strip()
    return len(stripped) >= 4 and not PLACEHOLDER.search(stripped) and stripped not in ('不適用', 'none', '—', '-', '✅', 'pass')


def na_reason(text: str) -> str | None:
    match = re.match(r'^不適用[：:]\s*(.*)$', text)
    return match.group(1) if match else None


def evidence_reference(text: str) -> bool:
    """Recognize a filled source reference, without fetching or trusting it."""
    return concrete(text) and bool(re.search(r'https?://\S+|(?:[\w.-]+/)+[^\s;；]+|[\w.-]+\.(?:json|log|txt|png|html|xml)\b', text))


def observation_text(text: str) -> str:
    value = re.sub(r'[✅✔☑\ufe0f`]', '', text).strip()
    value = re.sub(r'\[[^\]]*\]\([^)]*\)|https?://\S+|(?:[A-Za-z_][\w.-]*/)+[^\s;；,，]+', '', value)
    return value.strip()


def journey_observations(lines: list[str]) -> list[str]:
    """Reject empty success labels, without trying to infer whether prose is true."""
    problems: list[str] = []
    header: list[str] | None = None
    for line in lines:
        if not line.startswith('|'):
            header = None
            continue
        cells = [cell.strip() for cell in line.strip('|').split('|')]
        if cells[:3] == ['ID', '旅程', '類型']:
            header = cells
            continue
        if cells and (cells[0] == '角色' or cells[0] in ROLES):
            continue
        if len(cells) < 4 or not re.search(r'正常|錯誤路徑', cells[2]):
            continue
        # Legacy rows may append evidence after the actual value. Prefer a marked
        # observation, never a reference-only cell; retain the old compact shape.
        fallback_index = 5 if len(cells) >= 6 else len(cells) - 1
        if not header:
            fallback_index = next((index for index in range(fallback_index, len(cells))
                                   if any(mark in cells[index] for mark in ('✅', '⬜', '❌'))
                                   and observation_text(cells[index]).strip(' ;；,，')), fallback_index)
        actual_index = next((header.index(name) for name in ('實際', '實際結果') if header and name in header), fallback_index)
        actual = cells[actual_index] if actual_index < len(cells) else ''
        # The existing gates report missing or failed execution before checking a claimed success.
        if any(mark in actual for mark in ('⬜', '❌')) or not any('✅' in cell for cell in cells):
            continue
        value = observation_text(actual)
        value = re.sub(r'\b(?:all\s+)?\d+\s+checks?\s+pass(?:ed)?\b', '', value, flags=re.I)
        # A test tally such as 100/100 PASS is not an HTTP status observation.
        status_value = re.sub(r'\b\d+\s*/\s*\d+\s*(?=pass(?:ed)?\b)', '', value, flags=re.I)
        residual = re.sub(r'\b(?:pass(?:ed)?|success(?:ful)?|verified|done|worker|background|queue|http|smtp|ui|api|all|checks?)\b', '', value, flags=re.I)
        residual = re.sub(r'未發請求|符合預期|如預期|驗證通過|已驗證|通過|成功|正常|完成|前端驗證|背景工作|全部|驗證', '', residual)
        residual = re.sub(r'\b\d+\s*/\s*\d+\b', '', residual)
        residual = re.sub(r'[\W_]+', '', residual)
        expected = ''
        if header:
            expected_index = next((header.index(name) for name in ('預期結果', '預期') if name in header), None)
            if expected_index is not None and expected_index < len(cells):
                expected = observation_text(cells[expected_index])
        observed_value = bool(STATUS.search(status_value) or re.search(r'→|->|「[^」]+」|message[-_ ]?id\s*[:=]|\d+\s*(?:封|筆|rows|bytes)\b', value, re.I))
        if (not residual and not STATUS.search(status_value)) or (expected and value == expected and not observed_value):
            problems.append(f'核心旅程列「{cells[0]}」實際欄缺具體觀察結果；不能只填 PASS、未發請求或重述預期。請填實際 HTTP／UI 訊息／job 狀態或 SMTP 收件結果並附證據；格式通過不代表實跑。')
    return problems


def validate(text: str, scope: str) -> list[str]:
    lines = section(visible_lines(text), '驗證' if scope == 'task' else '驗證證據', 2)
    observations = journey_observations(lines)
    declarations = [re.sub(r'^讀取權限驗證[：:]\s*', '', line) for line in lines if re.match(r'^讀取權限驗證[：:]', line)]
    if len(declarations) != 1:
        return observations + ['讀取權限驗證必須在驗證區塊內明確宣告一次「適用」或「不適用：具體原因」']
    declaration = declarations[0]
    reason = na_reason(declaration)
    if reason is not None:
        return observations if concrete(reason) else observations + ['讀取權限驗證不適用缺具體原因']
    if declaration != '適用':
        return observations + ['讀取權限驗證宣告只能是「適用」或「不適用：具體原因」']
    problems = observations
    if any(re.match(r'^核心旅程不適用[：:]', line) for line in lines):
        problems.append('讀取權限驗證適用時不得用「核心旅程不適用」豁免；需正常及拒絕存取旅程')
    journey_lines = section(lines, '核心旅程矩陣', 3)
    journeys: dict[str, set[str]] = {}
    for line in journey_lines:
        if not line.startswith('|'):
            continue
        cells = [cell.strip() for cell in line.strip('|').split('|')]
        if len(cells) >= 3 and cells[2] in ('正常', '錯誤路徑') and cells[1] and not PLACEHOLDER.search(cells[1]):
            journeys.setdefault(cells[1], set()).add(cells[2])
    if not journeys or any(types != {'正常', '錯誤路徑'} for types in journeys.values()):
        problems.append('讀取權限適用時核心旅程矩陣須每條都有正常與拒絕存取／錯誤路徑列')
    read_section = section(lines, '讀取權限驗證', 3)
    if not read_section:
        return problems + ['缺「### 讀取權限驗證」區塊']
    fields: dict[str, str] = {}
    for field in FIELDS:
        values = [m.group(1) for line in read_section if (m := re.match(r'^-\s*' + field + r'[：:]\s*(.*)$', line))]
        if len(values) != 1:
            problems.append(f'讀取權限驗證欄位「{field}」須填一次')
        else:
            fields[field] = values[0]
    for name in ('入口與服務', '固定資料'):
        if name in fields and not concrete(fields[name]):
            problems.append(f'「{name}」缺已填的路徑／服務或固定 fixture 資料')
    for name in ('資料庫驗證', '快取撤權', '期限邊界'):
        if name not in fields:
            continue
        value = fields[name]
        reason = na_reason(value)
        if reason is not None:
            if not concrete(reason):
                problems.append(f'「{name}」不適用缺具體原因')
            continue
        evidence = re.search(r'證據[：:]\s*(.+)', value)
        if not value.startswith('✅') or not concrete(value) or not evidence or not evidence_reference(evidence.group(1)):
            problems.append(f'「{name}」需 ✅、具體執行結果與證據，或不適用理由')
        if name == '資料庫驗證':
            if not re.search(r'PostgreSQL|MySQL|MariaDB|SQLite|SQL Server', value, re.I) or not re.search(r'指令[：:]\s*\S+', value) or not re.search(r'結果[：:]\s*\S+', value) or re.search(r'^✅\s*mock(?:ed)?\s+(?:PostgreSQL|MySQL|MariaDB|SQLite|SQL Server)\b', value, re.I):
                problems.append('資料庫驗證須列真實資料庫引擎、執行指令、結果與證據；mock／SQL 字串檢查不可冒充 DB 驗證')
    table = [tuple(cell.strip() for cell in line.strip('|').split('|')) for line in read_section if line.startswith('|')]
    if HEADER not in table:
        return problems + ['讀取權限角色表欄位必須為「角色 | 預期 | 實際 | 資料斷言 | 結果 | 證據」']
    for role in ROLES:
        rows = [row for row in table if row and row[0] == role]
        if len(rows) != 1 or len(rows[0]) != 6:
            problems.append(f'讀取權限角色「{role}」須有一列完整六欄')
            continue
        _, expected, actual, assertion, result, evidence = rows[0]
        reason = na_reason(actual)
        if reason is not None:
            if not concrete(reason):
                problems.append(f'角色「{role}」不適用缺具體原因')
            if result != '不適用':
                problems.append(f'角色「{role}」未實測時結果必須填「不適用」，不可標 ✅')
            continue
        if not result.startswith('✅') or PLACEHOLDER.search(result) or any(mark in result for mark in ('❌', '⬜')):
            problems.append(f'角色「{role}」結果欄缺 ✅ 或尚未通過')
        if not STATUS.search(actual) or PLACEHOLDER.search(actual) or any(mark in actual for mark in ('❌', '⬜')):
            problems.append(f'角色「{role}」實際欄須記錄 HTTP 狀態碼')
        if not expected or expected in ('—', '-') or PLACEHOLDER.search(expected) or not concrete(assertion):
            problems.append(f'角色「{role}」缺預期或具體資料斷言（含不可出現的私人資料）')
        if (re.search(r'(?<!\d)[45]\d\d(?!\d)', actual) or re.search(r'拒絕|不得|不可|僅公開|不含|不應', expected)) and not re.search(r'不含|未回傳|不可見|不存在|沒有|僅公開|absent|not present|no private', assertion, re.I):
            problems.append(f'角色「{role}」拒絕存取須斷言回應不含私人資料')
        if not evidence_reference(evidence):
            problems.append(f'角色「{role}」缺已填的證據來源')
    return problems


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--scope', choices=('task', 'pr'), required=True)
    parser.add_argument('--file', type=Path)
    parser.add_argument('--emit-section', action='store_true', help='Emit only visible lines in the selected evidence section')
    args = parser.parse_args()
    try:
        text = args.file.read_text() if args.file else sys.stdin.read()
    except OSError as exc:
        print(f'讀取權限證據無法讀取：{exc}', file=sys.stderr)
        return 1
    if args.emit_section:
        print('\n'.join(section(visible_lines(text), '驗證' if args.scope == 'task' else '驗證證據', 2)))
        return 0
    problems = validate(text, args.scope)
    for problem in problems:
        print(problem)
    return 1 if problems else 0


if __name__ == '__main__':
    raise SystemExit(main())
