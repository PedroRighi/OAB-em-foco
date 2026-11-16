export type ScheduleDay = {
  day: number;
  date: Date;
  key: string;
  focus: string;
  study: string;
  timeNotes: string;
};

export function toDateKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}

export function makeDate(year: number, monthIndex: number, day: number): Date {
  return new Date(Date.UTC(year, monthIndex, day));
}

export function brazilToday(now = new Date()): Date {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return makeDate(Number(values.year), Number(values.month) - 1, Number(values.day));
}

export function parseBrazilianDate(value: string): Date {
  const parts = value.split('/').map(Number);
  const day = parts[0] ?? 1;
  const month = parts[1] ?? 1;
  const year = parts[2] ?? 2026;
  return makeDate(year, month - 1, day);
}

export function formatDate(date: Date, options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }): string {
  return new Intl.DateTimeFormat('pt-BR', { ...options, timeZone: 'UTC' }).format(date);
}

export function dayDifference(start: Date, end: Date): number {
  return Math.round((Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate())
    - Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate())) / 86_400_000);
}

export function createIntensiveDates(): ScheduleDay[] {
  return Array.from({ length: 40 }, (_, index) => {
    const date = makeDate(2026, 10, 23 + index);
    return {
      day: index + 1,
      date,
      key: `intensive-${index + 1}`,
      focus: 'Estudo de duas disciplinas selecionadas',
      study: 'Revisar os tópicos previstos para o ciclo e resolver questões do conteúdo estudado.',
      timeNotes: 'Organize o bloco diário entre revisão, aula ou leitura e questões, respeitando a rotina disponível.',
    };
  });
}

export function createReviewDays(): ScheduleDay[] {
  const focuses = ['Caderno de erros e pontos críticos', 'Revisão das quatro matérias de maior dificuldade', 'Questões dos conteúdos estudados', 'Revisão de Ética e Estatuto', 'Revisão de Direito Público', 'Revisão de Direito Privado e Processos', 'Simulado e análise dos erros', 'Revisão leve e preparação logística'] as const;
  return Array.from({ length: 8 }, (_, index) => {
    const date = makeDate(2027, 0, 2 + index);
    return {
      day: index + 1,
      date,
      key: `review-${index + 1}`,
      focus: focuses[index] ?? 'Revisão final',
      study: 'Priorize os tópicos que você marcou para revisar e consulte o texto legal atualizado. Evite iniciar um conteúdo extenso novo na véspera.',
      timeNotes: 'Ajuste o tempo ao seu ritmo; reserve pausas e respeite seu descanso.',
    };
  });
}

export function intensivePair(subjectIds: string[], dayIndex: number): string[] {
  if (subjectIds.length !== 10) return [];
  const first = (dayIndex * 2) % subjectIds.length;
  const second = (first + 3) % subjectIds.length;
  const firstSubject = subjectIds[first];
  const secondSubject = subjectIds[second];
  return firstSubject && secondSubject ? [firstSubject, secondSubject] : [];
}

export function daysUntilExam(now = new Date()): number {
  return dayDifference(brazilToday(now), makeDate(2027, 0, 10));
}
