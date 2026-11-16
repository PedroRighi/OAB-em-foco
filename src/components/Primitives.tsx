import type { ReactNode } from 'react';
import { ArrowUpRight, Check, Info } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export function PageHeader({ eyebrow, title, description, action }: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action && <div className="page-header-action">{action}</div>}
    </header>
  );
}

export function StatCard({ icon: Icon, label, value, detail, tone = 'teal' }: {
  icon: LucideIcon;
  label: string;
  value: string;
  detail?: string;
  tone?: 'teal' | 'gold' | 'ink' | 'rose';
}) {
  return (
    <article className={`stat-card stat-card-${tone}`}>
      <div className="stat-card-top"><span>{label}</span><Icon size={17} aria-hidden="true" /></div>
      <strong>{value}</strong>
      {detail && <small>{detail}</small>}
    </article>
  );
}

export function ProgressBar({ value, max, label, compact = false }: {
  value: number;
  max: number;
  label?: string;
  compact?: boolean;
}) {
  const safeMax = Math.max(max, 1);
  const percent = Math.min(100, Math.max(0, Math.round((value / safeMax) * 100)));
  return (
    <div className={`progress-wrap${compact ? ' progress-wrap-compact' : ''}`}>
      {label && <div className="progress-label"><span>{label}</span><span>{value}/{max}</span></div>}
      <div className="progress-track" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={label ?? 'Progresso'}>
        <span style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'teal' | 'gold' | 'green' | 'rose' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function InfoNote({ children, tone = 'default' }: { children: ReactNode; tone?: 'default' | 'warm' }) {
  return (
    <div className={`info-note info-note-${tone}`}>
      <Info size={18} aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, detail, children }: {
  icon?: LucideIcon;
  title: string;
  detail?: string;
  children?: ReactNode;
}) {
  const Mark = Icon ?? Check;
  return (
    <div className="empty-state">
      <div className="empty-state-mark"><Mark size={22} aria-hidden="true" /></div>
      <h3>{title}</h3>
      {detail && <p>{detail}</p>}
      {children}
    </div>
  );
}

export function ExternalLink({ href, children, className = '' }: { href: string; children: ReactNode; className?: string }) {
  return <a className={className} href={href} target="_blank" rel="noopener noreferrer">{children}<ArrowUpRight size={14} aria-hidden="true" /></a>;
}
