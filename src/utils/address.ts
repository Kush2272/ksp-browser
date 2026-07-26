import { invoke } from '@tauri-apps/api/core';

// ── Types matching the Rust AddressClassification ────────────────────

export type ProtocolFamily = 
  | 'ksp' 
  | 'https' 
  | 'http' 
  | 'wss' 
  | 'ws'
  | 'search';

export type TargetKind =
  | 'native_page'
  | 'native_ksp'
  | 'gateway'
  | 'direct_local'
  | 'web_socket'
  | 'search';

export interface ClassifiedAddress {
  original: string;
  normalized: string;
  family: ProtocolFamily;
  target: TargetKind;
  is_secure: boolean;
  hostname: string;
}

// ── Cache ────────────────────────────────────────────────────────────

let lastInput: string | null = null;
let lastResult: ClassifiedAddress | null = null;

/**
 * Classify an address bar input by calling the authoritative Rust
 * classifier over IPC.
 *
 * Results are cached by input string so repeated calls with the same
 * input (e.g., during re-renders) don't hit IPC again.
 */
export async function classifyAddress(input: string): Promise<ClassifiedAddress> {
  if (input === lastInput && lastResult) {
    return lastResult;
  }
  const result = await invoke<ClassifiedAddress>('classify_address', { input });
  lastInput = input;
  lastResult = result;
  return result;
}

/**
 * Synchronous fallback for cases where the async IPC call can't be
 * awaited (e.g., inside a synchronous Zustand action).
 *
 * Uses the cached result if available; otherwise does a best-effort
 * local classification.  The Rust classifier is always the source of
 * truth — this is only for the tiny window between first render and
 * the IPC response arriving.
 */
export function classifyAddressSync(input: string): ClassifiedAddress {
  if (input === lastInput && lastResult) {
    return lastResult;
  }
  // Minimal local fallback — will be overwritten by the next async call.
  return localFallbackClassify(input);
}

// ── Local fallback (mirrors Rust logic for sync contexts) ────────────

const COMMON_TLDS = ['.com', '.org', '.net', '.io', '.dev', '.edu', '.co', '.ai', '.in', '.gov', '.uk', '.ca'];
const NATIVE_KSP_PAGES = ['home', 'start', 'settings', 'downloads', 'gateway', 'protocol', 'history', 'bookmarks', 'about', 'diagnostics', 'flags'];

function localFallbackClassify(input: string): ClassifiedAddress {
  const trimmed = input.trim();
  const lower = trimmed.toLowerCase();

  if (trimmed.includes(' ') && !trimmed.startsWith('ksp://')) {
    return {
      original: trimmed,
      normalized: `https://duckduckgo.com/?q=${encodeURIComponent(trimmed)}`,
      family: 'search',
      target: 'search',
      is_secure: true,
      hostname: 'duckduckgo.com',
    };
  }

  let urlStr = trimmed;
  if (!urlStr.includes('://')) {
    const isLocalhost = lower.startsWith('localhost') || lower.startsWith('127.0.0.1');
    const isIp = /^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/.test(urlStr);
    const hasTld = lower.startsWith('www.') || COMMON_TLDS.some(tld => lower.includes(tld));
    const isNativePage = NATIVE_KSP_PAGES.includes(lower) || lower.startsWith('ksp/');

    if (isLocalhost || isIp) urlStr = 'http://' + urlStr;
    else if (hasTld) urlStr = 'https://' + urlStr;
    else if (isNativePage) urlStr = 'ksp://' + urlStr;
    else urlStr = 'https://duckduckgo.com/?q=' + encodeURIComponent(trimmed);
  }

  try {
    const url = new URL(urlStr);
    const family = mapFamily(url.protocol);
    return {
      original: trimmed,
      normalized: url.toString(),
      family,
      target: mapTarget(url, family),
      is_secure: family === 'ksp' || family === 'https' || family === 'wss',
      hostname: url.hostname,
    };
  } catch {
    return {
      original: trimmed,
      normalized: `https://duckduckgo.com/?q=${encodeURIComponent(trimmed)}`,
      family: 'search',
      target: 'search',
      is_secure: true,
      hostname: 'duckduckgo.com',
    };
  }
}

function mapFamily(protocol: string): ProtocolFamily {
  switch (protocol) {
    case 'ksp:': return 'ksp';
    case 'https:': return 'https';
    case 'http:': return 'http';
    case 'wss:': return 'wss';
    case 'ws:': return 'ws';
    default: return 'https';
  }
}

function mapTarget(url: URL, family: ProtocolFamily): TargetKind {
  if (family === 'ksp') {
    return NATIVE_KSP_PAGES.includes(url.hostname) ? 'native_page' : 'native_ksp';
  }
  if (family === 'wss' || family === 'ws') return 'web_socket';
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') return 'direct_local';
  if (family === 'search') return 'search';
  return 'gateway';
}
