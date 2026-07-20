//! Normalizer stage of Navigation Pipeline.

pub fn normalize_url(url: &str) -> String {
    let mut s = url.to_string();
    if s.ends_with('/') && s.matches('/').count() > 3 {
        s.pop();
    }
    s
}
