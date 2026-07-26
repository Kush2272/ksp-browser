//! Unified address parser, normalizer, and classifier.
//!
//! Merges the old parser.rs + normalizer.rs + router.rs into a single
//! authoritative classifier.  The frontend calls `classify_address` via
//! Tauri invoke and stops duplicating this logic.

use serde::{Deserialize, Serialize};
use url::Url;

// ── Classification types ──────────────────────────────────────────────

/// How the browser should route a classified address.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TargetKind {
    /// A built-in browser page (`ksp://home`, `ksp://settings`, …).
    NativePage,
    /// A KSP-native resource (`.ksp` TLD).
    NativeKsp,
    /// Regular web content tunneled through the KSP gateway.
    Gateway,
    /// Direct HTTP(S) to localhost / loopback — bypasses the gateway.
    DirectLocal,
    /// A WebSocket connection (`ws://` or `wss://`).
    WebSocket,
    /// Input was interpreted as a search query.
    Search,
}

/// The protocol family of the resolved address.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ProtocolFamily {
    Ksp,
    Https,
    Http,
    Wss,
    Ws,
    Search,
}

/// Result of classifying a raw address-bar input.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AddressClassification {
    /// The raw string the user typed.
    pub original: String,
    /// The fully-resolved, normalized URL.
    pub normalized: String,
    /// Which protocol family the URL belongs to.
    pub family: ProtocolFamily,
    /// How the browser should route this address.
    pub target: TargetKind,
    /// Whether the connection is considered secure.
    pub is_secure: bool,
    /// The hostname extracted from the URL, if any.
    pub hostname: String,
}

// ── Constants ─────────────────────────────────────────────────────────

const NATIVE_KSP_PAGES: &[&str] = &[
    "home", "start", "settings", "downloads", "gateway",
    "protocol", "history", "bookmarks", "about", "diagnostics", "flags",
];

const COMMON_TLDS: &[&str] = &[
    ".com", ".org", ".net", ".io", ".dev", ".edu", ".co",
    ".ai", ".in", ".gov", ".uk", ".ca",
];

/// Default search provider URL template.  `%s` is replaced with the query.
const DEFAULT_SEARCH_URL: &str = "https://duckduckgo.com/?q=";

// ── Core classifier ──────────────────────────────────────────────────

/// Classify a raw address-bar input into a fully-resolved
/// [`AddressClassification`].
///
/// This is the single source of truth — the frontend should call this
/// over IPC rather than re-implementing the logic in TypeScript.
pub fn classify(input: &str) -> AddressClassification {
    let trimmed = input.trim();
    let lower = trimmed.to_lowercase();

    // ── Spaces (and not ksp://) → search query ───────────────────
    if trimmed.contains(' ') && !trimmed.starts_with("ksp://") {
        return make_search(trimmed);
    }

    // ── Already has a scheme ─────────────────────────────────────
    if trimmed.contains("://") {
        return classify_url(trimmed);
    }

    // ── Bare input — infer the scheme ────────────────────────────
    let is_localhost = lower.starts_with("localhost") || lower.starts_with("127.0.0.1");
    let is_ip = is_bare_ip(&lower);
    let has_tld = lower.starts_with("www.") || COMMON_TLDS.iter().any(|t| lower.contains(t));
    let is_native = NATIVE_KSP_PAGES.contains(&lower.as_str()) || lower.starts_with("ksp/");

    if is_localhost || is_ip {
        classify_url(&format!("http://{trimmed}"))
    } else if has_tld {
        classify_url(&format!("https://{trimmed}"))
    } else if is_native {
        classify_url(&format!("ksp://{trimmed}"))
    } else {
        make_search(trimmed)
    }
}

// ── Helpers ───────────────────────────────────────────────────────────

fn classify_url(raw: &str) -> AddressClassification {
    // Normalize: strip meaningless trailing slash.
    let normalized = normalize(raw);

    match Url::parse(&normalized) {
        Ok(url) => {
            let hostname = url.host_str().unwrap_or("").to_string();
            let (family, target) = route(&url);
            let is_secure = matches!(
                family,
                ProtocolFamily::Ksp | ProtocolFamily::Https | ProtocolFamily::Wss
            );
            AddressClassification {
                original: raw.to_string(),
                normalized,
                family,
                target,
                is_secure,
                hostname,
            }
        }
        Err(_) => make_search(raw),
    }
}

fn route(url: &Url) -> (ProtocolFamily, TargetKind) {
    match url.scheme() {
        "ksp" => {
            let host = url.host_str().unwrap_or("");
            let path = url.path();
            if NATIVE_KSP_PAGES.contains(&host) || NATIVE_KSP_PAGES.contains(&host.trim_end_matches('/')) {
                (ProtocolFamily::Ksp, TargetKind::NativePage)
            } else if host.ends_with(".ksp") || path.ends_with(".ksp") {
                (ProtocolFamily::Ksp, TargetKind::NativeKsp)
            } else {
                (ProtocolFamily::Ksp, TargetKind::NativePage)
            }
        }
        "https" => {
            let host = url.host_str().unwrap_or("");
            if is_loopback(host) {
                (ProtocolFamily::Https, TargetKind::DirectLocal)
            } else {
                (ProtocolFamily::Https, TargetKind::Gateway)
            }
        }
        "http" => {
            let host = url.host_str().unwrap_or("");
            if is_loopback(host) {
                (ProtocolFamily::Http, TargetKind::DirectLocal)
            } else {
                (ProtocolFamily::Http, TargetKind::Gateway)
            }
        }
        "wss" => (ProtocolFamily::Wss, TargetKind::WebSocket),
        "ws" => (ProtocolFamily::Ws, TargetKind::WebSocket),
        _ => (ProtocolFamily::Https, TargetKind::Gateway),
    }
}

fn normalize(url: &str) -> String {
    let mut s = url.to_string();
    // Strip a sole trailing slash only when it follows a path segment,
    // i.e. `https://example.com/foo/` → `https://example.com/foo`
    // but not `https://example.com/`.
    if s.ends_with('/') && s.matches('/').count() > 3 {
        s.pop();
    }
    s
}

fn make_search(query: &str) -> AddressClassification {
    let encoded = urlencoding_simple(query);
    let normalized = format!("{DEFAULT_SEARCH_URL}{encoded}");
    AddressClassification {
        original: query.to_string(),
        normalized,
        family: ProtocolFamily::Search,
        target: TargetKind::Search,
        is_secure: true,
        hostname: "duckduckgo.com".to_string(),
    }
}

fn urlencoding_simple(s: &str) -> String {
    // Percent-encode in a way that mirrors the frontend's encodeURIComponent
    // but for the minimal set of characters that matter in a search query.
    s.chars()
        .map(|c| match c {
            ' ' => "+".to_string(),
            '&' | '=' | '?' | '#' | '%' => format!("%{:02X}", c as u32),
            _ => c.to_string(),
        })
        .collect()
}

fn is_bare_ip(s: &str) -> bool {
    let parts: Vec<&str> = s.split('.').collect();
    parts.len() == 4 && parts.iter().all(|p| p.parse::<u8>().is_ok())
}

fn is_loopback(host: &str) -> bool {
    host == "localhost" || host == "127.0.0.1" || host == "::1"
}

// ── Tests ─────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn ksp_native_page() {
        let c = classify("home");
        assert_eq!(c.target, TargetKind::NativePage);
        assert_eq!(c.family, ProtocolFamily::Ksp);
        assert_eq!(c.normalized, "ksp://home");
    }

    #[test]
    fn https_url_is_gateway() {
        let c = classify("https://example.com");
        assert_eq!(c.target, TargetKind::Gateway);
        assert_eq!(c.family, ProtocolFamily::Https);
        assert!(c.is_secure);
    }

    #[test]
    fn localhost_is_direct() {
        let c = classify("localhost:3000");
        assert_eq!(c.target, TargetKind::DirectLocal);
        assert_eq!(c.family, ProtocolFamily::Http);
    }

    #[test]
    fn bare_domain_gets_https() {
        let c = classify("example.com");
        assert_eq!(c.family, ProtocolFamily::Https);
        assert_eq!(c.target, TargetKind::Gateway);
    }

    #[test]
    fn space_input_is_search() {
        let c = classify("rust async tutorial");
        assert_eq!(c.target, TargetKind::Search);
        assert!(c.normalized.starts_with("https://duckduckgo.com/?q="));
    }

    #[test]
    fn websocket_url() {
        let c = classify("wss://stream.example.com/feed");
        assert_eq!(c.target, TargetKind::WebSocket);
        assert_eq!(c.family, ProtocolFamily::Wss);
        assert!(c.is_secure);
    }

    #[test]
    fn ip_address_routes_through_gateway() {
        // Non-loopback IPs go through the gateway.
        let c = classify("192.168.1.1");
        assert_eq!(c.target, TargetKind::Gateway);
        assert_eq!(c.family, ProtocolFamily::Http);
    }

    #[test]
    fn loopback_ip_is_direct() {
        let c = classify("127.0.0.1:3000");
        assert_eq!(c.target, TargetKind::DirectLocal);
        assert_eq!(c.family, ProtocolFamily::Http);
    }

    #[test]
    fn ksp_native_resource() {
        let c = classify("ksp://data.ksp/resource");
        assert_eq!(c.target, TargetKind::NativeKsp);
    }
}
