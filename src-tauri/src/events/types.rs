//! Prioritized event types for the browser engine.

use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
pub enum EventPriority {
    Low,
    Normal,
    High,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum BrowserEvent {
    // Navigation events
    NavigationStarted { tab_id: String, url: String },
    NavigationFinished { tab_id: String, url: String, status_code: u16 },

    // Network & Gateway events
    DnsLookupStarted { host: String },
    DnsLookupFinished { host: String, addrs: Vec<String> },
    GatewayConnected { addr: String },
    GatewayDisconnected { addr: String, reason: String },
    HandshakeStarted { session_id: String },
    HandshakeCompleted { session_id: String, cipher_suite: String },

    // Packet & Frame events
    PacketCaptured {
        session_id: String,
        stream_id: u32,
        packet_type: String,
        direction: String, // "in" | "out"
        bytes: usize,
        encrypted: bool,
        hex_dump: String,
    },
    FrameDecoded {
        stream_id: u32,
        payload_type: String,
        summary: String,
    },

    // Application & Resource events
    ResourceLoaded { tab_id: String, url: String, bytes: usize, mime_type: String },
    DownloadStarted { download_id: String, url: String },
    DownloadFinished { download_id: String, checksum: String },
    WebSocketOpened { stream_id: u32, url: String },
    WebSocketClosed { stream_id: u32 },

    // Telemetry & Errors
    TelemetryReport { cpu_percent: f32, memory_bytes: u64, rtt_ms: f64 },
    Error { code: String, message: String },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EventEnvelope {
    pub priority: EventPriority,
    pub timestamp: DateTime<Utc>,
    pub event: BrowserEvent,
}

impl EventEnvelope {
    pub fn new(priority: EventPriority, event: BrowserEvent) -> Self {
        Self {
            priority,
            timestamp: Utc::now(),
            event,
        }
    }
}
