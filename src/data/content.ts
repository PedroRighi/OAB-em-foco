import type { Subject } from './subjects';
import { topicCounts } from './topicCounts';

const materials = import.meta.glob('../content/materials/*.md', {
  query: '?raw',
  import: 'default',
}) as Record<string, () => Promise<string>>;

export type StudyTopic = { id: string; title: string };

export function slugify(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export async function getMaterial(subject: Subject): Promise<string> {
  const loader = Object.entries(materials).find(([path]) => path.endsWith(`/${subject.material}`))?.[1];
  return loader ? loader() : `# ${subject.title}\n\nO material desta disciplina ainda não está disponível.`;
}

const excludedTopics = /^(como usar|mapa dos tópicos centrais|mapa da disciplina|questões|gabarito|referências|referencias|checklist|revisão|revisao|fontes|bibliografia|atualizações e jurisprudência|alterações e jurisprudência|método de leitura|como ler questões|como resolver questões|como estudar)/i;

export function getStudyTopics(markdown: string): StudyTopic[] {
  return markdown.split('\n')
    .filter((line) => /^##\s+/.test(line) && !/^###/.test(line))
    .map((line) => line.replace(/^##\s+/, '').trim())
    .filter((title) => title && !excludedTopics.test(title))
    .map((title) => ({ id: slugify(title), title }));
}

export function getTopicCount(subjectId: string): number {
  return topicCounts[subjectId] ?? 0;
}
