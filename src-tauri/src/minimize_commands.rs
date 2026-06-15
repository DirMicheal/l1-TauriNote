use tauri::Window;

#[tauri::command] 
pub async fn window_control(window: Window, action: String) -> Result<(), String> {
    match action.as_str() {
        "minimize" => window.minimize().map_err(|e| e.to_string())?,
        "maximize" => {
            // 检查窗口是否已经最大化
            if window.is_maximized().unwrap_or(false) {
                // 如果已经最大化，则恢复初始大小
                window.unmaximize().map_err(|e| e.to_string())?
            } else {
                // 如果未最大化，则最大化窗口
                window.maximize().map_err(|e| e.to_string())?
            }
        }
        _ => return Err("Invalid action".to_string()),
    }
    Ok(())
}

#[tauri::command]
pub async fn handle_window_close(window: Window) -> Result<(), String> {
    window.close().map_err(|e| e.to_string())?;
    Ok(())
}