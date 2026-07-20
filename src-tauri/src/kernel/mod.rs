//! Top-level Browser Kernel coordinator.

pub mod scheduler;

use std::sync::Arc;
use crate::services::ServiceRegistry;
use crate::kernel::scheduler::TaskScheduler;

pub struct BrowserKernel {
    pub services:  Arc<ServiceRegistry>,
    pub scheduler: Arc<TaskScheduler>,
}

impl BrowserKernel {
    pub fn boot() -> Self {
        Self {
            services:  Arc::new(ServiceRegistry::new()),
            scheduler: Arc::new(TaskScheduler::new()),
        }
    }
}

impl Default for BrowserKernel {
    fn default() -> Self {
        Self::boot()
    }
}
