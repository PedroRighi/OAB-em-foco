const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const progressKey = 'oab-em-foco-48-progress-v1';
const themeKey = 'oab-em-foco-theme-v1';
const progressValue = JSON.stringify({ completedTopics: { civil: ['sucessoes'] }, extra: 'preservar', quizResults: [{ id: 'antigo' }] });

function environment(saved, dark = false, blocked = false) {
  const storage = new Map([[progressKey, progressValue]]);
  if (saved !== undefined) storage.set(themeKey, saved);
  const writes = [];
  const document = {
    documentElement: { dataset: {}, style: {} },
    querySelector: () => ({ setAttribute: (key, value) => { document.meta = { key, value }; } }),
  };
  const localStorage = {
    getItem: (key) => { if (blocked) throw new Error('Sem acesso'); return storage.get(key) ?? null; },
    setItem: (key, value) => { if (blocked) throw new Error('Sem acesso'); writes.push(key); storage.set(key, value); },
  };
  const matchMedia = () => ({ matches: dark });
  const window = { localStorage, matchMedia };
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(path.join(root, 'src/lib/theme.ts'), 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText;
  new Function('window', 'document', 'module', 'exports', code)(window, document, module, module.exports);
  return { library: module.exports, storage, writes, document, window, localStorage, matchMedia };
}

test('aparência usa chave própria, não grava na leitura e preserva progresso ao alternar', () => {
  const env = environment('dark');
  const { library } = env;
  assert.equal(library.THEME_KEY, themeKey);
  assert.equal(library.readThemePreference(), 'dark');
  assert.deepEqual(env.writes, []);
  for (const preference of ['dark', 'light', 'system']) {
    library.applyTheme(preference);
    assert.equal(library.saveThemePreference(preference), true);
    assert.equal(env.storage.get(progressKey), progressValue);
  }
  assert.deepEqual(env.writes, [themeKey, themeKey, themeKey]);
});

test('tema automático respeita o sistema e preferências inválidas voltam ao automático', () => {
  for (const dark of [false, true]) {
    const env = environment('invalido', dark);
    assert.equal(env.library.readThemePreference(), 'system');
    assert.equal(env.library.applyTheme('system'), dark ? 'dark' : 'light');
    assert.equal(env.document.documentElement.dataset.theme, dark ? 'dark' : 'light');
    assert.equal(env.library.applyTheme('light'), 'light');
    assert.equal(env.library.applyTheme('dark'), 'dark');
    assert.equal(env.library.resolveTheme('system', dark), dark ? 'dark' : 'light');
  }
});

test('bloqueio do armazenamento não impede aplicar aparência e não toca no progresso', () => {
  const env = environment(undefined, true, true);
  assert.equal(env.library.readThemePreference(), 'system');
  assert.equal(env.library.applyTheme('dark'), 'dark');
  assert.equal(env.library.saveThemePreference('dark'), false);
  assert.equal(env.storage.get(progressKey), progressValue);
  assert.deepEqual(env.writes, []);
});

test('bootstrap do HTML aplica tema antes do React, sem nenhuma escrita no armazenamento', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const bootstrap = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  for (const saved of [undefined, 'light', 'dark', 'system', 'antigo-invalido']) {
    for (const dark of [false, true]) {
      const env = environment(saved, dark);
      vm.runInNewContext(bootstrap, { document: env.document, localStorage: env.localStorage, matchMedia: env.matchMedia });
      const expected = saved === 'light' || saved === 'dark' ? saved : dark ? 'dark' : 'light';
      assert.equal(env.document.documentElement.dataset.theme, expected);
      assert.equal(env.document.documentElement.style.colorScheme, expected);
      assert.equal(env.document.meta.value, expected === 'dark' ? '#101a18' : '#f6f5f0');
      assert.equal(env.storage.get(progressKey), progressValue);
      assert.deepEqual(env.writes, []);
    }
  }
  const blocked = environment(undefined, true, true);
  vm.runInNewContext(bootstrap, { document: blocked.document, localStorage: blocked.localStorage, matchMedia: blocked.matchMedia });
  assert.equal(blocked.document.documentElement.dataset.theme, 'dark');
  assert.ok(html.indexOf(bootstrap) < html.indexOf('src="/src/main.tsx"'));
});

function luminance(hex) {
  const values = hex.slice(1).match(/../g).map((part) => parseInt(part, 16) / 255).map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
}
function contrast(first, second) {
  const a = luminance(first), b = luminance(second);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
function tokens(block) {
  return Object.fromEntries([...block.matchAll(/(--[\w-]+):\s*(#[a-f\d]{6})/gi)].map((match) => [match[1], match[2]]));
}

for (const mode of ['light', 'dark']) test(`paleta ${mode}: leitura 4,5:1, legendas e foco/controles 3:1 nos pares usados`, () => {
  const css = fs.readFileSync(path.join(root, 'src/theme.css'), 'utf8');
  const primaryCss = fs.readFileSync(path.join(root, 'src/styles.css'), 'utf8');
  const base = { ...tokens(primaryCss.match(/:root\s*\{([^}]+)\}/)[1]), ...tokens(css.match(/:root\s*\{([^}]+)\}/)[1]) };
  const palette = mode === 'dark' ? { ...base, ...tokens(css.match(/:root\[data-theme="dark"\]\s*\{([^}]+)\}/)[1]) } : base;
  const textRoles = ['--text', '--ink', '--text-secondary', '--text-subtle', '--text-strong', '--accent-text'];
  const surfaces = ['--paper', '--page', '--sidebar-bg', '--surface-raised', '--surface-hover', '--surface-selected'];
  for (const foreground of textRoles) {
    for (const background of surfaces) {
      const ratio = contrast(palette[foreground], palette[background]);
      assert.ok(ratio >= 4.5, `${foreground}/${background}: ${ratio.toFixed(2)}`);
    }
  }
  for (const [foreground, background] of [['--warm-text', '--surface-warm'], ['--text-secondary', '--surface-warm'], ['--success-text', '--surface-success'], ['--danger-text', '--surface-danger'], ['--on-brand', '--brand-bg'], ['--on-brand', '--brand-hover'], ['--on-brand', '--success-fill'], ['--on-accent', '--teal'], ['--on-gold', '--gold']]) {
    const ratio = contrast(palette[foreground], palette[background]);
    assert.ok(ratio >= 4.5, `${foreground}/${background}: ${ratio.toFixed(2)}`);
  }
  for (const foreground of ['--focus', '--control-border']) {
    for (const background of ['--paper', '--page', '--surface-hover']) {
      const ratio = contrast(palette[foreground], palette[background]);
      assert.ok(ratio >= 3, `${foreground}/${background}: ${ratio.toFixed(2)}`);
    }
  }
  for (const background of ['--surface-selected', '--surface-success']) assert.ok(contrast(palette['--border-accent'], palette[background]) >= 3);
  const heroSmall = css.match(/\.welcome-side small\s*\{\s*color:\s*(#[a-f\d]{6})/i)[1];
  assert.ok(contrast(heroSmall, palette['--brand-bg']) >= 4.5);
  assert.ok(css.includes('.plan-tab small { color: var(--text-secondary); }'));
  assert.ok(contrast(palette['--text-secondary'], palette['--surface-neutral']) >= 4.5);
});

test('controle usa select nativo rotulado, acompanha sistema e estilos não invertem mídias', () => {
  const component = fs.readFileSync(path.join(root, 'src/components/ThemeControl.tsx'), 'utf8');
  const shell = fs.readFileSync(path.join(root, 'src/components/AppShell.tsx'), 'utf8');
  const styles = fs.readFileSync(path.join(root, 'src/theme.css'), 'utf8');
  assert.ok(shell.includes('<ThemeControl />'));
  assert.ok(component.includes('htmlFor="appearance-theme"'));
  assert.ok(component.includes('id="appearance-theme"'));
  for (const preference of ['light', 'dark', 'system']) assert.ok(component.includes(`value="${preference}"`));
  assert.ok(component.includes("addEventListener('change'"));
  assert.ok(component.includes("removeEventListener('change'"));
  assert.ok(component.includes('aria-describedby="appearance-hint"'));
  assert.ok(styles.includes(':focus-visible'));
  assert.ok(!/filter:\s*invert/.test(styles));
});
