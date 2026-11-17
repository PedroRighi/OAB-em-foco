import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, ClipboardCheck, Copy, RotateCcw, Target, X } from 'lucide-react';
import { subjects } from '../data/subjects';
import { questions } from '../data/appData';
import type { OabQuestion } from '../data/appData';
import { useProgress } from '../context/ProgressContext';
import type { QuizResult } from '../lib/progress';
import { quizPassTarget } from '../lib/progress';
import { Badge, InfoNote, PageHeader, ProgressBar } from '../components/Primitives';

const LETTERS = ['A', 'B', 'C', 'D'] as const;

type QuizSession = { questions: OabQuestion[]; subjectIds: string[]; answers: Record<string, string>; mode: 'weekly' | 'subject' };

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapWith = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapWith]] = [copy[swapWith]!, copy[index]!];
  }
  return copy;
}

function createPrompt(selected: string[], topics: string): string {
  const names = selected.map((id) => subjects.find((subject) => subject.id === id)?.title ?? id).join('; ');
  return `Crie um simulado inédito de 20 questões para a 1ª fase do 48º Exame da OAB. Use quatro alternativas (A–D), apenas uma correta, e inclua gabarito comentado com fundamento em fonte oficial. Restrinja o conteúdo às matérias que estudei nesta semana: ${names || '[selecione as matérias]'}. Tópicos/recorte: ${topics.trim() || '[descreva os tópicos estudados]'}. Não inclua assunto fora desse recorte. Minha meta é acertar pelo menos 18 de 20.`;
}

export default function MockExamPage() {
  const { progress, updateProgress } = useProgress();
  const [session, setSession] = useState<QuizSession | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [resultId, setResultId] = useState<string | null>(null);
  const [copied, setCopied] = useState<'idle' | 'copied' | 'failed'>('idle');
  const [showAllResults, setShowAllResults] = useState(false);
  const selected = progress.selectedWeekSubjects;
  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const available = useMemo(() => questions.filter((question) => selectedSet.has(question.subjectId)), [selectedSet]);
  const singleSelectedSubject = selected.length === 1 ? subjects.find((subject) => subject.id === selected[0]) : undefined;
  const displayedResult = progress.quizResults.find((result) => result.id === resultId) ?? null;
  const recent = showAllResults ? progress.quizResults : progress.quizResults.slice(0, 5);
  const activeQuestion = session?.questions[questionIndex];
  const answerCount = session ? Object.keys(session.answers).length : 0;

  function toggleSubject(subjectId: string) {
    updateProgress((previous) => {
      const next = new Set(previous.selectedWeekSubjects);
      next.has(subjectId) ? next.delete(subjectId) : next.add(subjectId);
      return { ...previous, selectedWeekSubjects: [...next] };
    });
  }

  function startQuiz(questionCount = 20, mode: QuizSession['mode'] = 'weekly') {
    if (available.length < questionCount || questionCount < 1) return;
    setResultId(null);
    setQuestionIndex(0);
    setSession({ questions: shuffle(available).slice(0, questionCount), subjectIds: [...selected], answers: {}, mode });
  }

  function selectAnswer(answer: string) {
    if (!session || !activeQuestion) return;
    setSession({ ...session, answers: { ...session.answers, [activeQuestion.id]: answer } });
  }

  function finishQuiz() {
    if (!session || session.questions.some((question) => !session.answers[question.id])) return;
    const correct = session.questions.reduce((total, question) => total + (session.answers[question.id] === question.answer ? 1 : 0), 0);
    const result: QuizResult = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      completedAt: new Date().toISOString(),
      correct,
      total: session.questions.length,
      mode: session.mode,
      subjectIds: session.subjectIds,
      questionIds: session.questions.map((question) => question.id),
      answers: session.answers,
    };
    updateProgress((previous) => ({ ...previous, quizResults: [result, ...previous.quizResults] }));
    setSession(null);
    setResultId(result.id);
  }

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(createPrompt(selected, progress.weeklyTopics));
      setCopied('copied');
    } catch {
      setCopied('failed');
    }
  }

  if (session && activeQuestion) {
    return (
      <div className="page-stack exam-session-page">
        <button type="button" className="back-button" onClick={() => { setSession(null); setQuestionIndex(0); }}><ArrowLeft size={15} /> Sair do simulado</button>
        <div className="exam-session-header"><div><span className="eyebrow">{session.mode === 'subject' ? 'TREINO DE MATÉRIA' : 'SIMULADO SEMANAL'}</span><h1>Questão {questionIndex + 1} <span>de {session.questions.length}</span></h1></div><Badge tone="gold"><Target size={13} /> Meta: {quizPassTarget(session.questions.length)} de {session.questions.length}</Badge></div>
        <ProgressBar value={answerCount} max={session.questions.length} label="Respondidas" />
        <section className="exam-question-card">
          <div className="exam-question-top"><Badge>{activeQuestion.subjectTitle}</Badge><span>Exercício de treino · não oficial</span></div>
          <h2>{activeQuestion.prompt}</h2>
          <div className="exam-options">{LETTERS.map((letter) => {
            const chosen = session.answers[activeQuestion.id] === letter;
            return <button type="button" key={letter} className={`exam-option${chosen ? ' exam-option-selected' : ''}`} aria-pressed={chosen} onClick={() => selectAnswer(letter)}><span className="exam-option-letter">{letter}</span><span>{activeQuestion.choices[letter]}</span>{chosen && <Check size={17} className="exam-option-check" />}</button>;
          })}</div>
          <div className="exam-question-footer"><button type="button" className="button button-outline" disabled={questionIndex === 0} onClick={() => setQuestionIndex((index) => Math.max(0, index - 1))}><ArrowLeft size={15} /> Anterior</button><span>{answerCount}/{session.questions.length} respondidas</span>{questionIndex < session.questions.length - 1 ? <button type="button" className="button button-primary" onClick={() => setQuestionIndex((index) => Math.min(session.questions.length - 1, index + 1))}>Próxima <ArrowRight size={15} /></button> : <button type="button" className="button button-gold" disabled={answerCount < session.questions.length} onClick={finishQuiz}><CheckCircle2 size={16} /> Corrigir simulado</button>}</div>
        </section>
        <div className="exam-number-strip" aria-label="Navegar pelas questões">{session.questions.map((question, index) => <button type="button" key={question.id} aria-label={`Ir à questão ${index + 1}`} aria-current={questionIndex === index ? 'step' : undefined} className={`exam-number${questionIndex === index ? ' exam-number-current' : ''}${session.answers[question.id] ? ' exam-number-answered' : ''}`} onClick={() => setQuestionIndex(index)}>{index + 1}</button>)}</div>
      </div>
    );
  }

  if (displayedResult) return <ResultReview result={displayedResult} onBack={() => setResultId(null)} />;

  return (
    <div className="page-stack exam-page">
      <PageHeader eyebrow="PRÁTICA COM PROPÓSITO" title="Simulado da semana" description="Escolha o que estudou, faça 20 questões e veja onde vale revisar de novo." action={<div className="exam-goal-pill"><Target size={17} /><span>Meta de aprovação<br /><strong>18 de 20 acertos</strong></span></div>} />
      <InfoNote><strong>Como funciona o banco local:</strong> há {questions.length} exercícios comentados, filtrados por disciplina — não por tópico. São questões de treino autorais ou adaptadas, não questões oficiais da OAB/FGV. O simulado semanal continua com 20 questões e meta de 18 acertos; se marcar uma matéria com menos de 20 questões, você também pode fazer um treino individual com todas as questões disponíveis, sem misturar disciplinas, e a meta é ajustada proporcionalmente a 90%.</InfoNote>
      <div className="exam-setup-layout">
        <section className="exam-setup-main panel">
          <div className="exam-setup-heading"><span className="eyebrow">PASSO 1</span><h2>O que você estudou?</h2><p>Marque as disciplinas da sua semana. As matérias e o recorte escrito ficam salvos apenas neste navegador.</p></div>
          <div className="exam-subject-grid">
            {subjects.map((subject) => {
              const count = questions.filter((question) => question.subjectId === subject.id).length;
              const checked = selectedSet.has(subject.id);
              return <label key={subject.id} className={`exam-subject-option${checked ? ' exam-subject-checked' : ''}`}><input type="checkbox" checked={checked} onChange={() => toggleSubject(subject.id)} /><span className="fake-checkbox">{checked && <Check size={13} />}</span><span className="exam-subject-label">{subject.shortTitle}</span><span className="exam-subject-count">{count}</span></label>;
            })}
          </div>
          <label className="topics-note-label" htmlFor="weekly-topics"><span>Passo 2 · Seu recorte de conteúdo <small>(opcional)</small></span><textarea id="weekly-topics" rows={3} maxLength={3000} value={progress.weeklyTopics} onChange={(event) => updateProgress((previous) => ({ ...previous, weeklyTopics: event.target.value }))} placeholder="Ex.: Ética — publicidade e honorários; Penal — tentativa e desistência voluntária." /></label>
          <div className="exam-selection-status" aria-live="polite"><div><span>Questões disponíveis</span><strong>{available.length}</strong></div><div className="exam-selection-meter"><ProgressBar value={Math.min(available.length, 20)} max={20} compact /><small>{available.length >= 20 ? 'Você já pode começar.' : singleSelectedSubject && available.length > 0 ? `Faça um treino só de ${singleSelectedSubject.shortTitle} com ${available.length} questões ou selecione outras matérias para chegar a 20.` : `Faltam ${20 - available.length} para montar o simulado semanal.`}</small></div></div>
          <button type="button" className="button button-primary start-exam-button" disabled={available.length < 20} onClick={() => startQuiz()}><ClipboardCheck size={17} /> Iniciar 20 questões <ArrowRight size={16} /></button>
          {singleSelectedSubject && available.length > 0 && available.length < 20 && <button type="button" className="button button-outline start-exam-button" onClick={() => startQuiz(available.length, 'subject')}><Target size={16} /> Treino só de {singleSelectedSubject.shortTitle} · {available.length} questões</button>}
          {available.length >= 20 && <p className="exam-source-hint">Serão sorteadas 20 questões dentre as {available.length} disponíveis nas matérias selecionadas.</p>}
          {singleSelectedSubject && available.length > 0 && available.length < 20 && <p className="exam-source-hint">Esse treino usa apenas {singleSelectedSubject.shortTitle}, registra acertos e erros por questão e não mistura outras matérias.</p>}
        </section>
        <aside className="exam-sidebar">
          <div className="exam-expectation-card"><span className="exam-expectation-mark"><Target size={19} /></span><span className="eyebrow">SEU OBJETIVO</span><strong>18 <small>de 20</small></strong><p>Acertar pelo menos 18 questões é a meta definida para você considerar o simulado aprovado.</p><div className="goal-bars"><i /><i /><i /><i /><i /><i /><i /><i /><i className="goal-bar-last" /><i className="goal-bar-last" /></div></div>
              <div className="exam-history-card"><div className="panel-heading-row"><h3>Últimos resultados</h3><span>{progress.quizResults.length}</span></div>{recent.length ? <div className="exam-history-list">{recent.map((result) => { const passed = result.correct >= quizPassTarget(result.total); return <button type="button" key={result.id} className="exam-history-row" onClick={() => setResultId(result.id)}><span className={`history-score${passed ? ' history-score-pass' : ''}`}>{result.correct}/{result.total}</span><span><strong>{passed ? 'Meta alcançada' : 'Continue revisando'}</strong><small>{result.mode === 'subject' ? 'Treino por matéria · ' : 'Simulado semanal · '}{new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short' }).format(new Date(result.completedAt))}</small></span><ArrowRight size={14} /></button>; })}</div> : <p className="quiet-note">Seus resultados aparecerão aqui. Eles só ficam neste navegador.</p>}</div>
          {progress.quizResults.length > 5 && <button type="button" className="button button-outline" onClick={() => setShowAllResults(!showAllResults)}>{showAllResults ? 'Mostrar últimos cinco resultados' : `Ver todo o histórico (${progress.quizResults.length})`}</button>}
        </aside>
      </div>
      {selected.length > 0 && (
        <section className="new-quiz-prompt"><div className="new-quiz-icon"><Copy size={18} /></div><div className="new-quiz-copy"><span className="eyebrow">{available.length < 20 ? 'AINDA FALTAM QUESTÕES NO BANCO' : 'RECORTE PERSONALIZADO POR TÓPICOS'}</span><h2>Peça um simulado novo com seu conteúdo</h2><p>{available.length < 20 ? 'O banco local ainda não tem 20 questões dessas disciplinas. Copie o pedido abaixo e use no chat para solicitar um simulado novo, restrito ao conteúdo estudado.' : 'O simulado local filtra por disciplina. Para um recorte exato dos tópicos da semana ou questões inéditas, copie este pedido e use no chat.'} Inclua os tópicos específicos da semana no campo de recorte.</p><textarea readOnly value={createPrompt(selected, progress.weeklyTopics)} rows={5} aria-label="Pedido de simulado personalizado" /><button type="button" className="button button-gold" onClick={copyPrompt}><Copy size={15} />{copied === 'copied' ? 'Pedido copiado' : 'Copiar pedido para o chat'}</button>{copied === 'failed' && <small className="clipboard-fallback">A cópia automática não ficou disponível. Selecione o texto acima e copie manualmente.</small>}</div></section>
      )}
      {available.length === 0 && <div className="exam-empty-tip"><InfoIcon /> Marque ao menos uma disciplina para ver quantas questões do banco estão disponíveis.</div>}
      <p className="exam-disclaimer">Nenhum item deste banco é apresentado como questão oficial da OAB/FGV. Os exercícios autorais ou adaptados servem para revisar a legislação e temas observados em provas anteriores. Na correção, as novas questões mostram o tema, a evidência de recorrência e fontes oficiais para conferência.</p>
    </div>
  );
}

function ResultReview({ result, onBack }: { result: QuizResult; onBack: () => void }) {
  const byId = new Map(questions.map((question) => [question.id, question]));
  const resultQuestions = result.questionIds.map((id) => byId.get(id)).filter((question): question is OabQuestion => Boolean(question));
  const target = quizPassTarget(result.total);
  const passed = result.correct >= target;
  return (
    <div className="page-stack result-page">
      <button type="button" className="back-button" onClick={onBack}><ArrowLeft size={15} /> Voltar ao simulador</button>
      <section className={`result-hero${passed ? ' result-hero-pass' : ''}`}><div className="result-hero-mark">{passed ? <CheckCircle2 size={28} /> : <Target size={28} />}</div><div className="result-hero-copy"><span className="eyebrow">{result.mode === 'subject' ? 'TREINO DE MATÉRIA CONCLUÍDO' : 'SIMULADO CONCLUÍDO'}</span><h1>{passed ? 'Meta alcançada.' : 'Mais uma rodada de revisão.'}</h1><p>{passed ? `Você atingiu a meta de ${target} acertos em ${result.total} questões.` : `A meta é ${target} de ${result.total}. Revise os comentários abaixo e tente novamente quando quiser.`}</p></div><div className="result-score"><strong>{result.correct}<small>/${result.total}</small></strong><span>acertos</span></div></section>
      <div className="result-summary-row"><div><span>Resultado</span><strong>{Math.round(result.correct / result.total * 100)}%</strong></div><div><span>Meta do treino</span><strong className={passed ? 'pass-color' : ''}>{passed ? 'Atingida' : `${target - result.correct} acertos abaixo`}</strong></div><div><span>Respondido em</span><strong>{new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(result.completedAt))}</strong></div></div>
      <div className="review-answers-heading"><div><span className="eyebrow">REVISÃO COMENTADA</span><h2>Veja o raciocínio, questão por questão</h2></div><button type="button" onClick={onBack} className="button button-outline"><RotateCcw size={15} /> Novo simulado</button></div>
      <div className="review-question-list">{resultQuestions.map((question, index) => {
        const userAnswer = result.answers[question.id];
        const correct = userAnswer === question.answer;
        return (
          <article className={`review-question-card${correct ? ' review-correct' : ' review-incorrect'}`} key={question.id}>
            <div className="review-question-head"><span className="review-index">{String(index + 1).padStart(2, '0')}</span><Badge>{question.subjectTitle}</Badge><Badge tone={correct ? 'green' : 'rose'}>{correct ? 'Acertou' : 'Para revisar'}</Badge></div>
            <h3>{question.prompt}</h3>
            <div className="review-choice-list">{LETTERS.map((letter) => <div key={letter} className={`review-choice${letter === question.answer ? ' review-choice-correct' : ''}${letter === userAnswer && !correct ? ' review-choice-wrong' : ''}`}><span>{letter}</span><p>{question.choices[letter]}</p>{letter === question.answer && <Check size={15} />}{letter === userAnswer && !correct && <X size={15} />}</div>)}</div>
            <div className="answer-explanation">
              <strong>Gabarito: {question.answer}.</strong>
              <p>{question.explanation}</p>
              {question.recurringTopic && <p className="question-recurrence"><strong>Tema para revisão:</strong> {question.recurringTopic}</p>}
              {question.recurrenceNote && <p className="question-recurrence-note">{question.recurrenceNote}</p>}
              {question.references?.length ? <div className="question-references"><strong>Fontes consultáveis:</strong><ul>{question.references.map((reference) => <li key={reference.url}><a href={reference.url} target="_blank" rel="noreferrer">{reference.label}</a></li>)}</ul></div> : null}
            </div>
          </article>
        );
      })}</div>
    </div>
  );
}

function InfoIcon() {
  return <span className="exam-info-glyph" aria-hidden="true">i</span>;
}
