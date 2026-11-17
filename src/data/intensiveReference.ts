export const referenceSubjectIds = [
  'constitucional',
  'processo-trabalho',
  'civil',
  'trabalho',
  'processo-penal',
  'etica',
  'processo-civil',
  'tributario',
  'administrativo',
  'penal',
] as const;

export type ReferenceDay = {
  day: number;
  week: number;
  kind: 'study' | 'review' | 'mock';
  title: string;
  blocks: { subjectId: string; topics: string[] }[];
  guidance: string;
};

const studyGuidance =
  'Leia o resumo/fonte, resolva questões e revise os erros.';
const reviewGuidance =
  'Leia o resumo/fonte, resolva questões e revise os erros da semana.';
const mockGuidance =
  '20 questões, meta de 18; seleção por disciplina, não tópico.';

export const referenceDays: ReferenceDay[] = [
  {
    day: 1,
    week: 1,
    kind: 'study',
    title: 'Dia 1 — Fundamentos constitucionais, despesas processuais e bases do Direito',
    blocks: [
      {
        subjectId: 'constitucional',
        topics: ['Teoria da Constituição', 'Direitos e Garantias Fundamentais'],
      },
      {
        subjectId: 'processo-trabalho',
        topics: ['Despesas Processuais'],
      },
    ],
    guidance: studyGuidance,
  },
  {
    day: 2,
    week: 1,
    kind: 'study',
    title: 'Dia 2 — Negócio jurídico, contrato e empregador',
    blocks: [
      {
        subjectId: 'civil',
        topics: ['Negócio Jurídico'],
      },
      {
        subjectId: 'trabalho',
        topics: ['Contrato de Trabalho', 'Empregador'],
      },
    ],
    guidance: studyGuidance,
  },
  {
    day: 3,
    week: 1,
    kind: 'study',
    title: 'Dia 3 — Inquérito e fundamentos da advocacia',
    blocks: [
      {
        subjectId: 'processo-penal',
        topics: ['Inquérito Policial'],
      },
      {
        subjectId: 'etica',
        topics: ['Atividades da Advocacia', 'Mandato Judicial', 'Inscrição na OAB'],
      },
    ],
    guidance: studyGuidance,
  },
  {
    day: 4,
    week: 1,
    kind: 'study',
    title: 'Dia 4 — Intervenção de terceiros, litisconsórcio e competência tributária',
    blocks: [
      {
        subjectId: 'processo-civil',
        topics: ['Intervenção de Terceiros', 'Litisconsórcio'],
      },
      {
        subjectId: 'tributario',
        topics: ['Competência'],
      },
    ],
    guidance: studyGuidance,
  },
  {
    day: 5,
    week: 1,
    kind: 'study',
    title: 'Dia 5 — Organização administrativa e eficácia da lei penal',
    blocks: [
      {
        subjectId: 'administrativo',
        topics: ['Organização da Administração Pública'],
      },
      {
        subjectId: 'penal',
        topics: ['Eficácia da Lei no Tempo', 'Eficácia da Lei no Espaço'],
      },
    ],
    guidance: studyGuidance,
  },
  {
    day: 6,
    week: 1,
    kind: 'review',
    title: 'Revisão semanal 1',
    blocks: [],
    guidance: reviewGuidance,
  },
  {
    day: 7,
    week: 1,
    kind: 'mock',
    title: 'Simulado da semana 1',
    blocks: [],
    guidance: mockGuidance,
  },
  {
    day: 8,
    week: 2,
    kind: 'study',
    title: 'Dia 8 — Remédios constitucionais e ação trabalhista',
    blocks: [
      {
        subjectId: 'constitucional',
        topics: ['Remédios Constitucionais'],
      },
      {
        subjectId: 'processo-trabalho',
        topics: ['Ação', 'Defesa', 'Audiência'],
      },
    ],
    guidance: studyGuidance,
  },
  {
    day: 9,
    week: 2,
    kind: 'study',
    title: 'Dia 9 — Modalidades, inadimplemento e alterações do contrato de trabalho',
    blocks: [
      {
        subjectId: 'civil',
        topics: ['Modalidades de Obrigações', 'Inadimplemento das Obrigações'],
      },
      {
        subjectId: 'trabalho',
        topics: ['Interrupção do Contrato', 'Suspensão do Contrato', 'Alteração do Contrato'],
      },
    ],
    guidance: studyGuidance,
  },
  {
    day: 10,
    week: 2,
    kind: 'study',
    title: 'Dia 10 — Ação penal e direitos profissionais da advocacia',
    blocks: [
      {
        subjectId: 'processo-penal',
        topics: ['Ação'],
      },
      {
        subjectId: 'etica',
        topics: [
          'Direitos e Prerrogativas',
          'Sociedade de Advogados',
          'Advogado Empregado',
        ],
      },
    ],
    guidance: studyGuidance,
  },
  {
    day: 11,
    week: 2,
    kind: 'study',
    title: 'Dia 11 — Tutela processual e princípios tributários',
    blocks: [
      {
        subjectId: 'processo-civil',
        topics: ['Tutela Provisória'],
      },
      {
        subjectId: 'tributario',
        topics: ['Princípios Tributários', 'Conceito de Tributo', 'Espécies Tributárias'],
      },
    ],
    guidance: studyGuidance,
  },
  {
    day: 12,
    week: 2,
    kind: 'study',
    title: 'Dia 12 — Agentes públicos e fato típico',
    blocks: [
      {
        subjectId: 'administrativo',
        topics: ['Agentes Públicos'],
      },
      {
        subjectId: 'penal',
        topics: ['Fato Típico'],
      },
    ],
    guidance: studyGuidance,
  },
  {
    day: 13,
    week: 2,
    kind: 'review',
    title: 'Revisão semanal 2',
    blocks: [],
    guidance: reviewGuidance,
  },
  {
    day: 14,
    week: 2,
    kind: 'mock',
    title: 'Simulado da semana 2',
    blocks: [],
    guidance: mockGuidance,
  },
  {
    day: 15,
    week: 3,
    kind: 'study',
    title: 'Dia 15 — Nacionalidade, repartição de competências e recursos trabalhistas',
    blocks: [
      {
        subjectId: 'constitucional',
        topics: ['Nacionalidade', 'Repartição de Competência'],
      },
      {
        subjectId: 'processo-trabalho',
        topics: ['Recursos'],
      },
    ],
    guidance: studyGuidance,
  },
  {
    day: 16,
    week: 3,
    kind: 'study',
    title: 'Dia 16 — Contratos e duração do trabalho',
    blocks: [
      {
        subjectId: 'civil',
        topics: ['Contratos em Geral', 'Espécies de Contratos'],
      },
      {
        subjectId: 'trabalho',
        topics: ['Duração do Trabalho'],
      },
    ],
    guidance: studyGuidance,
  },
  {
    day: 17,
    week: 3,
    kind: 'study',
    title: 'Dia 17 — Competência, provas e honorários na advocacia',
    blocks: [
      {
        subjectId: 'processo-penal',
        topics: ['Competência', 'Provas'],
      },
      {
        subjectId: 'etica',
        topics: ['Honorários Advocatícios', 'Incompatibilidades', 'Impedimentos'],
      },
    ],
    guidance: studyGuidance,
  },
  {
    day: 18,
    week: 3,
    kind: 'study',
    title: 'Dia 18 — Procedimento comum e imunidades tributárias',
    blocks: [
      {
        subjectId: 'processo-civil',
        topics: ['Procedimento Comum'],
      },
      {
        subjectId: 'tributario',
        topics: ['Imunidades Tributárias'],
      },
    ],
    guidance: studyGuidance,
  },
  {
    day: 19,
    week: 3,
    kind: 'study',
    title: 'Dia 19 — Improbidade, ilicitude e culpabilidade',
    blocks: [
      {
        subjectId: 'administrativo',
        topics: ['Improbidade Administrativa'],
      },
      {
        subjectId: 'penal',
        topics: ['Ilicitude', 'Culpabilidade'],
      },
    ],
    guidance: studyGuidance,
  },
  {
    day: 20,
    week: 3,
    kind: 'review',
    title: 'Revisão semanal 3',
    blocks: [],
    guidance: reviewGuidance,
  },
  {
    day: 21,
    week: 3,
    kind: 'mock',
    title: 'Simulado da semana 3',
    blocks: [],
    guidance: mockGuidance,
  },
  {
    day: 22,
    week: 4,
    kind: 'study',
    title: 'Dia 22 — Poder Legislativo, processo legislativo e execução trabalhista',
    blocks: [
      {
        subjectId: 'constitucional',
        topics: ['Poder Legislativo', 'Processo Legislativo'],
      },
      {
        subjectId: 'processo-trabalho',
        topics: ['Execução', 'Ações Especiais'],
      },
    ],
    guidance: studyGuidance,
  },
  {
    day: 23,
    week: 4,
    kind: 'study',
    title: 'Dia 23 — Responsabilidade, família patrimonial, estabilidade e salário',
    blocks: [
      {
        subjectId: 'civil',
        topics: ['Responsabilidade Civil', 'Família — Direito Patrimonial'],
      },
      {
        subjectId: 'trabalho',
        topics: ['Estabilidade', 'Remuneração e Salário'],
      },
    ],
    guidance: studyGuidance,
  },
  {
    day: 24,
    week: 4,
    kind: 'study',
    title: 'Dia 24 — Prisão, cautelares, liberdade, procedimentos e disciplina da advocacia',
    blocks: [
      {
        subjectId: 'processo-penal',
        topics: ['Prisão', 'Medidas Cautelares', 'Liberdade Provisória', 'Procedimentos no CPP'],
      },
      {
        subjectId: 'etica',
        topics: ['Infrações Disciplinares', 'Sanções Disciplinares', 'Processo Administrativo Disciplinar'],
      },
    ],
    guidance: studyGuidance,
  },
  {
    day: 25,
    week: 4,
    kind: 'study',
    title: 'Dia 25 — Execução civil e impostos por ente federativo',
    blocks: [
      {
        subjectId: 'processo-civil',
        topics: ['Execução'],
      },
      {
        subjectId: 'tributario',
        topics: ['Impostos Federais', 'Impostos Estaduais', 'Impostos Municipais'],
      },
    ],
    guidance: studyGuidance,
  },
  {
    day: 26,
    week: 4,
    kind: 'study',
    title: 'Dia 26 — Serviços públicos, PPP, penas e concurso de crimes',
    blocks: [
      {
        subjectId: 'administrativo',
        topics: ['Serviços Públicos', 'Parcerias Público-Privadas'],
      },
      {
        subjectId: 'penal',
        topics: ['Penas', 'Concurso de Crimes'],
      },
    ],
    guidance: studyGuidance,
  },
  {
    day: 27,
    week: 4,
    kind: 'review',
    title: 'Revisão semanal 4',
    blocks: [],
    guidance: reviewGuidance,
  },
  {
    day: 28,
    week: 4,
    kind: 'mock',
    title: 'Simulado da semana 4',
    blocks: [],
    guidance: mockGuidance,
  },
  {
    day: 29,
    week: 5,
    kind: 'study',
    title: 'Dia 29 — Controle de constitucionalidade e crimes contra a vida',
    blocks: [
      {
        subjectId: 'constitucional',
        topics: ['Controle de Constitucionalidade'],
      },
      {
        subjectId: 'penal',
        topics: ['Crimes contra a Vida'],
      },
    ],
    guidance: studyGuidance,
  },
  {
    day: 30,
    week: 5,
    kind: 'study',
    title: 'Dia 30 — Recursos e ações autônomas nos processos civil e penal',
    blocks: [
      {
        subjectId: 'processo-civil',
        topics: ['Recursos', 'Ações Autônomas de Impugnação'],
      },
      {
        subjectId: 'processo-penal',
        topics: ['Recursos', 'Ações Autônomas de Impugnação'],
      },
    ],
    guidance: studyGuidance,
  },
  {
    day: 31,
    week: 5,
    kind: 'study',
    title: 'Dia 31 — Publicidade na advocacia e sucessão',
    blocks: [
      {
        subjectId: 'etica',
        topics: ['Publicidade Profissional'],
      },
      {
        subjectId: 'civil',
        topics: ['Sucessão Legítima', 'Sucessão Testamentária'],
      },
    ],
    guidance: studyGuidance,
  },
  {
    day: 32,
    week: 5,
    kind: 'study',
    title: 'Dia 32 — Licitações, contratos administrativos e extinção do contrato de trabalho',
    blocks: [
      {
        subjectId: 'administrativo',
        topics: ['Licitações', 'Contratos'],
      },
      {
        subjectId: 'trabalho',
        topics: ['Extinção do Contrato de Trabalho'],
      },
    ],
    guidance: studyGuidance,
  },
  {
    day: 33,
    week: 5,
    kind: 'study',
    title: 'Dia 33 — Defesa do Estado, ordem social e crimes contra patrimônio e Administração Pública',
    blocks: [
      {
        subjectId: 'constitucional',
        topics: ['Defesa do Estado', 'Ordem Social'],
      },
      {
        subjectId: 'penal',
        topics: ['Crimes contra o Patrimônio', 'Crimes contra a Administração Pública'],
      },
    ],
    guidance: studyGuidance,
  },
  {
    day: 34,
    week: 5,
    kind: 'review',
    title: 'Revisão semanal 5 — início da revisão final',
    blocks: [],
    guidance: reviewGuidance,
  },
  {
    day: 35,
    week: 5,
    kind: 'mock',
    title: 'Simulado da semana 5',
    blocks: [],
    guidance: mockGuidance,
  },
  {
    day: 36,
    week: 6,
    kind: 'review',
    title: 'Revisão final — Administrativo e Tributário',
    blocks: [
      {
        subjectId: 'administrativo',
        topics: ['Organização da Administração Pública', 'Agentes Públicos', 'Improbidade Administrativa', 'Serviços Públicos', 'Parcerias Público-Privadas', 'Licitações', 'Contratos'],
      },
      {
        subjectId: 'tributario',
        topics: ['Competência', 'Princípios Tributários', 'Conceito de Tributo', 'Espécies Tributárias', 'Imunidades Tributárias', 'Impostos Federais', 'Impostos Estaduais', 'Impostos Municipais'],
      },
    ],
    guidance: reviewGuidance,
  },
  {
    day: 37,
    week: 6,
    kind: 'review',
    title: 'Revisão final — Constitucional',
    blocks: [
      {
        subjectId: 'constitucional',
        topics: [
          'Teoria da Constituição',
          'Direitos e Garantias Fundamentais',
          'Remédios Constitucionais',
          'Nacionalidade',
          'Repartição de Competência',
          'Poder Legislativo',
          'Processo Legislativo',
          'Controle de Constitucionalidade',
          'Defesa do Estado',
          'Ordem Social',
        ],
      },
    ],
    guidance: reviewGuidance,
  },
  {
    day: 38,
    week: 6,
    kind: 'review',
    title: 'Revisão final — Ética',
    blocks: [
      {
        subjectId: 'etica',
        topics: [
          'Atividades da Advocacia',
          'Mandato Judicial',
          'Inscrição na OAB',
          'Direitos e Prerrogativas',
          'Sociedade de Advogados',
          'Advogado Empregado',
          'Honorários Advocatícios',
          'Incompatibilidades',
          'Impedimentos',
          'Infrações Disciplinares',
          'Sanções Disciplinares',
          'Processo Administrativo Disciplinar',
          'Publicidade Profissional',
        ],
      },
    ],
    guidance: reviewGuidance,
  },
  {
    day: 39,
    week: 6,
    kind: 'review',
    title: 'Revisão final — Penal e Processo Penal',
    blocks: [
      {
        subjectId: 'penal',
        topics: [
          'Eficácia da Lei no Tempo',
          'Eficácia da Lei no Espaço',
          'Fato Típico',
          'Ilicitude',
          'Culpabilidade',
          'Penas',
          'Concurso de Crimes',
          'Crimes contra a Vida',
          'Crimes contra o Patrimônio',
          'Crimes contra a Administração Pública',
        ],
      },
      {
        subjectId: 'processo-penal',
        topics: [
          'Inquérito Policial',
          'Ação',
          'Competência',
          'Provas',
          'Prisão',
          'Medidas Cautelares',
          'Liberdade Provisória',
          'Procedimentos no CPP',
          'Recursos',
          'Ações Autônomas de Impugnação',
        ],
      },
    ],
    guidance: reviewGuidance,
  },
  {
    day: 40,
    week: 6,
    kind: 'review',
    title: 'Revisão final — Civil, Processo Civil, Trabalho e Processo do Trabalho',
    blocks: [
      {
        subjectId: 'civil',
        topics: [
          'Negócio Jurídico',
          'Modalidades de Obrigações',
          'Inadimplemento das Obrigações',
          'Contratos em Geral',
          'Espécies de Contratos',
          'Responsabilidade Civil',
          'Família — Direito Patrimonial',
          'Sucessão Legítima',
          'Sucessão Testamentária',
        ],
      },
      {
        subjectId: 'processo-civil',
        topics: [
          'Intervenção de Terceiros',
          'Litisconsórcio',
          'Tutela Provisória',
          'Procedimento Comum',
          'Execução',
          'Recursos',
          'Ações Autônomas de Impugnação',
        ],
      },
      {
        subjectId: 'trabalho',
        topics: [
          'Contrato de Trabalho',
          'Empregador',
          'Interrupção do Contrato',
          'Suspensão do Contrato',
          'Alteração do Contrato',
          'Duração do Trabalho',
          'Estabilidade',
          'Remuneração e Salário',
          'Extinção do Contrato de Trabalho',
        ],
      },
      {
        subjectId: 'processo-trabalho',
        topics: [
          'Despesas Processuais',
          'Ação',
          'Defesa',
          'Audiência',
          'Recursos',
          'Execução',
          'Ações Especiais',
        ],
      },
    ],
    guidance: reviewGuidance,
  },
];
