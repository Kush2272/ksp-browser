//! Navigation commands for Tauri frontend.

use crate::navigation::{process_navigation, NavigationContext};

#[tauri::command]
pub fn navigate(tab_id: String, url: String) -> NavigationContext {
    process_navigation(&tab_id, &url)
}
