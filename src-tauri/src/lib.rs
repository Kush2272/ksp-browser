pub mod renderer;
pub mod kernel;
pub mod services;
pub mod storage;
pub mod extensions;
pub mod navigation;
pub mod network;
pub mod loader;
pub mod inspector;
pub mod telemetry;
pub mod events;
pub mod commands;

use kernel::BrowserKernel;
use storage::Database;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let kernel = BrowserKernel::boot();
    let db = Database::open_in_memory().expect("Failed to initialize SQLite storage engine");
    tracing::info!("KSP Browser Kernel & SQLite storage engine booted successfully");

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(kernel)
        .manage(db)
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
