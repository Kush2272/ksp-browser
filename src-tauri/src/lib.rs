pub mod kernel;
pub mod services;
pub mod storage;
pub mod extensions;
pub mod navigation;
pub mod network;
pub mod inspector;
pub mod telemetry;
pub mod events;
pub mod commands;

use std::sync::Arc;

use kernel::BrowserKernel;
use network::ConnectionManager;
use storage::Database;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let kernel = BrowserKernel::boot();
    let db = Database::open_in_memory().expect("Failed to initialize SQLite storage engine");
    let conn_manager = Arc::new(ConnectionManager::new());
    tracing::info!("KSP Browser Kernel & SQLite storage engine booted successfully");

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(kernel)
        .manage(db)
        .manage(Arc::clone(&conn_manager))
        // All web content is served through this scheme: the webview asks for
        // http://kspweb.localhost/<scheme>/<host>/<path> and every request is
        // tunneled to the KSP gateway over the encrypted session pool.
        .register_asynchronous_uri_scheme_protocol("kspweb", {
            move |_ctx, request, responder| {
                let cm = Arc::clone(&conn_manager);
                tauri::async_runtime::spawn(async move {
                    responder.respond(network::kspweb::handle(cm, request).await);
                });
            }
        })
        .invoke_handler(tauri::generate_handler![
            // Navigation — real classifier + security policy
            commands::navigation::classify_address,
            commands::navigation::check_navigation_policy,
            commands::navigation::get_search_providers,
            commands::navigation::open_in_app_window,
            // Network & gateway
            commands::network::get_gateway_capabilities,
            commands::network::get_telemetry,
            commands::network::gateway_status,
            // Inspector
            commands::inspector::export_kspcap_json,
            commands::inspector::analyze_capture,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
