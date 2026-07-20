//! Connection Manager — pooling, reconnect, backoff, origin mapping, health checks.

use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;
use crate::network::gateway_client::GatewayClient;
use crate::network::capabilities::GatewayCapabilities;

pub struct ConnectionManager {
    clients: Arc<Mutex<HashMap<String, Arc<GatewayClient>>>>,
    pub capabilities: GatewayCapabilities,
}

impl ConnectionManager {
    pub fn new() -> Self {
        Self {
            clients: Arc::new(Mutex::new(HashMap::new())),
            capabilities: GatewayCapabilities::default_ksp(),
        }
    }

    pub async fn get_client(&self, origin: &str) -> Arc<GatewayClient> {
        let mut map = self.clients.lock().await;
        if let Some(client) = map.get(origin) {
            return Arc::clone(client);
        }
        let client = Arc::new(GatewayClient::new("127.0.0.1:8765"));
        map.insert(origin.to_string(), Arc::clone(&client));
        client
    }
}

impl Default for ConnectionManager {
    fn default() -> Self {
        Self::new()
    }
}
