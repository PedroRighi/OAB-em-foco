import Hls from 'hls.js';
import type {
  FragmentLoaderConstructor,
  HlsConfig,
  Loader,
  LoaderCallbacks,
  LoaderConfiguration,
  LoaderContext,
  LoaderResponse,
  LoaderStats,
  FragmentLoaderContext,
} from 'hls.js';
import { decryptVideoSegment } from './privateVideoCrypto';

const STORAGE_PREFIX = '/manus-storage/oab-private-videos/';
const LOADER_ERROR = 'Encrypted video segment failed integrity validation';

interface ActiveLoad {
  context: FragmentLoaderContext;
  callbacks: LoaderCallbacks<FragmentLoaderContext>;
  cancelled: boolean;
  terminal: boolean;
  abortNotified: boolean;
}

function validStoragePath(pathname: string): boolean {
  if (
    !pathname.startsWith(STORAGE_PREFIX) ||
    !/^[\x20-\x7E]*$/.test(pathname) ||
    pathname.includes('\\') ||
    pathname.includes('?') ||
    pathname.includes('#') ||
    pathname.includes('%')
  ) {
    return false;
  }

  const segments = pathname.slice(STORAGE_PREFIX.length).split('/');
  const filename = segments.length === 3 ? segments[2] : undefined;
  return (
    segments.length === 3 &&
    segments.every(
      (segment) => segment.length > 0 && segment !== '.' && segment !== '..',
    ) &&
    filename !== undefined &&
    filename.endsWith('.bin') &&
    filename.length > '.bin'.length
  );
}

function getAllowedRequestPath(url: string): string | null {
  if (typeof url !== 'string') return null;

  const browserLocation = globalThis.location;
  if (!browserLocation) {
    return url.startsWith('/') && validStoragePath(url) ? url : null;
  }

  let parsed: URL;
  try {
    parsed = new URL(url, browserLocation.href);
  } catch {
    return null;
  }

  if (
    (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') ||
    parsed.origin !== browserLocation.origin ||
    parsed.username !== '' ||
    parsed.password !== '' ||
    parsed.search !== '' ||
    parsed.hash !== ''
  ) {
    return null;
  }

  return validStoragePath(parsed.pathname) ? parsed.pathname : null;
}

function integrityError(
  callbacks: LoaderCallbacks<FragmentLoaderContext>,
  context: FragmentLoaderContext,
  stats: LoaderStats,
): void {
  callbacks.onError(
    { code: 0, text: LOADER_ERROR },
    context,
    null,
    stats,
  );
}

class EncryptedFragmentLoader implements Loader<FragmentLoaderContext> {
  private readonly networkLoader: Loader<LoaderContext>;
  private readonly key: CryptoKey;
  private activeLoad: ActiveLoad | null = null;
  private destroyed = false;

  public readonly stats: LoaderStats;

  public constructor(config: HlsConfig, key: CryptoKey) {
    this.key = key;
    const NetworkLoader = Hls.DefaultConfig.loader;
    this.networkLoader = new NetworkLoader(config);
    this.stats = this.networkLoader.stats;
  }

  public get context(): FragmentLoaderContext | null {
    return this.activeLoad?.context ?? null;
  }

  public load(
    context: FragmentLoaderContext,
    config: LoaderConfiguration,
    callbacks: LoaderCallbacks<FragmentLoaderContext>,
  ): void {
    if (this.destroyed) return;

    this.activeLoad = {
      context,
      callbacks,
      cancelled: false,
      terminal: false,
      abortNotified: false,
    };
    const activeLoad = this.activeLoad;
    const pathname = getAllowedRequestPath(context.url);

    if (!pathname) {
      queueMicrotask(() => {
        if (this.activeLoad !== activeLoad || activeLoad.cancelled) return;
        activeLoad.terminal = true;
        integrityError(callbacks, context, this.stats);
      });
      return;
    }

    const networkCallbacks: LoaderCallbacks<LoaderContext> = {
      onSuccess: (response, stats, _networkContext, networkDetails) => {
        if (
          this.activeLoad !== activeLoad ||
          activeLoad.cancelled ||
          activeLoad.terminal
        ) {
          return;
        }

        const responseData = response.data;
        if (!(responseData instanceof ArrayBuffer)) {
          activeLoad.terminal = true;
          integrityError(callbacks, context, stats);
          return;
        }

        void decryptVideoSegment(responseData, this.key, pathname)
          .then((plaintext) => {
            if (
              this.activeLoad !== activeLoad ||
              activeLoad.cancelled ||
              activeLoad.terminal
            ) {
              return;
            }
            activeLoad.terminal = true;
            const decryptedResponse: LoaderResponse = {
              ...response,
              data: plaintext,
            };
            callbacks.onSuccess(
              decryptedResponse,
              stats,
              context,
              networkDetails,
            );
          })
          .catch(() => {
            if (
              this.activeLoad !== activeLoad ||
              activeLoad.cancelled ||
              activeLoad.terminal
            ) {
              return;
            }
            activeLoad.terminal = true;
            integrityError(callbacks, context, stats);
          });
      },
      onError: (error, _networkContext, networkDetails, stats) => {
        if (
          this.activeLoad !== activeLoad ||
          activeLoad.cancelled ||
          activeLoad.terminal
        ) {
          return;
        }
        activeLoad.terminal = true;
        callbacks.onError(error, context, networkDetails, stats);
      },
      onTimeout: (stats, _networkContext, networkDetails) => {
        if (
          this.activeLoad !== activeLoad ||
          activeLoad.cancelled ||
          activeLoad.terminal
        ) {
          return;
        }
        activeLoad.terminal = true;
        callbacks.onTimeout(stats, context, networkDetails);
      },
      onAbort: (stats, _networkContext, networkDetails) => {
        if (
          this.activeLoad !== activeLoad ||
          activeLoad.abortNotified ||
          activeLoad.terminal
        ) {
          return;
        }
        activeLoad.abortNotified = true;
        activeLoad.cancelled = true;
        activeLoad.terminal = true;
        callbacks.onAbort?.(stats, context, networkDetails);
      },
    };

    this.networkLoader.load(context, config, networkCallbacks);
  }

  public abort(): void {
    const activeLoad = this.activeLoad;
    if (activeLoad && !activeLoad.terminal) {
      activeLoad.cancelled = true;
    }
    this.networkLoader.abort();
  }

  public destroy(): void {
    this.destroyed = true;
    if (this.activeLoad) {
      this.activeLoad.cancelled = true;
      this.activeLoad.terminal = true;
    }
    this.activeLoad = null;
    this.networkLoader.destroy();
  }

  public getCacheAge(): number | null {
    return this.networkLoader.getCacheAge?.() ?? null;
  }

  public getResponseHeader(name: string): string | null {
    return this.networkLoader.getResponseHeader?.(name) ?? null;
  }
}

export function createEncryptedFragmentLoader(
  key: CryptoKey,
): FragmentLoaderConstructor {
  return class EncryptedFragmentLoaderForKey extends EncryptedFragmentLoader {
    public constructor(config: HlsConfig) {
      super(config, key);
    }
  };
}
