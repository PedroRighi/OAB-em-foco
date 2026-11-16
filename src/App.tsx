import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes, Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';
import AppShell from './components/AppShell';
import { ProgressProvider } from './context/ProgressContext';
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const StudyPlanPage = lazy(() => import('./pages/StudyPlanPage'));
const SubjectsPage = lazy(() => import('./pages/SubjectsPage'));
const SubjectDetailPage = lazy(() => import('./pages/SubjectDetailPage'));
const MockExamPage = lazy(() => import('./pages/MockExamPage'));
const ResourcesPage = lazy(() => import('./pages/ResourcesPage'));
const LibraryPage = lazy(() => import('./pages/LibraryPage'));

function NotFoundPage() {
  return <div className="not-found-page"><Compass size={30} /><span className="eyebrow">PÁGINA NÃO ENCONTRADA</span><h1>Este caminho não está no mapa de estudos.</h1><Link to="/" className="button button-primary"><ArrowLeft size={15} /> Voltar à visão geral</Link></div>;
}

function LoadingPage() {
  return <div className="page-stack" role="status" aria-live="polite"><span className="eyebrow">OAB EM FOCO</span><h1>Preparando seu espaço de estudo…</h1></div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <ProgressProvider>
        <Suspense fallback={<LoadingPage />}>
          <Routes>
            <Route element={<AppShell />}>
              <Route index element={<DashboardPage />} />
              <Route path="plano" element={<StudyPlanPage />} />
              <Route path="materias" element={<SubjectsPage />} />
              <Route path="materias/:slug" element={<SubjectDetailPage />} />
              <Route path="simulados" element={<MockExamPage />} />
              <Route path="recursos" element={<ResourcesPage />} />
              <Route path="biblioteca" element={<LibraryPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Suspense>
      </ProgressProvider>
    </BrowserRouter>
  );
}
