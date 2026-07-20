//! Packet replay engine for recorded captures.

use tracing::info;
use crate::inspector::kspcap::KspCapFile;

pub struct ReplayEngine;

impl ReplayEngine {
    pub async fn replay(cap: &KspCapFile) {
        info!(
            frames = cap.frames.len(),
            version = %cap.header.capture_version,
            "Replaying KSP capture"
        );
    }
}
