//! Multi-tier packet capture buffer.

use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RawFrame {
    pub timestamp: DateTime<Utc>,
    pub data: Vec<u8>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DecodedFrame {
    pub timestamp: DateTime<Utc>,
    pub session_id: String,
    pub stream_id: u32,
    pub packet_type: String,
    pub flags: Vec<String>,
    pub payload_len: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApplicationEvent {
    pub timestamp: DateTime<Utc>,
    pub event_type: String, // "HTTP_REQUEST" | "HTTP_RESPONSE" | "TLS_HANDSHAKE"
    pub summary: String,
}

pub struct CaptureBuffer {
    pub raw_frames: Vec<RawFrame>,
    pub decoded_frames: Vec<DecodedFrame>,
    pub app_events: Vec<ApplicationEvent>,
}

impl CaptureBuffer {
    pub fn new() -> Self {
        Self {
            raw_frames: Vec::new(),
            decoded_frames: Vec::new(),
            app_events: Vec::new(),
        }
    }

    pub fn push_decoded(&mut self, frame: DecodedFrame) {
        self.decoded_frames.push(frame);
    }
}

impl Default for CaptureBuffer {
    fn default() -> Self {
        Self::new()
    }
}
