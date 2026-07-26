pub mod registry;

pub use registry::ServiceRegistry;

// Note: SearchService/SearchProvider has moved to navigation::search_resolver.
// GatewayService has been folded into ServiceRegistry::gateway_capabilities().
