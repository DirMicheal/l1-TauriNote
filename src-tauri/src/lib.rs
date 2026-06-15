mod file_commands;
mod file_tree;
mod models;
mod minimize_commands;

use minimize_commands::{ window_control,handle_window_close };
use file_commands::{create_path, delete_path, read_file_content, rename_file, write_file_content};
use file_tree::get_filtered_file_tree; 

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        // .plugin(DialogPlugin::new())
        .invoke_handler(tauri::generate_handler![
            get_filtered_file_tree,
            rename_file,
            delete_path,
            create_path,
            read_file_content,
            write_file_content,
            window_control,handle_window_close
            
           
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
