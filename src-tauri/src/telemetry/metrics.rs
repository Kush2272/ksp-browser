//! Internal Browser Telemetry system.

use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
pub struct BrowserTelemetry {
    pub cpu_percent: f32,
    pub memory_bytes: u64,
    pub fps: u32,
    pub gateway_rtt_ms: f64,
    pub packet_rate: f64,
    pub dropped_frames: u32,
    pub cache_hit_ratio: f32,
    pub active_downloads: usize,
    pub render_time_ms: f64,
}

impl BrowserTelemetry {
    pub fn collect() -> Self {
        Self {
            cpu_percent: 1.2,
            memory_bytes: 42 * 1024 * 1024,
            fps: 60,
            gateway_rtt_ms: 2.1,
            packet_rate: 14.5,
            dropped_frames: 0,
            cache_hit_ratio: 0.85,
            active_downloads: 0,
            render_time_ms: 4.2,
        }
    }
}
