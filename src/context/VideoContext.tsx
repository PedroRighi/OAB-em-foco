import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import privateVideoCatalog from '../data/privateVideoCatalog.json';
import { unlockVideoKey } from '../lib/privateVideoCrypto';
import { getVideoTime, loadVideoProgress, saveVideoProgress, setVideoTime } from '../lib/videoProgress';
import type { VideoProgress } from '../lib/videoProgress';

export type VideoEncryption = {
  salt: string;
  iterations: number;
  checkIv: string;
  checkCiphertext: string;
};

export type PrivateVideoLesson = {
  id: string;
  title: string;
  subject: string;
  subjectSlug: string | null;
  durationSeconds: number;
  playlistPath: string;
};

type PrivateVideoCatalog = {
  version: number;
  encryption: VideoEncryption;
  lessons: PrivateVideoLesson[];
};

const catalog = privateVideoCatalog as PrivateVideoCatalog;

export type VideoSupport = {
  supported: boolean;
  reason: string | null;
};

export function getVideoSupport(): VideoSupport {
  if (typeof window === 'undefined') return { supported: true, reason: null };

  const userAgent = window.navigator?.userAgent ?? '';
  const isIPhone = /iPhone/i.test(userAgent);
  const isSafari = /Safari/i.test(userAgent) && !/(CriOS|FxiOS|EdgiOS|OPiOS|Chrome|Firefox)/i.test(userAgent);
  if (isIPhone && isSafari) {
    const versionMatch = userAgent.match(/Version\/(\d+)(?:\.(\d+))?/i);
    const major = Number(versionMatch?.[1] ?? 0);
    const minor = Number(versionMatch?.[2] ?? 0);
    if (major < 17 || (major === 17 && minor < 1)) {
      return { supported: false, reason: 'No Safari do iPhone, o streaming criptografado exige iOS 17.1 ou mais recente.' };
    }
  }

  if (!window.crypto?.subtle) {
    return { supported: false, reason: 'Este navegador não oferece WebCrypto para abrir as aulas com segurança.' };
  }

  const browserWindow = window as Window & typeof globalThis & { ManagedMediaSource?: typeof MediaSource };
  if (!('MediaSource' in window) && !browserWindow.ManagedMediaSource) {
    return { supported: false, reason: 'Este navegador não oferece MediaSource/ManagedMediaSource para streaming.' };
  }

  return { supported: true, reason: null };
}

type VideoContextValue = {
  lessons: PrivateVideoLesson[];
  isUnlocked: boolean;
  unlocking: boolean;
  error: string | null;
  activeLessonId: string | null;
  activeLesson: PrivateVideoLesson | null;
  videoProgress: VideoProgress;
  support: VideoSupport;
  unlock: (code: string) => Promise<boolean>;
  lock: () => void;
  openLesson: (lessonId: string) => void;
  closePlayer: () => void;
  getVideoKey: () => CryptoKey | null;
  getProgressTime: (lessonId: string) => number;
  savePosition: (lessonId: string, time: number, force?: boolean) => boolean;
  retryUnlock: () => void;
};

const VideoContext = createContext<VideoContextValue | null>(null);

export function VideoProvider({ children }: { children: ReactNode }) {
  const [videoKey, setVideoKey] = useState<CryptoKey | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [videoProgress, setVideoProgress] = useState<VideoProgress>(loadVideoProgress);
  const progressRef = useRef(videoProgress);
  const lastSavedAtRef = useRef(new Map<string, number>());
  const unlockAttemptRef = useRef(0);
  progressRef.current = videoProgress;

  const support = useMemo(getVideoSupport, []);

  const unlock = useCallback(async (code: string): Promise<boolean> => {
    setError(null);
    // Deliberately do not trim: the access code is an exact passphrase.
    if (code.length < 20) {
      setError('O código precisa ter pelo menos 20 caracteres.');
      return false;
    }
    if (!support.supported) {
      setError(support.reason ?? 'Este navegador não é compatível com o streaming privado.');
      return false;
    }

    const attempt = ++unlockAttemptRef.current;
    setUnlocking(true);
    try {
      const key = await unlockVideoKey(code, catalog.encryption);
      if (attempt !== unlockAttemptRef.current) return false;
      setVideoKey(key);
      setActiveLessonId(null);
      setError(null);
      return true;
    } catch {
      if (attempt === unlockAttemptRef.current) setError('Código inválido. Confira o código e tente novamente.');
      return false;
    } finally {
      if (attempt === unlockAttemptRef.current) setUnlocking(false);
    }
  }, [support]);

  const lock = useCallback(() => {
    ++unlockAttemptRef.current;
    setUnlocking(false);
    setVideoKey(null);
    setActiveLessonId(null);
    setError(null);
  }, []);

  const openLesson = useCallback((lessonId: string) => {
    if (!videoKey) {
      setError('Desbloqueie as aulas com o código de acesso antes de assistir.');
      return;
    }
    if (!catalog.lessons.some((lesson) => lesson.id === lessonId)) return;
    setError(null);
    setActiveLessonId(lessonId);
  }, [videoKey]);

  const closePlayer = useCallback(() => {
    setActiveLessonId(null);
  }, []);

  const getVideoKey = useCallback(() => videoKey, [videoKey]);

  const getProgressTime = useCallback((lessonId: string) => getVideoTime(lessonId, progressRef.current), []);

  const savePosition = useCallback((lessonId: string, time: number, force = false): boolean => {
    if (!lessonId || !Number.isFinite(time) || time < 0) return false;
    const now = Date.now();
    const lastSavedAt = lastSavedAtRef.current.get(lessonId) ?? 0;
    if (!force && now - lastSavedAt < 5000) return false;

    const nextProgress = setVideoTime(lessonId, time, progressRef.current);
    progressRef.current = nextProgress;
    setVideoProgress(nextProgress);
    lastSavedAtRef.current.set(lessonId, now);
    // A blocked localStorage must not interrupt playback; in-memory progress still works.
    return saveVideoProgress(nextProgress);
  }, []);

  const retryUnlock = useCallback(() => setError(null), []);

  const activeLesson = useMemo(
    () => catalog.lessons.find((lesson) => lesson.id === activeLessonId) ?? null,
    [activeLessonId],
  );

  const value = useMemo<VideoContextValue>(() => ({
    lessons: catalog.lessons,
    isUnlocked: Boolean(videoKey),
    unlocking,
    error,
    activeLessonId,
    activeLesson,
    videoProgress,
    support,
    unlock,
    lock,
    openLesson,
    closePlayer,
    getVideoKey,
    getProgressTime,
    savePosition,
    retryUnlock,
  }), [activeLesson, activeLessonId, closePlayer, error, getProgressTime, getVideoKey, lock, openLesson, retryUnlock, savePosition, support, unlock, unlocking, videoKey, videoProgress]);

  return <VideoContext.Provider value={value}>{children}</VideoContext.Provider>;
}

export function useVideo(): VideoContextValue {
  const context = useContext(VideoContext);
  if (!context) throw new Error('useVideo precisa estar dentro de VideoProvider');
  return context;
}
