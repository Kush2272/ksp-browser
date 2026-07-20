//! Search provider schema & service.

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchProvider {
    pub id: String,
    pub name: String,
    pub search_url: String,
    pub suggestions_url: Option<String>,
    pub icon: String,
    pub privacy_mode: bool,
}

pub struct SearchService;

impl SearchService {
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
}
