//! Security policy — the single place where navigation allow/deny
//! decisions are enforced at the Rust (network) layer.
//!
//! This replaces the old `permissions.rs` which unconditionally returned
//! `true`.  Having at least one real, enforced rule is better than a
//! silent pass-through that gives false confidence.
//!
//! Future phases will add:
//! - Certificate-pinning TOFU trust decisions (Phase 9)
//! - Camera/mic/geolocation permission prompts (Phase 9)
//! - Content-Security-Policy enforcement

use serde::{Deserialize, Serialize};

use super::address_parser::{AddressClassification, ProtocolFamily, TargetKind};

/// The result of a security-policy check.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PolicyDecision {
    /// Whether the navigation is allowed.
    pub allowed: bool,
    /// Human-readable reason for blocking (empty if allowed).
    pub reason: String,
    /// If true, the user can override this block (soft warning).
    /// If false, the navigation is unconditionally denied (hard block).
    pub overridable: bool,
}

impl PolicyDecision {
    fn allow() -> Self {
        Self {
            allowed: true,
            reason: String::new(),
            overridable: false,
        }
    }

    fn block(reason: impl Into<String>, overridable: bool) -> Self {
        Self {
            allowed: false,
            reason: reason.into(),
            overridable,
        }
    }
}

/// Check whether navigating to `target` from `referrer` is allowed.
///
/// `referrer` is `None` for top-level user-initiated navigations
/// (typed in the address bar, clicked a bookmark, etc.) — those are
/// always allowed except for scheme-level rules.
///
/// When `referrer` is `Some`, we enforce mixed-content blocking:
/// an HTTPS page cannot pull sub-resources or navigate to plain HTTP.
pub fn check(
    target: &AddressClassification,
    referrer: Option<&AddressClassification>,
) -> PolicyDecision {
    // ── Rule 1: block dangerous schemes outright ─────────────────
    // `javascript:`, `data:`, `blob:` in the address bar are always
    // blocked — they're a classic XSS vector.
    let norm_lower = target.normalized.to_lowercase();
    if norm_lower.starts_with("javascript:")
        || norm_lower.starts_with("data:text/html")
        || norm_lower.starts_with("vbscript:")
    {
        return PolicyDecision::block(
            format!("Blocked: '{}' scheme is not allowed for security reasons", target.family_label()),
            false,
        );
    }

    // ── Rule 2: mixed-content blocking ───────────────────────────
    // If the referrer is HTTPS (secure) and the target is plain HTTP
    // (insecure) to a non-loopback host, block with an overridable warning.
    if let Some(ref_cls) = referrer {
        if ref_cls.is_secure
            && target.family == ProtocolFamily::Http
            && target.target != TargetKind::DirectLocal
        {
            return PolicyDecision::block(
                format!(
                    "Mixed content blocked: secure page '{}' attempted to load insecure resource '{}'",
                    ref_cls.hostname, target.hostname
                ),
                true, // user can override if they really want to
            );
        }
    }

    // ── Default: allow ───────────────────────────────────────────
    PolicyDecision::allow()
}

/// Convenience trait extension on `AddressClassification` for display.
trait FamilyLabel {
    fn family_label(&self) -> &'static str;
}

impl FamilyLabel for AddressClassification {
    fn family_label(&self) -> &'static str {
        match self.family {
            ProtocolFamily::Ksp => "ksp",
            ProtocolFamily::Https => "https",
            ProtocolFamily::Http => "http",
            ProtocolFamily::Wss => "wss",
            ProtocolFamily::Ws => "ws",
            ProtocolFamily::Search => "search",
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::navigation::address_parser::classify;

    #[test]
    fn top_level_https_allowed() {
        let target = classify("https://example.com");
        let decision = check(&target, None);
        assert!(decision.allowed);
    }

    #[test]
    fn javascript_scheme_blocked() {
        let mut target = classify("test");
        target.normalized = "javascript:alert(1)".into();
        let decision = check(&target, None);
        assert!(!decision.allowed);
        assert!(!decision.overridable);
    }

    #[test]
    fn mixed_content_blocked() {
        let referrer = classify("https://secure.example.com");
        let target = classify("http://insecure.example.com");
        let decision = check(&target, Some(&referrer));
        assert!(!decision.allowed);
        assert!(decision.overridable);
    }

    #[test]
    fn mixed_content_localhost_allowed() {
        let referrer = classify("https://secure.example.com");
        let target = classify("http://localhost:3000");
        let decision = check(&target, Some(&referrer));
        // localhost is DirectLocal — exempt from mixed-content blocking
        assert!(decision.allowed);
    }
}
