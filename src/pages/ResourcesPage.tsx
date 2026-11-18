import { ArrowUpRight, BookOpen, ExternalLink, Info, PlayCircle, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';
import { videoResources, officialSources } from '../data/resources';
import { PageHeader, Badge, InfoNote } from '../components/Primitives';
import '../support-pages.css';

export default function ResourcesPage() {
  return (
    <div className="page-stack">
      <PageHeader eyebrow="FONTES E AULAS ABERTAS" title="Estude com referência" description="Links externos para acompanhar o edital e encontrar conteúdo aberto de revisão." />
      <section className="resource-feature-note"><span className="resource-feature-icon"><Scale size={21} /></span><div><strong>A fonte final é o documento oficial.</strong><p>A apostila ajuda a revisar; para regras e datas, consulte OAB/FGV e a legislação publicada pelo Planalto.</p></div></section>
      <section className="resource-feature-note"><span className="resource-feature-icon"><PlayCircle size={21} /></span><div><strong>Suas oito videoaulas pessoais</strong><p>Abra com o código de acesso e assista enquanto navega pelo portal. As fontes públicas abaixo continuam disponíveis sem código.</p><Link to="/videoaulas" className="button button-outline">Abrir minhas aulas <ArrowUpRight size={15} /></Link></div></section>
      <section className="resource-section">
        <div className="resource-section-heading"><div><span className="eyebrow">VIDEOAULAS PÚBLICAS</span><h2>Conteúdo aberto para complementar</h2></div><span className="resource-count">{videoResources.length} fontes</span></div>
        <div className="video-resource-list">
          {videoResources.map((resource) => (
            <article className="video-resource-card" key={resource.id}>
              <div className={`video-resource-icon video-resource-${resource.provider.toLowerCase().replaceAll(' ', '-')}`}><PlayCircle size={21} /></div>
              <div className="video-resource-body"><div className="resource-card-top"><Badge tone="teal">{resource.provider}</Badge><span>{resource.observed}</span></div><h3>{resource.title}</h3><p>{resource.coverage}</p><div className="resource-access-note"><Info size={14} />{resource.accessNote}</div></div>
              <a className="button button-outline" href={resource.url} target="_blank" rel="noopener noreferrer">Abrir no YouTube <ArrowUpRight size={15} /></a>
            </article>
          ))}
        </div>
      </section>
      <section className="resource-section official-section">
        <div className="resource-section-heading"><div><span className="eyebrow">FONTES PRIMÁRIAS</span><h2>OAB/FGV e legislação</h2></div><span className="resource-count">Atualizado 16 nov 2026</span></div>
        <div className="official-source-list">
          {officialSources.map((source) => (
            <a href={source.url} target="_blank" rel="noopener noreferrer" className="official-source-row" key={source.url}><span className="official-source-icon">{source.kind === 'Planalto' ? <BookOpen size={17} /> : <Scale size={17} />}</span><span><strong>{source.title}</strong><small>{source.kind} · {source.detail}</small></span><ExternalLink size={16} className="official-arrow" /></a>
          ))}
        </div>
      </section>
      <InfoNote><strong>Acesso a vídeos:</strong> as playlists verificadas cobrem apenas parte das matérias. Alguns vídeos podem estar agendados e a disponibilidade gratuita pode mudar. Canais podem também divulgar cursos pagos; o portal não oferece nem promete acesso a esses cursos.</InfoNote>
      <p className="resource-updated">Conteúdo verificado em 16/11/2026. Mudanças legislativas, jurisprudência, edital e retificações devem ser conferidos novamente antes da prova.</p>
    </div>
  );
}
