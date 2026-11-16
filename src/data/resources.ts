export type VideoResource = {
  id: string;
  provider: string;
  title: string;
  url: string;
  type: 'playlist' | 'channel';
  observed: string;
  coverage: string;
  subjects: string[];
  accessNote: string;
};

export const videoResources: VideoResource[] = [
  {
    id: 'verbo-start-48',
    provider: 'Verbo OAB',
    title: 'Start 1ª fase OAB 48',
    url: 'https://www.youtube.com/playlist?list=PLWCIBiUqF93I',
    type: 'playlist',
    observed: '18 vídeos observados em 16/11/2026',
    coverage: 'Playlist curta e parcial. Os títulos observados incluem Ética, Penal, Direitos Humanos, Civil, Tributário, Trabalho, Administrativo e Empresarial.',
    subjects: ['etica', 'penal', 'direitos-humanos', 'civil', 'tributario', 'trabalho', 'administrativo', 'empresarial'],
    accessNote: 'A playlist era pública e anunciava aulas gratuitas na consulta. Verifique a disponibilidade de cada vídeo; isso não equivale a acesso a cursos fechados.',
  },
  {
    id: 'estrategia-90-dias',
    provider: 'Estratégia OAB',
    title: 'OAB 48 em 90 Dias',
    url: 'https://www.youtube.com/playlist?list=PLPoWgJWtSF8s',
    type: 'playlist',
    observed: '7 vídeos observados em 16/11/2026',
    coverage: 'Cobertura parcial: orientação de estudos e alguns encontros sobre Civil, Penal e Ética. Não corresponde às 20 disciplinas completas.',
    subjects: ['civil', 'penal', 'etica'],
    accessNote: 'Playlist pública no YouTube; alguns itens estavam agendados na consulta e a disponibilidade/acesso pode mudar.',
  },
  {
    id: 'ceisc-channel',
    provider: 'CEISC',
    title: 'Aulas abertas e lives do canal',
    url: 'https://www.youtube.com/@cursoceisc',
    type: 'channel',
    observed: 'Canal consultado em 16/11/2026',
    coverage: 'Canal com lives e aulas abertas, inclusive análise do edital do 48º. Os vídeos variam por disciplina e data.',
    subjects: [],
    accessNote: 'Há conteúdos públicos gratuitos, mas o canal também divulga cursos pagos. Confira o acesso de cada vídeo; o portal não promete acesso a aulas fechadas.',
  },
];

export const officialSources = [
  { title: 'Calendário oficial do Exame de Ordem', detail: 'Datas previstas e eventuais alterações', url: 'https://examedeordem.oab.org.br/Calendario', kind: 'OAB/FGV' },
  { title: 'Editais, provas e gabaritos do 48º Exame', detail: 'Fonte primária para edital, anexos, retificações e provas', url: 'https://examedeordem.oab.org.br/EditaisProvas?NumeroExame=18197', kind: 'OAB/FGV' },
  { title: 'Edital de abertura do 48º EOU', detail: 'PDF oficial, publicado em 21/09/2026', url: 'https://oab.fgv.br/arq/651/579325_48%20eou.%20edital%20de%20abertura.%2021.09.2026.%20atualizado..pdf', kind: 'OAB/FGV' },
  { title: 'Emenda Constitucional nº 141/2026', detail: 'Texto oficial e regra de transição', url: 'https://www.planalto.gov.br/ccivil_03/constituicao/emendas/emc/emc141.htm', kind: 'Planalto' },
  { title: 'Lei nº 15.472/2026', detail: 'Altera o Estatuto da Advocacia e explicita a natureza alimentar dos honorários', url: 'https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2026/lei/l15472.htm', kind: 'Planalto' },
  { title: 'Lei nº 15.450/2026', detail: 'Acrescenta ao ECA campanha preventiva sobre uso indiscriminado ou excessivo de psicofármacos', url: 'https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2026/lei/l15450.htm', kind: 'Planalto' },
] as const;

export const contentReviewedAt = '16/11/2026';
export const baseMaterialsUpdatedAt = '15/11/2026';
export const examDateLabel = '10 de janeiro de 2027';
