pub mod renderer;
pub mod kernel;
pub mod services;
pub mod navigation;
pub mod network;
pub mod loader;
pub mod inspector;
pub mod telemetry;
pub mod events;
pub mod commands;

use kernel::BrowserKernel;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let kernel = BrowserKernel::boot();
    tracing::info!("KSP Browser Kernel booted successfully");

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(kernel)
        .invoke_handler(tauri::generate_handler![
            commands::navigation::navigate,
            commands::network::get_gateway_capabilities,
            commands::network::get_telemetry,
            commands::inspector::export_kspcap_json,
            commands::inspector::analyze_capture,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
