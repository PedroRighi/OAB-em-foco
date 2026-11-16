export type Subject = {
  id: string;
  title: string;
  shortTitle: string;
  material: string;
  group: 'Núcleo mínimo do edital' | 'Demais disciplinas';
  category: string;
};

export const subjects: Subject[] = [
  { id: 'etica', title: 'Ética Profissional', shortTitle: 'Ética', material: '00-etica.md', group: 'Núcleo mínimo do edital', category: 'Ética e OAB' },
  { id: 'constitucional', title: 'Direito Constitucional', shortTitle: 'Constitucional', material: '01-constitucional.md', group: 'Demais disciplinas', category: 'Direito público' },
  { id: 'direitos-humanos', title: 'Direitos Humanos', shortTitle: 'Direitos Humanos', material: '02-direitos-humanos.md', group: 'Núcleo mínimo do edital', category: 'Direito público' },
  { id: 'internacional', title: 'Direito Internacional', shortTitle: 'Internacional', material: '03-internacional.md', group: 'Demais disciplinas', category: 'Direito público' },
  { id: 'tributario', title: 'Direito Tributário', shortTitle: 'Tributário', material: '04-tributario.md', group: 'Demais disciplinas', category: 'Direito público' },
  { id: 'administrativo', title: 'Direito Administrativo', shortTitle: 'Administrativo', material: '05-administrativo.md', group: 'Demais disciplinas', category: 'Direito público' },
  { id: 'ambiental', title: 'Direito Ambiental', shortTitle: 'Ambiental', material: '06-ambiental.md', group: 'Demais disciplinas', category: 'Direito público' },
  { id: 'civil', title: 'Direito Civil', shortTitle: 'Civil', material: '07-civil.md', group: 'Demais disciplinas', category: 'Direito privado' },
  { id: 'eca', title: 'Estatuto da Criança e do Adolescente', shortTitle: 'ECA', material: '08-eca.md', group: 'Demais disciplinas', category: 'Direito privado' },
  { id: 'consumidor', title: 'Direito do Consumidor', shortTitle: 'Consumidor', material: '09-consumidor.md', group: 'Demais disciplinas', category: 'Direito privado' },
  { id: 'empresarial', title: 'Direito Empresarial', shortTitle: 'Empresarial', material: '10-empresarial.md', group: 'Demais disciplinas', category: 'Direito privado' },
  { id: 'processo-civil', title: 'Direito Processual Civil', shortTitle: 'Processo Civil', material: '11-processo-civil.md', group: 'Demais disciplinas', category: 'Processo' },
  { id: 'penal', title: 'Direito Penal', shortTitle: 'Penal', material: '12-penal.md', group: 'Demais disciplinas', category: 'Direito público' },
  { id: 'processo-penal', title: 'Direito Processual Penal', shortTitle: 'Processo Penal', material: '13-processo-penal.md', group: 'Demais disciplinas', category: 'Processo' },
  { id: 'previdenciario', title: 'Direito Previdenciário', shortTitle: 'Previdenciário', material: '14-previdenciario.md', group: 'Demais disciplinas', category: 'Direito público' },
  { id: 'eleitoral', title: 'Direito Eleitoral', shortTitle: 'Eleitoral', material: '15-eleitoral.md', group: 'Demais disciplinas', category: 'Direito público' },
  { id: 'financeiro', title: 'Direito Financeiro', shortTitle: 'Financeiro', material: '16-financeiro.md', group: 'Demais disciplinas', category: 'Direito público' },
  { id: 'trabalho', title: 'Direito do Trabalho', shortTitle: 'Trabalho', material: '17-trabalho.md', group: 'Demais disciplinas', category: 'Direito social' },
  { id: 'processo-trabalho', title: 'Direito Processual do Trabalho', shortTitle: 'Processo do Trabalho', material: '18-processo-trabalho.md', group: 'Demais disciplinas', category: 'Processo' },
  { id: 'filosofia', title: 'Filosofia do Direito', shortTitle: 'Filosofia', material: '19-filosofia.md', group: 'Núcleo mínimo do edital', category: 'Formação geral' },
];

export const subjectById = Object.fromEntries(subjects.map((subject) => [subject.id, subject])) as Record<string, Subject>;
