//! Tunnel frame codec — the browser side of the KSP HTTP tunnel.
//!
//! Wire format (must stay in sync with `ksp-gateway/crates/gateway-ksp/src/codec.rs`):
//!
//! ```text
//! ┌──────────────┬─────────────────────┬──────────────┐
//! │ u32 BE       │ JSON header         │ raw body     │
//! │ header_len   │ (header_len bytes)  │ (remainder)  │
//! └──────────────┴─────────────────────┴──────────────┘
//! ```

use std::collections::HashMap;
use serde::{Deserialize, Serialize};

/// An outbound HTTP request to be carried over the KSP tunnel.
#[derive(Debug, Clone)]
pub struct TunnelRequest {
    pub method:  String,
    pub url:     String,
    pub headers: HashMap<String, String>,
    pub body:    Vec<u8>,
}

impl TunnelRequest {
    pub fn get(url: impl Into<String>) -> Self {
        Self {
            method:  "GET".into(),
            url:     url.into(),
            headers: HashMap::new(),
            body:    Vec::new(),
        }
    }
}

#[derive(Serialize)]
struct RequestHeader<'a> {
    method:  &'a str,
    url:     &'a str,
    headers: &'a HashMap<String, String>,
}

#[derive(Deserialize)]
struct ResponseHeader {
    status: u16,
    #[serde(default)]
    reason: String,
    #[serde(default)]
    headers: HashMap<String, String>,
    #[serde(default)]
    error: Option<String>,
}

/// An HTTP response received over the KSP tunnel.
#[derive(Debug, Clone)]
pub struct TunnelResponse {
    pub status:  u16,
    pub reason:  String,
    pub headers: HashMap<String, String>,
    /// Gateway-level failure (DNS error, upstream unreachable, …).
    pub error:   Option<String>,
    pub body:    Vec<u8>,
}

/// Serialize a request into a tunnel frame (payload of one KSP Data packet).
pub fn encode_request(req: &TunnelRequest) -> Vec<u8> {
    let header = RequestHeader {
        method:  &req.method,
        url:     &req.url,
        headers: &req.headers,
    };
    let header_json = serde_json::to_vec(&header).expect("request header serialization");
    let mut out = Vec::with_capacity(4 + header_json.len() + req.body.len());
    out.extend_from_slice(&(header_json.len() as u32).to_be_bytes());
    out.extend_from_slice(&header_json);
    out.extend_from_slice(&req.body);
    out
}

/// Parse a tunnel response frame.
pub fn decode_response(payload: &[u8]) -> Result<TunnelResponse, String> {
    if payload.len() < 4 {
        return Err("tunnel response shorter than 4 bytes".into());
    }
    let header_len = u32::from_be_bytes([payload[0], payload[1], payload[2], payload[3]]) as usize;
    if payload.len() < 4 + header_len {
        return Err(format!(
            "tunnel response truncated: header_len={header_len}, available={}",
            payload.len() - 4
        ));
    }
    let header: ResponseHeader = serde_json::from_slice(&payload[4..4 + header_len])
        .map_err(|e| format!("invalid tunnel response header: {e}"))?;

    Ok(TunnelResponse {
        status:  header.status,
        reason:  header.reason,
        headers: header.headers,
        error:   header.error,
        body:    payload[4 + header_len..].to_vec(),
    })
}
