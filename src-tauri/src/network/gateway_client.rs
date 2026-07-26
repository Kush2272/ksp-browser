//! KSP Protocol speaker wrapper.

use tracing::info;

pub struct GatewayClient {
    pub target_addr: String,
}

impl GatewayClient {
    pub fn new(target_addr: impl Into<String>) -> Self {
        Self {
            target_addr: target_addr.into(),
        }
    }

    pub async fn connect(&self) -> Result<(), String> {
        info!(addr = %self.target_addr, "Connecting via KSP protocol");
        Ok(())
    }
}
