pub mod context;
pub mod parser;
pub mod normalizer;
pub mod history;
pub mod router;
pub mod permissions;

pub use context::NavigationContext;

/// Process a raw input through the full 6-stage navigation pipeline.
pub fn process_navigation(tab_id: &str, raw_input: &str) -> NavigationContext {
    let mut ctx = NavigationContext::new(tab_id, raw_input);

    // Stage 1: Parse
    let parsed = parser::parse_input(&ctx.raw_input);
    
    // Stage 2: Normalize
    let normalized = normalizer::normalize_url(&parsed);
    ctx.parsed_url = normalized;

    // Stage 3: Record History
    history::record_history(&ctx.tab_id, &ctx.parsed_url);

    // Stage 4: Route Classification
    let target = router::route_target(&ctx.parsed_url);
    ctx.target_kind = format!("{:?}", target);

    // Stage 5: Permissions Check
    ctx.allowed = permissions::check_permissions(&ctx.parsed_url);

    ctx
}
