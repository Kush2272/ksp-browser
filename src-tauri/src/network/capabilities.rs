//! Gateway capability negotiation.

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GatewayCapabilities {
    pub gateway: String,
    pub protocol: String,
    pub features: Vec<String>,
}

impl GatewayCapabilities {
    pub fn default_ksp() -> Self {
        Self {
            gateway: "1.0.1".into(),
            protocol: "KSP/1".into(),
            features: vec![
                "compression".into(),
                "cache".into(),
                "websocket".into(),
                "http2".into(),
                "replay".into(),
                "metrics".into(),
            ],
        }
    }
}
