import { useMemo, useState } from 'react';
import { ArrowRight, BookOpen, Check, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { subjects } from '../data/subjects';
import { getTopicCount } from '../data/content';
import { useProgress } from '../context/ProgressContext';
import { Badge, PageHeader, ProgressBar } from '../components/Primitives';
import { getSubjectReviewedTopicCount } from '../lib/topicProgress';

const filters = ['Todas', 'Núcleo mínimo do edital', 'Direito público', 'Direito privado', 'Processo', 'Direito social', 'Formação geral', 'Ética e OAB'] as const;

type Filter = typeof filters[number];

export default function SubjectsPage() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('Todas');
  const { progress } = useProgress();
  const filtered = useMemo(() => subjects.filter((subject) => {
    const matchesQuery = `${subject.title} ${subject.shortTitle}`.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR'));
    const matchesFilter = filter === 'Todas' || (filter === 'Núcleo mínimo do edital' ? subject.group === filter : subject.category === filter);
    return matchesQuery && matchesFilter;
  }), [query, filter]);
  const completedCount = progress.completedSubjects.length;

  return (
    <div className="page-stack">
      <PageHeader eyebrow="MAPA DO EDITAL" title="As 20 matérias" description="Escolha uma disciplina, leia o conteúdo no site e acompanhe o que já revisou." action={<div className="subject-total"><strong>{completedCount}</strong><span>de 20 concluídas</span></div>} />
      <div className="subject-index-progress"><ProgressBar value={completedCount} max={20} label="Seu progresso por disciplina" /></div>
      <section className="subject-filter-bar" aria-label="Filtros de disciplinas">
        <label className="search-field"><Search size={17} aria-hidden="true" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar matéria..." aria-label="Buscar matéria" /></label>
        <div className="filter-chips">{filters.map((item) => <button key={item} type="button" className={`filter-chip${filter === item ? ' filter-chip-active' : ''}`} onClick={() => setFilter(item)}>{item}</button>)}</div>
      </section>
      <div className="subject-results-caption"><span>{filtered.length} disciplina{filtered.length === 1 ? '' : 's'}</span><span>Conteúdo para leitura direta no portal</span></div>
      <div className="subject-list">
        {filtered.map((subject, index) => {
          const topicCount = getTopicCount(subject.id);
          const done = getSubjectReviewedTopicCount(subject.id, progress.completedTopics[subject.id] ?? []);
          const complete = progress.completedSubjects.includes(subject.id);
          return (
            <Link to={`/materias/${subject.id}`} key={subject.id} className="subject-row">
              <span className="subject-number">{String(index + 1).padStart(2, '0')}</span>
              <span className="subject-row-main"><strong>{subject.title}</strong><small>{topicCount} tópicos de estudo · {subject.category}</small></span>
              <span className="subject-row-tags">{subject.group === 'Núcleo mínimo do edital' && <Badge tone="gold">Núcleo prioritário</Badge>}{complete && <Badge tone="green"><Check size={12} /> Concluída</Badge>}</span>
              <span className="subject-row-progress"><span>{Math.min(done, topicCount)}/{topicCount} tópicos</span><ProgressBar compact value={Math.min(done, topicCount)} max={topicCount} /></span>
              <ArrowRight size={17} className="subject-row-arrow" aria-hidden="true" />
            </Link>
          );
        })}
      </div>
      {filtered.length === 0 && <div className="quiet-note">Nenhuma matéria encontrada. Tente outro nome ou filtro.</div>}
      <div className="subject-coverage-note"><BookOpen size={17} /><p>O edital destaca pelo menos 15% de questões para Ética/Estatuto, Direitos Humanos e Filosofia do Direito. Use o programa oficial como referência e acompanhe retificações.</p></div>
    </div>
  );
}
