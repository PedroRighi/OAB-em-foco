import { ArrowRight, BookOpen, CalendarCheck, Clock3, GraduationCap, ShieldCheck, Sparkles, Target, Trash2, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { subjects } from '../data/subjects';
import { ceiscSchedule } from '../data/appData';
import { brazilToday, createIntensiveDates, createReferenceDates, createReviewDays, daysUntilExam, formatDate, intensivePair, parseBrazilianDate, toDateKey } from '../lib/schedule';
import { useProgress } from '../context/ProgressContext';
import { quizPassTarget } from '../lib/progress';
import { Badge, ProgressBar, StatCard } from '../components/Primitives';
import type { ScheduleDay } from '../lib/schedule';
import '../reference-plan.css';

function formatToday(): string {
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Sao_Paulo' })
    .format(new Date()).replace(/^./, (character) => character.toUpperCase());
}

export default function DashboardPage() {
  const { progress, updateProgress, resetProgress } = useProgress();
  const isIntensiveMode = progress.planMode === 'intensive';
  const isReferencePlan = isIntensiveMode && progress.intensivePlanVariant === 'reference';
  const intensiveDays = isReferencePlan ? createReferenceDates() : createIntensiveDates();
  const reviewDays = createReviewDays(isReferencePlan ? 'reference-review' : 'review');
  const ceiscDays: ScheduleDay[] = ceiscSchedule.map((day) => ({ ...day, date: parseBrazilianDate(day.date), key: String(day.day) }));
  const activeSchedule: ScheduleDay[] = isIntensiveMode ? [...intensiveDays, ...reviewDays] : ceiscDays;
  const scheduleReady = !isIntensiveMode || isReferencePlan || progress.intensiveSubjectIds.length === 10;
  const completedDayKeys = isReferencePlan ? progress.referenceDaysCompleted : isIntensiveMode ? progress.intensiveDaysCompleted : progress.ceiscDaysCompleted;
  const todayKey = toDateKey(brazilToday());
  const exactToday = activeSchedule.find((day) => toDateKey(day.date) === todayKey);
  const fallbackDay = activeSchedule.find((day) => !completedDayKeys.includes(isIntensiveMode ? day.key : String(day.day))) ?? activeSchedule[activeSchedule.length - 1];
  const todayPlan = scheduleReady ? exactToday ?? fallbackDay : undefined;
  const isReviewStage = todayPlan?.kind === 'review' || Boolean(todayPlan?.key.includes('review-'));
  const selectedPair = isReferencePlan ? todayPlan?.blocks?.map((block) => block.subjectId) ?? [] : isIntensiveMode && todayPlan?.key.startsWith('intensive-')
    ? intensivePair(progress.intensiveSubjectIds, todayPlan.day - 1)
    : [];
  const selectedPairNames = selectedPair.map((id) => subjects.find((subject) => subject.id === id)?.shortTitle ?? id);
  const todayFocus = !isReferencePlan && isIntensiveMode && selectedPairNames.length ? selectedPairNames.join(' + ') : todayPlan?.focus;
  const todayStudy = !isReferencePlan && isIntensiveMode && selectedPairNames.length
    ? 'Divida seu bloco entre as duas matérias: revise os tópicos estudados, resolva questões e anote os erros.'
    : todayPlan?.study;
  const todaySubject = isIntensiveMode
    ? selectedPair[0] ? subjects.find((subject) => subject.id === selectedPair[0]) : undefined
    : todayPlan ? subjects.find((subject) => todayPlan.focus.toLocaleLowerCase('pt-BR').includes(subject.shortTitle.toLocaleLowerCase('pt-BR'))) : undefined;
  const completedIntensiveDays = intensiveDays.filter((day) => completedDayKeys.includes(day.key)).length;
  const completedReviewDays = reviewDays.filter((day) => completedDayKeys.includes(day.key)).length;
  const completedPlanDays = isIntensiveMode
    ? completedIntensiveDays
    : progress.ceiscDaysCompleted.length;
  const planDayTotal = isIntensiveMode ? intensiveDays.length : ceiscSchedule.length;
  const planStarted = (isReferencePlan ? progress.referencePlanStarted : progress.startedPlanModes.includes(progress.planMode)) || completedDayKeys.length > 0;
  const resumeDay = activeSchedule.find((day) => !completedDayKeys.includes(isIntensiveMode ? day.key : String(day.day))) ?? activeSchedule[activeSchedule.length - 1];
  const planActionHref = !scheduleReady
    ? '/plano#intensive-picker'
    : isIntensiveMode && resumeDay?.key.includes('review-') ? `/plano#${resumeDay.key}`
      : isIntensiveMode ? `/plano#${resumeDay?.key ?? 'intensive-1'}` : `/plano#ceisc-day-${resumeDay?.day ?? 1}`;
  const planActionLabel = planStarted ? 'Continuar plano' : 'Começar plano';
  const focusHeading = !todayPlan ? 'Configure seu intensivo'
    : isIntensiveMode && todayPlan.key.includes('review-') ? 'Revisão final'
      : todayPlan.kind === 'review' ? todayPlan.day < 36 ? 'Revisão da semana' : 'Revisão por matéria'
      : !isIntensiveMode && todayPlan.day === 56 ? 'Dia de prova'
        : exactToday ? isIntensiveMode ? 'Plano intensivo para hoje' : 'Plano para hoje'
          : isIntensiveMode ? 'Próxima etapa do intensivo' : 'Continue no seu ritmo';
  const completedSubjects = progress.completedSubjects.length;
  const daysLeft = daysUntilExam();
  const latestQuiz = progress.quizResults[0];
  const dueLabel = daysLeft < 0 ? 'Prova prevista para 10 de janeiro de 2027' : daysLeft === 0 ? 'Prova prevista para hoje' : `${daysLeft} dias para a prova prevista`;

  function handlePlanStart() {
    if (!scheduleReady) return;
    if (isReferencePlan) {
      updateProgress((previous) => ({ ...previous, referencePlanStarted: true }));
      return;
    }
    updateProgress((previous) => previous.startedPlanModes.includes(previous.planMode)
      ? previous
      : { ...previous, startedPlanModes: [...previous.startedPlanModes, previous.planMode] });
  }

  return (
    <div className="page-stack dashboard-page">
      <div className="dashboard-date-row"><span>{formatToday()}</span><Badge tone="teal">48º Exame · 1ª fase</Badge></div>
      <section className="welcome-panel">
        <div className="welcome-copy">
          <span className="eyebrow welcome-eyebrow">UM PASSO DE CADA VEZ</span>
          <h1>Seu estudo,<br /><em>em foco.</em></h1>
          <p>Conteúdo por matéria, rotina que cabe no dia e progresso que fica só com você.</p>
          <div className="welcome-actions">
            <Link to={planActionHref} onClick={handlePlanStart} className="button button-light">{planActionLabel} <ArrowRight size={16} /></Link>
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
        <StatCard icon={CalendarCheck} label={isReferencePlan ? 'Trilha temática' : isIntensiveMode ? 'Plano pessoal' : 'Plano CEISC'} value={`${completedPlanDays}/${planDayTotal}`} detail={isIntensiveMode ? `${completedReviewDays}/8 dias de revisão` : 'dias registrados no navegador'} tone="gold" />
        <StatCard icon={Target} label="Último simulado" value={latestQuiz ? `${latestQuiz.correct}/${latestQuiz.total}` : '—'} detail={latestQuiz ? latestQuiz.correct >= quizPassTarget(latestQuiz.total) ? 'meta alcançada' : `${quizPassTarget(latestQuiz.total) - latestQuiz.correct} acertos abaixo da meta` : 'faça o primeiro quando quiser'} tone="ink" />
        <StatCard icon={Clock3} label="Ritmo sugerido" value="1h30–2h" detail="referência diária do plano" tone="rose" />
      </section>

      {!isReferencePlan && <section className="panel reference-promo"><div><span className="eyebrow">INTENSIVO POR ASSUNTOS</span><h2>Uma trilha adaptada ao material enviado</h2><p>Dez matérias, conteúdos diários e revisões semanais. Seu plano e suas marcações anteriores continuam guardados.</p></div><Link to="/plano#reference-1" className="button button-outline" onClick={() => updateProgress((previous) => ({ ...previous, planMode: 'intensive', intensivePlanVariant: 'reference' }))}>Abrir trilha temática <ArrowRight size={15} /></Link></section>}

      <div className="dashboard-columns">
        <section className="panel focus-panel">
          <div className="panel-heading-row"><div><span className="eyebrow">PRÓXIMO ESTUDO</span><h2>{focusHeading}</h2></div><Link to="/plano" className="subtle-link">{isIntensiveMode ? 'Abrir intensivo' : 'Abrir cronograma'} <ArrowRight size={15} /></Link></div>
          {todayPlan ? (
            <div className="today-focus">
              <div className="focus-date"><span>{isIntensiveMode && isReviewStage ? 'Rev.' : 'Dia'}</span><strong>{String(todayPlan.day).padStart(2, '0')}</strong></div>
              <div className="focus-divider" />
              <div className="focus-detail">
                <div className="focus-meta"><span>{formatDate(todayPlan.date, { day: 'numeric', month: 'long' })}</span><span>·</span><span>{todayPlan.timeNotes.split(';')[0]}</span></div>
                <h3>{todayFocus}</h3>
                <p>{todayStudy}</p>
                {todaySubject && <Link className="text-arrow" to={`/materias/${todaySubject.id}`}>Estudar {todaySubject.shortTitle} <ArrowRight size={14} /></Link>}
              </div>
              <div className="focus-stamp"><CalendarCheck size={20} aria-hidden="true" /></div>
            </div>
          ) : <div className="quiet-note">{isIntensiveMode ? <>Selecione dez matérias no modo intensivo para montar o ciclo.<br /><Link to="/plano" className="text-arrow">Configurar o intensivo <ArrowRight size={14} /></Link></> : 'Escolha um plano de estudo para começar a organizar seus dias.'}</div>}
          <div className="panel-progress"><ProgressBar value={completedPlanDays} max={planDayTotal} label={isIntensiveMode ? 'Plano intensivo · 40 dias' : 'Plano CEISC · 56 dias'} /></div>
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
