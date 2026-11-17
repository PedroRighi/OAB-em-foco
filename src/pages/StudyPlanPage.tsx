import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CalendarCheck, Check, Circle, Clock3, Info, RotateCcw, Target } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { subjects, subjectById } from '../data/subjects';
import { ceiscSchedule } from '../data/appData';
import { referenceSubjectIds } from '../data/intensiveReference';
import { useProgress } from '../context/ProgressContext';
import { brazilToday, createIntensiveDates, createReferenceDates, createReviewDays, dayDifference, formatDate, intensivePair, parseBrazilianDate, toDateKey } from '../lib/schedule';
import type { ScheduleDay } from '../lib/schedule';
import type { IntensivePlanVariant, PlanMode } from '../lib/progress';
import { Badge, InfoNote, PageHeader, ProgressBar } from '../components/Primitives';
import '../reference-plan.css';

type DayList = 'ceiscDaysCompleted' | 'intensiveDaysCompleted' | 'referenceDaysCompleted';

export default function StudyPlanPage() {
  const { progress, updateProgress } = useProgress();
  const [mode, setMode] = useState<PlanMode>(progress.planMode);
  const [showAll, setShowAll] = useState(false);
  const { hash } = useLocation();
  const todayKey = toDateKey(brazilToday());
  const selectedSubjects = progress.intensiveSubjectIds;
  const isReferencePlan = progress.intensivePlanVariant === 'reference';
  const customDays = useMemo(() => createIntensiveDates(), []);
  const referenceDays = useMemo(() => createReferenceDates(), []);
  const reviewDays = useMemo(() => createReviewDays(isReferencePlan ? 'reference-review' : 'review'), [isReferencePlan]);
  const completedKeys = isReferencePlan ? progress.referenceDaysCompleted : progress.intensiveDaysCompleted;
  const dayList: DayList = isReferencePlan ? 'referenceDaysCompleted' : 'intensiveDaysCompleted';
  const activeDays = isReferencePlan ? referenceDays : customDays;
  const intensiveDone = activeDays.filter((day) => completedKeys.includes(day.key)).length;

  useEffect(() => {
    if (!hash.startsWith('#intensive-') && !hash.startsWith('#reference-')) return;
    const day = Number(hash.replace(/^#(?:intensive|reference)-/, ''));
    if (Number.isInteger(day) && day > (isReferencePlan ? 7 : 10)) setShowAll(true);
  }, [hash, isReferencePlan]);

  useEffect(() => {
    const targetId = hash.slice(1);
    if (!targetId) return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [hash, mode, selectedSubjects.length, showAll, isReferencePlan]);

  function changeMode(nextMode: PlanMode) {
    setMode(nextMode);
    updateProgress((previous) => ({ ...previous, planMode: nextMode }));
    setShowAll(false);
  }

  function changeVariant(variant: IntensivePlanVariant) {
    updateProgress((previous) => ({ ...previous, intensivePlanVariant: variant }));
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

  function toggleDay(key: string, list: DayList) {
    updateProgress((previous) => {
      const current = new Set(previous[list]);
      current.has(key) ? current.delete(key) : current.add(key);
      return { ...previous, [list]: [...current] };
    });
  }

  function prepareWeek(week: number) {
    const weekDays = referenceDays.filter((day) => day.week === week);
    const subjectIds = [...new Set(weekDays.flatMap((day) => day.blocks?.map((block) => block.subjectId) ?? []))];
    const topics = weekDays.flatMap((day) => day.blocks?.map((block) => `${subjectById[block.subjectId]?.shortTitle}: ${block.topics.join('; ')}`) ?? []).join('\n');
    updateProgress((previous) => ({ ...previous, selectedWeekSubjects: subjectIds, weeklyTopics: `Semana ${week} da trilha temática:\n${topics}` }));
  }

  return (
    <div className="page-stack plan-page">
      <PageHeader eyebrow="ROTINA QUE CABE NO DIA" title="Seu plano de estudo" description="Uma trilha por assuntos, revisões e prática — com seus registros preservados." action={<div className="plan-time-pill"><Clock3 size={16} /><span>Referência diária<br /><strong>90 a 120 min</strong></span></div>} />
      <div className="plan-tabs" role="tablist" aria-label="Escolha um plano">
        <button type="button" role="tab" aria-selected={mode === 'ceisc'} className={mode === 'ceisc' ? 'plan-tab plan-tab-active' : 'plan-tab'} onClick={() => changeMode('ceisc')}><CalendarCheck size={17} /><span>Trilha de 56 dias</span><small>seu cronograma CEISC preservado</small></button>
        <button type="button" role="tab" aria-selected={mode === 'intensive'} className={mode === 'intensive' ? 'plan-tab plan-tab-active' : 'plan-tab'} onClick={() => changeMode('intensive')}><RotateCcw size={17} /><span>Intensivo · 40 dias</span><small>modelo adaptado ao material VDE</small></button>
      </div>

      {mode === 'ceisc' ? (
        <section className="plan-mode-content">
          <InfoNote><strong>Origem:</strong> esta trilha de 56 dias foi organizada com base no cronograma CEISC que você forneceu. Seus estudos e registros continuam aqui; trocar de trilha não apaga nenhum dia.</InfoNote>
          <div className="plan-summary-strip"><div><span className="eyebrow">TRILHA CEISC</span><strong>16 nov 2026 — 10 jan 2027</strong><small>56 dias · incluindo a data de prova informada no cronograma</small></div><div className="plan-summary-progress"><ProgressBar value={progress.ceiscDaysCompleted.length} max={56} label="Dias marcados" /></div><Badge tone="gold">{progress.ceiscDaysCompleted.length}/56 concluídos</Badge></div>
          <div className="schedule-list">
            {ceiscSchedule.map((day) => {
              const key = String(day.day);
              const done = progress.ceiscDaysCompleted.includes(key);
              const isToday = toDateKey(parseBrazilianDate(day.date)) === todayKey;
              const isExamDay = day.day === 56;
              const subjectLink = subjects.find((subject) => day.focus.toLocaleLowerCase('pt-BR').includes(subject.shortTitle.toLocaleLowerCase('pt-BR')));
              return (
                <article key={day.day} id={`ceisc-day-${day.day}`} className={`schedule-row${isToday ? ' schedule-row-today' : ''}${done ? ' schedule-row-done' : ''}${isExamDay ? ' schedule-row-exam' : ''}`}>
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
          <div className="intensive-variant-switch" role="group" aria-label="Modelo do intensivo">
            <button type="button" aria-pressed={isReferencePlan} className={isReferencePlan ? 'variant-active' : ''} onClick={() => changeVariant('reference')}><strong>Trilha por assuntos</strong><span>Base no material enviado · dez matérias</span></button>
            <button type="button" aria-pressed={!isReferencePlan} className={!isReferencePlan ? 'variant-active' : ''} onClick={() => changeVariant('custom')}><strong>Meu modelo pessoal</strong><span>Sua seleção e seus registros anteriores</span></button>
          </div>
          <InfoNote tone="warm"><strong>Seus registros não foram reiniciados.</strong> A nova trilha e o modelo pessoal têm marcações separadas: um dia concluído não é transferido para conteúdos diferentes.</InfoNote>

          {isReferencePlan ? (
            <>
              <section className="panel reference-intro">
                <span className="eyebrow">ESTUDO + REVISÃO + QUESTÕES</span>
                <h2>Um roteiro para cada semana</h2>
                <p>Adaptação independente da estrutura do material VDE enviado, baseada na prévia pública de mesmo título. O arquivo original não foi conferido integralmente. A cópia usa datas antigas e chega ao Dia 42 incluindo véspera e prova; aqui, os 40 dias de conteúdo vão de 23/11 a 01/01, com reforço até a véspera de 09/01.</p>
                <div className="reference-subjects">{referenceSubjectIds.map((id) => <Link key={id} to={`/materias/${id}`}>{subjectById[id]?.shortTitle}</Link>)}</div>
                <p className="reference-source-line"><a href="https://www.studocu.com/pt-br/document/universidade-ceuma/direito-civil/cronograma-oab-40-dias-vde-preparacao-e-revisao/164893736" target="_blank" rel="noreferrer">Material informado</a> · <a href="https://www.passeidireto.com/arquivo/189740476/cronograma-oab-40-dias-vde-1" target="_blank" rel="noreferrer">Prévia textual consultada</a> · Sem aulas ou mentorias do curso.</p>
              </section>
              <PlanSummary completed={intensiveDone} label="TRILHA TEMÁTICA · 40 DIAS" />
              <div className="reference-weeks">
                {[1, 2, 3, 4, 5, 6].filter((week) => showAll || week === 1).map((week) => {
                  const days = referenceDays.filter((day) => day.week === week);
                  const completed = days.filter((day) => completedKeys.includes(day.key)).length;
                  return (
                    <section className="reference-week" key={week}>
                      <div className="reference-week-heading"><div><span className="eyebrow">SEMANA {String(week).padStart(2, '0')}</span><h2>{week === 6 ? 'Revisão por matéria' : week === 5 ? 'Temas finais e consolidação' : 'Conteúdo, revisão e prática'}</h2><small>{formatDate(days[0]!.date)} — {formatDate(days[days.length - 1]!.date)} · {completed}/{days.length} dias marcados</small></div><Link to="/simulados" className="button button-outline" onClick={() => prepareWeek(week)}><Target size={15} /> Preparar simulado</Link></div>
                      <div className="schedule-list">{days.map((day) => <ReferenceDayRow key={day.key} day={day} done={completedKeys.includes(day.key)} onToggle={() => toggleDay(day.key, 'referenceDaysCompleted')} onPrepare={() => prepareWeek(week)} />)}</div>
                    </section>
                  );
                })}
              </div>
              <button type="button" className="button button-outline schedule-expand" onClick={() => setShowAll(!showAll)}>{showAll ? 'Mostrar apenas a primeira semana' : 'Ver as seis semanas da trilha'}</button>
              <p className="reference-quiz-note">“Preparar simulado” atualiza a seleção de matérias e o recorte no simulador. O banco local filtra por disciplina, não por tópico; o campo de recorte serve para pedir no chat um simulado específico. Nada é respondido ou concluído automaticamente.</p>
            </>
          ) : (
            <>
              <InfoNote><strong>Seu modelo configurável anterior continua aqui.</strong> Escolha dez matérias para distribuir dois blocos por dia. Este modelo não segue os assuntos diários da trilha temática.</InfoNote>
              <section className="intensive-picker panel" id="intensive-picker">
                <div className="intensive-picker-heading"><div><span className="eyebrow">SUA SELEÇÃO PRESERVADA</span><h2>Escolha dez matérias</h2><p>A ordem da seleção é preservada no navegador e usada para distribuir duas disciplinas por dia.</p></div><div className={`selection-counter${selectedSubjects.length === 10 ? ' selection-counter-complete' : ''}`}><strong>{selectedSubjects.length}</strong><span>/10</span></div></div>
                <div className="subject-picker-grid">{subjects.map((subject) => {
                  const selectedIndex = selectedSubjects.indexOf(subject.id);
                  const selected = selectedIndex >= 0;
                  return <button type="button" key={subject.id} aria-pressed={selected} onClick={() => toggleIntensiveSubject(subject.id)} disabled={!selected && selectedSubjects.length >= 10} className={`subject-picker-option${selected ? ' subject-picker-selected' : ''}`}><span className="picker-check">{selected ? <Check size={14} /> : <Circle size={14} />}</span><span className="picker-name">{subject.shortTitle}</span>{selected && <span className="picker-order">{selectedIndex + 1}</span>}</button>;
                })}</div>
                {selectedSubjects.length < 10 && <p className="picker-hint">Selecione mais {10 - selectedSubjects.length} matéria{10 - selectedSubjects.length === 1 ? '' : 's'} para montar o cronograma de 40 dias.</p>}
              </section>
              {selectedSubjects.length === 10 ? <><PlanSummary completed={intensiveDone} label="SEU MODELO PESSOAL · 40 DIAS" /><div className="schedule-list intensive-days-list">{(showAll ? customDays : customDays.slice(0, 10)).map((day, index) => <IntensiveDay key={day.key} day={day} names={intensivePair(selectedSubjects, index).map((id) => subjectById[id]?.shortTitle ?? id)} done={completedKeys.includes(day.key)} onToggle={() => toggleDay(day.key, 'intensiveDaysCompleted')} />)}</div><button type="button" className="button button-outline schedule-expand" onClick={() => setShowAll(!showAll)}>{showAll ? 'Mostrar apenas os primeiros 10 dias' : 'Ver os 40 dias do ciclo'}</button></> : <div className="intensive-preview-card"><CalendarCheck size={20} /><div><strong>Seu cronograma será montado aqui.</strong><p>Com dez matérias selecionadas, distribuiremos duas por dia de 23/11 a 01/01. Nenhuma seleção ou conclusão anterior foi apagada.</p></div></div>}
            </>
          )}

          {(isReferencePlan || selectedSubjects.length === 10) && (
            <section className="review-window" id="review-window">
              <div className="review-window-heading"><div><span className="eyebrow">REFORÇO ATÉ A VÉSPERA</span><h2>Revisão final · 02 a 09 de janeiro</h2><p>Reveja os erros e lacunas, sem iniciar um conteúdo extenso na véspera.</p></div><Badge tone="gold">2–9 jan 2027</Badge></div>
              <div className="review-day-grid">{reviewDays.map((day) => { const done = completedKeys.includes(day.key); return <div id={day.key} className={`review-day${done ? ' review-day-done' : ''}`} key={day.key}><button type="button" onClick={() => toggleDay(day.key, dayList)} aria-label={`${done ? 'Desmarcar' : 'Marcar'} revisão de ${formatDate(day.date, { day: 'numeric', month: 'long' })}`} aria-pressed={done}>{done ? <Check size={14} /> : <Circle size={14} />}</button><div><small>{formatDate(day.date, { weekday: 'short', day: 'numeric', month: 'short' })}{day.day === 8 ? ' · Véspera' : ''}</small><strong>{day.focus}</strong></div></div>; })}</div>
              <p className="reference-quiz-note">A prova está prevista para 10/01/2027; confira alterações no calendário oficial. O foco em dez matérias não cobre todo o edital: inclua as outras disciplinas nos pontos de maior dificuldade. <Link to="/materias">Abrir as 20 disciplinas <ArrowRight size={12} /></Link></p>
            </section>
          )}
          <p className="plan-privacy"><Info size={14} /> Tudo fica apenas neste navegador/dispositivo. Trocar de trilha não apaga progresso e não sincroniza com outro aparelho.</p>
        </section>
      )}
    </div>
  );
}

function PlanSummary({ completed, label }: { completed: number; label: string }) {
  return <div className="plan-summary-strip intensive-summary"><div><span className="eyebrow">{label}</span><strong>23 nov 2026 — 1º jan 2027</strong><small>Datas adaptadas · revisão adicional até 09 jan</small></div><div className="plan-summary-progress"><ProgressBar value={completed} max={40} label="Dias marcados" /></div><Badge tone="teal">{completed}/40</Badge></div>;
}

function ReferenceDayRow({ day, done, onToggle, onPrepare }: { day: ScheduleDay; done: boolean; onToggle: () => void; onPrepare: () => void }) {
  const isToday = dayDifference(brazilToday(), day.date) === 0;
  return (
    <article id={day.key} className={`schedule-row reference-day-row${isToday ? ' schedule-row-today' : ''}${done ? ' schedule-row-done' : ''}${day.kind === 'mock' ? ' schedule-row-mock' : ''}`}>
      <button type="button" className={`schedule-check${done ? ' schedule-check-done' : ''}`} onClick={onToggle} aria-label={`${done ? 'Desmarcar' : 'Marcar'} dia ${day.day} da trilha temática`} aria-pressed={done}>{done ? <Check size={15} /> : <Circle size={16} />}</button>
      <div className="schedule-date"><span>DIA</span><strong>{String(day.day).padStart(2, '0')}</strong><small>{formatDate(day.date, { day: 'numeric', month: 'short' })}</small></div>
      <div className="schedule-main"><div className="schedule-tags"><Badge tone={day.kind === 'mock' ? 'gold' : day.kind === 'review' ? 'teal' : 'neutral'}>{day.kind === 'mock' ? 'Simulado · 20/18' : day.kind === 'review' ? 'Revisão' : 'Estudo'}</Badge>{isToday && <Badge tone="teal">Hoje</Badge>}{done && <Badge tone="green">Concluído</Badge>}</div>
        {day.blocks?.length ? <div className="reference-day-blocks">{day.blocks.map((block) => <div className="reference-topic-block" key={block.subjectId}><Link to={`/materias/${block.subjectId}`}><strong>{subjectById[block.subjectId]?.shortTitle}</strong><ArrowRight size={13} /></Link><p>{block.topics.join(' · ')}</p></div>)}</div> : <><h3>{day.focus}</h3><p>{day.study}</p></>}
        {day.kind === 'review' && Boolean(day.blocks?.length) && <p className="reference-day-guidance">Revise os tópicos já estudados e priorize os erros daquela matéria.</p>}
        <div className="schedule-time"><Clock3 size={13} /><span>{day.timeNotes}</span>{day.kind === 'mock' && <Link to="/simulados" onClick={onPrepare}>Preparar questões da semana <ArrowRight size={13} /></Link>}</div>
      </div>
    </article>
  );
}

function IntensiveDay({ day, names, done, onToggle }: { day: ScheduleDay; names: string[]; done: boolean; onToggle: () => void }) {
  const until = dayDifference(brazilToday(), day.date);
  const firstName = names[0] ?? 'Matéria';
  const secondName = names[1] ?? 'Matéria';
  const subject = subjects.find((item) => item.shortTitle === firstName);
  return <article id={day.key} className={`schedule-row${done ? ' schedule-row-done' : ''}${until === 0 ? ' schedule-row-today' : ''}`}><button type="button" className={`schedule-check${done ? ' schedule-check-done' : ''}`} onClick={onToggle} aria-label={`${done ? 'Desmarcar' : 'Marcar'} dia ${day.day}`} aria-pressed={done}>{done ? <Check size={15} /> : <Circle size={16} />}</button><div className="schedule-date"><span>DIA</span><strong>{String(day.day).padStart(2, '0')}</strong><small>{formatDate(day.date, { day: 'numeric', month: 'short' })}</small></div><div className="schedule-main"><div className="schedule-tags">{until === 0 && <Badge tone="teal">Hoje</Badge>}{until > 0 && <Badge>Em {until} dias</Badge>}{done && <Badge tone="green">Concluído</Badge>}</div><h3>{firstName} <span className="schedule-amp">+</span> {secondName}</h3><p>Revise os tópicos que estudou nessas matérias e resolva questões relacionadas. Este é o seu modelo pessoal, não a trilha temática do material.</p><div className="schedule-time"><Clock3 size={13} /><span>Divida o bloco entre leitura ou aula, questões e revisão dos erros.</span>{subject && <Link to={`/materias/${subject.id}`}>Abrir matéria <ArrowRight size={13} /></Link>}</div></div></article>;
}
