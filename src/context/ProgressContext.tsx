import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { emptyProgress, loadProgress, saveProgress } from '../lib/progress';
import type { StudyProgress } from '../lib/progress';

type ProgressContextValue = {
  progress: StudyProgress;
  updateProgress: (updater: (previous: StudyProgress) => StudyProgress) => void;
  resetProgress: () => void;
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<StudyProgress>(loadProgress);
  const hasUserChange = useRef(false);

  useEffect(() => {
    // Opening the portal must not rewrite the user's previously saved data.
    if (hasUserChange.current) saveProgress(progress);
  }, [progress]);

  const updateProgress = useCallback((updater: (previous: StudyProgress) => StudyProgress) => {
    hasUserChange.current = true;
    setProgress(updater);
  }, []);

  const resetProgress = useCallback(() => {
    hasUserChange.current = true;
    setProgress(emptyProgress);
  }, []);

  const value = useMemo(() => ({ progress, updateProgress, resetProgress }), [progress, updateProgress, resetProgress]);
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const context = useContext(ProgressContext);
  if (!context) throw new Error('useProgress precisa estar dentro de ProgressProvider');
  return context;
}
