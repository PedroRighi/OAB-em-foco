import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { BookOpen, Clock3, Film, KeyRound, LockKeyhole, LogOut, Play, Search, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/Primitives';
import { useVideo } from '../context/VideoContext';
import '../video-lessons.css';

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return 'Duração não informada';
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const remainingSeconds = total % 60;
  if (hours) return `${hours}h ${String(minutes).padStart(2, '0')}min`;
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}

function formatProgress(seconds: number, duration: number): string {
  if (!seconds || seconds < 1) return '';
  const percent = duration > 0 ? Math.min(99, Math.round((seconds / duration) * 100)) : 0;
  return percent > 0 ? `${percent}% assistido · ${formatDuration(seconds)}` : `Retomar em ${formatDuration(seconds)}`;
}

export default function VideoLessonsPage() {
  const { lessons, isUnlocked, unlocking, error, activeLessonId, videoProgress, support, unlock, lock, openLesson } = useVideo();
  const [code, setCode] = useState('');
  const [query, setQuery] = useState('');

  const filteredLessons = useMemo(() => {
    const normalized = query.toLocaleLowerCase('pt-BR');
    if (!normalized) return lessons;
    return lessons.filter((lesson) => `${lesson.title} ${lesson.subject}`.toLocaleLowerCase('pt-BR').includes(normalized));
  }, [lessons, query]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = code;
    setCode('');
    await unlock(value);
  };

  return (
    <div className="page-stack video-lessons-page">
      <PageHeader eyebrow="OITO AULAS PESSOAIS" title="Videoaulas privadas" description="Assista por streaming, continue de onde parou e siga navegando pelo portal sem recriar o vídeo." action={isUnlocked ? <button type="button" className="button button-outline" onClick={lock}><LogOut size={15} /> Bloquear aulas</button> : undefined} />

      <section className="video-privacy-banner"><span className="video-privacy-icon"><ShieldCheck size={20} /></span><div><strong>Seu código abre a chave apenas nesta sessão.</strong><p>Ele não é salvo no navegador, na URL ou no progresso. As aulas são carregadas em segmentos criptografados; não há download em claro.</p></div></section>

      {!support.supported && <div className="video-browser-warning" role="alert"><LockKeyhole size={18} /><div><strong>Navegador não compatível com este streaming.</strong><p>{support.reason}</p></div></div>}

      {!isUnlocked ? (
        <section className="video-access-card" aria-labelledby="video-access-title">
          <div className="video-access-copy"><span className="eyebrow">ÁREA RESTRITA</span><h2 id="video-access-title">Digite seu código de acesso</h2><p>Use o código completo, exatamente como foi recebido. Não o inclua em mensagens, links ou capturas de tela.</p></div>
          <form className="video-access-form" onSubmit={handleSubmit}>
            <label htmlFor="video-access-code">Código de acesso</label>
            <div className="video-access-input"><KeyRound size={17} aria-hidden="true" /><input id="video-access-code" type="password" value={code} onChange={(event) => setCode(event.target.value)} minLength={20} autoComplete="off" spellCheck={false} placeholder="Digite o código completo" aria-describedby="video-access-hint" disabled={unlocking || !support.supported} /></div>
            <span id="video-access-hint">Mínimo de 20 caracteres. O campo é limpo após cada tentativa.</span>
            <button type="submit" className="button button-primary" disabled={unlocking || !support.supported || code.length === 0}>{unlocking ? 'Verificando…' : 'Desbloquear aulas'} <Play size={14} /></button>
            {error && <p className="video-form-error" role="alert">{error}</p>}
          </form>
        </section>
      ) : (
        <>
          <section className="video-catalog-heading"><div><span className="eyebrow">CATÁLOGO PRIVADO</span><h2>Escolha uma aula para começar</h2><p>O player fica fixo no canto inferior enquanto você consulta matérias, plano e simulados.</p></div><div className="video-catalog-count"><Film size={18} /><strong>{lessons.length}</strong><span>aulas</span></div></section>
          <div className="video-filter-row"><label className="video-search-field" htmlFor="video-lesson-search"><Search size={16} aria-hidden="true" /><input id="video-lesson-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filtrar por aula ou disciplina" aria-label="Filtrar videoaulas" /></label><span>{filteredLessons.length} de {lessons.length}</span></div>
          <section className="video-lesson-list" aria-label="Videoaulas privadas">
            {filteredLessons.map((lesson, index) => {
              const currentTime = videoProgress[lesson.id] ?? 0;
              const resumeLabel = formatProgress(currentTime, lesson.durationSeconds);
              const isActive = activeLessonId === lesson.id;
              return <article className={`video-lesson-card${isActive ? ' video-lesson-card-active' : ''}`} key={lesson.id}>
                <div className="video-lesson-number">{String(index + 1).padStart(2, '0')}</div>
                <div className="video-lesson-mark"><Film size={19} /></div>
                <div className="video-lesson-body"><div className="video-lesson-meta"><span>{lesson.subject}</span><span><Clock3 size={12} /> {formatDuration(lesson.durationSeconds)}</span></div><h3>{lesson.title}</h3>{resumeLabel && <p className="video-resume-label">{resumeLabel}</p>}{lesson.subjectSlug && <Link className="video-material-link" to={`/materias/${lesson.subjectSlug}`}><BookOpen size={13} /> Ver material da matéria</Link>}</div>
                <button type="button" className={`button ${resumeLabel ? 'button-gold' : 'button-primary'} video-lesson-action`} onClick={() => openLesson(lesson.id)}>{isActive ? 'No player' : resumeLabel ? 'Continuar' : 'Assistir'} <Play size={14} /></button>
              </article>;
            })}
            {!filteredLessons.length && <div className="video-empty-state"><Film size={21} /><strong>Nenhuma aula encontrada.</strong><p>Tente outro termo de busca.</p></div>}
          </section>
        </>
      )}
    </div>
  );
}
