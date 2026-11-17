import { ArrowDownToLine, ArrowUpRight, FileArchive, FileText, Files, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { subjects } from '../data/subjects';
import { libraryFiles } from '../data/appData';
import { InfoNote, PageHeader } from '../components/Primitives';
import '../support-pages.css';

export default function LibraryPage() {
  return (
    <div className="page-stack">
      <PageHeader eyebrow="ARQUIVOS OPCIONAIS" title="Biblioteca de apoio" description="Os arquivos-base ficam disponíveis para guardar, imprimir ou editar; o estudo atualizado continua nas páginas do site." />
      <section className="library-download-banner"><span className="library-banner-icon"><FileArchive size={22} /></span><div><span className="eyebrow">COLEÇÃO-BASE · 16/11/2026</span><h2>40 arquivos · 20 disciplinas · PDF e Word</h2><p>Um pacote ZIP com os arquivos-base organizados para baixar de uma vez.</p></div><a href={libraryFiles.zip} download className="button button-light">Baixar coleção ZIP <ArrowDownToLine size={16} /></a></section>
      <div className="library-summary"><span><Files size={17} /> {libraryFiles.materials.length} matérias</span><span><FileText size={17} /> PDF para leitura</span><span><FileText size={17} /> Word editável</span></div>
      <div className="library-list">
        {libraryFiles.materials.map((file, index) => {
          const subject = subjects.find((item) => item.id === file.subjectId);
          return (
            <article className="library-row" key={file.subjectId}>
              <span className="library-number">{String(index + 1).padStart(2, '0')}</span>
              <div className="library-row-title"><strong>{subject?.title ?? file.title}</strong><small>Arquivo-base · 16/11/2026 · sem os 21 complementos Aprofundamento VDE</small></div>
              <a href={file.pdf} download={`${subject?.shortTitle ?? file.title}.pdf`} className="file-action file-action-pdf" aria-label={`Baixar PDF de ${subject?.title ?? file.title}`}><span className="file-type-mark">PDF</span><span>PDF</span><ArrowDownToLine size={15} /></a>
              <a href={file.docx} download={`${subject?.shortTitle ?? file.title}.docx`} className="file-action file-action-word" aria-label={`Baixar Word de ${subject?.title ?? file.title}`}><span className="file-type-mark file-type-word">W</span><span>Word</span><ArrowDownToLine size={15} /></a>
              <Link to={`/materias/${file.subjectId}`} className="library-read-link">Estudar no site <ArrowUpRight size={14} /></Link>
            </article>
          );
        })}
      </div>
      <InfoNote tone="warm"><strong>Atualização dos arquivos:</strong> os complementos <strong>Aprofundamento VDE</strong> estão nas páginas das matérias. Os downloads base anteriores (16/11/2026) não incluem a revisão atual; use o site para estudar o conteúdo completo e atualizado.</InfoNote>
      <p className="library-privacy"><Info size={14} /> Os arquivos ficam no armazenamento do projeto. O site não precisa acessar arquivos locais do seu computador.</p>
    </div>
  );
}
