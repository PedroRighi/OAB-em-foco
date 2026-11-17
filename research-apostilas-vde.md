# Aulas VDE 40 dias – Exame 48: uso no portal

Registro da incorporação do pacote enviado pela usuária em 17/11/2026. O material serve como roteiro de aprofundamento; o portal mantém texto próprio, conferido com a legislação vigente, e não hospeda os arquivos originais do curso.

## O que veio no pacote

- 2,0 GB compactados, com 29 arquivos: 21 PDFs de aula (16 a 37 páginas cada), 8 videoaulas (MP4) e uma pasta de cronograma vazia.
- Disciplinas contempladas nos PDFs: Constitucional (5), Administrativo (4), Ética (3), Processo Civil (3), Tributário (2), Penal (2), Civil (1) e Processo Penal (1).
- Videoaulas disponíveis: Negócio Jurídico, Competência (Processo do Trabalho), Atos Processuais (partes 1 e 2), Atos Administrativos, Intervenção de Terceiros, Concurso de Pessoas, Penas (parte 1) e "Como estudar com pouco tempo".
- Os vídeos não foram transcritos nesta etapa; os PDFs cobrem temas equivalentes nos casos em que há aula escrita.

## Como o material foi usado

1. Extração do texto dos 21 PDFs com `pdftotext`, preservando tabelas e fluxogramas convertidos em texto.
2. Um redator dedicado por aula, com instruções editoriais comuns: síntese própria, conferência dos dispositivos no Planalto/STF/STJ, quadro comparativo, pegadinhas, caso prático, três questões de fixação e referências HTTPS.
3. Validação automática antes da integração: título padronizado (`## Aprofundamento VDE — ...`), oito seções obrigatórias, 900 a 2.600 palavras, nenhum heading extra, nenhum link `http://`, nenhuma menção ao professor ou à escola do curso e nenhuma alegação estatística de incidência.
4. Integração ao final de cada apostila, antes do checklist e das referências, sem alterar capítulos, questões ou IDs existentes. Os capítulos entram como tópicos novos no índice lateral e podem ser marcados como revisados.

## Capítulos acrescentados

| # | Disciplina | Capítulo | Correções e destaques em relação à aula |
| --- | --- | --- | --- |
| 01 | Constitucional | Teoria da Constituição e aplicação das normas | CF/88 tratada como rígida (e não semi-rígida); sem limite temporal de imutabilidade além da revisão do art. 3º do ADCT; ausência de hierarquia entre leis decorre da repartição de competências; EC 115/2022 (proteção de dados); MS 35.535 (PEC na intervenção). |
| 02 | Constitucional | Organização do Estado e repartição de competências | LC 230/2026 regulamenta apenas o desmembramento para incorporação a Município limítrofe; criação de Município segue a ADI 4.711; Municípios têm autonomia plena (residual é a competência estadual); Territórios integram a União. |
| 03 | Constitucional | Processo legislativo | Ressalva orçamentária da MP está no art. 62, § 1º, I, "d"; autorização da lei delegada no art. 68, § 2º; controle judicial excepcional de relevância e urgência (ADI 5.599); resoluções do Senado também têm efeitos gerais; prazos de trancamento e reedição. |
| 04 | Constitucional | Poder Legislativo: estrutura, atribuições e imunidades | Perda de mandato por condenação exige decisão da Casa (art. 55, § 2º, EC 76/2013; AP 694); CPI tem poderes próprios, sem interceptação telefônica; voto aberto; julgamento de contas do Presidente no Congresso. |
| 05 | Constitucional | Intervenção federal e intervenção estadual | Requisição por desobediência a ordem judicial é o art. 36, II (não III); prazo da dívida fundada difere entre arts. 34, V, e 35, I; dispensa de apreciação e retorno das autoridades (art. 36, §§ 3º e 4º); ADI 7.369-MT. |
| 06 | Ética | Ética do advogado e relações com o cliente | CED vigente é a Resolução CFOAB 02/2015; inclusão do Capítulo III (arts. 9º a 26); nome social (Res. 07/2016); art. 3º-A (Res. 05/2024); art. 34, XXX (Lei 14.612/2023); leitura literal do art. 34, VIII. |
| 07 | Ética | Direitos e prerrogativas do advogado | Parágrafo único do art. 6º renumerado pela Lei 14.508/2022; §§ 1º e 2º do art. 7º restabelecidos pela ADI 7231 (2025); sanção do § 6º-I é exclusão (art. 35, III); art. 7º-B (crime de violação de prerrogativa). |
| 08 | Ética | Sigilo profissional | Dispensa de depor está no art. 38 do CED (e no art. 7º, XIX, do Estatuto); censura do art. 36, I; suspensão por reincidência; art. 7º, § 6º-I (Lei 14.365/2022); confidencialidade na mediação (Lei 13.140/2015); art. 154 do CP. |
| 09 | Civil | Modalidades das obrigações | Coisa certa é individualizada e incerta é definida por gênero e quantidade; art. 240 remete ao 239; benfeitorias dos arts. 1.219 e 1.220; art. 251 como critério do não fazer; art. 313 como princípio geral; arts. 257 a 285. |
| 10 | Tributário | Contribuições de melhoria | A lei pode ser editada antes da obra, mas lançamento e cobrança dependem da valorização; tributo vinculado à obra e ao benefício; requisitos do art. 82 do CTN; distinção com o art. 149 e com a CIP (EC 132/2023); RE 115.863/SP (recapeamento). |
| 11 | Tributário | Empréstimo compulsório | Condições de resgate no parágrafo único do art. 15 do CTN (o art. 16 trata de imposto); art. 15, III, do CTN não recepcionado pela CF/88; RE 175.385/CE (restituição na mesma espécie); anterioridade bifurcada. |
| 12 | Penal | Fato típico: tipicidade, dolo, culpa e erro | Teto de R$ 20 mil no descaminho é parâmetro jurisprudencial (art. 20 da Lei 10.522/2002 remete à PGFN); Súmula 599 do STJ no alcance real; erro sobre o nexo causal como construção doutrinária; arts. 20, § 1º, e 21. |
| 13 | Penal | Ilicitude e excludentes | Art. 24, § 2º (redução de pena); parágrafo único do art. 25 (Lei 13.964/2019); ADPF 779 (legítima defesa da honra); descriminante putativa como excludente de culpabilidade; requisitos do consentimento do ofendido. |
| 14 | Processo Penal | Ação penal | Lei 15.438/2026 amplia para 12 meses a decadência em violência doméstica (CP, art. 103, parágrafo único; CPP, art. 38, § 2º; Lei 11.340, art. 16-A); Lei 15.380/2026 (art. 16); prazo da ação privada subsidiária conta do art. 38 do CPP. |
| 15 | Processo Civil | Procedimento comum: saneamento, provas e julgamento | Cessação da dobra no art. 229, § 1º (o § 2º afasta o benefício em autos eletrônicos); fórmula do art. 341, II; prazos próprios de MP, Advocacia Pública e Defensoria; roteiro completo dos arts. 347 a 495. |
| 16 | Processo Civil | Processos nos tribunais e incidentes | "Grande repercussão social" corresponde ao enunciado 469 do FPPC (o 558 trata de reclamação); art. 976, § 4º; cessação da suspensão (arts. 980 e 982, § 5º); suspensão nacional; Súmula Vinculante 10. |
| 17 | Processo Civil | Agravo interno e embargos de declaração | Embargos de declaração estão no art. 1.022 (o 1.021 trata do agravo interno); Juizados: art. 48 remete ao CPC e o art. 50 prevê interrupção; Súmula 418 do STJ cancelada, substituída pela 579; prequestionamento ficto (art. 1.025). |
| 18 | Administrativo | Intervenção do Estado na propriedade | Direito de preferência do art. 22 do DL 25/1937 revogado pelo CPC/2015; alienação e gravame possíveis, com averbação das restrições (art. 13); limitação do entorno como restrição especial (art. 18). |
| 19 | Administrativo | Contratação direta na Lei 14.133/2021 | Valores do art. 75 reajustados pelo IPCA-E (art. 182; Decreto 12.807/2025: R$ 130.984,20 e R$ 65.492,11 em 2026); numeração do art. 74 (credenciamento no IV, imóvel no V); revogação da Lei 8.666/1993; ADI 6890. |
| 20 | Administrativo | Contratos administrativos: anulação, revogação e extinção | Extinção exige decisão motivada com contraditório (art. 137); indenização limitada ao executado e a prejuízos comprovados (art. 149; STJ, REsp 2.045.450); arts. 147 e 148 (eficácia diferida); distinção ex tunc/ex nunc. |
| 21 | Administrativo | Consórcios públicos | A lei ratifica o protocolo; a personalidade vem do contrato e das ratificações; exigência de participação estadual recai sobre a União (art. 1º, § 2º); Lei 13.822/2019; Leis 14.662/2023, 14.026/2020 e 14.133/2021. |

## Limites assumidos

- O conteúdo é síntese independente, não reprodução do curso; o portal não promete aulas, mentorias ou simulados do VDE.
- A conferência foi feita em fontes oficiais em 17/11/2026. Leis e súmulas novas, o edital vigente e eventuais retificações continuam a exigir checagem antes da prova.
- O progresso já salvo permanece válido: os capítulos novos apenas acrescentam tópicos às chaves existentes, sem remover marcações.
