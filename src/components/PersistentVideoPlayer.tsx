import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, Expand, LoaderCircle, LockKeyhole, Minimize2, Pause, PictureInPicture2, Play, RefreshCw, X } from 'lucide-react';
import Hls from 'hls.js';
import { Events } from 'hls.js';
import { createEncryptedFragmentLoader } from '../lib/encryptedVideoLoader';
import { getVideoSupport, useVideo } from '../context/VideoContext';
import '../video-lessons.css';

type PlayerPhase = 'loading' | 'ready' | 'playing' | 'paused' | 'error' | 'unsupported';
type SafariVideo = HTMLVideoElement & {
  webkitPresentationMode?: string;
  webkitSetPresentationMode?: (mode: string) => void;
};

function formatClock(value: number): string {
  if (!Number.isFinite(value) || value < 0) return '00:00';
  const total = Math.floor(value);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return hours > 0
    ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function isNativePiPSupported(video: HTMLVideoElement | null): boolean {
  if (!video || typeof document === 'undefined') return false;
  const safariVideo = video as SafariVideo;
  return (document.pictureInPictureEnabled && typeof video.requestPictureInPicture === 'function')
    || typeof safariVideo.webkitSetPresentationMode === 'function';
}

export function PersistentVideoPlayer() {
  const { activeLesson, closePlayer, getVideoKey, getProgressTime, savePosition } = useVideo();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const pendingResumeRef = useRef(0);
  const playbackRateRef = useRef(1);
  const hasStartedLoadingRef = useRef(false);
  const [phase, setPhase] = useState<PlayerPhase>('loading');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [retryToken, setRetryToken] = useState(0);
  const [clock, setClock] = useState({ current: 0, duration: 0 });

  const cleanMedia = useCallback((video: HTMLVideoElement | null, player: Hls | null) => {
    if (player) {
      player.stopLoad();
      player.detachMedia();
      player.destroy();
    }
    if (video) {
      video.pause();
      video.removeAttribute('src');
      video.load();
    }
    hlsRef.current = null;
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!activeLesson || !video) return undefined;

    let disposed = false;
    const browserSupport = getVideoSupport();
    const key = getVideoKey();
    const resumeAt = getProgressTime(activeLesson.id);
    pendingResumeRef.current = resumeAt;
    hasStartedLoadingRef.current = false;
    setPhase('loading');
    setReady(false);
    setError(null);
    setNotice(null);
    setClock({ current: resumeAt, duration: activeLesson.durationSeconds });
    video.playsInline = true;
    video.preload = 'metadata';
    video.controls = true;
    video.disableRemotePlayback = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('disableRemotePlayback', '');
    video.defaultPlaybackRate = playbackRateRef.current;
    video.playbackRate = playbackRateRef.current;

    const applyResume = () => {
      if (pendingResumeRef.current <= 0 || !Number.isFinite(video.duration) || video.duration <= 0) return;
      const target = Math.min(pendingResumeRef.current, Math.max(0, video.duration - 0.25));
      if (target > 0) video.currentTime = target;
      pendingResumeRef.current = 0;
    };
    const onLoadedMetadata = () => {
      applyResume();
      setClock((previous) => ({ ...previous, current: video.currentTime, duration: Number.isFinite(video.duration) ? video.duration : previous.duration }));
    };
    const onCanPlay = () => {
      applyResume();
      if (!disposed) {
        setReady(true);
        setPhase(video.paused ? 'ready' : 'playing');
      }
    };
    const onTimeUpdate = () => {
      setClock((previous) => ({ ...previous, current: video.currentTime }));
    };
    const startSegments = () => {
      if (!hasStartedLoadingRef.current) {
        hasStartedLoadingRef.current = true;
        hlsRef.current?.startLoad();
      }
    };
    const onPlay = () => {
      startSegments();
      if (!disposed) setPhase('playing');
    };
    const onPause = () => {
      if (!disposed) setPhase('paused');
    };
    const onEnded = () => {
      savePosition(activeLesson.id, video.currentTime, true);
      if (!disposed) setPhase('paused');
    };
    const onError = () => {
      if (!disposed && video.error) {
        setPhase('error');
        setError('O navegador não conseguiu reproduzir este segmento criptografado.');
      }
    };

    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('ended', onEnded);
    video.addEventListener('error', onError);

    if (!browserSupport.supported) {
      setPhase('unsupported');
      setError(browserSupport.reason ?? 'Este navegador não é compatível com as aulas privadas.');
      return () => {
        savePosition(activeLesson.id, video.currentTime, true);
        video.removeEventListener('loadedmetadata', onLoadedMetadata);
        video.removeEventListener('canplay', onCanPlay);
        video.removeEventListener('timeupdate', onTimeUpdate);
        video.removeEventListener('play', onPlay);
        video.removeEventListener('pause', onPause);
        video.removeEventListener('ended', onEnded);
        video.removeEventListener('error', onError);
        cleanMedia(video, hlsRef.current);
      };
    }
    if (!key || !Hls.isSupported()) {
      setPhase('unsupported');
      setError(!key ? 'Desbloqueie as aulas novamente para reproduzir.' : 'Este navegador não oferece HLS MediaSource para o streaming criptografado.');
      return () => {
        savePosition(activeLesson.id, video.currentTime, true);
        video.removeEventListener('loadedmetadata', onLoadedMetadata);
        video.removeEventListener('canplay', onCanPlay);
        video.removeEventListener('timeupdate', onTimeUpdate);
        video.removeEventListener('play', onPlay);
        video.removeEventListener('pause', onPause);
        video.removeEventListener('ended', onEnded);
        video.removeEventListener('error', onError);
        cleanMedia(video, hlsRef.current);
      };
    }

    try {
      const hls = new Hls({
        autoStartLoad: true,
        backBufferLength: 30,
        maxBufferLength: 30,
        maxMaxBufferLength: 30,
        preferManagedMediaSource: true,
        fLoader: createEncryptedFragmentLoader(key),
      });
      hlsRef.current = hls;
      hls.on(Events.MANIFEST_PARSED, () => {
        if (!disposed) {
          setReady(true);
          setPhase(video.paused ? 'ready' : 'playing');
        }
      });
      hls.on(Events.ERROR, (_event, data) => {
        if (disposed || !data.fatal) return;
        hls.stopLoad();
        setPhase('error');
        setError('Não foi possível carregar a aula. Verifique sua conexão e tente novamente.');
      });
      hls.attachMedia(video);
      hasStartedLoadingRef.current = true;
      hls.loadSource(activeLesson.playlistPath);
    } catch {
      setPhase('error');
      setError('Não foi possível preparar o streaming criptografado neste navegador.');
    }

    return () => {
      disposed = true;
      savePosition(activeLesson.id, video.currentTime, true);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('error', onError);
      cleanMedia(video, hlsRef.current);
    };
  }, [activeLesson, cleanMedia, getProgressTime, getVideoKey, retryToken, savePosition]);

  useEffect(() => {
    const video = videoRef.current;
    if (!activeLesson || !video) return undefined;
    const save = (force: boolean) => savePosition(activeLesson.id, video.currentTime, force);
    const onTimeUpdate = () => save(false);
    const onPause = () => save(true);
    const onSeeked = () => save(true);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('pause', onPause);
    video.addEventListener('seeked', onSeeked);
    return () => {
      // The media cleanup above saves before video.load() resets currentTime.
      // A second save here would replace the actual resume point with zero.
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('seeked', onSeeked);
    };
  }, [activeLesson, savePosition]);

  const handleStart = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !ready) return;
    setNotice(null);
    if (!hasStartedLoadingRef.current) {
      hasStartedLoadingRef.current = true;
      hlsRef.current?.startLoad();
    }
    try {
      await video.play();
    } catch {
      setNotice('O navegador bloqueou o início automático. Use o botão de reprodução do vídeo para tentar novamente.');
    }
  }, [ready]);

  const handlePiP = useCallback(async () => {
    const video = videoRef.current as SafariVideo | null;
    if (!video || !ready || video.readyState < 2) {
      setNotice('Aguarde a aula ficar pronta para abrir o Picture-in-Picture.');
      return;
    }
    try {
      if (document.pictureInPictureEnabled && typeof video.requestPictureInPicture === 'function') {
        await video.requestPictureInPicture();
      } else if (typeof video.webkitSetPresentationMode === 'function') {
        video.webkitSetPresentationMode('picture-in-picture');
      } else {
        setNotice('Picture-in-Picture não está disponível; o player flutuante continua ativo nesta página.');
      }
    } catch {
      setNotice('Não foi possível abrir o Picture-in-Picture; o player flutuante continua ativo nesta página.');
    }
  }, [ready]);

  const handleClose = useCallback(() => {
    const video = videoRef.current;
    if (activeLesson && video) {
      video.pause();
      savePosition(activeLesson.id, video.currentTime, true);
    }
    closePlayer();
  }, [activeLesson, closePlayer, savePosition]);

  if (!activeLesson) return null;

  const pipAvailable = isNativePiPSupported(videoRef.current);
  const percent = clock.duration > 0 ? Math.min(100, Math.max(0, (clock.current / clock.duration) * 100)) : 0;

  return (
    <aside className={`persistent-video-player${expanded ? ' persistent-video-player-expanded' : ''}`} aria-label={`Player da aula ${activeLesson.title}`}>
      <div className="persistent-video-head">
        <div className="persistent-video-title"><span className="eyebrow">AULA PRIVADA</span><strong>{activeLesson.title}</strong></div>
        <div className="persistent-video-actions">
          <button type="button" className="video-icon-button" title={expanded ? 'Minimizar player' : 'Expandir player'} aria-label={expanded ? 'Minimizar player' : 'Expandir player'} onClick={() => setExpanded((value) => !value)}>{expanded ? <Minimize2 size={15} /> : <Expand size={15} />}</button>
          <button type="button" className="video-icon-button" title="Fechar player" aria-label="Fechar player" onClick={handleClose}><X size={16} /></button>
        </div>
      </div>
      <div className="persistent-video-stage">
        <video ref={videoRef} className="persistent-video-element" playsInline preload="metadata" controls aria-label={`Vídeo: ${activeLesson.title}`} />
        {phase === 'loading' && <div className="persistent-video-overlay" role="status"><LoaderCircle size={22} className="video-spin" /><span>Preparando o streaming…</span></div>}
        {(phase === 'error' || phase === 'unsupported') && <div className="persistent-video-overlay persistent-video-overlay-error" role="alert"><AlertTriangle size={22} /><strong>{error ?? 'Não foi possível reproduzir esta aula.'}</strong><button type="button" className="button button-outline" onClick={() => setRetryToken((value) => value + 1)}><RefreshCw size={14} /> Tentar novamente</button></div>}
        {ready && phase !== 'playing' && phase !== 'error' && phase !== 'unsupported' && <button type="button" className="persistent-video-play" onClick={handleStart}><Play size={17} fill="currentColor" /> Reproduzir</button>}
      </div>
      <div className="persistent-video-meta">
        <div className="video-progress-line" aria-label={`Progresso ${formatClock(clock.current)} de ${formatClock(clock.duration)}`}><span style={{ width: `${percent}%` }} /></div>
        <div className="persistent-video-controls-row">
          <span>{formatClock(clock.current)} / {formatClock(clock.duration)}</span>
          <label className="video-speed-control">Velocidade<select aria-label="Velocidade de reprodução" value={playbackRate} onChange={(event) => { const rate = Number(event.target.value); playbackRateRef.current = rate; setPlaybackRate(rate); if (videoRef.current) { videoRef.current.defaultPlaybackRate = rate; videoRef.current.playbackRate = rate; } }}><option value="0.75">0,75×</option><option value="1">1×</option><option value="1.25">1,25×</option><option value="1.5">1,5×</option><option value="1.75">1,75×</option><option value="2">2×</option></select></label>
          <button type="button" className="video-pip-button" onClick={pipAvailable ? handlePiP : () => setNotice('O navegador não oferece PiP nativo; o player flutuante continua ativo nesta página.')} title={pipAvailable ? 'Abrir Picture-in-Picture' : 'Continuar no player flutuante'} aria-label={pipAvailable ? 'Abrir Picture-in-Picture' : 'Continuar no player flutuante'}>{pipAvailable ? <PictureInPicture2 size={15} /> : <Pause size={15} />} {pipAvailable ? 'PiP' : 'Flutuar'}</button>
        </div>
      </div>
      {(notice || error) && phase !== 'error' && phase !== 'unsupported' && <p className="persistent-video-message" role="status">{notice ?? error}</p>}
      <div className="persistent-video-foot"><span><LockKeyhole size={12} /> Chave mantida só nesta sessão</span><span>{activeLesson.subject}</span></div>
    </aside>
  );
}

export default PersistentVideoPlayer;
