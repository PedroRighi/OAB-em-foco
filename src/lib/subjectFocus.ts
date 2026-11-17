import type { Subject } from '../data/subjects';

function normalizeSubjectText(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLocaleLowerCase('pt-BR');
}

function subjectLabels(subject: Subject): string[] {
  return [subject.shortTitle, subject.title].map(normalizeSubjectText);
}

export function resolveSubjectFromFocus(focus: string, subjectList: Subject[]): Subject | undefined {
  const firstSegment = focus.split('+', 1)[0] ?? focus;
  const normalizedFirstSegment = normalizeSubjectText(firstSegment);
  const exactMatch = subjectList.find((subject) => subjectLabels(subject).some((label) => label === normalizedFirstSegment));
  if (exactMatch) return exactMatch;

  const normalizedFocus = normalizeSubjectText(focus);
  return [...subjectList]
    .sort((left, right) => Math.max(...subjectLabels(right).map((label) => label.length)) - Math.max(...subjectLabels(left).map((label) => label.length)))
    .find((subject) => subjectLabels(subject).some((label) => normalizedFocus.includes(label)));
}
