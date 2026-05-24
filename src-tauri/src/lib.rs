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
    .invoke_handler(tauri::generate_handler![print_document, close_print_window])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

/// Prints a self-contained HTML document assembled by the frontend.
///
/// Background: the macOS WKWebView used by the Tauri build ignores the
/// JavaScript `window.print()` call. Printing the main window natively is
/// not an option either, because the nine reference books render inside an
/// iframe, and an iframe prints only as a single clipped box rather than
/// its full, paginated content.
///
/// So the frontend assembles a complete, standalone print document (the
/// user's selected sections or text selection, with styling inlined) and
/// hands it to this command. We open that document in its own window and
/// print THAT window — a top-level page with no iframe, so it paginates
/// correctly. Each print uses a unique window + temp-file name, so rapid
/// repeat prints never collide.
#[tauri::command]
fn print_document(app: tauri::AppHandle, html: String) -> Result<(), String> {
  let stamp = std::time::SystemTime::now()
    .duration_since(std::time::UNIX_EPOCH)
    .map(|d| d.as_millis())
    .unwrap_or(0);

  // Write the document to a temp file and load it as a top-level page.
  let mut path = std::env::temp_dir();
  path.push(format!("clinical-reference-print-{}.html", stamp));
  std::fs::write(&path, html).map_err(|e| e.to_string())?;

  let url = tauri::Url::from_file_path(&path)
    .map_err(|_| "could not build a file URL for the print document".to_string())?;

  tauri::WebviewWindowBuilder::new(
    &app,
    format!("cr-print-{}", stamp),
    tauri::WebviewUrl::External(url),
  )
  .title("Print — Clinical Reference")
  .inner_size(900.0, 1100.0)
  .center()
  .on_page_load(|win, payload| {
    // Once the print document has loaded, open the OS print dialog for it.
    if let tauri::webview::PageLoadEvent::Finished = payload.event() {
      let _ = win.print();
    }
  })
  .build()
  .map_err(|e| e.to_string())?;

  Ok(())
}

/// Closes whichever window invoked this command.
///
/// The print window calls this once printing finishes (or the user clicks
/// back to the app), so the print window disposes of itself — the user
/// never has to close it manually.
#[tauri::command]
fn close_print_window(window: tauri::WebviewWindow) {
  let _ = window.close();
}
