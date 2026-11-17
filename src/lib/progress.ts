export type PlanMode = 'ceisc' | 'intensive';
export type IntensivePlanVariant = 'reference' | 'custom';

export type QuizResult = {
  id: string;
  completedAt: string;
  correct: number;
  total: number;
  mode?: 'weekly' | 'subject';
  subjectIds: string[];
  questionIds: string[];
  answers: Record<string, string>;
};

export type StudyProgress = {
  version: 1;
  completedSubjects: string[];
  completedTopics: Record<string, string[]>;
  planMode: PlanMode;
  startedPlanModes: PlanMode[];
  ceiscDaysCompleted: string[];
  intensivePlanVariant: IntensivePlanVariant;
  intensiveSubjectIds: string[];
  intensiveDaysCompleted: string[];
  referencePlanStarted: boolean;
  referenceDaysCompleted: string[];
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
  startedPlanModes: [],
  ceiscDaysCompleted: [],
  intensivePlanVariant: 'reference',
  intensiveSubjectIds: [],
  intensiveDaysCompleted: [],
  referencePlanStarted: false,
  referenceDaysCompleted: [],
  selectedWeekSubjects: [],
  weeklyTopics: '',
  quizResults: [],
};

export function quizPassTarget(total: number): number {
  return Math.ceil(total * 0.9);
}

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
    const ceiscDaysCompleted = stringList(saved.ceiscDaysCompleted);
    const intensiveDaysCompleted = stringList(saved.intensiveDaysCompleted);
    const startedPlanModes: PlanMode[] = stringList(saved.startedPlanModes).filter(
      (mode): mode is PlanMode => mode === 'ceisc' || mode === 'intensive',
    );
    if (ceiscDaysCompleted.length > 0 && !startedPlanModes.includes('ceisc')) startedPlanModes.push('ceisc');
    if (intensiveDaysCompleted.length > 0 && !startedPlanModes.includes('intensive')) startedPlanModes.push('intensive');
    const intensiveSubjectIds = stringList(saved.intensiveSubjectIds);
    const hadCustomPlan = intensiveSubjectIds.length > 0 || intensiveDaysCompleted.length > 0 || startedPlanModes.includes('intensive');
    const intensivePlanVariant = saved.intensivePlanVariant === 'reference' || saved.intensivePlanVariant === 'custom'
      ? saved.intensivePlanVariant : hadCustomPlan ? 'custom' : 'reference';
    const referenceDaysCompleted = stringList(saved.referenceDaysCompleted);
    const quizResults = Array.isArray(saved.quizResults)
      ? saved.quizResults.filter((item): item is QuizResult => Boolean(
          item && typeof item.id === 'string' && typeof item.completedAt === 'string'
          && typeof item.correct === 'number' && Array.isArray(item.subjectIds)
          && Array.isArray(item.questionIds) && item.answers && typeof item.answers === 'object',
        ))
      : [];
    return {
      ...saved,
      version: 1,
      completedSubjects: stringList(saved.completedSubjects),
      completedTopics,
      planMode,
      startedPlanModes,
      ceiscDaysCompleted,
      intensivePlanVariant,
      intensiveSubjectIds,
      intensiveDaysCompleted,
      referencePlanStarted: saved.referencePlanStarted === true || referenceDaysCompleted.length > 0,
      referenceDaysCompleted,
      selectedWeekSubjects: stringList(saved.selectedWeekSubjects),
      weeklyTopics: typeof saved.weeklyTopics === 'string' ? saved.weeklyTopics : '',
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
