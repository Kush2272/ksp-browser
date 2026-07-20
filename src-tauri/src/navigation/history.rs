//! History recording stage of Navigation Pipeline.

use tracing::info;

pub fn record_history(tab_id: &str, url: &str) {
    info!(tab_id = %tab_id, url = %url, "Recorded navigation history");
}
