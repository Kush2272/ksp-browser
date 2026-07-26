export type ProtocolFamily = 
  | 'ksp-native' 
  | 'https' 
  | 'http' 
  | 'wss' 
  | 'ws'
  | 'localhost'
  | 'ip'
  | 'search';

export interface ClassifiedAddress {
  original: string;
  normalized: string;
  family: ProtocolFamily;
  isSecure: boolean;
  hostname: string;
}

/**
 * Classifies an address bar string into its intended protocol and destination.
 */
export function classifyAddress(input: string): ClassifiedAddress {
  const trimmed = input.trim();
  
  // If it has spaces, it's a search query
  if (trimmed.includes(' ') && !trimmed.startsWith('ksp://')) {
    return {
      original: trimmed,
      normalized: `https://duckduckgo.com/?q=${encodeURIComponent(trimmed)}`,
      family: 'search',
      isSecure: true,
      hostname: 'duckduckgo.com',
    };
  }

  let urlStr = trimmed;
  // If no scheme is provided, we default to ksp://
  if (!urlStr.includes('://')) {
    // Basic heuristic for localhost or IP
    const isLocalhost = urlStr.startsWith('localhost') || urlStr.startsWith('127.0.0.1');
    const isIp = /^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/.test(urlStr);
    
    if (isLocalhost) {
      urlStr = 'http://' + urlStr;
    } else if (isIp) {
      urlStr = 'http://' + urlStr;
    } else {
      urlStr = 'ksp://' + urlStr;
    }
  }

  try {
    const url = new URL(urlStr);
    const family = determineFamily(url);
    
    return {
      original: trimmed,
      normalized: url.toString(),
      family,
      isSecure: family === 'ksp-native' || family === 'https' || family === 'wss',
      hostname: url.hostname,
    };
  } catch (e) {
    // Fallback to search if it's completely unparseable
    return {
      original: trimmed,
      normalized: `https://duckduckgo.com/?q=${encodeURIComponent(trimmed)}`,
      family: 'search',
      isSecure: true,
      hostname: 'duckduckgo.com',
    };
  }
}

function determineFamily(url: URL): ProtocolFamily {
  switch (url.protocol) {
    case 'ksp:':
      return 'ksp-native';
    case 'https:':
      return 'https';
    case 'http:':
      if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') return 'localhost';
      if (/^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$/.test(url.hostname)) return 'ip';
      return 'http';
    case 'wss:':
      return 'wss';
    case 'ws:':
      return 'ws';
    default:
      return 'https'; // Default fallback
  }
}
