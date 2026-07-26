//! Priority-queued Browser Task Scheduler.
//!
//! Tasks are dispatched into separate bounded semaphores per priority
//! level, so `High` tasks can always proceed even when `Background`
//! slots are saturated.  This is a real distinction real browsers make
//! (e.g., user-blocking navigation vs. background favicon prefetch).

use std::sync::Arc;
use tokio::sync::Semaphore;
use tokio::task::JoinHandle;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TaskPriority {
    /// User-blocking: navigation, page load, critical resource.
    High,
    /// Important but deferrable: favicon fetch, suggestion lookup.
    Medium,
    /// Background: cache eviction, prefetch, analytics.
    Background,
}

/// Concurrency limits per priority tier.
const HIGH_SLOTS: usize = 16;
const MEDIUM_SLOTS: usize = 8;
const BACKGROUND_SLOTS: usize = 4;

pub struct TaskScheduler {
    high: Arc<Semaphore>,
    medium: Arc<Semaphore>,
    background: Arc<Semaphore>,
}

impl TaskScheduler {
    pub fn new() -> Self {
        Self {
            high: Arc::new(Semaphore::new(HIGH_SLOTS)),
            medium: Arc::new(Semaphore::new(MEDIUM_SLOTS)),
            background: Arc::new(Semaphore::new(BACKGROUND_SLOTS)),
        }
    }

    /// Spawn a future under the given priority's concurrency limit.
    ///
    /// The task will wait for a permit from the appropriate semaphore
    /// before executing, ensuring that background work cannot starve
    /// user-blocking tasks of runtime resources.
    pub fn spawn<F>(&self, priority: TaskPriority, future: F) -> JoinHandle<F::Output>
    where
        F: std::future::Future + Send + 'static,
        F::Output: Send + 'static,
    {
        let sem = match priority {
            TaskPriority::High => Arc::clone(&self.high),
            TaskPriority::Medium => Arc::clone(&self.medium),
            TaskPriority::Background => Arc::clone(&self.background),
        };

        tokio::spawn(async move {
            // Acquire a permit — this is where backpressure happens.
            // `acquire_owned` is cancel-safe and won't leak the permit
            // if the task is dropped.
            let _permit = sem
                .acquire_owned()
                .await
                .expect("TaskScheduler semaphore closed unexpectedly");
            future.await
        })
    }
}

impl Default for TaskScheduler {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::atomic::{AtomicUsize, Ordering};

    #[tokio::test]
    async fn high_priority_executes() {
        let sched = TaskScheduler::new();
        let counter = Arc::new(AtomicUsize::new(0));
        let c = Arc::clone(&counter);
        let handle = sched.spawn(TaskPriority::High, async move {
            c.fetch_add(1, Ordering::SeqCst);
            42
        });
        let result = handle.await.unwrap();
        assert_eq!(result, 42);
        assert_eq!(counter.load(Ordering::SeqCst), 1);
    }

    #[tokio::test]
    async fn background_respects_concurrency() {
        // With only 4 background slots, spawning 8 tasks should still
        // complete — they just queue rather than all running at once.
        let sched = Arc::new(TaskScheduler::new());
        let counter = Arc::new(AtomicUsize::new(0));
        let mut handles = vec![];
        for _ in 0..8 {
            let c = Arc::clone(&counter);
            handles.push(sched.spawn(TaskPriority::Background, async move {
                c.fetch_add(1, Ordering::SeqCst);
            }));
        }
        for h in handles {
            h.await.unwrap();
        }
        assert_eq!(counter.load(Ordering::SeqCst), 8);
    }
}
