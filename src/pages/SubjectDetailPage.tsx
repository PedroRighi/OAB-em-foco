import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronRight, Circle, RotateCcw } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { subjects } from '../data/subjects';
import { getMaterial, getStudyTopics, getTopicCount } from '../data/content';
import { useProgress } from '../context/ProgressContext';
import { Badge, InfoNote, ProgressBar } from '../components/Primitives';
import MarkdownLesson from '../components/MarkdownLesson';

export default function SubjectDetailPage() {
  const { slug } = useParams();
  const subject = subjects.find((item) => item.id === slug);
  const { progress, updateProgress } = useProgress();
  const [loadedMaterial, setLoadedMaterial] = useState<{ subjectId: string; markdown: string } | null>(null);
  useEffect(() => {
    let active = true;
    if (!subject) {
      setLoadedMaterial(null);
      return () => { active = false; };
    }
    void getMaterial(subject).then((markdown) => {
      if (active) setLoadedMaterial({ subjectId: subject.id, markdown });
    }).catch(() => {
      if (active) setLoadedMaterial({ subjectId: subject.id, markdown: `# ${subject.title}\n\nNão foi possível carregar este material agora. Tente atualizar a página.` });
    });
    return () => { active = false; };
  }, [subject]);
  const markdown = subject && loadedMaterial?.subjectId === subject.id ? loadedMaterial.markdown : '';
  const loading = Boolean(subject && loadedMaterial?.subjectId !== subject.id);
  const topics = useMemo(() => getStudyTopics(markdown), [markdown]);
  const completed = subject ? progress.completedTopics[subject.id] ?? [] : [];
  if (!subject) {
    return <div className="not-found-page"><h1>Essa matéria não aparece no edital.</h1><Link to="/materias" className="button button-primary">Voltar às matérias <ArrowRight size={16} /></Link></div>;
  }
  const currentSubject = subject;
  const currentIndex = subjects.findIndex((item) => item.id === subject.id);
  const previous = subjects[currentIndex - 1];
  const next = subjects[currentIndex + 1];
  const totalTopics = getTopicCount(subject.id);
  const allDone = totalTopics > 0 && completed.length >= totalTopics;
  const isCourseComplete = progress.completedSubjects.includes(subject.id);

  function toggleTopic(topicId: string) {
    updateProgress((previousState) => {
      const current = new Set(previousState.completedTopics[currentSubject.id] ?? []);
      current.has(topicId) ? current.delete(topicId) : current.add(topicId);
      const topicIds = [...current];
      const completedSubjects = topicIds.length >= topics.length && topics.length > 0
        ? [...new Set([...previousState.completedSubjects, currentSubject.id])]
        : previousState.completedSubjects.filter((id) => id !== currentSubject.id);
      return { ...previousState, completedTopics: { ...previousState.completedTopics, [currentSubject.id]: topicIds }, completedSubjects };
    });
  }

  function setAllTopics(done: boolean) {
    updateProgress((previousState) => ({
      ...previousState,
      completedTopics: { ...previousState.completedTopics, [currentSubject.id]: done ? topics.map((topic) => topic.id) : [] },
      completedSubjects: done ? [...new Set([...previousState.completedSubjects, currentSubject.id])] : previousState.completedSubjects.filter((id) => id !== currentSubject.id),
    }));
  }

  return (
    <div className="page-stack lesson-page">
      <div className="back-row"><Link to="/materias"><ArrowLeft size={15} /> Todas as matérias</Link><span><ChevronRight size={14} /></span><span>{subject.shortTitle}</span></div>
      <section className="lesson-hero">
        <div className="lesson-hero-main"><span className="eyebrow">{subject.category.toUpperCase()}</span><h1>{subject.title}</h1><p>Leitura de estudo, síntese de revisão e questões comentadas no mesmo lugar.</p><div className="lesson-hero-tags"><Badge tone={subject.group === 'Núcleo mínimo do edital' ? 'gold' : 'teal'}>{subject.group === 'Núcleo mínimo do edital' ? 'Núcleo prioritário do edital' : 'Programa da 1ª fase'}</Badge><Badge>Conferência do portal: 16/11/2026</Badge></div></div>
        <div className="lesson-progress-card"><div><span>Seu avanço</span><strong>{completed.length}<small>/{totalTopics}</small></strong><small>tópicos revisados</small></div><ProgressBar value={completed.length} max={totalTopics} compact /><button type="button" disabled={loading} className={`mark-course-button${isCourseComplete ? ' mark-course-done' : ''}`} onClick={() => setAllTopics(!allDone)}>{allDone ? <><RotateCcw size={14} /> Desmarcar tópicos</> : <><Check size={14} /> Marcar tudo revisado</>}</button></div>
      </section>
      <InfoNote tone="warm"><strong>Estudo no site:</strong> o conteúdo completo está abaixo, organizado por capítulos. Os arquivos PDF e Word são opcionais e ficam na <Link to="/biblioteca">biblioteca</Link>. Revise as referências oficiais antes da prova.</InfoNote>
      <div className="lesson-layout">
        <article className="lesson-article">{loading ? <div className="quiet-note" role="status">Carregando a apostila de {subject.shortTitle}…</div> : <MarkdownLesson markdown={markdown} topics={topics} completedTopicIds={completed} onToggleTopic={toggleTopic} />}</article>
        <aside className="lesson-outline" aria-label="Navegue pelos tópicos">
          <div className="outline-sticky"><span className="eyebrow">NESTA MATÉRIA</span><strong>{totalTopics} tópicos de estudo</strong><div className="outline-progress"><ProgressBar value={completed.length} max={totalTopics} compact /></div><nav>{loading ? <span className="quiet-note">Carregando tópicos…</span> : topics.map((topic) => <a key={topic.id} href={`#${topic.id}`} className={completed.includes(topic.id) ? 'outline-link outline-link-done' : 'outline-link'}><span>{completed.includes(topic.id) ? <Check size={12} /> : <Circle size={9} />}</span><span>{topic.title.replace(/^\d+\.\s*/, '')}</span></a>)}</nav><div className="outline-note"><BookOpen size={14} /><span>Marque cada capítulo ao concluir sua revisão.</span></div></div>
        </aside>
      </div>
      <div className="lesson-next-row"><div>{previous ? <Link to={`/materias/${previous.id}`} className="lesson-next-card"><span><ArrowLeft size={15} /> Matéria anterior</span><strong>{previous.shortTitle}</strong></Link> : <span />}</div><div>{next ? <Link to={`/materias/${next.id}`} className="lesson-next-card lesson-next-card-right"><span>Próxima matéria <ArrowRight size={15} /></span><strong>{next.shortTitle}</strong></Link> : <Link to="/simulados" className="lesson-next-card lesson-next-card-right"><span>Próxima etapa <ArrowRight size={15} /></span><strong>Treinar no simulado</strong></Link>}</div></div>
    </div>
  );
}
