//! Gateway service interface.

use crate::network::GatewayCapabilities;

pub struct GatewayService;

impl GatewayService {
    pub fn new() -> Self {
        Self
    }

    pub fn capabilities(&self) -> GatewayCapabilities {
        GatewayCapabilities::default_ksp()
    }
}

impl Default for GatewayService {
    fn default() -> Self {
        Self::new()
    }
}
