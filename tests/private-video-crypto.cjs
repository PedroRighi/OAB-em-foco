const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const ts = require('typescript');
const Hls = require('hls.js');

const root = path.resolve(__dirname, '..');
const encoder = new TextEncoder();
const ACCESS_AAD = 'oab-video-access-v1';
const SEGMENT_AAD_PREFIX = 'oab-video-segment-v1:';
const ACCESS_PLAINTEXT = 'OAB em Foco video access v1';
const ITERATIONS = 600000;
const STORAGE_PATH = '/manus-storage/oab-private-videos/pack-a/lesson-1/segment-1.bin';

function load(relative) {
  const filename = path.resolve(root, relative);
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
      esModuleInterop: true,
      verbatimModuleSyntax: true,
    },
  }).outputText;
  const localRequire = (request) => {
    if (!request.startsWith('.')) return require(request);
    const base = path.resolve(path.dirname(filename), request);
    const target = [base, `${base}.ts`, `${base}.tsx`].find(
      (candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile(),
    );
    if (!target) throw new Error(`Cannot resolve ${request}`);
    return load(path.relative(root, target));
  };
  new Function('require', 'module', 'exports', code)(
    localRequire,
    module,
    module.exports,
  );
  return module.exports;
}

const cryptoLibrary = load('src/lib/privateVideoCrypto.ts');
const loaderLibrary = load('src/lib/encryptedVideoLoader.ts');

function base64(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function concatBuffers(...buffers) {
  const total = buffers.reduce((size, buffer) => size + buffer.byteLength, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const buffer of buffers) {
    result.set(new Uint8Array(buffer), offset);
    offset += buffer.byteLength;
  }
  return result.buffer;
}

async function deriveTestKey(code, salt, usages = ['encrypt', 'decrypt']) {
  const password = await crypto.subtle.importKey(
    'raw',
    encoder.encode(code),
    { name: 'PBKDF2' },
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
    password,
    { name: 'AES-GCM', length: 256 },
    false,
    usages,
  );
}

async function createFixture() {
  const code = 'correct private video code 2026';
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveTestKey(code, salt);
  const checkIv = crypto.getRandomValues(new Uint8Array(12));
  const checkCiphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: checkIv, additionalData: encoder.encode(ACCESS_AAD) },
    key,
    encoder.encode(ACCESS_PLAINTEXT),
  );
  const encryption = {
    salt: base64(salt),
    iterations: ITERATIONS,
    checkIv: base64(checkIv),
    checkCiphertext: base64(new Uint8Array(checkCiphertext)),
  };
  const decryptKey = await cryptoLibrary.unlockVideoKey(code, encryption);
  return { code, key, decryptKey, encryption };
}

async function encryptSegment(key, pathname = STORAGE_PATH, plaintext = 'segment plaintext') {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
      additionalData: encoder.encode(SEGMENT_AAD_PREFIX + pathname),
    },
    key,
    encoder.encode(plaintext),
  );
  return concatBuffers(iv.buffer, ciphertext);
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

test('desbloqueia uma chave AES-GCM somente para decrypt e descriptografa fragmento válido', async () => {
  const fixture = await createFixture();
  assert.equal(fixture.decryptKey.extractable, false);
  assert.deepEqual(fixture.decryptKey.usages, ['decrypt']);

  const encrypted = await encryptSegment(fixture.key, STORAGE_PATH, 'conteúdo sintético');
  const plaintext = await cryptoLibrary.decryptVideoSegment(
    encrypted,
    fixture.decryptKey,
    STORAGE_PATH,
  );
  assert.equal(new TextDecoder().decode(plaintext), 'conteúdo sintético');
});

test('senha errada é rejeitada sem expor o código ou detalhes criptográficos', async () => {
  const fixture = await createFixture();
  await assert.rejects(
    cryptoLibrary.unlockVideoKey('wrong private video code 2026', fixture.encryption),
    (error) => {
      assert.match(error.message, /^Unable to unlock private video$/);
      assert.equal(error.message.includes(fixture.code), false);
      return true;
    },
  );
});

test('tamper no ciphertext e AAD diferente falham autenticação', async () => {
  const fixture = await createFixture();
  const encrypted = await encryptSegment(fixture.key);
  const tampered = new Uint8Array(encrypted.slice(0));
  tampered[tampered.length - 1] ^= 1;
  await assert.rejects(
    cryptoLibrary.decryptVideoSegment(tampered.buffer, fixture.decryptKey, STORAGE_PATH),
    /^Error: Unable to decrypt private video segment$/,
  );
  await assert.rejects(
    cryptoLibrary.decryptVideoSegment(
      encrypted,
      fixture.decryptKey,
      '/manus-storage/oab-private-videos/pack-a/lesson-2/segment-1.bin',
    ),
    /^Error: Unable to decrypt private video segment$/,
  );
});

test('fragmento truncado e pathname fora do storage privado são rejeitados', async () => {
  const fixture = await createFixture();
  await assert.rejects(
    cryptoLibrary.decryptVideoSegment(new ArrayBuffer(27), fixture.decryptKey, STORAGE_PATH),
    /^Error: Unable to decrypt private video segment$/,
  );
  await assert.rejects(
    cryptoLibrary.decryptVideoSegment(
      new ArrayBuffer(28),
      fixture.decryptKey,
      '/manus-storage/public/pack-a/lesson-1/segment-1.bin',
    ),
    /^Error: Unable to decrypt private video segment$/,
  );
});

test('loader delega rede ao loader padrão, entrega somente plaintext e cobre initSegment', async () => {
  const fixture = await createFixture();
  const encrypted = await encryptSegment(fixture.key, STORAGE_PATH, 'init ou media');
  const OriginalLoader = Hls.DefaultConfig.loader;
  const requests = [];

  class FakeNetworkLoader {
    constructor() {
      this.stats = {
        aborted: false,
        loaded: encrypted.byteLength,
        retry: 2,
        total: encrypted.byteLength,
        chunkCount: 0,
        bwEstimate: 0,
        loading: { start: 1, first: 2, end: 3 },
        parsing: { start: 0, end: 0 },
        buffering: { start: 0, first: 0, end: 0 },
      };
      this.context = null;
      this.callbacks = null;
    }
    load(context, config, callbacks) {
      this.context = context;
      this.callbacks = callbacks;
      requests.push({ context, config, loader: this });
      queueMicrotask(() => callbacks.onSuccess(
        { url: context.url, code: 200, data: encrypted },
        this.stats,
        context,
        null,
      ));
    }
    abort() {
      this.stats.aborted = true;
      this.callbacks?.onAbort?.(this.stats, this.context, null);
    }
    destroy() {
      this.callbacks = null;
      this.context = null;
    }
    getCacheAge() { return 7; }
    getResponseHeader(name) { return name === 'age' ? '7' : null; }
  }

  Hls.DefaultConfig.loader = FakeNetworkLoader;
  try {
    const Factory = loaderLibrary.createEncryptedFragmentLoader(fixture.decryptKey);
    const loader = new Factory({});
    const context = {
      url: STORAGE_PATH,
      responseType: 'arraybuffer',
      type: 'media-fragment',
      frag: {},
      part: null,
    };
    const result = await new Promise((resolve, reject) => {
      loader.load(context, {
        loadPolicy: {
          maxTimeToFirstByteMs: 10,
          maxLoadTimeMs: 20,
          timeoutRetry: null,
          errorRetry: null,
        },
        maxRetry: 0,
        timeout: 20,
        retryDelay: 0,
        maxRetryDelay: 0,
      }, {
        onSuccess: (response, stats) => resolve({ response, stats }),
        onError: reject,
        onTimeout: () => reject(new Error('unexpected timeout')),
      });
    });
    assert.equal(new TextDecoder().decode(result.response.data), 'init ou media');
    assert.equal(result.response.data.byteLength < encrypted.byteLength, true);
    assert.equal(result.stats.retry, 2);
    assert.equal(loader.getCacheAge(), 7);
    assert.equal(loader.getResponseHeader('age'), '7');
    assert.equal(requests.length, 1);
  } finally {
    Hls.DefaultConfig.loader = OriginalLoader;
  }
});

test('loader envia integridade inválida para onError sem payload ao decoder', async () => {
  const fixture = await createFixture();
  const encrypted = new Uint8Array(await encryptSegment(fixture.key));
  encrypted[encrypted.length - 1] ^= 1;
  const OriginalLoader = Hls.DefaultConfig.loader;

  class BadNetworkLoader {
    constructor() {
      this.stats = {
        aborted: false,
        loaded: encrypted.byteLength,
        retry: 0,
        total: encrypted.byteLength,
        chunkCount: 0,
        bwEstimate: 0,
        loading: { start: 1, first: 2, end: 3 },
        parsing: { start: 0, end: 0 },
        buffering: { start: 0, first: 0, end: 0 },
      };
      this.context = null;
      this.callbacks = null;
    }
    load(context, config, callbacks) {
      this.context = context;
      this.callbacks = callbacks;
      queueMicrotask(() => callbacks.onSuccess(
        { url: context.url, code: 200, data: encrypted.buffer },
        this.stats,
        context,
        null,
      ));
    }
    abort() {}
    destroy() {}
  }

  Hls.DefaultConfig.loader = BadNetworkLoader;
  try {
    const Factory = loaderLibrary.createEncryptedFragmentLoader(fixture.decryptKey);
    const loader = new Factory({});
    const context = {
      url: STORAGE_PATH,
      responseType: 'arraybuffer',
      type: 'media-fragment',
      frag: {},
      part: null,
    };
    const failure = await new Promise((resolve, reject) => {
      loader.load(context, {
        loadPolicy: {
          maxTimeToFirstByteMs: 10,
          maxLoadTimeMs: 20,
          timeoutRetry: null,
          errorRetry: null,
        },
        maxRetry: 0,
        timeout: 20,
        retryDelay: 0,
        maxRetryDelay: 0,
      }, {
        onSuccess: () => reject(new Error('unexpected decrypted payload')),
        onError: (error) => resolve(error),
        onTimeout: () => reject(new Error('unexpected timeout')),
      });
    });
    assert.equal(failure.code, 0);
    assert.equal(failure.text, 'Encrypted video segment failed integrity validation');
    assert.equal(failure.data, undefined);
    loader.destroy();
  } finally {
    Hls.DefaultConfig.loader = OriginalLoader;
  }
});

test('abort invalida callbacks tardios e nunca entrega ciphertext', async () => {
  const fixture = await createFixture();
  const encrypted = await encryptSegment(fixture.key, STORAGE_PATH, 'abort payload');
  const OriginalLoader = Hls.DefaultConfig.loader;
  const events = [];

  class SlowNetworkLoader {
    constructor() {
      this.stats = {
        aborted: false,
        loaded: 0,
        retry: 0,
        total: encrypted.byteLength,
        chunkCount: 0,
        bwEstimate: 0,
        loading: { start: 1, first: 0, end: 0 },
        parsing: { start: 0, end: 0 },
        buffering: { start: 0, first: 0, end: 0 },
      };
      this.context = null;
      this.callbacks = null;
    }
    load(context, config, callbacks) {
      this.context = context;
      this.callbacks = callbacks;
      setTimeout(() => callbacks.onSuccess(
        { url: context.url, code: 200, data: encrypted },
        this.stats,
        context,
        null,
      ), 25);
    }
    abort() {
      this.stats.aborted = true;
      this.callbacks?.onAbort?.(this.stats, this.context, null);
    }
    destroy() {}
  }

  Hls.DefaultConfig.loader = SlowNetworkLoader;
  try {
    const Factory = loaderLibrary.createEncryptedFragmentLoader(fixture.decryptKey);
    const loader = new Factory({});
    const context = {
      url: STORAGE_PATH,
      responseType: 'arraybuffer',
      type: 'media-fragment',
      frag: {},
      part: null,
    };
    loader.load(context, {
      loadPolicy: {
        maxTimeToFirstByteMs: 10,
        maxLoadTimeMs: 20,
        timeoutRetry: null,
        errorRetry: null,
      },
      maxRetry: 0,
      timeout: 20,
      retryDelay: 0,
      maxRetryDelay: 0,
    }, {
      onSuccess: () => events.push('success'),
      onError: (error) => events.push(['error', error.text]),
      onTimeout: () => events.push('timeout'),
      onAbort: () => events.push('abort'),
    });
    loader.abort();
    await wait(50);
    assert.deepEqual(events, ['abort']);
    loader.destroy();
  } finally {
    Hls.DefaultConfig.loader = OriginalLoader;
  }
});
