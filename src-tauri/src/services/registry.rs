//! Central dependency injection service registry container.

use std::sync::Arc;
use crate::events::EventBus;

pub struct ServiceRegistry {
    pub event_bus: Arc<EventBus>,
}

impl ServiceRegistry {
    pub fn new() -> Self {
        Self {
            event_bus: Arc::new(EventBus::new(2048)),
        }
    }
}

impl Default for ServiceRegistry {
    fn default() -> Self {
        Self::new()
    }
}
