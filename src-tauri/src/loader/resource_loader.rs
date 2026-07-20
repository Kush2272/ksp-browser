//! Resource Loader layer — fetches HTML, CSS, JS, Images, Fonts.

pub struct ResourceLoader;

impl ResourceLoader {
    pub fn new() -> Self {
        Self
    }
}

impl Default for ResourceLoader {
    fn default() -> Self {
        Self::new()
    }
}
