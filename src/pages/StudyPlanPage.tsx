import { useMemo, useState } from 'react';
import { ArrowRight, CalendarCheck, Check, Circle, Clock3, Info, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { subjects } from '../data/subjects';
import { ceiscSchedule } from '../data/appData';
import { useProgress } from '../context/ProgressContext';
import { brazilToday, createIntensiveDates, createReviewDays, dayDifference, formatDate, intensivePair, parseBrazilianDate, toDateKey } from '../lib/schedule';
import type { ScheduleDay } from '../lib/schedule';
import { Badge, InfoNote, PageHeader, ProgressBar } from '../components/Primitives';

type Mode = 'ceisc' | 'intensive';

export default function StudyPlanPage() {
  const { progress, updateProgress } = useProgress();
  const [mode, setMode] = useState<Mode>(progress.planMode);
  const [showAll, setShowAll] = useState(false);
  const todayKey = toDateKey(brazilToday());
  const selectedSubjects = progress.intensiveSubjectIds;
  const intensiveDays = useMemo(() => createIntensiveDates(), []);
  const reviewDays = useMemo(() => createReviewDays(), []);

  function changeMode(nextMode: Mode) {
    setMode(nextMode);
    updateProgress((previous) => ({ ...previous, planMode: nextMode }));
    setShowAll(false);
  }

  function toggleIntensiveSubject(subjectId: string) {
    updateProgress((previous) => {
      const selected = previous.intensiveSubjectIds;
      if (selected.includes(subjectId)) return { ...previous, intensiveSubjectIds: selected.filter((id) => id !== subjectId) };
      if (selected.length >= 10) return previous;
      return { ...previous, intensiveSubjectIds: [...selected, subjectId] };
    });
  }

  function toggleDay(key: string, list: 'ceiscDaysCompleted' | 'intensiveDaysCompleted') {
    updateProgress((previous) => {
      const current = new Set(previous[list]);
      current.has(key) ? current.delete(key) : current.add(key);
      return { ...previous, [list]: [...current] };
    });
  }

  const dayCountLabel = `${progress.ceiscDaysCompleted.length}/56`;
  const intensiveDone = progress.intensiveDaysCompleted.filter((key) => key.startsWith('intensive-')).length;

  return (
    <div className="page-stack plan-page">
      <PageHeader eyebrow="ROTINA QUE CABE NO DIA" title="Seu plano de estudo" description="Dois jeitos de organizar o caminho até a data prevista da prova." action={<div className="plan-time-pill"><Clock3 size={16} /><span>Referência diária<br /><strong>90 a 120 min</strong></span></div>} />
      <div className="plan-tabs" role="tablist" aria-label="Escolha um plano">
        <button type="button" role="tab" aria-selected={mode === 'ceisc'} className={mode === 'ceisc' ? 'plan-tab plan-tab-active' : 'plan-tab'} onClick={() => changeMode('ceisc')}><CalendarCheck size={17} /><span>Trilha de 56 dias</span><small>base no cronograma enviado</small></button>
        <button type="button" role="tab" aria-selected={mode === 'intensive'} className={mode === 'intensive' ? 'plan-tab plan-tab-active' : 'plan-tab'} onClick={() => changeMode('intensive')}><RotateCcw size={17} /><span>Modelo intensivo · 40 dias</span><small>configure suas 10 matérias</small></button>
      </div>

      {mode === 'ceisc' ? (
        <section className="plan-mode-content">
          <InfoNote><strong>Origem:</strong> esta trilha de 56 dias foi organizada com base no cronograma CEISC que você forneceu. Ela preserva os estudos e a rotina indicados no material recebido; acompanhe as datas e ajuste o plano se precisar.</InfoNote>
          <div className="plan-summary-strip"><div><span className="eyebrow">TRILHA CEISC</span><strong>16 nov 2026 — 10 jan 2027</strong><small>56 dias · incluindo a data de prova informada no cronograma</small></div><div className="plan-summary-progress"><ProgressBar value={progress.ceiscDaysCompleted.length} max={56} label="Dias marcados" /></div><Badge tone="gold">{dayCountLabel} concluídos</Badge></div>
          <div className="schedule-list">
            {ceiscSchedule.map((day) => {
              const key = String(day.day);
              const done = progress.ceiscDaysCompleted.includes(key);
              const isToday = toDateKey(parseBrazilianDate(day.date)) === todayKey;
              const isExamDay = day.day === 56;
              const subjectLink = subjects.find((subject) => day.focus.toLocaleLowerCase('pt-BR').includes(subject.shortTitle.toLocaleLowerCase('pt-BR')));
              return (
                <article key={day.day} className={`schedule-row${isToday ? ' schedule-row-today' : ''}${done ? ' schedule-row-done' : ''}${isExamDay ? ' schedule-row-exam' : ''}`}>
                  <button type="button" className={`schedule-check${done ? ' schedule-check-done' : ''}`} onClick={() => toggleDay(key, 'ceiscDaysCompleted')} aria-label={`${done ? 'Desmarcar' : 'Marcar'} dia ${day.day}`} aria-pressed={done}>{done ? <Check size={15} /> : <Circle size={16} />}</button>
                  <div className="schedule-date"><span>DIA</span><strong>{String(day.day).padStart(2, '0')}</strong><small>{formatDate(parseBrazilianDate(day.date), { day: 'numeric', month: 'short' })}</small></div>
                  <div className="schedule-main"><div className="schedule-tags">{isToday && <Badge tone="teal">Hoje</Badge>}{isExamDay && <Badge tone="gold">Data de prova no cronograma</Badge>}{done && <Badge tone="green">Concluído</Badge>}</div><h3>{day.focus}</h3><p>{day.study}</p><div className="schedule-time"><Clock3 size={13} /><span>{day.timeNotes}</span>{subjectLink && <Link to={`/materias/${subjectLink.id}`}>Abrir matéria <ArrowRight size={13} /></Link>}</div></div>
                </article>
              );
            })}
          </div>
          <div className="schedule-footnote"><Info size={14} /><span>O calendário oficial apresenta 10/01/2027 como data prevista. O cronograma inclui esse dia como prova, não como dia normal de estudo.</span></div>
        </section>
      ) : (
        <section className="plan-mode-content intensive-content">
          <InfoNote tone="warm"><strong>Modelo configurável baseado nas informações que você relatou sobre o anúncio VDE.</strong> O portal não recebeu a lista das dez disciplinas do anúncio e não inventa nem atribui matérias a ele. Escolha as suas dez; o ciclo de 40 dias começa em 23/11/2026.</InfoNote>
          <section className="intensive-picker panel">
            <div className="intensive-picker-heading"><div><span className="eyebrow">SUA SELEÇÃO</span><h2>Escolha dez matérias</h2><p>A ordem da seleção é preservada no navegador e usada para distribuir duas disciplinas por dia.</p></div><div className={`selection-counter${selectedSubjects.length === 10 ? ' selection-counter-complete' : ''}`}><strong>{selectedSubjects.length}</strong><span>/10</span></div></div>
            <div className="subject-picker-grid">
              {subjects.map((subject) => {
                const selectedIndex = selectedSubjects.indexOf(subject.id);
                const selected = selectedIndex >= 0;
                return <button type="button" key={subject.id} aria-pressed={selected} onClick={() => toggleIntensiveSubject(subject.id)} disabled={!selected && selectedSubjects.length >= 10} className={`subject-picker-option${selected ? ' subject-picker-selected' : ''}`}><span className="picker-check">{selected ? <Check size={14} /> : <Circle size={14} />}</span><span className="picker-name">{subject.shortTitle}</span>{selected && <span className="picker-order">{selectedIndex + 1}</span>}</button>;
              })}
            </div>
            {selectedSubjects.length < 10 && <p className="picker-hint">Selecione mais {10 - selectedSubjects.length} matéria{10 - selectedSubjects.length === 1 ? '' : 's'} para montar o cronograma de 40 dias.</p>}
          </section>

          {selectedSubjects.length === 10 ? (
            <>
              <div className="plan-summary-strip intensive-summary"><div><span className="eyebrow">SEU CICLO · 40 DIAS</span><strong>23 nov 2026 — 1º jan 2027</strong><small>Duas matérias por dia · datas calculadas para o ciclo completo</small></div><div className="plan-summary-progress"><ProgressBar value={intensiveDone} max={40} label="Dias marcados" /></div><Badge tone="teal">{intensiveDone}/40</Badge></div>
              <div className="schedule-list intensive-days-list">
                {(showAll ? intensiveDays : intensiveDays.slice(0, 10)).map((day, index) => {
                  const pair = intensivePair(selectedSubjects, index);
                  const names = pair.map((id) => subjects.find((subject) => subject.id === id)?.shortTitle ?? id);
                  const done = progress.intensiveDaysCompleted.includes(day.key);
                  return <IntensiveDay key={day.key} day={day} names={names} done={done} onToggle={() => toggleDay(day.key, 'intensiveDaysCompleted')} />;
                })}
              </div>
              <button type="button" className="button button-outline schedule-expand" onClick={() => setShowAll(!showAll)}>{showAll ? 'Mostrar apenas os próximos 10 dias' : 'Ver os 40 dias do ciclo'}</button>
              <section className="review-window"><div className="review-window-heading"><div><span className="eyebrow">DEPOIS DO CICLO</span><h2>Revisão final · 02 a 09 de janeiro</h2><p>Oito dias reservados antes da data prevista da prova, para revisar erros e fazer simulados.</p></div><Badge tone="gold">2–9 jan 2027</Badge></div><div className="review-day-grid">{reviewDays.map((day) => { const done = progress.intensiveDaysCompleted.includes(day.key); return <div className={`review-day${done ? ' review-day-done' : ''}`} key={day.key}><button type="button" onClick={() => toggleDay(day.key, 'intensiveDaysCompleted')} aria-label={`${done ? 'Desmarcar' : 'Marcar'} ${formatDate(day.date, { day: 'numeric', month: 'long' })}`} aria-pressed={done}>{done ? <Check size={14} /> : <Circle size={14} />}</button><div><small>{formatDate(day.date, { weekday: 'short', day: 'numeric', month: 'short' })}</small><strong>{day.focus}</strong></div></div>; })}</div></section>
            </>
          ) : (
            <div className="intensive-preview-card"><CalendarCheck size={20} /><div><strong>Seu cronograma será montado aqui.</strong><p>Quando houver dez matérias selecionadas, distribuiremos duas por dia de 23/11 a 01/01 e mostraremos os dias de revisão de 02/01 a 09/01.</p></div></div>
          )}
          <p className="plan-privacy"><Info size={14} /> Sua seleção e os dias marcados são salvos apenas neste navegador e podem ser apagados em “Visão geral”.</p>
        </section>
      )}
    </div>
  );
}

function IntensiveDay({ day, names, done, onToggle }: { day: ScheduleDay; names: string[]; done: boolean; onToggle: () => void }) {
  const until = dayDifference(brazilToday(), day.date);
  const firstName = names[0] ?? 'Matéria';
  const secondName = names[1] ?? 'Matéria';
  return (
    <article className={`schedule-row${done ? ' schedule-row-done' : ''}${until === 0 ? ' schedule-row-today' : ''}`}>
      <button type="button" className={`schedule-check${done ? ' schedule-check-done' : ''}`} onClick={onToggle} aria-label={`${done ? 'Desmarcar' : 'Marcar'} dia ${day.day}`} aria-pressed={done}>{done ? <Check size={15} /> : <Circle size={16} />}</button>
      <div className="schedule-date"><span>DIA</span><strong>{String(day.day).padStart(2, '0')}</strong><small>{formatDate(day.date, { day: 'numeric', month: 'short' })}</small></div>
      <div className="schedule-main"><div className="schedule-tags">{until === 0 && <Badge tone="teal">Hoje</Badge>}{until > 0 && <Badge>Em {until} dias</Badge>}{done && <Badge tone="green">Concluído</Badge>}</div><h3>{firstName} <span className="schedule-amp">+</span> {secondName}</h3><p>Revise os tópicos que estudou nessas matérias e resolva questões relacionadas. A distribuição é um modelo de organização, não uma lista de conteúdos oficiais do VDE.</p><div className="schedule-time"><Clock3 size={13} /><span>Divida o bloco entre leitura ou aula, questões e revisão dos erros.</span>{pairSubjectLink(firstName) && <Link to={`/materias/${pairSubjectLink(firstName)}`}>Abrir matéria <ArrowRight size={13} /></Link>}</div></div>
    </article>
  );
}

function pairSubjectLink(shortTitle: string): string | undefined {
  return subjects.find((subject) => subject.shortTitle === shortTitle)?.id;
}
