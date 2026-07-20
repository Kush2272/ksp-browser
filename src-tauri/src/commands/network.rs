//! Network and gateway status commands.

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
