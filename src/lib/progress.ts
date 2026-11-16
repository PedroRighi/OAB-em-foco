export type PlanMode = 'ceisc' | 'intensive';

export type QuizResult = {
  id: string;
  completedAt: string;
  correct: number;
  total: 20;
  subjectIds: string[];
  questionIds: string[];
  answers: Record<string, string>;
};

export type StudyProgress = {
  version: 1;
  completedSubjects: string[];
  completedTopics: Record<string, string[]>;
  planMode: PlanMode;
  ceiscDaysCompleted: string[];
  intensiveSubjectIds: string[];
  intensiveDaysCompleted: string[];
  selectedWeekSubjects: string[];
  weeklyTopics: string;
  quizResults: QuizResult[];
};

export const PROGRESS_KEY = 'oab-em-foco-48-progress-v1';

export const emptyProgress: StudyProgress = {
  version: 1,
  completedSubjects: [],
  completedTopics: {},
  planMode: 'ceisc',
  ceiscDaysCompleted: [],
  intensiveSubjectIds: [],
  intensiveDaysCompleted: [],
  selectedWeekSubjects: [],
  weeklyTopics: '',
  quizResults: [],
};

function stringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

export function loadProgress(): StudyProgress {
  if (typeof window === 'undefined') return emptyProgress;
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);
    if (!raw) return emptyProgress;
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object') return emptyProgress;
    const saved = value as Partial<StudyProgress>;
    const completedTopics = saved.completedTopics && typeof saved.completedTopics === 'object'
      ? Object.fromEntries(Object.entries(saved.completedTopics).map(([id, topics]) => [id, stringList(topics)]))
      : {};
    const planMode: PlanMode = saved.planMode === 'intensive' ? 'intensive' : 'ceisc';
    const quizResults = Array.isArray(saved.quizResults)
      ? saved.quizResults.filter((item): item is QuizResult => Boolean(
          item && typeof item.id === 'string' && typeof item.completedAt === 'string'
          && typeof item.correct === 'number' && Array.isArray(item.subjectIds)
          && Array.isArray(item.questionIds) && item.answers && typeof item.answers === 'object',
        )).slice(0, 30)
      : [];
    return {
      version: 1,
      completedSubjects: stringList(saved.completedSubjects),
      completedTopics,
      planMode,
      ceiscDaysCompleted: stringList(saved.ceiscDaysCompleted),
      intensiveSubjectIds: stringList(saved.intensiveSubjectIds).slice(0, 10),
      intensiveDaysCompleted: stringList(saved.intensiveDaysCompleted),
      selectedWeekSubjects: stringList(saved.selectedWeekSubjects),
      weeklyTopics: typeof saved.weeklyTopics === 'string' ? saved.weeklyTopics.slice(0, 3000) : '',
      quizResults,
    };
  } catch {
    return emptyProgress;
  }
}

export function saveProgress(progress: StudyProgress): void {
  try {
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // The site remains usable if browser storage is disabled or full.
  }
}
