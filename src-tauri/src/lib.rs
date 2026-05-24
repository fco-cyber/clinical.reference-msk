#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![print_self])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

/// Opens the operating-system print dialog for the app's main webview.
///
/// The macOS WKWebView used by the Tauri build ignores the JavaScript
/// `window.print()` call, so the native print path is required. Before
/// calling this, the frontend lays the selected content out as a
/// top-level overlay in the main window (inside an isolated Shadow DOM),
/// so the printout paginates correctly and nothing is trapped in an
/// iframe. No separate window is involved.
#[tauri::command]
fn print_self(window: tauri::WebviewWindow) {
  let _ = window.print();
}
