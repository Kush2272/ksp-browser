//! Parser stage of Navigation Pipeline.

pub fn parse_input(raw: &str) -> String {
    let trimmed = raw.trim();
    if trimmed.contains("://") {
        trimmed.to_string()
    } else if trimmed.starts_with("localhost") || trimmed.contains('.') {
        format!("http://{}", trimmed)
    } else {
        format!("https://duckduckgo.com/?q={}", urlencoding_simple(trimmed))
    }
}

fn urlencoding_simple(s: &str) -> String {
    s.replace(' ', "+")
}
