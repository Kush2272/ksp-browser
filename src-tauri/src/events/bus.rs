//! Prioritized event bus engine using tokio broadcast channels.

use tokio::sync::broadcast;
use crate::events::types::{BrowserEvent, EventEnvelope, EventPriority};

pub struct EventBus {
    tx: broadcast::Sender<EventEnvelope>,
}

impl EventBus {
    pub fn new(capacity: usize) -> Self {
        let (tx, _) = broadcast::channel(capacity);
        Self { tx }
    }

    pub fn publish(&self, priority: EventPriority, event: BrowserEvent) {
        let envelope = EventEnvelope::new(priority, event);
        let _ = self.tx.send(envelope);
    }

    pub fn subscribe(&self) -> broadcast::Receiver<EventEnvelope> {
        self.tx.subscribe()
    }
}

impl Default for EventBus {
    fn default() -> Self {
        Self::new(1024)
    }
}
