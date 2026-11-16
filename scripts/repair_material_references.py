from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / 'src/content/materials'
EXAM_PDF = 'https://oab.fgv.br/arq/651/579325_48%20eou.%20edital%20de%20abertura.%2021.09.2026.%20atualizado..pdf'
EXAM_PORTAL = 'https://examedeordem.oab.org.br/EditaisProvas?NumeroExame=18197'
CALENDAR = 'https://examedeordem.oab.org.br/Calendario'


def replace_line(filename: str, predicate, replacement: str) -> None:
    path = ROOT / filename
    lines = path.read_text(encoding='utf-8').splitlines()
    found = [index for index, line in enumerate(lines) if predicate(line)]
    if len(found) != 1:
        raise RuntimeError(f'{filename}: expected one matching line, got {len(found)}')
    lines[found[0]] = replacement
    path.write_text('\n'.join(lines) + '\n', encoding='utf-8')


replace_line(
    '02-direitos-humanos.md',
    lambda line: 'Como referência conferida para o recorte' in line,
    'Leia uma vez para compreender a arquitetura constitucional e internacional; na segunda passagem, transforme as distinções em perguntas e responda às questões originais ao final sem consultar o gabarito. Em revisão rápida, use o mapa e o checklist. A apostila foi organizada para a prova objetiva e não substitui o texto normativo, o edital aplicável nem a jurisprudência atual. O edital do 48º Exame foi publicado em 21/09/2026 e inclui Direitos Humanos entre os conteúdos da prova objetiva; confira o Anexo II e eventuais retificações oficiais [1].',
)
replace_line(
    '02-direitos-humanos.md',
    lambda line: line.startswith('[1]:') and '47º Exame' in line,
    f'[1]: {EXAM_PDF} "OAB/FGV, Edital de Abertura do 48º Exame de Ordem Unificado, Anexo II"',
)
replace_line(
    '03-internacional.md',
    lambda line: 'A prova objetiva do 47º Exame' in line,
    '> **Como usar.** Leia primeiro o mapa e as distinções em destaque. Em seguida, estude as regras legais com a Constituição, a LINDB, o CPC e a Lei de Migração abertos para consulta. Resolva as questões sem olhar os comentários e, ao revisar, explique por que cada alternativa errada falha. Este material é uma síntese direcionada à prova objetiva, não substitui o edital oficial nem a leitura da legislação vigente. O edital de abertura do 48º Exame prevê prova objetiva com 80 questões de múltipla escolha, quatro alternativas (A–D) e cinco horas, na data provável de 10/01/2027. Acompanhe comunicados e retificações oficiais [1] [2].',
)
replace_line(
    '03-internacional.md',
    lambda line: line.startswith('[1]:') and '47%C2%BA' in line,
    f'[1]: {EXAM_PDF} "OAB/FGV, Edital de Abertura do 48º Exame de Ordem Unificado, Anexo II"',
)
replace_line(
    '05-administrativo.md',
    lambda line: line.startswith('[19]:') and 'NumeroExame=0' in line,
    f'[19]: {EXAM_PORTAL} "OAB/FGV, Editais, provas e gabaritos oficiais do 48º Exame"',
)
replace_line(
    '06-ambiental.md',
    lambda line: line.startswith('[1]:') and 'NumeroExame=0' in line,
    f'[1]: {EXAM_PORTAL} "OAB/FGV, Editais, provas e gabaritos oficiais do 48º Exame"',
)
replace_line(
    '08-eca.md',
    lambda line: line.startswith('[9]:') and 'portal oficial do Exame' in line,
    f'[9]: {EXAM_PDF} "OAB/FGV, Edital de Abertura do 48º Exame, Anexo II — ECA"',
)
replace_line(
    '08-eca.md',
    lambda line: line.startswith('**Limitação de conferência do edital:**'),
    f'O edital de abertura do 48º Exame foi publicado em 21/09/2026 e apresenta ECA no Anexo II [9]. Confira eventuais retificações e a redação consolidada da Lei 15.450/2026 antes da prova; o portal oficial mantém o edital e os comunicados da edição [10].',
)
replace_line(
    '11-processo-civil.md',
    lambda line: 'programa de Direito Processual Civil constante do edital' in line and '47º Exame' in line,
    'O conteúdo foi organizado conforme o programa de Direito Processual Civil do edital de abertura do 48º Exame de Ordem Unificado, publicado pelo Conselho Federal da OAB e pela FGV em 21/09/2026 [1]. Confira as alterações normativas posteriores a 15/11/2026 e eventuais retificações oficiais antes da revisão final. Este resumo não substitui a leitura da lei e não pretende esgotar a disciplina. Ética profissional está em apostila separada.',
)
replace_line(
    '11-processo-civil.md',
    lambda line: line.startswith('[1]') and '47º Exame' in line,
    f'[1] OAB/FGV, Edital de Abertura do 48º Exame, publicado em 21/09/2026, Anexo II — Conteúdo Programático. PDF oficial: {EXAM_PDF} . Editais, provas e gabaritos: {EXAM_PORTAL} .',
)
replace_line(
    '12-penal.md',
    lambda line: line.startswith('[1]:') and '47%C2%BA' in line,
    f'[1]: {EXAM_PDF} "OAB/FGV, Edital de Abertura do 48º Exame de Ordem Unificado, Anexo II"',
)
replace_line(
    '15-eleitoral.md',
    lambda line: line.startswith('O edital oficial do 47º Exame'),
    f'O edital de abertura do 48º Exame inclui Direito Eleitoral no programa da prova objetiva (Anexo II), composta por 80 questões de quatro alternativas e prevista para 10/01/2027, com cinco horas de duração. Confira eventuais retificações e o conteúdo oficial antes da prova [1] [2].',
)
replace_line(
    'ATUALIZACAO.md',
    lambda line: 'corrigindo referências residuais ao 47º' in line,
    'As apostilas foram preparadas para estudo da 1ª fase e conferidas editorialmente em relação ao edital de abertura do 48º Exame. Consulte o edital, o calendário oficial, retificações, legislação consolidada e jurisprudência qualificada novamente antes da prova. O portal é material educacional independente e não substitui as publicações oficiais.',
)

print('Corrected residual exam references in 11 material files.')
