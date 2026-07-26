//! Central dependency injection service registry container.

use std::sync::Arc;
use crate::events::EventBus;
use crate::services::gateway_service::GatewayService;

pub struct ServiceRegistry {
    pub event_bus: Arc<EventBus>,
    pub gateway: Arc<GatewayService>,
}

impl ServiceRegistry {
    pub fn new() -> Self {
        Self {
            event_bus: Arc::new(EventBus::new(2048)),
            gateway: Arc::new(GatewayService::new()),
        }
    }
}

impl Default for ServiceRegistry {
    fn default() -> Self {
        Self::new()
    }
}
