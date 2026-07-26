//! Central service registry — the dependency-injection container that
//! holds all shared services.
//!
//! This is the embryonic `BrowserService` from the plan.  Phase 1 will
//! extend it with `HistoryService`, `BookmarksService`, `DownloadsService`,
//! `SettingsService`, and `SessionService`, each backed by the shared
//! `Database` handle.  For now it holds the `EventBus` and the gateway
//! capability lookup (folded in from the deleted `gateway_service.rs`).

use std::sync::Arc;
use crate::events::EventBus;
use crate::network::GatewayCapabilities;

pub struct ServiceRegistry {
    pub event_bus: Arc<EventBus>,
}

impl ServiceRegistry {
    pub fn new() -> Self {
        Self {
            event_bus: Arc::new(EventBus::new(2048)),
        }
    }

    /// Gateway capability lookup — folded in from the deleted
    /// `GatewayService` (which was a one-method wrapper around a
    /// static constructor).
    pub fn gateway_capabilities(&self) -> GatewayCapabilities {
        GatewayCapabilities::default_ksp()
    }
}

impl Default for ServiceRegistry {
    fn default() -> Self {
        Self::new()
    }
}
