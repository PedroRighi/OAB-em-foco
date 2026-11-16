from pathlib import Path

PATH = Path(__file__).resolve().parents[1] / 'src/content/materials/08-eca.md'
text = PATH.read_text(encoding='utf-8')
replacements = [
    (
        'prevenção de uso problemático de telas e dispositivos digitais (Lei 15.450/2026)',
        'prevenção ao uso indiscriminado, desnecessário ou excessivo de psicofármacos em crianças e adolescentes nas campanhas de educação sanitária (Lei 15.450/2026)',
    ),
    (
        'A Lei 15.450/2026 acrescentou medida legal relacionada à prevenção do uso problemático de telas e dispositivos digitais, alterando o art. 14; para detalhes operacionais, confira a redação vigente diretamente no texto consolidado, especialmente porque se trata de inovação legislativa recente.',
        'A Lei 15.450/2026 acrescentou o § 6º ao art. 14 para incluir nas campanhas de educação sanitária a prevenção do uso indiscriminado, desnecessário ou excessivo de psicofármacos em crianças e adolescentes. A lei entra em vigor após 180 dias da publicação oficial [4].',
    ),
    (
        'A Lei 15.240/2025 alterou os arts. 4º e 5º para explicitar assistência afetiva e caracterizar abandono afetivo como ilícito civil sujeito a reparação. A Lei 15.450, de 30 de junho de 2026, alterou o ECA para instituir medida destinada à prevenção do uso problemático de telas/dispositivos digitais. São atualizações posteriores a muitos materiais de preparação. Consulte o texto compilado oficial e as leis alteradoras, inclusive quanto à vigência e à redação exata, antes da prova.[1][3][4]',
        'A Lei 15.240/2025 alterou os arts. 4º e 5º para explicitar assistência afetiva e caracterizar abandono afetivo como ilícito civil sujeito a reparação. A Lei 15.450/2026 acrescentou ao art. 14, § 6º, a prevenção do uso indiscriminado, desnecessário ou excessivo de psicofármacos em crianças e adolescentes nas campanhas de educação sanitária; sua vigência começa 180 dias após a publicação oficial. Confira o texto integral e a vigência no Planalto [1] [3] [4].',
    ),
    (
        '- [ ] Lei 15.450/2026: consultar texto exato da medida sobre prevenção do uso problemático de telas.',
        '- [ ] Lei 15.450/2026: identificar a inclusão do art. 14, § 6º, sobre campanhas de prevenção ao uso indiscriminado, desnecessário ou excessivo de psicofármacos e sua vigência após 180 dias.',
    ),
    (
        '[4]: https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2026/lei/l15450.htm "Lei 15.450 de 30 de junho de 2026 — prevenção do uso problemático de telas e dispositivos digitais"',
        '[4]: https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2026/lei/l15450.htm "Lei nº 15.450, de 30 de junho de 2026 — prevenção do uso indiscriminado, desnecessário ou excessivo de psicofármacos em crianças e adolescentes nas campanhas de educação sanitária"',
    ),
    (
        'O edital de abertura do 48º Exame foi publicado em 21/09/2026 e apresenta ECA no Anexo II [9]. Confira eventuais retificações e a redação consolidada da Lei 15.450/2026 antes da prova; o portal oficial mantém o edital e os comunicados da edição [10].',
        'O edital de abertura do 48º Exame foi publicado em 21/09/2026 e apresenta ECA no Anexo II [9]. A Lei 15.450/2026 acrescenta a prevenção ao uso excessivo de psicofármacos às campanhas de educação sanitária e entra em vigor após 180 dias da publicação oficial [4]. Confira eventuais retificações no portal OAB/FGV antes da prova.',
    ),
]
for old, new in replacements:
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f'Expected one target phrase; found {count}: {old[:90]!r}')
    text = text.replace(old, new)
PATH.write_text(text, encoding='utf-8')
print(f'Updated {len(replacements)} ECA passages to match the official law.')
