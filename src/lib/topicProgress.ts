import studyTopicIds from '../data/studyTopicIds.json';

type Topic = { id: string };
const idsBySubject = studyTopicIds as Record<string, string[]>;

// O estado bruto é preservado. Só os IDs do conteúdo atual entram na contagem.
export function getReviewedTopicIds(savedIds: string[], topics: Topic[]): string[] {
  const saved = new Set(savedIds);
  return topics.filter((topic) => saved.has(topic.id)).map((topic) => topic.id);
}

export function getSubjectReviewedTopicCount(subjectId: string, savedIds: string[]): number {
  return getReviewedTopicIds(savedIds, (idsBySubject[subjectId] ?? []).map((id) => ({ id }))).length;
}

export function setAllTopicReviews(savedIds: string[], topics: Topic[], done: boolean): string[] {
  const activeIds = new Set(topics.map((topic) => topic.id));
  return done
    ? [...new Set([...savedIds, ...activeIds])]
    : savedIds.filter((id) => !activeIds.has(id));
}
