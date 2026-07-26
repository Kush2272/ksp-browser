//! `kspweb` custom URI scheme — routes WebView page loads through the KSP gateway.
//!
//! The frontend navigates the content webview to
//! `http://kspweb.localhost/https/example.com/path?query` (Windows form).
//! Every request the render engine makes under that origin — the document and
//! all relative subresources (CSS, JS, images) — lands in [`handle`], which
//! forwards it through the encrypted KSP tunnel and returns the upstream bytes.
//!
//! Root-relative asset URLs (`/style.css`) don't carry the `/scheme/host`
//! prefix, so the target origin is recovered from the `Referer` header.

use std::sync::Arc;

use tauri::http::{header::{HeaderName, HeaderValue}, Request, Response, StatusCode};
use tracing::{debug, warn};

use crate::network::connection_manager::ConnectionManager;
use crate::network::tunnel::{TunnelRequest, TunnelResponse};

/// Request headers forwarded from the WebView to the upstream server.
const FORWARDED_REQUEST_HEADERS: &[&str] = &[
    "accept",
    "accept-language",
    "accept-encoding",
    "user-agent",
    "content-type",
    "range",
    "cache-control",
    "pragma",
];

/// Response headers never passed back to the WebView.
///
/// - framing/transport headers are managed by us (`content-length` is re-set);
/// - `set-cookie` is dropped because all tunneled sites share the
///   `kspweb.localhost` origin — storing cookies there would leak them
///   between sites (proper per-site cookie jars are future work);
/// - CSP/HSTS are dropped because the page is served from a plain-http custom
///   protocol origin: `upgrade-insecure-requests` and `https:` source lists
///   would break every relative subresource load.
const STRIPPED_RESPONSE_HEADERS: &[&str] = &[
    "content-length",
    "transfer-encoding",
    "connection",
    "keep-alive",
    "set-cookie",
    "content-security-policy",
    "content-security-policy-report-only",
    "strict-transport-security",
    // Framing blockers — the browser renders tunneled pages inside an <iframe>,
    // so these must be dropped or sites like Google refuse to display.
    "x-frame-options",
    "cross-origin-opener-policy",
    "cross-origin-embedder-policy",
    "cross-origin-resource-policy",
];

/// Entry point invoked (via `tauri::async_runtime`) for every `kspweb` request.
pub async fn handle(cm: Arc<ConnectionManager>, request: Request<Vec<u8>>) -> Response<Vec<u8>> {
    let uri = request.uri().clone();
    let path = uri.path().to_string();
    let query = uri.query().map(str::to_string);

    let real_url = match resolve_real_url(&path, query.as_deref(), &request, &cm) {
        Ok(u) => u,
        Err(e) => {
            warn!(path = %path, error = %e, "kspweb: cannot resolve target URL");
            return error_page(StatusCode::BAD_REQUEST, "Invalid tunnel URL", &e, &path);
        }
    };

    // Remember this origin so later refererless root-relative requests resolve.
    if let Ok(u) = url::Url::parse(&real_url) {
        if let Some(host) = u.host_str() {
            cm.set_last_origin(format!("{}://{}", u.scheme(), host));
        }
    }

    debug!(url = %real_url, method = %request.method(), "kspweb: tunneling");

    let mut headers = std::collections::HashMap::new();
    for name in FORWARDED_REQUEST_HEADERS {
        if let Some(v) = request.headers().get(*name).and_then(|v| v.to_str().ok()) {
            headers.insert((*name).to_string(), v.to_string());
        }
    }
    // Translate the tunnel-form referer back to the real one.
    if let Some(referer) = request.headers().get("referer").and_then(|v| v.to_str().ok()) {
        if let Some(real_ref) = tunnel_path_to_real_url(referer) {
            headers.insert("referer".into(), real_ref);
        }
    }

    let treq = TunnelRequest {
        method: request.method().as_str().to_string(),
        url: real_url.clone(),
        headers,
        body: request.into_body(),
    };

    match cm.fetch(&treq).await {
        Ok(resp) => {
            if let Some(gw_error) = &resp.error {
                return error_page(
                    StatusCode::BAD_GATEWAY,
                    &format!("{} {}", resp.status, resp.reason),
                    gw_error,
                    &real_url,
                );
            }
            build_response(resp, &real_url)
        }
        Err(e) => error_page(StatusCode::BAD_GATEWAY, "KSP Gateway unreachable", &e, &real_url),
    }
}

/// Reconstruct the real target URL from a `kspweb` request path.
///
/// Resolution order:
/// 1. Explicit `/scheme/host/...` prefix (document loads, tunnel-form links).
/// 2. Root-relative path recovered from the `Referer`'s prefix.
/// 3. Root-relative path resolved against the last-navigated origin.
fn resolve_real_url(
    path: &str,
    query: Option<&str>,
    request: &Request<Vec<u8>>,
    cm: &ConnectionManager,
) -> Result<String, String> {
    let trimmed = path.trim_start_matches('/');
    let (scheme, rest) = trimmed.split_once('/').unwrap_or((trimmed, ""));

    if (scheme == "http" || scheme == "https") && !rest.is_empty() {
        let mut url = format!("{scheme}://{rest}");
        if !rest.contains('/') {
            url.push('/');
        }
        if let Some(q) = query {
            url.push('?');
            url.push_str(q);
        }
        return Ok(url);
    }

    // Root-relative asset (e.g. `/style.css`): recover origin from Referer.
    if let Some(referer) = request.headers().get("referer").and_then(|v| v.to_str().ok()) {
        if let Ok(ref_url) = url::Url::parse(referer) {
            let ref_path = ref_url.path().trim_start_matches('/');
            let mut parts = ref_path.splitn(3, '/');
            if let (Some(ref_scheme), Some(ref_host)) = (parts.next(), parts.next()) {
                if (ref_scheme == "http" || ref_scheme == "https") && !ref_host.is_empty() {
                    return Ok(join_origin(&format!("{ref_scheme}://{ref_host}"), path, query));
                }
            }
        }
    }

    // Last resort: resolve against the most recently navigated origin.
    if let Some(origin) = cm.last_origin() {
        return Ok(join_origin(&origin, path, query));
    }

    Err(format!("no /scheme/host prefix and no usable Referer for '{path}'"))
}

/// Join `scheme://host` + absolute `path` + optional query into a full URL.
fn join_origin(origin: &str, path: &str, query: Option<&str>) -> String {
    let mut url = format!("{origin}{path}");
    if let Some(q) = query {
        url.push('?');
        url.push_str(q);
    }
    url
}

/// Turn a full tunnel URL (`http://kspweb.localhost/https/example.com/x`)
/// back into the real URL (`https://example.com/x`), if it is one.
fn tunnel_path_to_real_url(tunnel_url: &str) -> Option<String> {
    let parsed = url::Url::parse(tunnel_url).ok()?;
    let path = parsed.path().trim_start_matches('/');
    let (scheme, rest) = path.split_once('/')?;
    if scheme != "http" && scheme != "https" {
        return None;
    }
    let mut url = format!("{scheme}://{rest}");
    if let Some(q) = parsed.query() {
        url.push('?');
        url.push_str(q);
    }
    Some(url)
}

/// Convert a real URL into its tunnel path form (`/https/example.com/x?q`).
fn real_url_to_tunnel_path(real: &str) -> Option<String> {
    let parsed = url::Url::parse(real).ok()?;
    let scheme = parsed.scheme();
    if scheme != "http" && scheme != "https" {
        return None;
    }
    let host = parsed.host_str()?;
    let port = parsed.port().map(|p| format!(":{p}")).unwrap_or_default();
    let mut path = format!("/{scheme}/{host}{port}{}", parsed.path());
    if let Some(q) = parsed.query() {
        path.push('?');
        path.push_str(q);
    }
    Some(path)
}

fn build_response(t: TunnelResponse, real_url: &str) -> Response<Vec<u8>> {
    let status = StatusCode::from_u16(t.status).unwrap_or(StatusCode::BAD_GATEWAY);
    let mut builder = Response::builder().status(status);

    let content_type = t
        .headers
        .iter()
        .find(|(k, _)| k.eq_ignore_ascii_case("content-type"))
        .map(|(_, v)| v.to_ascii_lowercase())
        .unwrap_or_default();
    let is_html = content_type.contains("text/html");

    for (k, v) in &t.headers {
        let name = k.to_ascii_lowercase();
        if STRIPPED_RESPONSE_HEADERS.contains(&name.as_str()) {
            continue;
        }
        // Keep redirects inside the tunnel: rewrite absolute Location targets.
        if name == "location" {
            if let Some(tunnel_path) = real_url_to_tunnel_path(v) {
                builder = builder.header("location", tunnel_path);
                continue;
            }
        }
        if let (Ok(hn), Ok(hv)) = (HeaderName::try_from(name.as_str()), HeaderValue::from_str(v)) {
            builder = builder.header(hn, hv);
        }
    }

    // For HTML documents, inject a <base> pointing at the tunnel-form origin so
    // relative URLs (href="a/b", src="./x") resolve back through the gateway.
    let body = if is_html {
        inject_base_tag(t.body, real_url)
    } else {
        t.body
    };

    builder = builder.header("content-length", body.len());
    builder
        .body(body)
        .unwrap_or_else(|e| plain_response(StatusCode::BAD_GATEWAY, format!("response build error: {e}")))
}

/// Insert `<base href="…tunnel form of this document…">` after `<head>` so the
/// engine resolves relative URLs (href="a/b", src="./x") back through the
/// gateway. The base is the document's own tunnel URL, so relative resolution
/// respects the document's directory. (First base tag wins per spec.)
fn inject_base_tag(body: Vec<u8>, real_url: &str) -> Vec<u8> {
    let Ok(u) = url::Url::parse(real_url) else { return body };
    let Some(host) = u.host_str() else { return body };
    let port = u.port().map(|p| format!(":{p}")).unwrap_or_default();
    let base = format!(
        "http://kspweb.localhost/{}/{}{}{}",
        u.scheme(),
        host,
        port,
        u.path()
    );
    let tag = format!(r#"<base href="{base}">"#);

    let html = String::from_utf8_lossy(&body);
    let lower = html.to_ascii_lowercase();

    // Insert right after the opening <head...> tag if present, else after <html>,
    // else at the very top.
    let insert_at = lower
        .find("<head")
        .and_then(|i| lower[i..].find('>').map(|j| i + j + 1))
        .or_else(|| lower.find("<html").and_then(|i| lower[i..].find('>').map(|j| i + j + 1)))
        .unwrap_or(0);

    let mut out = String::with_capacity(html.len() + tag.len());
    out.push_str(&html[..insert_at]);
    out.push_str(&tag);
    out.push_str(&html[insert_at..]);
    out.into_bytes()
}

fn plain_response(status: StatusCode, msg: String) -> Response<Vec<u8>> {
    Response::builder()
        .status(status)
        .header("content-type", "text/plain; charset=utf-8")
        .body(msg.into_bytes())
        .expect("plain response")
}

/// A styled error page matching the browser's dark theme.
fn error_page(status: StatusCode, title: &str, detail: &str, url: &str) -> Response<Vec<u8>> {
    let html = format!(
        r##"<!doctype html>
<html><head><meta charset="utf-8"><title>{title}</title><style>
  body {{ background:#0d0e10; color:#e8eaf0; font-family:'Segoe UI',system-ui,sans-serif;
         display:flex; align-items:center; justify-content:center; height:100vh; margin:0; }}
  .card {{ max-width:520px; padding:2.5rem; background:#16181c; border:1px solid #252830;
          border-radius:16px; }}
  h1 {{ font-size:1.15rem; margin:0 0 .75rem; color:#fbbf24; }}
  p  {{ font-size:.85rem; line-height:1.6; color:#a1a1aa; margin:.4rem 0; }}
  code {{ background:#0d0e10; border:1px solid #252830; border-radius:6px;
         padding:.15rem .45rem; font-size:.78rem; color:#34d399; }}
  .url {{ word-break:break-all; color:#71717a; font-size:.75rem; margin-top:1rem; }}
</style></head><body>
  <div class="card">
    <h1>&#9888;&#65039; {title}</h1>
    <p>{detail}</p>
    <p>If the KSP Gateway is not running, start it with:</p>
    <p><code>ksp-gateway start</code></p>
    <div class="url">{url}</div>
  </div>
</body></html>"##
    );
    Response::builder()
        .status(status)
        .header("content-type", "text/html; charset=utf-8")
        .body(html.into_bytes())
        .unwrap_or_else(|_| plain_response(status, format!("{title}: {detail}")))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn tunnel_path_roundtrip() {
        let real = "https://example.com/a/b?x=1";
        let path = real_url_to_tunnel_path(real).unwrap();
        assert_eq!(path, "/https/example.com/a/b?x=1");
        assert_eq!(
            tunnel_path_to_real_url("http://kspweb.localhost/https/example.com/a/b?x=1").unwrap(),
            real
        );
    }

    #[test]
    fn join_origin_builds_url() {
        assert_eq!(join_origin("https://a.com", "/style.css", None), "https://a.com/style.css");
        assert_eq!(join_origin("https://a.com", "/s", Some("v=2")), "https://a.com/s?v=2");
    }

    #[test]
    fn base_tag_uses_document_path() {
        let body = b"<html><head><meta></head><body>hi</body></html>".to_vec();
        let out = String::from_utf8(inject_base_tag(body, "https://example.com/a/b/page.html")).unwrap();
        assert!(
            out.contains(r#"<base href="http://kspweb.localhost/https/example.com/a/b/page.html">"#),
            "got: {out}"
        );
        // base must sit inside <head>, before the meta.
        let base_pos = out.find("<base").unwrap();
        let meta_pos = out.find("<meta").unwrap();
        assert!(base_pos < meta_pos);
    }

    #[test]
    fn base_tag_skips_non_html_gracefully() {
        // Invalid URL → body returned unchanged.
        let body = b"binary".to_vec();
        assert_eq!(inject_base_tag(body.clone(), "not a url"), body);
    }
}
