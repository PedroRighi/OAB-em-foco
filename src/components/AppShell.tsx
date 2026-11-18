import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { BookMarked, BookOpen, CalendarDays, ClipboardCheck, Compass, Home, LibraryBig, PlayCircle, Scale } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import ThemeControl from './ThemeControl';

const navigation: { label: string; to: string; icon: LucideIcon; match?: string }[] = [
  { label: 'Visão geral', to: '/', icon: Home },
  { label: 'Plano de estudo', to: '/plano', icon: CalendarDays },
  { label: 'Matérias', to: '/materias', icon: BookOpen, match: '/materias' },
  { label: 'Simulados', to: '/simulados', icon: ClipboardCheck },
  { label: 'Aulas', to: '/videoaulas', icon: PlayCircle },
  { label: 'Recursos', to: '/recursos', icon: Compass },
  { label: 'Biblioteca', to: '/biblioteca', icon: LibraryBig },
];

const routeNames: Record<string, string> = {
  '/': 'Visão geral', '/plano': 'Plano de estudo', '/materias': 'Matérias', '/simulados': 'Simulados',
  '/recursos': 'Recursos', '/biblioteca': 'Biblioteca', '/videoaulas': 'Videoaulas pessoais',
};

function getSection(pathname: string): string {
  if (pathname.startsWith('/materias/')) return 'Matéria';
  return routeNames[pathname] ?? 'OAB em Foco';
}

export default function AppShell() {
  const location = useLocation();
  const section = getSection(location.pathname);
  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Navegação principal">
        <NavLink to="/" className="brand-lockup" aria-label="OAB em Foco, página inicial">
          <img src="/oab-mark.svg" alt="" className="brand-mark" />
          <span><strong>OAB em Foco</strong><small>48º Exame · 1ª fase</small></span>
        </NavLink>
        <div className="sidebar-kicker">Seu espaço de estudo</div>
        <nav className="primary-nav">
          {navigation.map(({ label, to, icon: Icon, match }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav-link${isActive || (match && location.pathname.startsWith(match)) ? ' nav-link-active' : ''}`}
            >
              <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
              <span>{label}</span>
              {to === '/simulados' && <span className="nav-dot" aria-label="Novo" />}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-spacer" />
        <div className="sidebar-exam-card">
          <div className="sidebar-exam-icon"><Scale size={17} aria-hidden="true" /></div>
          <div><span>Próxima prova</span><strong>10 jan 2027</strong><small>Data prevista · OAB/FGV</small></div>
        </div>
        <div className="sidebar-footer"><BookMarked size={14} aria-hidden="true" /> Progresso só neste navegador</div>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <div className="topbar-breadcrumb"><span>OAB em Foco</span><span className="crumb-divider">/</span><strong>{section}</strong></div>
          <div className="topbar-right"><ThemeControl /><span className="open-access"><span /> Acesso livre</span><div className="profile-mark" aria-label="Sem conta ou login">OF</div></div>
        </header>
        <main id="main-content" className="main-content"><Outlet /></main>
        <footer className="site-footer"><span>OAB em Foco — material independente de estudo.</span><span>Sem conta. Sem paywall. Seu progresso fica no dispositivo.</span></footer>
      </div>

      <nav className="mobile-nav" aria-label="Navegação móvel">
        {navigation.map(({ label, to, icon: Icon, match }) => (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `mobile-nav-link${isActive || (match && location.pathname.startsWith(match)) ? ' mobile-nav-active' : ''}`}>
            <Icon size={18} strokeWidth={1.8} aria-hidden="true" /><span>{label === 'Visão geral' ? 'Início' : label === 'Plano de estudo' ? 'Plano' : label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
