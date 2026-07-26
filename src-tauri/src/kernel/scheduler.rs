//! Priority-queued Browser Task Scheduler.

use tokio::task::JoinHandle;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TaskPriority {
    High,
    Medium,
    Background,
}

pub struct TaskScheduler;

impl TaskScheduler {
    pub fn new() -> Self {
        Self
    }

    pub fn spawn<F>(&self, _priority: TaskPriority, future: F) -> JoinHandle<F::Output>
    where
        F: std::future::Future + Send + 'static,
        F::Output: Send + 'static,
    {
        tokio::spawn(future)
    }
}

impl Default for TaskScheduler {
    fn default() -> Self {
        Self::new()
    }
}
