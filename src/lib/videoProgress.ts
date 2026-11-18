export const VIDEO_PROGRESS_KEY = 'oab-em-foco-video-progress-v1';

export type VideoProgress = Record<string, number>;

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function isValidTime(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function sanitizeProgress(value: unknown): VideoProgress {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const result: VideoProgress = {};
  for (const [id, time] of Object.entries(value)) {
    if (id && isValidTime(time)) result[id] = time;
  }
  return result;
}

/** Reads only the independent video id -> seconds map. It never touches study progress. */
export function loadVideoProgress(): VideoProgress {
  const storage = getStorage();
  if (!storage) return {};
  try {
    const raw = storage.getItem(VIDEO_PROGRESS_KEY);
    return raw ? sanitizeProgress(JSON.parse(raw)) : {};
  } catch {
    return {};
  }
}

/** Saves only valid id/time pairs and fails softly when storage is blocked or full. */
export function saveVideoProgress(progress: VideoProgress): boolean {
  const storage = getStorage();
  if (!storage) return false;
  try {
    storage.setItem(VIDEO_PROGRESS_KEY, JSON.stringify(sanitizeProgress(progress)));
    return true;
  } catch {
    return false;
  }
}

export function getVideoTime(id: string, progress: VideoProgress = loadVideoProgress()): number {
  return isValidTime(progress[id]) ? progress[id] : 0;
}

export function setVideoTime(id: string, time: number, progress: VideoProgress = loadVideoProgress()): VideoProgress {
  if (!id || !isValidTime(time)) return sanitizeProgress(progress);
  return { ...sanitizeProgress(progress), [id]: time };
}

export function saveVideoTime(id: string, time: number): boolean {
  if (!id || !isValidTime(time)) return false;
  return saveVideoProgress(setVideoTime(id, time));
}

export function clearVideoProgress(): boolean {
  const storage = getStorage();
  if (!storage) return false;
  try {
    storage.removeItem(VIDEO_PROGRESS_KEY);
    return true;
  } catch {
    return false;
  }
}
