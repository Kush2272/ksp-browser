//! Network and gateway status commands.

use std::sync::Arc;
use serde::Serialize;

use crate::network::connection_manager::{ConnectionManager, GATEWAY_ADDR};
use crate::network::GatewayCapabilities;
use crate::telemetry::BrowserTelemetry;

#[tauri::command]
pub fn get_gateway_capabilities() -> GatewayCapabilities {
    GatewayCapabilities::default_ksp()
}

#[tauri::command]
pub fn get_telemetry() -> BrowserTelemetry {
    BrowserTelemetry::collect()
}

#[derive(Debug, Serialize)]
pub struct GatewayStatus {
    pub reachable: bool,
    pub addr: String,
    pub error: Option<String>,
}

/// Probe the KSP gateway: establishes (or reuses) a pooled KSP session.
#[tauri::command]
pub async fn gateway_status(
    cm: tauri::State<'_, Arc<ConnectionManager>>,
) -> Result<GatewayStatus, String> {
    Ok(match cm.probe().await {
        Ok(()) => GatewayStatus { reachable: true, addr: GATEWAY_ADDR.into(), error: None },
        Err(e) => GatewayStatus { reachable: false, addr: GATEWAY_ADDR.into(), error: Some(e) },
    })
}
