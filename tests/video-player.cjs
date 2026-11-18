const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');

function loadVideoProgress(saved = null, blocked = false) {
  const storage = new Map(saved === null ? [] : [['oab-em-foco-video-progress-v1', JSON.stringify(saved)]]);
  const writes = [];
  const window = { localStorage: {
    getItem: (key) => { if (blocked) throw new Error('bloqueado'); return storage.get(key) ?? null; },
    setItem: (key, value) => { if (blocked) throw new Error('bloqueado'); writes.push(key); storage.set(key, value); },
    removeItem: (key) => { if (blocked) throw new Error('bloqueado'); storage.delete(key); },
  } };
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(path.join(root, 'src/lib/videoProgress.ts'), 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText;
  new Function('window', 'module', 'exports', code)(window, module, module.exports);
  return { library: module.exports, storage, writes };
}

test('progresso de vídeo usa chave independente e guarda somente id/tempo', () => {
  const env = loadVideoProgress({ civil: 12.5, invalido: 'não é tempo', negativo: -1 });
  assert.equal(env.library.VIDEO_PROGRESS_KEY, 'oab-em-foco-video-progress-v1');
  assert.deepEqual(env.library.loadVideoProgress(), { civil: 12.5 });
  assert.deepEqual(env.writes, []);
  const next = env.library.setVideoTime('penal', 33.25, env.library.loadVideoProgress());
  assert.deepEqual(next, { civil: 12.5, penal: 33.25 });
  assert.equal(env.library.saveVideoProgress(next), true);
  assert.deepEqual(JSON.parse(env.storage.get(env.library.VIDEO_PROGRESS_KEY)), next);
  assert.equal(env.storage.has('oab-em-foco-48-progress-v1'), false);
});

test('progresso de vídeo falha suavemente quando localStorage está bloqueado', () => {
  const env = loadVideoProgress(null, true);
  assert.deepEqual(env.library.loadVideoProgress(), {});
  assert.equal(env.library.saveVideoTime('civil', 4), false);
  assert.deepEqual(env.writes, []);
});

test('contexto exige código exato longo e mantém a chave fora do armazenamento', () => {
  const context = fs.readFileSync(path.join(root, 'src/context/VideoContext.tsx'), 'utf8');
  assert.ok(context.includes("code.length < 20"));
  assert.ok(context.includes('unlockVideoKey(code, catalog.encryption)'));
  assert.ok(context.includes('Deliberately do not trim'));
  assert.ok(context.includes("setVideoKey(null)"));
  assert.ok(!context.includes('window.localStorage'));
});

test('player não possui fallback em claro, limita buffers e desativa AirPlay remoto', () => {
  const player = fs.readFileSync(path.join(root, 'src/components/PersistentVideoPlayer.tsx'), 'utf8');
  assert.ok(player.includes('createEncryptedFragmentLoader(key)'));
  assert.ok(player.includes('preferManagedMediaSource: true'));
  assert.ok(player.includes('maxBufferLength: 30'));
  assert.ok(player.includes('backBufferLength: 30'));
  assert.ok(player.includes('disableRemotePlayback'));
  assert.ok(player.includes('requestPictureInPicture'));
  assert.ok(player.includes('webkitSetPresentationMode'));
  assert.ok(!player.includes('URL.createObjectURL'));
  assert.ok(!player.includes('arrayBuffer()'));
});

test('página limpa o código, não usa autocomplete de senha e mantém links de matéria', () => {
  const page = fs.readFileSync(path.join(root, 'src/pages/VideoLessonsPage.tsx'), 'utf8');
  assert.ok(page.includes('setCode(\'\')'));
  assert.ok(page.includes('autoComplete="off"'));
  assert.ok(page.includes('subjectSlug'));
  assert.ok(page.includes('materias/${lesson.subjectSlug}'));
  assert.ok(page.includes('Bloquear aulas'));
});

test('CSS mantém player flutuante fora da navegação móvel e os dois tamanhos', () => {
  const css = fs.readFileSync(path.join(root, 'src/video-lessons.css'), 'utf8');
  assert.ok(css.includes('width: 340px'));
  assert.ok(css.includes('width: min(720px'));
  assert.ok(css.includes('bottom: calc(70px + env(safe-area-inset-bottom))'));
  assert.ok(css.includes('prefers-reduced-motion: reduce'));
});

test('streaming carrega após a seleção e o cleanup não sobrescreve a retomada após reset', () => {
  const player = fs.readFileSync(path.join(root, 'src/components/PersistentVideoPlayer.tsx'), 'utf8');
  assert.ok(player.includes('autoStartLoad: true'));
  assert.ok(player.includes('hls.loadSource(activeLesson.playlistPath)'));
  const secondCleanup = player.slice(player.indexOf('const onSeeked = () => save(true);'), player.indexOf('const handleStart = useCallback'));
  assert.ok(!secondCleanup.includes('return () => {\n      save(true);'));
  assert.ok(secondCleanup.includes("video.removeEventListener('seeked', onSeeked)"));
});

test('catálogo contém exatamente as oito aulas reais e somente manifestos com ciphertext', () => {
  const catalog = JSON.parse(fs.readFileSync(path.join(root, 'src/data/privateVideoCatalog.json'), 'utf8'));
  assert.equal(catalog.lessons.length, 8);
  assert.equal(new Set(catalog.lessons.map((lesson) => lesson.id)).size, 8);
  assert.ok(catalog.lessons.some((lesson) => lesson.id === 'atos-processuais-parte-2'));
  assert.ok(!catalog.lessons.some((lesson) => lesson.id === 'atos-processuais-parte-1'));
  assert.equal(catalog.encryption.iterations, 600000);
  for (const lesson of catalog.lessons) {
    assert.ok(lesson.durationSeconds > 0);
    const text = fs.readFileSync(path.join(root, 'public', lesson.playlistPath), 'utf8');
    assert.ok(text.includes('#EXT-X-ENDLIST'));
    assert.ok(text.includes('#EXT-X-MAP'));
    const paths = [...text.matchAll(/URI="([^"]+)"|^([^#\r\n]+)$/gm)].map((match) => match[1] || match[2]);
    assert.ok(paths.length > 1);
    assert.ok(paths.every((url) => /^\/manus-storage\/oab-private-videos\/[^/]+\/[^/]+\/[^/]+\.bin$/.test(url)));
  }
});

test('velocidade escolhida persiste ao trocar ou reabrir aulas', () => {
  const player = fs.readFileSync(path.join(root, 'src/components/PersistentVideoPlayer.tsx'), 'utf8');
  assert.ok(player.includes('const playbackRateRef = useRef(1)'));
  assert.ok(player.includes('video.defaultPlaybackRate = playbackRateRef.current'));
  assert.ok(player.includes('video.playbackRate = playbackRateRef.current'));
  assert.ok(player.includes('playbackRateRef.current = rate'));
});
