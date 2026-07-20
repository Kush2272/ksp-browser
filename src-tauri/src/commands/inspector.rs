//! Inspector commands for export, replay, and analysis.

use crate::inspector::{KspCapFile, InspectorAnalyzer, AnalysisReport};

#[tauri::command]
pub fn export_kspcap_json() -> String {
    let cap = KspCapFile::new(vec![]);
    cap.to_json().unwrap_or_default()
}

#[tauri::command]
pub fn analyze_capture() -> AnalysisReport {
    InspectorAnalyzer::analyze(&[])
}
