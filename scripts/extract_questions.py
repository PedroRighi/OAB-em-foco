from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MATERIALS = ROOT / 'src/content/materials'
SUBJECTS = ROOT / 'src/data/subjects.ts'
OUTPUT = ROOT / 'src/data/questions.json'

# Source material files are named consistently with the approved 20-subject catalog.
SUBJECT_NAMES = {
    '01-constitucional': ('constitucional', 'Direito Constitucional'),
    '02-direitos-humanos': ('direitos-humanos', 'Direitos Humanos'),
    '03-internacional': ('internacional', 'Direito Internacional'),
    '04-tributario': ('tributario', 'Direito Tributário'),
    '05-administrativo': ('administrativo', 'Direito Administrativo'),
    '06-ambiental': ('ambiental', 'Direito Ambiental'),
    '07-civil': ('civil', 'Direito Civil'),
    '08-eca': ('eca', 'Estatuto da Criança e do Adolescente'),
    '09-consumidor': ('consumidor', 'Direito do Consumidor'),
    '10-empresarial': ('empresarial', 'Direito Empresarial'),
    '11-processo-civil': ('processo-civil', 'Direito Processual Civil'),
    '12-penal': ('penal', 'Direito Penal'),
    '13-processo-penal': ('processo-penal', 'Direito Processual Penal'),
    '14-previdenciario': ('previdenciario', 'Direito Previdenciário'),
    '15-eleitoral': ('eleitoral', 'Direito Eleitoral'),
    '16-financeiro': ('financeiro', 'Direito Financeiro'),
    '17-trabalho': ('trabalho', 'Direito do Trabalho'),
    '18-processo-trabalho': ('processo-trabalho', 'Direito Processual do Trabalho'),
    '19-filosofia': ('filosofia', 'Filosofia do Direito'),
}
SECTION = re.compile(r'^##\s+(?:(?:\d+)\.\s+)?Questões?\b[^\n]*$', re.I | re.M)
KEY_SECTION = re.compile(r'^#{1,6}\s+(?:(?:\d+)\.\s*)?(?:Gabarito|Respostas)\b[^\n]*$', re.I | re.M)
STARTS = [
    re.compile(r'^###\s*Quest[aã]o\s+(\d+)\s*$', re.I),
    re.compile(r'^\*\*(\d+)\.\*\*\s*(.*)$'),
    re.compile(r'^\*\*(\d+)\.\s+(.+?)\*\*\s*$'),
    re.compile(r'^###\s*(\d+)\.\s*(.+)$'),
]
OPTION = re.compile(r'^\s*([ABCD])[).]\s*(.*?)\s*$')
KEY_INLINE = re.compile(r'^\*\*Gabarito:\s*([ABCD])\.\*\*\s*(.*)$', re.I)
KEY_NUMBERED = re.compile(r'^\*\*(\d+)\.\s*([ABCD])\.\*\*\s*(.*)$')


def plain(value: str) -> str:
    value = re.sub(r'\s*\\\s*$', '', value)
    value = re.sub(r'\*\*([^*]+)\*\*', r'\1', value)
    value = re.sub(r'\*([^*]+)\*', r'\1', value)
    value = re.sub(r'\s+', ' ', value)
    return value.strip()


def block_starts(lines: list[str]) -> list[tuple[int, int, str, bool]]:
    found: list[tuple[int, int, str, bool]] = []
    for index, line in enumerate(lines):
        for pattern_index, pattern in enumerate(STARTS):
            match = pattern.match(line)
            if match:
                number = int(match.group(1))
                inline_prompt = match.group(2) if pattern_index in (1, 2, 3) else ''
                found.append((index, number, inline_prompt, pattern_index == 0))
                break
    return found


def parse_material(path: Path) -> list[dict[str, object]]:
    key = path.stem
    if key not in SUBJECT_NAMES:
        return []
    subject_id, subject_title = SUBJECT_NAMES[key]
    text = path.read_text(encoding='utf-8')
    section_match = SECTION.search(text)
    if not section_match:
        raise RuntimeError(f'{path.name}: question section not found')
    tail = text[section_match.end():]
    next_section = re.search(r'^##\s+\d+\.\s+(?!Gabarito|Respostas)[^\n]*$', tail, re.M | re.I)
    section = tail[:next_section.start()] if next_section else tail
    key_heading = KEY_SECTION.search(section)
    question_text = section[:key_heading.start()] if key_heading else section
    lines = question_text.splitlines()
    section_lines = section.splitlines()
    starts = block_starts(lines)
    if len(starts) != 6:
        raise RuntimeError(f'{path.name}: expected 6 question blocks, found {len(starts)}')
    section_keys: dict[int, tuple[str, str]] = {}
    inline_keys: list[tuple[str, str]] = []
    for line in section_lines:
        inline_key = KEY_INLINE.match(line.strip())
        if inline_key:
            inline_keys.append((inline_key.group(1).upper(), plain(inline_key.group(2))))
        numbered_key = KEY_NUMBERED.match(line.strip())
        if numbered_key:
            section_keys[int(numbered_key.group(1))] = (numbered_key.group(2), plain(numbered_key.group(3)))

    output: list[dict[str, object]] = []
    for position, (start, number, inline_prompt, is_heading) in enumerate(starts):
        end = starts[position + 1][0] if position + 1 < len(starts) else len(lines)
        block = lines[start + 1:end] if is_heading else lines[start + 1:end]
        if inline_prompt:
            block = [inline_prompt, *block]
        prompt_lines: list[str] = []
        choices: dict[str, str] = {}
        answer: str | None = None
        explanation: str | None = None
        after_key = False
        for line in block:
            inline_key = KEY_INLINE.match(line.strip())
            numbered_key = KEY_NUMBERED.match(line.strip())
            if inline_key or numbered_key:
                match = inline_key or numbered_key
                assert match is not None
                if numbered_key and int(numbered_key.group(1)) != number:
                    continue
                answer = match.group(1) if inline_key else match.group(2)
                explanation = plain(match.group(2 if inline_key else 3))
                after_key = True
                continue
            choice = OPTION.match(line)
            if choice:
                choices[choice.group(1)] = plain(choice.group(2))
                after_key = False
                continue
            if after_key:
                if re.match(r'^#{1,6}\s+(?:Checklist|Referências|Referencias|Bibliografia|Fontes|Revisão)\b', line.strip(), re.I):
                    break
                if line.strip() and explanation is not None:
                    explanation = plain(explanation + ' ' + line.strip())
                continue
            if choices:
                continue
            if is_heading and not line.strip():
                continue
            if line.strip():
                prompt_lines.append(line.strip())

        if answer is None and number in section_keys:
            answer, explanation = section_keys[number]
        if answer is None and number <= len(inline_keys):
            answer, explanation = inline_keys[number - 1]
        prompt = plain(' '.join(prompt_lines))
        if set(choices) != set('ABCD'):
            raise RuntimeError(f'{path.name} #{number}: expected A–D, found {sorted(choices)}')
        if answer not in choices or not explanation:
            raise RuntimeError(f'{path.name} #{number}: missing valid key or comment')
        if not prompt:
            raise RuntimeError(f'{path.name} #{number}: empty prompt')
        output.append({
            'id': f'{subject_id}-{number:02d}',
            'subjectId': subject_id,
            'subjectTitle': subject_title,
            'number': number,
            'prompt': prompt,
            'choices': choices,
            'answer': answer,
            'explanation': explanation,
            'source': path.name,
        })
    return output


def main() -> None:
    if not SUBJECTS.exists():
        raise RuntimeError('Subject catalog not found')
    items: list[dict[str, object]] = []
    for path in sorted(MATERIALS.glob('*.md')):
        items.extend(parse_material(path))
    ethics_path = ROOT / 'src/data/manualEthicsQuestions.json'
    ethics = json.loads(ethics_path.read_text(encoding='utf-8'))
    if len(ethics) != 10:
        raise RuntimeError(f'Expected 10 manually adapted Ethics questions; found {len(ethics)}')
    for item in ethics:
        if item['subjectId'] != 'etica' or set(item['choices']) != set('ABCD') or item['answer'] not in item['choices']:
            raise RuntimeError(f'Invalid Ethics item: {item.get("id")}')
    items = ethics + items
    ids = [item['id'] for item in items]
    if len(ids) != len(set(ids)):
        raise RuntimeError('Duplicate question IDs')
    if len(items) != 124:
        raise RuntimeError(f'Expected 124 total questions, found {len(items)}')
    OUTPUT.write_text(json.dumps(items, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Wrote {len(items)} questions: 114 extracted A–D + {len(ethics)} carefully adapted from open Ethics prompts.')


if __name__ == '__main__':
    main()
