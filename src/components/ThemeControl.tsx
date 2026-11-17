import { useEffect, useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import {
  applyTheme, isThemePreference, readThemePreference, saveThemePreference,
  SYSTEM_THEME_QUERY, THEME_KEY,
} from '../lib/theme';
import type { ThemePreference } from '../lib/theme';

export default function ThemeControl() {
  const [preference, setPreference] = useState<ThemePreference>(readThemePreference);
  const [storageUnavailable, setStorageUnavailable] = useState(false);

  useEffect(() => {
    applyTheme(preference);
    if (preference !== 'system' || typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia(SYSTEM_THEME_QUERY);
    const updateFromSystem = () => applyTheme('system');
    media.addEventListener('change', updateFromSystem);
    return () => media.removeEventListener('change', updateFromSystem);
  }, [preference]);

  useEffect(() => {
    const syncFromAnotherTab = (event: StorageEvent) => {
      if (event.key !== THEME_KEY) return;
      const next = isThemePreference(event.newValue) ? event.newValue : 'system';
      applyTheme(next);
      setPreference(next);
    };
    window.addEventListener('storage', syncFromAnotherTab);
    return () => window.removeEventListener('storage', syncFromAnotherTab);
  }, []);

  function changeTheme(value: string) {
    if (!isThemePreference(value)) return;
    applyTheme(value);
    setPreference(value);
    setStorageUnavailable(!saveThemePreference(value));
  }

  const Icon = preference === 'dark' ? Moon : preference === 'light' ? Sun : Monitor;
  return (
    <div className="theme-control">
      <label className="theme-picker" htmlFor="appearance-theme">
        <Icon size={16} aria-hidden="true" />
        <span className="sr-only">Acessibilidade visual: tema de aparência</span>
        <select id="appearance-theme" value={preference} onChange={(event) => changeTheme(event.target.value)} aria-describedby="appearance-hint">
          <option value="light">Claro</option>
          <option value="dark">Escuro</option>
          <option value="system">Automático</option>
        </select>
      </label>
      <span id="appearance-hint" className="sr-only">Automático acompanha o tema do dispositivo. A aparência não altera seu progresso de estudo.</span>
      <span className="sr-only" role="status">{storageUnavailable ? 'Aparência aplicada nesta visita. Não foi possível salvar a preferência neste navegador.' : ''}</span>
    </div>
  );
}
