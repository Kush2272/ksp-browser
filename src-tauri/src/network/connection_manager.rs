//! Connection Manager — a small pool of KSP sessions to the local gateway.
//!
//! Requests are serialized per session (KSP request/response alternates on a
//! connection), so the pool provides request concurrency the same way HTTP/1.1
//! browsers did: N parallel connections, round-robin.

use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::{Arc, RwLock};

use crate::network::capabilities::GatewayCapabilities;
use crate::network::gateway_client::GatewayClient;
use crate::network::tunnel::{TunnelRequest, TunnelResponse};

/// Address the local KSP gateway listens on (see ksp-gateway config/default.toml).
pub const GATEWAY_ADDR: &str = "127.0.0.1:8765";

/// Number of parallel KSP sessions to the gateway.
const POOL_SIZE: usize = 4;

pub struct ConnectionManager {
    clients: Vec<Arc<GatewayClient>>,
    next: AtomicUsize,
    /// Origin (`scheme://host`) of the most recent successfully-prefixed
    /// request, used to resolve root-relative requests that arrive without a
    /// usable Referer (JS navigations, `<base>`-less root-relative assets).
    last_origin: RwLock<Option<String>>,
    pub capabilities: GatewayCapabilities,
}

impl ConnectionManager {
    pub fn new() -> Self {
        let clients = (0..POOL_SIZE)
            .map(|_| Arc::new(GatewayClient::new(GATEWAY_ADDR)))
            .collect();
        Self {
            clients,
            next: AtomicUsize::new(0),
            last_origin: RwLock::new(None),
            capabilities: GatewayCapabilities::default_ksp(),
        }
    }

    /// Remember the origin (`scheme://host`) of the last resolved navigation.
    pub fn set_last_origin(&self, origin: String) {
        if let Ok(mut guard) = self.last_origin.write() {
            *guard = Some(origin);
        }
    }

    /// The last known origin, if any.
    pub fn last_origin(&self) -> Option<String> {
        self.last_origin.read().ok().and_then(|g| g.clone())
    }

    /// Fetch a URL through the KSP tunnel, using the next pooled session.
    pub async fn fetch(&self, req: &TunnelRequest) -> Result<TunnelResponse, String> {
        let idx = self.next.fetch_add(1, Ordering::Relaxed) % self.clients.len();
        self.clients[idx].fetch(req).await
    }

    /// True if at least one pooled session is currently established.
    pub async fn any_connected(&self) -> bool {
        for client in &self.clients {
            if client.is_connected().await {
                return true;
            }
        }
        false
    }

    /// Try to establish the first pooled session (used for status probes).
    pub async fn probe(&self) -> Result<(), String> {
        self.clients[0].connect().await
    }
}

impl Default for ConnectionManager {
    fn default() -> Self {
        Self::new()
    }
}
