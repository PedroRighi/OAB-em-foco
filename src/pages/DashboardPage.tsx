import { ArrowRight, BookOpen, CalendarCheck, Clock3, GraduationCap, ShieldCheck, Sparkles, Target, Trash2, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { subjects } from '../data/subjects';
import { ceiscSchedule } from '../data/appData';
import { brazilToday, daysUntilExam, formatDate, parseBrazilianDate, toDateKey } from '../lib/schedule';
import { useProgress } from '../context/ProgressContext';
import { Badge, ProgressBar, StatCard } from '../components/Primitives';

function formatToday(): string {
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Sao_Paulo' })
    .format(new Date()).replace(/^./, (character) => character.toUpperCase());
}

export default function DashboardPage() {
  const { progress, resetProgress } = useProgress();
  const todayKey = toDateKey(brazilToday());
  const exactToday = ceiscSchedule.find((day) => toDateKey(parseBrazilianDate(day.date)) === todayKey);
  const fallbackDay = ceiscSchedule.find((day) => !progress.ceiscDaysCompleted.includes(String(day.day))) ?? ceiscSchedule[0];
  const todayPlan = exactToday ?? fallbackDay;
  const todaySubject = todayPlan ? subjects.find((subject) => todayPlan.focus.toLocaleLowerCase('pt-BR').includes(subject.shortTitle.toLocaleLowerCase('pt-BR'))) : undefined;
  const completedSubjects = progress.completedSubjects.length;
  const daysLeft = daysUntilExam();
  const latestQuiz = progress.quizResults[0];
  const dueLabel = daysLeft < 0 ? 'Prova prevista para 10 de janeiro de 2027' : daysLeft === 0 ? 'Prova prevista para hoje' : `${daysLeft} dias para a prova prevista`;

  return (
    <div className="page-stack dashboard-page">
      <div className="dashboard-date-row"><span>{formatToday()}</span><Badge tone="teal">48º Exame · 1ª fase</Badge></div>
      <section className="welcome-panel">
        <div className="welcome-copy">
          <span className="eyebrow welcome-eyebrow">UM PASSO DE CADA VEZ</span>
          <h1>Seu estudo,<br /><em>em foco.</em></h1>
          <p>Conteúdo por matéria, rotina que cabe no dia e progresso que fica só com você.</p>
          <div className="welcome-actions">
            <Link to={todaySubject ? `/materias/${todaySubject.id}` : '/materias'} className="button button-light">{todaySubject ? `Continuar ${todaySubject.shortTitle}` : 'Escolher uma matéria'} <ArrowRight size={16} /></Link>
            <Link to="/plano" className="button button-quiet">Ver meu plano</Link>
          </div>
        </div>
        <div className="welcome-side" aria-label={dueLabel}>
          <div className="countdown-ring"><strong>{Math.max(0, daysLeft)}</strong><span>dias</span></div>
          <span className="countdown-label">até a data prevista</span>
          <strong className="countdown-date">10 jan 2027</strong>
          <small>Confira o calendário OAB/FGV<br />para possíveis alterações.</small>
        </div>
        <div className="welcome-watermark">48</div>
      </section>

      <section className="stat-grid" aria-label="Seu progresso">
        <StatCard icon={BookOpen} label="Disciplinas" value={`${completedSubjects}/20`} detail="marcadas como concluídas" tone="teal" />
        <StatCard icon={CalendarCheck} label="Plano CEISC" value={`${progress.ceiscDaysCompleted.length}/56`} detail="dias registrados no navegador" tone="gold" />
        <StatCard icon={Target} label="Último simulado" value={latestQuiz ? `${latestQuiz.correct}/20` : '—'} detail={latestQuiz ? latestQuiz.correct >= 18 ? 'meta alcançada' : '18 acertos é a meta' : 'faça o primeiro quando quiser'} tone="ink" />
        <StatCard icon={Clock3} label="Ritmo sugerido" value="1h30–2h" detail="referência diária do plano" tone="rose" />
      </section>

      <div className="dashboard-columns">
        <section className="panel focus-panel">
          <div className="panel-heading-row"><div><span className="eyebrow">PRÓXIMO ESTUDO</span><h2>{todayPlan?.day === 56 ? 'Dia de prova' : exactToday ? 'Plano para hoje' : 'Continue no seu ritmo'}</h2></div><Link to="/plano" className="subtle-link">Abrir cronograma <ArrowRight size={15} /></Link></div>
          {todayPlan ? (
            <div className="today-focus">
              <div className="focus-date"><span>Dia</span><strong>{String(todayPlan.day).padStart(2, '0')}</strong></div>
              <div className="focus-divider" />
              <div className="focus-detail">
                <div className="focus-meta"><span>{formatDate(parseBrazilianDate(todayPlan.date), { day: 'numeric', month: 'long' })}</span><span>·</span><span>{todayPlan.timeNotes.split(';')[0]}</span></div>
                <h3>{todayPlan.focus}</h3>
                <p>{todayPlan.study}</p>
                {todaySubject && <Link className="text-arrow" to={`/materias/${todaySubject.id}`}>Estudar {todaySubject.shortTitle} <ArrowRight size={14} /></Link>}
              </div>
              <div className="focus-stamp"><CalendarCheck size={20} aria-hidden="true" /></div>
            </div>
          ) : <div className="quiet-note">Escolha um plano de estudo para começar a organizar seus dias.</div>}
          <div className="panel-progress"><ProgressBar value={progress.ceiscDaysCompleted.length} max={56} label="Plano de 56 dias marcado" /></div>
        </section>

        <section className="panel progress-panel">
          <div className="panel-heading-row"><div><span className="eyebrow">SEU RITMO</span><h2>Uma rotina possível</h2></div><div className="panel-icon-soft"><Sparkles size={17} /></div></div>
          <p className="progress-intro">O plano não cobra perfeição: cada sessão concluída já conta.</p>
          <ProgressBar value={completedSubjects} max={20} label="Matérias concluídas" />
          <div className="progress-foot"><span><ShieldCheck size={15} />Salvo neste navegador</span><span>Sem conta</span></div>
          <div className="milestone-line"><span className="milestone-icon"><Trophy size={17} /></span><div><strong>{progress.quizResults.length ? 'Seu histórico está crescendo' : 'A primeira revisão já começa'}</strong><small>{progress.quizResults.length ? `${progress.quizResults.length} simulado${progress.quizResults.length === 1 ? '' : 's'} registrado${progress.quizResults.length === 1 ? '' : 's'} localmente` : 'Marque um tópico como revisado na página de matéria.'}</small></div></div>
        </section>
      </div>

      <section className="panel quick-start-panel">
        <div className="panel-heading-row"><div><span className="eyebrow">PARA SEGUIR</span><h2>Escolha seu próximo passo</h2></div><GraduationCap size={20} className="panel-heading-icon" /></div>
        <div className="quick-start-grid">
          <Link to="/materias" className="quick-start-item"><span className="quick-icon quick-icon-teal"><BookOpen size={18} /></span><span><strong>Ir às matérias</strong><small>20 disciplinas, por tópico</small></span><ArrowRight size={16} /></Link>
          <Link to="/simulados" className="quick-start-item"><span className="quick-icon quick-icon-gold"><Target size={18} /></span><span><strong>Treinar 20 questões</strong><small>Escolha o que estudou na semana</small></span><ArrowRight size={16} /></Link>
          <Link to="/biblioteca" className="quick-start-item"><span className="quick-icon quick-icon-ink"><BookOpen size={18} /></span><span><strong>Apostilas opcionais</strong><small>PDF e Word, se preferir</small></span><ArrowRight size={16} /></Link>
        </div>
      </section>

      <div className="dashboard-bottom-row"><p className="independent-note">OAB em Foco é um material educacional independente. A data de 10/01/2027 é prevista pela OAB/FGV e pode sofrer alteração oficial.</p><button type="button" className="dashboard-clear-button" onClick={() => { if (window.confirm('Apagar todo o progresso salvo neste navegador? Esta ação não pode ser desfeita.')) resetProgress(); }}><Trash2 size={14} /> Apagar progresso neste dispositivo</button></div>
    </div>
  );
}
