//! Navigation commands for Tauri frontend.
//!
//! The old `navigate` command (which ran the dead 6-stage pipeline and
//! returned a `NavigationContext`) has been replaced by `classify_address`,
//! which is the real authoritative classifier.  The frontend calls this
//! and uses the result to decide where to render.

use crate::navigation::{
    self,
    AddressClassification, PolicyDecision,
    search_resolver::{self, SearchProvider},
};
use tauri::Manager;

/// Classify a raw address-bar input into a fully-resolved address
/// with routing and security metadata.
///
/// This is the single source of truth — the frontend should call this
/// instead of duplicating classification logic in TypeScript.
#[tauri::command]
pub fn classify_address(input: String) -> AddressClassification {
    navigation::classify(&input)
}

/// Run the security policy against a navigation target.
///
/// `referrer` is the URL of the page that initiated the navigation
/// (if any).  Top-level user navigations pass `None`.
#[tauri::command]
pub fn check_navigation_policy(
    target: String,
    referrer: Option<String>,
) -> PolicyDecision {
    let target_cls = navigation::classify(&target);
    let ref_cls = referrer.map(|r| navigation::classify(&r));
    navigation::check_security(&target_cls, ref_cls.as_ref())
}

/// Return the list of available search providers.
#[tauri::command]
pub fn get_search_providers() -> Vec<SearchProvider> {
    search_resolver::default_providers()
}

/// Open a URL in a separate native window.
#[tauri::command]
pub async fn open_in_app_window(app: tauri::AppHandle, url: String) -> Result<(), String> {
    use tauri::WebviewUrl;

    let parsed_url = url.parse::<url::Url>().map_err(|e| e.to_string())?;

    if let Some(existing) = app.get_webview_window("content_window") {
        let _ = existing.close();
    }

    let _window = tauri::WebviewWindowBuilder::new(
        &app,
        "content_window",
        WebviewUrl::External(parsed_url),
    )
    .title("KSP Web Content")
    .inner_size(1200.0, 800.0)
    .build()
    .map_err(|e| e.to_string())?;

    Ok(())
}
