//! KSP Protocol client wrapper for gateway communication.
//!
//! Each `GatewayClient` owns one encrypted KSP session to the gateway and
//! serializes request/response cycles over it (the `ConnectionManager` keeps a
//! small pool of these, like a classic browser's per-host connection pool).

use std::net::SocketAddr;
use std::sync::atomic::{AtomicU32, Ordering};
use std::time::Duration;
use tokio::sync::Mutex;
use tracing::{info, warn};

use ksp_client::KspClient;
use ksp_core::types::PacketType;

use crate::network::tunnel::{self, TunnelRequest, TunnelResponse};

/// How long to wait for the gateway to answer a single tunneled request.
const REQUEST_TIMEOUT: Duration = Duration::from_secs(45);

pub struct GatewayClient {
    pub target_addr: String,
    conn: Mutex<Option<KspClient>>,
    next_stream: AtomicU32,
}

impl GatewayClient {
    pub fn new(target_addr: impl Into<String>) -> Self {
        Self {
            target_addr: target_addr.into(),
            conn: Mutex::new(None),
            next_stream: AtomicU32::new(1),
        }
    }

    /// Establish a KSP connection to the gateway if not already connected.
    pub async fn connect(&self) -> Result<(), String> {
        let mut conn = self.conn.lock().await;
        self.ensure_connected(&mut conn).await
    }

    /// Check if the client currently holds an established session.
    pub async fn is_connected(&self) -> bool {
        self.conn.lock().await.is_some()
    }

    /// Disconnect from the gateway.
    pub async fn disconnect(&self) {
        let mut conn = self.conn.lock().await;
        if let Some(mut client) = conn.take() {
            let _ = client.close().await;
            info!("Disconnected from KSP gateway");
        }
    }

    /// Send one HTTP request through the KSP tunnel and await its response.
    ///
    /// Reconnects and retries once if the pooled session went stale (gateway
    /// restarted, idle timeout, …).
    pub async fn fetch(&self, req: &TunnelRequest) -> Result<TunnelResponse, String> {
        let frame = tunnel::encode_request(req);
        let mut conn = self.conn.lock().await;

        for attempt in 0..2u8 {
            self.ensure_connected(&mut conn).await?;
            let client = conn.as_mut().expect("ensure_connected guarantees Some");
            let stream_id = self.next_stream.fetch_add(1, Ordering::Relaxed);

            match tokio::time::timeout(REQUEST_TIMEOUT, Self::roundtrip(client, stream_id, &frame)).await {
                Ok(Ok(resp)) => return Ok(resp),
                Ok(Err(e)) => {
                    warn!(attempt, error = %e, "Tunnel roundtrip failed; dropping session");
                    *conn = None;
                    if attempt == 1 {
                        return Err(e);
                    }
                }
                Err(_) => {
                    *conn = None;
                    return Err(format!("gateway did not respond within {}s", REQUEST_TIMEOUT.as_secs()));
                }
            }
        }
        unreachable!("fetch retry loop always returns");
    }

    async fn ensure_connected(&self, conn: &mut Option<KspClient>) -> Result<(), String> {
        if conn.is_some() {
            return Ok(());
        }
        let addr: SocketAddr = self.target_addr.parse()
            .map_err(|e| format!("Invalid gateway address '{}': {}", self.target_addr, e))?;

        info!(addr = %self.target_addr, "Connecting via KSP protocol");
        match KspClient::connect(addr).await {
            Ok(client) => {
                info!("KSP session established with gateway at {}", self.target_addr);
                *conn = Some(client);
                Ok(())
            }
            Err(e) => Err(format!("Failed to connect to KSP gateway at {}: {}", self.target_addr, e)),
        }
    }

    async fn roundtrip(
        client: &mut KspClient,
        stream_id: u32,
        frame: &[u8],
    ) -> Result<TunnelResponse, String> {
        client
            .send_data(stream_id, frame)
            .await
            .map_err(|e| format!("failed to send tunnel request: {e}"))?;

        loop {
            let (packet, plaintext) = client
                .receive_packet()
                .await
                .map_err(|e| format!("failed to read tunnel response: {e}"))?;

            match packet.packet_type {
                PacketType::Data | PacketType::StreamData if packet.stream_id == stream_id => {
                    return tunnel::decode_response(&plaintext);
                }
                PacketType::GoAway => {
                    return Err("gateway closed the session".into());
                }
                // Keep-alive acks or responses to other streams: keep reading.
                _ => continue,
            }
        }
    }
}
