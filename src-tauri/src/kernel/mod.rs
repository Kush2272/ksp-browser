//! Top-level Browser Kernel coordinator.

pub mod scheduler;
pub mod session_restore;

use std::sync::Arc;
use crate::services::ServiceRegistry;
use crate::kernel::scheduler::TaskScheduler;
use crate::kernel::session_restore::SessionRestoreEngine;

pub struct BrowserKernel {
    pub services:  Arc<ServiceRegistry>,
    pub scheduler: Arc<TaskScheduler>,
}

impl BrowserKernel {
    pub fn boot() -> Self {
        let kernel = Self {
            services:  Arc::new(ServiceRegistry::new()),
            scheduler: Arc::new(TaskScheduler::new()),
        };
        let _restore = SessionRestoreEngine::restore_latest();
        kernel
    }
}

impl Default for BrowserKernel {
    fn default() -> Self {
        Self::boot()
    }
}
