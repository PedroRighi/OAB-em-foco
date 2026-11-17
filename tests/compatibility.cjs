const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { MemoryRouter } = require('react-router-dom');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const key = 'oab-em-foco-48-progress-v1';
const jsonCopy = (value) => JSON.parse(JSON.stringify(value));

function harness(saved = null) {
  const storage = new Map(saved === null ? [] : [[key, JSON.stringify(saved)]]);
  const writes = [];
  const window = { localStorage: {
    getItem: (name) => storage.get(name) ?? null,
    setItem: (name, value) => { writes.push(name); storage.set(name, value); },
  } };
  let progress;
  const cache = new Map();
  const mockContext = {
    useProgress: () => ({ progress, updateProgress: (updater) => { progress = updater(progress); }, resetProgress: () => {} }),
  };
  function load(relative) {
    const filename = path.resolve(root, relative);
    if (cache.has(filename)) return cache.get(filename).exports;
    const module = { exports: {} };
    cache.set(filename, module);
    const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true, resolveJsonModule: true },
    }).outputText;
    const localRequire = (request) => {
      if (!request.startsWith('.')) return require(request);
      if (request.endsWith('.css')) return {};
      const base = path.resolve(path.dirname(filename), request);
      if (base.endsWith('/context/ProgressContext')) return mockContext;
      if (base.endsWith('.json')) return JSON.parse(fs.readFileSync(base, 'utf8'));
      const target = [base, `${base}.ts`, `${base}.tsx`].find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
      if (!target) throw new Error(`Cannot resolve ${request}`);
      return load(target);
    };
    new Function('require', 'module', 'exports', 'window', code)(localRequire, module, module.exports, window);
    return module.exports;
  }
  const library = load('src/lib/progress.ts');
  progress = library.loadProgress();
  return { load, library, storage, writes, current: () => progress, set: (next) => { progress = next; } };
}

function findElement(node, predicate) {
  if (!node || typeof node !== 'object') return null;
  if (predicate(node)) return node;
  const children = React.Children.toArray(node.props?.children);
  for (const child of children) {
    const found = findElement(child, predicate);
    if (found) return found;
  }
  return null;
}

function planButton(h) {
  const Dashboard = h.load('src/pages/DashboardPage.tsx').default;
  return findElement(Dashboard(), (node) => node.props?.className === 'button button-light');
}

function oldProgress() {
  return {
    version: 1, completedSubjects: ['civil'], completedTopics: { civil: ['Sucessões'] },
    planMode: 'intensive', ceiscDaysCompleted: ['1', '2'],
    intensiveSubjectIds: ['constitucional', 'processo-trabalho', 'civil', 'trabalho', 'processo-penal', 'etica', 'processo-civil', 'tributario', 'administrativo', 'penal'],
    intensiveDaysCompleted: ['intensive-1', 'intensive-2', 'review-1'],
    selectedWeekSubjects: ['civil'], weeklyTopics: 'x'.repeat(3101),
    quizResults: Array.from({ length: 35 }, (_, index) => ({ id: `old-${index}`, completedAt: '2026-11-16T12:00:00.000Z', correct: 18, total: 20, subjectIds: ['civil'], questionIds: ['civil-01'], answers: { 'civil-01': 'A' } })),
    extraExistingField: { preserve: true },
  };
}

test('migração aditiva preserva todos os campos e não grava na leitura', () => {
  const old = oldProgress();
  const h = harness(old);
  assert.equal(h.library.PROGRESS_KEY, key);
  assert.deepEqual(h.writes, []);
  assert.equal(h.storage.get(key), JSON.stringify(old));
  for (const [name, value] of Object.entries(old)) assert.deepEqual(jsonCopy(h.current()[name]), value, name);
  assert.equal(h.current().intensivePlanVariant, 'custom');
  assert.equal(h.current().referencePlanStarted, false);
  assert.deepEqual(h.current().referenceDaysCompleted, []);
  assert.deepEqual(h.current().startedPlanModes, ['ceisc', 'intensive']);
  h.library.saveProgress(h.current());
  const roundtrip = JSON.parse(h.storage.get(key));
  for (const [name, value] of Object.entries(old)) assert.deepEqual(roundtrip[name], value, name);
});

test('começo CEISC leva ao Dia 1 sem concluir; retomada encontra primeiro pendente', () => {
  const h = harness();
  let button = planButton(h);
  assert.equal(button.props.children[0], 'Começar plano');
  assert.equal(button.props.to, '/plano#ceisc-day-1');
  button.props.onClick();
  assert.deepEqual(h.current().ceiscDaysCompleted, []);
  button = planButton(h);
  assert.equal(button.props.children[0], 'Continuar plano');
  assert.equal(button.props.to, '/plano#ceisc-day-1');
  h.set({ ...h.current(), ceiscDaysCompleted: ['1', '3'] });
  assert.equal(planButton(h).props.to, '/plano#ceisc-day-2');
});

test('trilha nova e modelo anterior possuem início e marcações independentes', () => {
  const h = harness(oldProgress());
  assert.equal(planButton(h).props.to, '/plano#intensive-3');
  h.set({ ...h.current(), intensivePlanVariant: 'reference' });
  let button = planButton(h);
  assert.equal(button.props.children[0], 'Começar plano');
  assert.equal(button.props.to, '/plano#reference-1');
  button.props.onClick();
  assert.equal(h.current().referencePlanStarted, true);
  assert.deepEqual(h.current().referenceDaysCompleted, []);
  assert.deepEqual(h.current().intensiveDaysCompleted, oldProgress().intensiveDaysCompleted);
  assert.equal(planButton(h).props.children[0], 'Continuar plano');
  h.set({ ...h.current(), referenceDaysCompleted: ['reference-1', 'reference-3'] });
  assert.equal(planButton(h).props.to, '/plano#reference-2');
  h.set({ ...h.current(), referenceDaysCompleted: Array.from({ length: 40 }, (_, i) => `reference-${i + 1}`) });
  assert.equal(planButton(h).props.to, '/plano#reference-review-1');
});

test('modelo pessoal incompleto abre configuração sem registrar início', () => {
  const h = harness();
  h.set({ ...h.current(), planMode: 'intensive', intensivePlanVariant: 'custom' });
  const button = planButton(h);
  assert.equal(button.props.to, '/plano#intensive-picker');
  button.props.onClick();
  assert.deepEqual(h.current().startedPlanModes, []);
  assert.deepEqual(h.current().intensiveDaysCompleted, []);
});

test('calendário tem 40 dias, seis semanas, dez matérias e datas adaptadas', () => {
  const h = harness();
  const data = h.load('src/data/intensiveReference.ts');
  const schedule = h.load('src/lib/schedule.ts');
  assert.equal(data.referenceDays.length, 40);
  assert.deepEqual(data.referenceDays.map((day) => day.day), Array.from({ length: 40 }, (_, index) => index + 1));
  assert.equal(new Set(data.referenceSubjectIds).size, 10);
  for (const day of data.referenceDays) {
    assert.equal(day.week, Math.ceil(day.day / 7));
    for (const block of day.blocks) assert.ok(data.referenceSubjectIds.includes(block.subjectId));
  }
  assert.deepEqual(data.referenceDays.filter((day) => day.kind === 'mock').map((day) => day.day), [7, 14, 21, 28, 35]);
  assert.deepEqual(data.referenceDays.filter((day) => day.kind === 'review').map((day) => day.day), [6, 13, 20, 27, 34, 36, 37, 38, 39, 40]);
  const days = schedule.createReferenceDates();
  assert.equal(schedule.toDateKey(days[0].date), '2026-11-23');
  assert.equal(schedule.toDateKey(days[39].date), '2027-01-01');
  const reviews = schedule.createReviewDays('reference-review');
  assert.equal(schedule.toDateKey(reviews[0].date), '2027-01-02');
  assert.equal(schedule.toDateKey(reviews[7].date), '2027-01-09');
  assert.equal(reviews[0].key, 'reference-review-1');
  assert.equal(new Set([...days, ...reviews].map((day) => day.key)).size, 48);
});

test('metas 20/18 e proporcional, 204 IDs únicos e 144 itens anteriores intactos', () => {
  const h = harness();
  assert.equal(h.library.quizPassTarget(20), 18);
  assert.equal(h.library.quizPassTarget(10), 9);
  assert.equal(h.library.quizPassTarget(11), 10);
  assert.equal(h.library.quizPassTarget(6), 6);
  const questions = JSON.parse(fs.readFileSync(path.join(root, 'src/data/questions.json')));
  assert.equal(questions.length, 204);
  assert.equal(new Set(questions.map((question) => question.id)).size, 204);
  const baseline = JSON.parse(execFileSync('git', ['show', '1cf324639bf08d7422e0cdf6342248a30947406:src/data/questions.json'], { cwd: root, encoding: 'utf8' }));
  assert.equal(baseline.length, 124);
  for (const question of baseline) assert.deepEqual(questions.find((item) => item.id === question.id), question);
  const previous = JSON.parse(execFileSync('git', ['show', 'b0350d9a8a3ba790f020b1c351d7cfccb8e34f8e:src/data/questions.json'], { cwd: root, encoding: 'utf8' }));
  assert.equal(previous.length, 144);
  for (const question of previous) assert.deepEqual(questions.find((item) => item.id === question.id), question);
  const oldIds = new Set(baseline.map((question) => question.id));
  for (const question of questions.filter((item) => !oldIds.has(item.id))) {
    assert.equal(Object.keys(question.choices).length, 4);
    assert.ok(question.choices[question.answer]);
    assert.ok(question.source.startsWith('Questão autoral de treino'));
    assert.ok((question.topic || question.recurringTopic) && question.references.length);
    for (const reference of question.references) assert.ok(reference.url.startsWith('https://'));
  }
  for (const subject of h.load('src/data/subjects.ts').subjects) assert.ok(questions.filter((question) => question.subjectId === subject.id).length >= 10, subject.id);
  for (const subjectId of ['civil', 'penal', 'processo-trabalho', 'tributario']) assert.equal(questions.filter((question) => question.subjectId === subjectId).length, 11);
});

test('renderização da trilha e do treino individual conserva rótulos e limites', () => {
  const h = harness();
  h.set({ ...h.current(), planMode: 'intensive', intensivePlanVariant: 'reference', selectedWeekSubjects: ['civil'] });
  const Plan = h.load('src/pages/StudyPlanPage.tsx').default;
  const planHtml = renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(Plan)));
  assert.ok(planHtml.includes('Teoria da Constituição'));
  assert.ok(planHtml.includes('Despesas Processuais'));
  assert.ok(planHtml.includes('reference-1'));
  assert.ok(planHtml.includes('Preparar simulado'));
  assert.ok(planHtml.includes('reference-review-8'));
  const Mock = h.load('src/pages/MockExamPage.tsx').default;
  const mockHtml = renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(Mock)));
  assert.ok(mockHtml.includes('Treino só de Civil'));
  assert.ok(mockHtml.includes('11 questões'));
  assert.ok(mockHtml.includes('18 de 20 acertos'));
});

test('todas as 20 disciplinas oferecem treino individual com dez ou onze questões', () => {
  const h = harness();
  const subjects = h.load('src/data/subjects.ts').subjects;
  const questions = JSON.parse(fs.readFileSync(path.join(root, 'src/data/questions.json')));
  const Mock = h.load('src/pages/MockExamPage.tsx').default;
  for (const subject of subjects) {
    h.set({ ...h.current(), selectedWeekSubjects: [subject.id] });
    const count = questions.filter((question) => question.subjectId === subject.id).length;
    const html = renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(Mock)));
    assert.ok(html.includes(`Treino só de ${subject.shortTitle}`), subject.id);
    assert.ok(html.includes(`${count} questões`), subject.id);
    assert.ok(count === 10 || count === 11, subject.id);
  }
});
test('contagem de tópicos confere com os materiais e complementos VDE estão integrados', () => {
  const h = harness();
  const subjects = h.load('src/data/subjects.ts').subjects;
  const { topicCounts } = h.load('src/data/topicCounts.ts');
  const excluded = /^(como usar|mapa dos tópicos centrais|mapa da disciplina|questões|gabarito|referências|referencias|checklist|revisão|revisao|fontes|bibliografia|atualizações e jurisprudência|alterações e jurisprudência|método de leitura|como ler questões|como resolver questões|como estudar)/i;
  const expectedChapters = { constitucional: 5, etica: 3, civil: 1, tributario: 2, penal: 2, 'processo-penal': 1, 'processo-civil': 3, administrativo: 4 };
  let totalChapters = 0;
  for (const subject of subjects) {
    const markdown = fs.readFileSync(path.join(root, 'src/content/materials', subject.material), 'utf8');
    const topics = markdown.split('\n').filter((line) => /^##\s+/.test(line) && !line.startsWith('###')).map((line) => line.replace(/^##\s+/, '').trim()).filter((title) => title && !excluded.test(title));
    assert.equal(topicCounts[subject.id], topics.length, subject.id);
    const titles = markdown.split('\n').filter((line) => line.startsWith('## Aprofundamento VDE — ')).map((line) => line.replace('## Aprofundamento VDE — ', '').trim());
    assert.equal(titles.length, expectedChapters[subject.id] ?? 0, subject.id);
    assert.equal(new Set(titles).size, titles.length, subject.id);
    totalChapters += titles.length;
    if (titles.length) {
      const blocks = markdown.split('\n## Aprofundamento VDE — ').slice(1);
      for (const block of blocks) {
        assert.ok(block.includes('### Referências consultadas'), subject.id);
        assert.ok(block.includes('### Fixação rápida'), subject.id);
        assert.ok(!block.includes('http://'), subject.id);
        assert.ok(!block.includes('Fernando Cursos'), subject.id);
      }
    }
  }
  assert.equal(totalChapters, 21);
});
