export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

// A aparência não compartilha armazenamento com o progresso de estudo.
export const THEME_KEY = 'oab-em-foco-theme-v1';
export const SYSTEM_THEME_QUERY = '(prefers-color-scheme: dark)';

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system';
}

export function readThemePreference(): ThemePreference {
  try {
    const saved = window.localStorage.getItem(THEME_KEY);
    return isThemePreference(saved) ? saved : 'system';
  } catch {
    return 'system';
  }
}

export function resolveTheme(preference: ThemePreference, systemDark: boolean): ResolvedTheme {
  return preference === 'system' ? (systemDark ? 'dark' : 'light') : preference;
}

export function systemPrefersDark(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    && window.matchMedia(SYSTEM_THEME_QUERY).matches;
}

export function applyTheme(preference: ThemePreference): ResolvedTheme {
  const resolved = resolveTheme(preference, systemPrefersDark());
  document.documentElement.dataset.theme = resolved;
  document.documentElement.style.colorScheme = resolved;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', resolved === 'dark' ? '#101a18' : '#f6f5f0');
  return resolved;
}

export function saveThemePreference(preference: ThemePreference): boolean {
  try {
    window.localStorage.setItem(THEME_KEY, preference);
    return true;
  } catch {
    // A troca funciona nesta visita mesmo sem permissão de armazenamento.
    return false;
  }
}
