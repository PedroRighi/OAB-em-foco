from __future__ import annotations

import json
import re
from pathlib import Path

from docx import Document
from docx.oxml.ns import qn
from docx.table import Table
from docx.text.paragraph import Paragraph

ROOT = Path(__file__).resolve().parents[1]
SOURCE_MD = Path('/home/ubuntu/oab_ethics_output/materias')
SOURCE_DOCS = Path('/home/ubuntu/oab_ethics_output/Apostilas_OAB_1fase_48')
SCHEDULE_DOCX = Path('/home/ubuntu/oab_ethics_output/Cronograma_56_dias_OAB_48_CEISC.docx')
TARGET_MD = ROOT / 'src/content/materials'
TARGET_DATA = ROOT / 'src/data'

EXAM_PDF = 'https://oab.fgv.br/arq/651/579325_48%20eou.%20edital%20de%20abertura.%2021.09.2026.%20atualizado..pdf'
EXAM_PORTAL = 'https://examedeordem.oab.org.br/EditaisProvas?NumeroExame=18197'


def paragraph_markdown(paragraph: Paragraph) -> str:
    text = ''.join(
        (f'**{run.text}**' if run.bold else f'*{run.text}*' if run.italic else run.text)
        for run in paragraph.runs
    ).strip()
    if not text:
        return ''
    style = paragraph.style.name.lower() if paragraph.style else ''
    heading = re.search(r'heading\s*(\d+)', style)
    if style == 'title':
        return f'# {text}'
    if heading:
        return f'{"#" * min(int(heading.group(1)) + 1, 6)} {text}'
    if 'list bullet' in style:
        return f'- {text}'
    if 'list number' in style:
        return f'1. {text}'
    if style.startswith('quote'):
        return f'> {text}'
    return text.replace('\t', '  ')


def docx_to_markdown(source: Path) -> str:
    document = Document(source)
    output: list[str] = []
    for element in document.element.body.iterchildren():
        if element.tag == qn('w:p'):
            rendered = paragraph_markdown(Paragraph(element, document))
            if rendered:
                output.append(rendered)
                output.append('')
        elif element.tag == qn('w:tbl'):
            table = Table(element, document)
            rows = [[cell.text.replace('\n', ' / ').replace('|', '\\|').strip() for cell in row.cells] for row in table.rows]
            if rows:
                width = max(len(row) for row in rows)
                rows = [row + [''] * (width - len(row)) for row in rows]
                output.append('| ' + ' | '.join(rows[0]) + ' |')
                output.append('| ' + ' | '.join(['---'] * width) + ' |')
                for row in rows[1:]:
                    output.append('| ' + ' | '.join(row) + ' |')
                output.append('')
    return '\n'.join(output).strip() + '\n'


def replace_once(path: Path, old: str, new: str) -> None:
    text = path.read_text(encoding='utf-8')
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f'Expected exactly one replacement in {path.name}, found {count}: {old[:80]!r}')
    path.write_text(text.replace(old, new), encoding='utf-8')


def import_materials() -> None:
    TARGET_MD.mkdir(parents=True, exist_ok=True)
    TARGET_DATA.mkdir(parents=True, exist_ok=True)
    for source in sorted(SOURCE_MD.glob('*.md')):
        (TARGET_MD / source.name).write_text(source.read_text(encoding='utf-8'), encoding='utf-8')
    ethics = TARGET_MD / '00-etica.md'
    ethics.write_text(docx_to_markdown(SOURCE_DOCS / '00-etica.docx'), encoding='utf-8')

    # Replace residual references to the 47th examination with the verified official 48th notice.
    changes = {
        '05-administrativo.md': [
            (
                'A matriz oficial consultada foi a do edital de abertura do 47º Exame Unificado, publicado pela OAB em 2026. Ela relaciona temas extensos, inclusive legislação extravagante, processo e precedentes qualificados [1]. Como a prova pretendida está marcada pela candidata para 10/01/2027, confirme no portal oficial o edital, o calendário, eventuais retificações e o programa do exame efetivamente correspondente. Não se deve presumir que um edital anterior governe a prova futura. A atualização legislativa deste material foi limitada a 15/11/2026.',
                'O edital de abertura do 48º Exame Unificado, publicado pela OAB/FGV em 21/09/2026, apresenta o programa de Direito Administrativo no Anexo II, incluindo legislação extravagante, processo e precedentes qualificados [1]. Use o programa deste exame e acompanhe eventuais retificações. A revisão jurídica original desta apostila foi concluída em 15/11/2026; o portal atualiza a referência do edital em 16/11/2026.'
            ),
            (
                '[1]: https://s.oab.org.br/arquivos/2026/05/3578986c-fb9e-42ed-b68b-9a5131c86c9a.pdf "OAB, Edital de Abertura do 47º Exame de Ordem Unificado, 2026, Anexo de conteúdo programático"',
                f'[1]: {EXAM_PDF} "OAB/FGV, Edital de Abertura do 48º Exame de Ordem Unificado, publicado em 21/09/2026, Anexo II"'
            ),
        ],
        '15-eleitoral.md': [
            (
                'O edital 47º, acessível na FGV, apresenta as disciplinas da prova objetiva e formato de 80 questões. A página pública da FGV também indica informações para o 48º Exame, mas na consulta realizada não expôs edital nem anexo programático em formato legível. Assim, não atribuo ao edital de 48º conteúdo que não consegui confirmar. Consulte a publicação oficial do 48º Exame antes da prova; eventual diferença de programa prevalece sobre esta referência.[1] [2]',
                'O edital de abertura do 48º Exame, publicado em 21/09/2026, prevê prova objetiva com 80 questões e apresenta no Anexo II os conteúdos de Direito Eleitoral [1]. A data da prova objetiva é 10/01/2027, sujeita a alterações oficiais [2]. Use o programa deste exame e acompanhe eventuais retificações.'
            ),
            (
                '[1]: https://oab.fgv.br/arq/650/580490_47%C2%BA%20eou.%20edital%20de%20abertura.%20ponto%20para%20publicar.%20(2).pdf "FGV e Conselho Federal da OAB. Edital de abertura do 47º Exame de Ordem Unificado, 2026."',
                f'[1]: {EXAM_PDF} "OAB/FGV, Edital de Abertura do 48º Exame de Ordem Unificado, Anexo II"'
            ),
            (
                '[2]: https://oab.fgv.br/home.aspx?key=651 "FGV. Página oficial do 48º Exame de Ordem Unificado."',
                f'[2]: {EXAM_PORTAL} "OAB/FGV, Editais, provas e gabaritos oficiais do 48º Exame"'
            ),
        ],
        '16-financeiro.md': [
            (
                'O edital oficial do 47º Exame, publicado pela OAB/FGV, inclui Direito Financeiro entre os conteúdos da prova objetiva e prevê questões de múltipla escolha com quatro alternativas. O edital do exame de janeiro de 2027 deve ser consultado separadamente: a matriz, datas e regras podem ser atualizadas [1].',
                'O edital oficial do 48º Exame, publicado pela OAB/FGV em 21/09/2026, inclui Direito Financeiro no programa da prova objetiva e prevê questões de múltipla escolha com quatro alternativas. Confira o Anexo II e acompanhe eventuais retificações oficiais [1].'
            ),
            (
                '[1]: https://oab.fgv.br/arq/650/580490_47%C2%BA%20eou.%20edital%20de%20abertura.%20ponto%20para%20publicar.%20%282%29.pdf "OAB/FGV, Edital de Abertura do 47º Exame de Ordem Unificado, 2026"',
                f'[1]: {EXAM_PDF} "OAB/FGV, Edital de Abertura do 48º Exame de Ordem Unificado, Anexo II"'
            ),
        ],
        '18-processo-trabalho.md': [
            (
                '[1]: https://s.oab.org.br/arquivos/2026/05/3578986c-fb9e-42ed-b68b-9a5131c86c9a.pdf "CFOAB, Edital do 47º Exame de Ordem Unificado, Anexo II, conteúdo programático de Direito Processual do Trabalho, 2026"',
                f'[1]: {EXAM_PDF} "CFOAB/FGV, Edital do 48º Exame de Ordem Unificado, Anexo II, conteúdo programático de Direito Processual do Trabalho"'
            ),
        ],
        '19-filosofia.md': [
            (
                'O edital oficialmente localizado nesta pesquisa é o do 47º Exame, publicado em 2026; a prova de janeiro de 2027 poderá ter edital próprio ou retificações. Ele inclui Filosofia do Direito na prova objetiva, mas não apresenta, no trecho de conteúdo programático consultado, uma lista fechada de autores ou teses. [1]',
                'O edital de abertura do 48º Exame, publicado em 21/09/2026, inclui Filosofia do Direito na prova objetiva e apresenta o programa no Anexo II, sem listar uma relação fechada de autores ou teses [1]. Acompanhe eventuais retificações oficiais.'
            ),
            (
                '[1]: https://oab.fgv.br/arq/650/580490_47%C2%BA%20eou.%20edital%20de%20abertura.%20ponto%20para%20publicar.%20%282%29.pdf "Conselho Federal da OAB e FGV, Edital de Abertura do 47º Exame de Ordem Unificado, 2026"',
                f'[1]: {EXAM_PDF} "Conselho Federal da OAB/FGV, Edital de Abertura do 48º Exame de Ordem Unificado, Anexo II"'
            ),
        ],
    }
    for filename, pairs in changes.items():
        path = TARGET_MD / filename
        for old, new in pairs:
            replace_once(path, old, new)

    # Save a single transparent source note for the browser pages.
    (TARGET_MD / 'ATUALIZACAO.md').write_text(
        '# Nota editorial — atualização do portal\n\n'
        '**Conferência do portal:** 16/11/2026. **Revisão jurídica das apostilas-base:** 15/11/2026.\n\n'
        'As apostilas foram preparadas para estudo da 1ª fase e revisadas para apontar o edital específico do 48º Exame, inclusive corrigindo referências residuais ao 47º identificadas na compilação. Consulte o edital, o calendário oficial, retificações, legislação consolidada e jurisprudência qualificada novamente antes da prova. O portal é material educacional independente e não substitui a publicação oficial.\n',
        encoding='utf-8'
    )


def import_schedule() -> None:
    document = Document(SCHEDULE_DOCX)
    entries: list[dict[str, str | int]] = []
    for table in document.tables:
        for row in table.rows:
            cells = [cell.text.replace('\n', ' / ').strip() for cell in row.cells]
            if len(cells) < 4:
                continue
            match = re.match(r'Dia\s+(\d+)\s*/\s*(\d{2}/\d{2}/\d{4})', cells[0], re.I)
            if not match:
                continue
            entries.append({
                'day': int(match.group(1)),
                'date': match.group(2),
                'focus': cells[1],
                'study': cells[2],
                'timeNotes': cells[3],
            })
    entries.sort(key=lambda item: int(item['day']))
    if len(entries) != 56:
        raise RuntimeError(f'Expected 56 CEISC-base schedule days; found {len(entries)}')
    (TARGET_DATA / 'ceisc56.json').write_text(json.dumps(entries, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Imported {len(entries)} schedule days: {entries[0]["date"]}–{entries[-1]["date"]}')


if __name__ == '__main__':
    import_materials()
    import_schedule()
    materials = sorted(TARGET_MD.glob('*.md'))
    print(f'Imported {len(materials)} Markdown files: ' + ', '.join(p.name for p in materials if p.name != 'ATUALIZACAO.md'))
