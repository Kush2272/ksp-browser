//! NavigationContext holding full request lifecycle state.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NavigationContext {
    pub navigation_id: String,
    pub tab_id:        String,
    pub raw_input:     String,
    pub parsed_url:    String,
    pub target_kind:   String,
    pub allowed:       bool,
    pub started_at:    DateTime<Utc>,
}

impl NavigationContext {
    pub fn new(tab_id: impl Into<String>, raw_input: impl Into<String>) -> Self {
        Self {
            navigation_id: uuid::Uuid::new_v4().to_string(),
            tab_id: tab_id.into(),
            raw_input: raw_input.into(),
            parsed_url: String::new(),
            target_kind: "Gateway".into(),
            allowed: true,
            started_at: Utc::now(),
        }
    }
}
