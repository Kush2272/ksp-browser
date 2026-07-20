//! .kspcap v1 File Format encoder/decoder.

use serde::{Deserialize, Serialize};
use crate::inspector::capture_buffer::DecodedFrame;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KspCapHeader {
    pub magic: String,
    pub version: u32,
    pub capture_version: String,
    pub protocol_version: String,
    pub browser_version: String,
    pub gateway_version: String,
    pub os: String,
    pub arch: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KspCapFile {
    pub header: KspCapHeader,
    pub frames: Vec<DecodedFrame>,
}

impl KspCapFile {
    pub fn new(frames: Vec<DecodedFrame>) -> Self {
        Self {
            header: KspCapHeader {
                magic: "KSPCAP1".into(),
                version: 1,
                capture_version: "1.0".into(),
                protocol_version: "KSP/1.0".into(),
                browser_version: env!("CARGO_PKG_VERSION").into(),
                gateway_version: "1.0.1".into(),
                os: std::env::consts::OS.into(),
                arch: std::env::consts::ARCH.into(),
            },
            frames,
        }
    }

    pub fn to_json(&self) -> Result<String, serde_json::Error> {
        serde_json::to_string_pretty(self)
    }

    pub fn from_json(json: &str) -> Result<Self, serde_json::Error> {
        serde_json::from_str(json)
    }
}
