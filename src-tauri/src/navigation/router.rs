//! Router stage of Navigation Pipeline — classifies destination target.

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum TargetKind {
    InternalPage,
    NativeKsp,
    ViaGateway,
    DirectHttp,
}

pub fn route_target(url: &str) -> TargetKind {
    if url.starts_with("ksp://") {
        if url.ends_with(".ksp") || url.contains(".ksp/") {
            TargetKind::NativeKsp
        } else {
            TargetKind::InternalPage
        }
    } else if url.contains(".ksp") {
        TargetKind::NativeKsp
    } else if url.contains("localhost") || url.contains("127.0.0.1") {
        TargetKind::DirectHttp
    } else {
        TargetKind::ViaGateway
    }
}
