//! PageRenderer abstraction.
//!
//! This module decouples the KSP Browser from the underlying rendering engine (Tauri/WebView2).
//! In the future, this allows hot-swapping the engine without changing the rest of the browser.

use serde::{Deserialize, Serialize};

/// Represents a rendered frame or a command to the UI layer.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RenderEvent {
    /// Navigate the active tab to a new URL.
    Navigate { tab_id: u32, url: String },
    /// Title changed for a tab.
    TitleChange { tab_id: u32, title: String },
    /// Render custom HTML content directly.
    RenderHtml { tab_id: u32, html: String },
    /// Execute JavaScript in the context of the rendered page.
    ExecuteScript { tab_id: u32, script: String },
}

/// The core abstraction for a browser engine backend.
pub trait PageRenderer: Send + Sync {
    /// Initialize the renderer.
    fn init(&self) -> Result<(), String>;

    /// Create a new tab. Returns the internal tab ID.
    fn create_tab(&self) -> Result<u32, String>;

    /// Close an existing tab.
    fn close_tab(&self, tab_id: u32) -> Result<(), String>;

    /// Send a command/event to the rendering layer.
    fn dispatch_event(&self, event: RenderEvent) -> Result<(), String>;
}

/// Tauri WebView2 specific implementation of `PageRenderer`.
pub struct TauriRenderer {
    // This will hold a handle to the Tauri AppHandle once initialized
}

impl TauriRenderer {
    pub fn new() -> Self {
        Self {}
    }
}

impl PageRenderer for TauriRenderer {
    fn init(&self) -> Result<(), String> {
        Ok(())
    }

    fn create_tab(&self) -> Result<u32, String> {
        // Placeholder for creating a new Tauri WebviewWindow or interacting with the frontend React layer.
        Ok(1)
    }

    fn close_tab(&self, _tab_id: u32) -> Result<(), String> {
        Ok(())
    }

    fn dispatch_event(&self, _event: RenderEvent) -> Result<(), String> {
        // Here we would emit an event using the Tauri AppHandle to the React frontend.
        Ok(())
    }
}

impl Default for TauriRenderer {
    fn default() -> Self {
        Self::new()
    }
}
