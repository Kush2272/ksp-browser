//! Search resolver — turns a bare search term + a user-chosen provider
//! into a fully-qualified search URL.
//!
//! This is the natural home for search-related logic that was previously
//! split between `services/search_service.rs` and the hardcoded fallback
//! in the old `parser.rs`.

use serde::{Deserialize, Serialize};

/// A configured search provider.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchProvider {
    pub id: String,
    pub name: String,
    /// URL template with `%s` as the query placeholder.
    pub search_url: String,
    /// Optional suggestions/autocomplete endpoint.
    pub suggestions_url: Option<String>,
    pub icon: String,
    /// Whether this provider avoids tracking.
    pub privacy_mode: bool,
}

/// Resolve a bare search query into a full URL using the given provider.
///
/// `%s` in the provider's `search_url` is replaced with the percent-encoded
/// query.  If the provider URL doesn't contain `%s`, the query is appended.
pub fn resolve(provider: &SearchProvider, query: &str) -> String {
    let encoded = percent_encode_query(query);
    if provider.search_url.contains("%s") {
        provider.search_url.replace("%s", &encoded)
    } else {
        format!("{}{}", provider.search_url, encoded)
    }
}

/// Return the built-in list of search providers.
pub fn default_providers() -> Vec<SearchProvider> {
    vec![
        SearchProvider {
            id: "duckduckgo".into(),
            name: "DuckDuckGo".into(),
            search_url: "https://duckduckgo.com/?q=%s".into(),
            suggestions_url: Some("https://duckduckgo.com/ac/?q=%s".into()),
            icon: "shield".into(),
            privacy_mode: true,
        },
        SearchProvider {
            id: "google".into(),
            name: "Google".into(),
            search_url: "https://google.com/search?q=%s".into(),
            suggestions_url: None,
            icon: "search".into(),
            privacy_mode: false,
        },
        SearchProvider {
            id: "brave".into(),
            name: "Brave Search".into(),
            search_url: "https://search.brave.com/search?q=%s".into(),
            suggestions_url: None,
            icon: "shield-check".into(),
            privacy_mode: true,
        },
    ]
}

/// Find a provider by id from the default list.
pub fn provider_by_id(id: &str) -> Option<SearchProvider> {
    default_providers().into_iter().find(|p| p.id == id)
}

fn percent_encode_query(s: &str) -> String {
    s.chars()
        .map(|c| match c {
            ' ' => "+".to_string(),
            '&' | '=' | '?' | '#' | '%' | '+' => format!("%{:02X}", c as u32),
            _ => c.to_string(),
        })
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn resolve_duckduckgo() {
        let ddg = default_providers().into_iter().find(|p| p.id == "duckduckgo").unwrap();
        let url = resolve(&ddg, "rust async");
        assert!(url.starts_with("https://duckduckgo.com/?q=rust+async"));
    }

    #[test]
    fn provider_lookup() {
        assert!(provider_by_id("google").is_some());
        assert!(provider_by_id("nonexistent").is_none());
    }
}
