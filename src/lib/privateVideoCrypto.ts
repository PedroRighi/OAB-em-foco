export interface VideoEncryption {
  salt: string;
  iterations: number;
  checkIv: string;
  checkCiphertext: string;
}

const PBKDF2_ITERATIONS = 600_000;
const PBKDF2_SALT_BYTES = 16;
const GCM_IV_BYTES = 12;
const GCM_TAG_BYTES = 16;
const MIN_CODE_LENGTH = 20;
const MIN_FRAGMENT_BYTES = GCM_IV_BYTES + GCM_TAG_BYTES;
const MAX_FRAGMENT_BYTES = 32 * 1024 * 1024;

const ACCESS_AAD = 'oab-video-access-v1';
const SEGMENT_AAD_PREFIX = 'oab-video-segment-v1:';
const ACCESS_PLAINTEXT = 'OAB em Foco video access v1';
const STORAGE_PREFIX = '/manus-storage/oab-private-videos/';
const textEncoder = new TextEncoder();

const UNLOCK_ERROR = 'Unable to unlock private video';
const DECRYPT_ERROR = 'Unable to decrypt private video segment';

function publicError(message: string): Error {
  return new Error(message);
}

function bytesToArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}

function decodeBase64(value: unknown): Uint8Array {
  if (
    typeof value !== 'string' ||
    value.length === 0 ||
    value.length % 4 !== 0 ||
    !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
      value,
    )
  ) {
    throw publicError('Invalid private video parameters');
  }

  let binary: string;
  try {
    binary = globalThis.atob(value);
  } catch {
    throw publicError('Invalid private video parameters');
  }

  if (globalThis.btoa(binary) !== value) {
    throw publicError('Invalid private video parameters');
  }

  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function validateEncryption(encryption: VideoEncryption): {
  salt: Uint8Array;
  checkIv: Uint8Array;
  checkCiphertext: Uint8Array;
} {
  if (!encryption || typeof encryption !== 'object') {
    throw publicError('Invalid private video parameters');
  }
  if (encryption.iterations !== PBKDF2_ITERATIONS) {
    throw publicError('Invalid private video parameters');
  }

  const salt = decodeBase64(encryption.salt);
  const checkIv = decodeBase64(encryption.checkIv);
  const checkCiphertext = decodeBase64(encryption.checkCiphertext);

  if (
    salt.byteLength !== PBKDF2_SALT_BYTES ||
    checkIv.byteLength !== GCM_IV_BYTES ||
    checkCiphertext.byteLength !==
      textEncoder.encode(ACCESS_PLAINTEXT).byteLength + GCM_TAG_BYTES
  ) {
    throw publicError('Invalid private video parameters');
  }

  return { salt, checkIv, checkCiphertext };
}

function validatePathname(pathname: string): void {
  if (
    typeof pathname !== 'string' ||
    !pathname.startsWith(STORAGE_PREFIX) ||
    pathname.length <= STORAGE_PREFIX.length ||
    !/^[\x20-\x7E]*$/.test(pathname) ||
    pathname.includes('\\') ||
    pathname.includes('?') ||
    pathname.includes('#') ||
    pathname.includes('%')
  ) {
    throw publicError(DECRYPT_ERROR);
  }

  const segments = pathname.slice(STORAGE_PREFIX.length).split('/');
  const filename = segments.length === 3 ? segments[2] : undefined;
  if (
    segments.length !== 3 ||
    segments.some(
      (segment) => segment.length === 0 || segment === '.' || segment === '..',
    ) ||
    !filename ||
    !filename.endsWith('.bin') ||
    filename.length <= '.bin'.length
  ) {
    throw publicError(DECRYPT_ERROR);
  }
}

function getSubtleCrypto(): SubtleCrypto {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw publicError(UNLOCK_ERROR);
  }
  return subtle;
}

function bytesEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.byteLength !== right.byteLength) return false;
  let difference = 0;
  for (let index = 0; index < left.byteLength; index += 1) {
    difference |= (left[index] ?? 0) ^ (right[index] ?? 0);
  }
  return difference === 0;
}

export async function unlockVideoKey(
  code: string,
  encryption: VideoEncryption,
): Promise<CryptoKey> {
  try {
    if (typeof code !== 'string' || code.length < MIN_CODE_LENGTH) {
      throw publicError(UNLOCK_ERROR);
    }

    const { salt, checkIv, checkCiphertext } = validateEncryption(encryption);
    const subtle = getSubtleCrypto();
    const codeBytes = textEncoder.encode(code);
    let passwordKey: CryptoKey;

    try {
      passwordKey = await subtle.importKey(
        'raw',
        bytesToArrayBuffer(codeBytes),
        { name: 'PBKDF2' },
        false,
        ['deriveKey'],
      );
    } finally {
      codeBytes.fill(0);
    }

    const key = await subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: bytesToArrayBuffer(salt),
        iterations: PBKDF2_ITERATIONS,
        hash: 'SHA-256',
      },
      passwordKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt'],
    );

    const plaintext = await subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: bytesToArrayBuffer(checkIv),
        additionalData: bytesToArrayBuffer(textEncoder.encode(ACCESS_AAD)),
        tagLength: 128,
      },
      key,
      bytesToArrayBuffer(checkCiphertext),
    );
    const expected = textEncoder.encode(ACCESS_PLAINTEXT);

    if (!bytesEqual(new Uint8Array(plaintext), expected)) {
      throw publicError(UNLOCK_ERROR);
    }

    return key;
  } catch {
    throw publicError(UNLOCK_ERROR);
  }
}

export async function decryptVideoSegment(
  data: ArrayBuffer,
  key: CryptoKey,
  pathname: string,
): Promise<ArrayBuffer> {
  try {
    validatePathname(pathname);
    if (
      !(data instanceof ArrayBuffer) ||
      data.byteLength < MIN_FRAGMENT_BYTES ||
      data.byteLength > MAX_FRAGMENT_BYTES
    ) {
      throw publicError(DECRYPT_ERROR);
    }

    const subtle = getSubtleCrypto();
    const iv = data.slice(0, GCM_IV_BYTES);
    const ciphertext = data.slice(GCM_IV_BYTES);
    return await subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
        additionalData: textEncoder.encode(SEGMENT_AAD_PREFIX + pathname),
        tagLength: 128,
      },
      key,
      ciphertext,
    );
  } catch {
    throw publicError(DECRYPT_ERROR);
  }
}
