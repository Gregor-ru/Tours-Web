#!/usr/bin/env python3
"""Переносит тексты из Tour_work/legal/drafts/*.md в src/data/legal.ts.

Источник правды — черновики в legal/drafts/. На сайт идёт тело файла после первой строки «---».
Запуск из папки my-tours-old:  python3 scripts/sync-legal.py
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DRAFTS = ROOT.parent / 'legal' / 'drafts'

DOCS = [
    ('CONSENT', 'Согласие на обработку персональных данных', '2026-11-23_pd-consent.md'),
    ('POLICY', 'Политика обработки персональных данных', '2026-11-23_pd-policy.md'),
    ('CONDITIONS', 'Условия участия', '2026-11-23_gudauri-conditions.md'),
    ('GUBAKHA_CONDITIONS', 'Условия участия', '2026-11-24_gubakha-conditions.md'),
]


def body(name: str) -> str:
    text = (DRAFTS / name).read_text(encoding='utf-8')
    part = text.split('\n---\n', 1)[1].strip()
    return part.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')


out = [
    '// СГЕНЕРИРОВАНО scripts/sync-legal.py — не править руками.',
    '// Источник — Tour_work/legal/drafts/. Черновики, проверить у юриста; заглушки ❓ заполняет владелец.',
    '',
]
for key, title, fname in DOCS:
    out.append(f"// {fname}")
    out.append(f"export const {key}_TITLE = '{title}';")
    out.append(f"export const {key}_MD = `{body(fname)}`;")
    out.append('')

(ROOT / 'src' / 'data' / 'legal.ts').write_text('\n'.join(out), encoding='utf-8')
print('src/data/legal.ts обновлён')
