//! Session Restore Engine — saves & restores open tabs and windows.

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionSnapshot {
    pub session_id: String,
    pub open_tabs: Vec<String>,
}

pub struct SessionRestoreEngine;

impl SessionRestoreEngine {
    pub fn save_session(tabs: Vec<String>) -> SessionSnapshot {
        SessionSnapshot {
            session_id: uuid::Uuid::new_v4().to_string(),
            open_tabs: tabs,
        }
    }

    pub fn restore_latest() -> Option<SessionSnapshot> {
        Some(SessionSnapshot {
            session_id: "default".into(),
            open_tabs: vec!["ksp://home".into()],
        })
    }
}
