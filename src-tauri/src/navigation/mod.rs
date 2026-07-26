//! Navigation module — address classification, search resolution, and
//! security policy enforcement.
//!
//! The old 6-stage pipeline (`parse → normalize → history → route →
//! permissions → context`) has been consolidated into three focused
//! modules:
//!
//! - [`address_parser`] — single-pass classify + normalize + route
//! - [`search_resolver`] — turn a search query + provider into a URL
//! - [`security_policy`] — real allow/deny rules enforced at the Rust layer
//!
//! `history` recording is kept but will move to `BrowserService` in
//! Phase 1/2 — it's not a navigation concern, it's a persistence concern.

pub mod address_parser;
pub mod search_resolver;
pub mod security_policy;
pub mod history;

// Re-exports for ergonomic access.
pub use address_parser::{classify, AddressClassification, TargetKind, ProtocolFamily};
pub use search_resolver::SearchProvider;
pub use security_policy::{check as check_security, PolicyDecision};
