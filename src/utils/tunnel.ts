/**
 * Helpers to route web content through the KSP gateway custom scheme.
 *
 * A normal `https://example.com/path?q` becomes a request the Tauri backend
 * serves via the `kspweb` protocol. On Windows/Linux Tauri exposes custom
 * schemes as `http://<scheme>.localhost/...`; on macOS as `<scheme>://...`.
 * We build the host-relative path `/<scheme>/<host>/<path>?<query>` which the
 * backend (`network/kspweb.rs`) decodes back into the real URL.
 */

/** Returns true if this URL should be tunneled through the gateway. */
export function isTunnelable(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}

/**
 * Convert a real http(s) URL into the webview-loadable kspweb URL.
 * Returns null if the URL isn't tunnelable.
 */
export function toTunnelUrl(realUrl: string): string | null {
  if (!isTunnelable(realUrl)) return null;
  try {
    const u = new URL(realUrl);
    const scheme = u.protocol.replace(':', ''); // "https"
    const host = u.host; // includes port if present
    const path = u.pathname === '/' ? '/' : u.pathname;
    const query = u.search; // includes leading "?" or ""
    // Windows/Linux form. Tauri maps this to the registered async scheme.
    return `http://kspweb.localhost/${scheme}/${host}${path}${query}`;
  } catch {
    return null;
  }
}

/** Convert a kspweb URL back to the real URL it represents (for the address bar). */
export function fromTunnelUrl(tunnelUrl: string): string | null {
  try {
    const u = new URL(tunnelUrl);
    if (!u.hostname.startsWith('kspweb')) return null;
    const segments = u.pathname.replace(/^\//, '').split('/');
    const scheme = segments.shift();
    const host = segments.shift();
    if (!scheme || !host) return null;
    const rest = segments.join('/');
    return `${scheme}://${host}/${rest}${u.search}`;
  } catch {
    return null;
  }
}
