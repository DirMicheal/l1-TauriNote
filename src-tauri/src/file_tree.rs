// 调整导入语句
use crate::models::FileNode;
// use serde::Serialize;
use std::{fs, path::Path};

// pub fn build_file_tree_with_filter(path: &str) -> Result<FileNode, std::io::Error> {
//     let metadata = fs::metadata(path)?;

//     if !metadata.is_dir() {
//         let ext = Path::new(path)
//             .extension()
//             .and_then(|e| e.to_str())
//             .map(|e| e.to_lowercase());

//         let allowed = ext.as_ref()
//             .map(|e| ["html", "md", "txt", "json","tn"].contains(&e.as_str()))
//             .unwrap_or(false);

//         return if allowed {
//             Ok(FileNode {
//                 name: path.split('/').last().unwrap_or("").to_string(),
//                 is_dir: false,
//                 children: Vec::new(),
//                 full_path: path.to_string(),
//             })
//         } else {
//             Err(std::io::Error::new(
//                 std::io::ErrorKind::InvalidData,
//                 "文件类型不符合要求"
//             ))
//         };
//     }

//     let mut children = Vec::new();
//     for entry in fs::read_dir(path)? {
//         let entry = entry?;
//         let path_str = entry.path().to_string_lossy().into_owned();
//         if let Ok(child) = build_file_tree_with_filter(&path_str) {
//             children.push(child);
//         }
//     }

//     children.sort_by(|a, b| a.name.cmp(&b.name));

//     Ok(FileNode {
//         name: Path::new(path)
//             .file_name()
//             .and_then(|n| n.to_str())
//             .unwrap_or("")
//             .to_string(),
//         is_dir: true,
//         children,
//         full_path: path.to_string(),
//     })
// }

pub fn build_file_tree_with_filter(path: &str) -> Result<FileNode, std::io::Error> {
    let metadata = fs::metadata(path)?;

    if !metadata.is_dir() {
        let ext = Path::new(path)
            .extension()
            .and_then(|e| e.to_str())
            .map(|e| e.to_lowercase());

        let allowed = ext
            .as_ref()
            .map(|e| ["html", "md", "txt", "json", "tn"].contains(&e.as_str()))
            .unwrap_or(false);

        return if allowed {
            Ok(FileNode {
                name: path.split('/').last().unwrap_or("").to_string(),
                is_dir: false,
                children: Vec::new(),
                full_path: path.to_string(),
            })
        } else {
            Err(std::io::Error::new(
                std::io::ErrorKind::InvalidData,
                "文件类型不符合要求",
            ))
        };
    }

    let mut children = Vec::new();
    for entry in fs::read_dir(path)? {
        let entry = entry?;

        // 新增过滤逻辑：跳过 .git 目录
        let file_name = entry.file_name().to_string_lossy().into_owned();
        if file_name == ".git" {
            continue;
        }

        let path_str = entry.path().to_string_lossy().into_owned();
        if let Ok(child) = build_file_tree_with_filter(&path_str) {
            children.push(child);
        }
    }

    children.sort_by(|a, b| a.name.cmp(&b.name));

    Ok(FileNode {
        name: Path::new(path)
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("")
            .to_string(),
        is_dir: true,
        children,
        full_path: path.to_string(),
    })
}

#[tauri::command]
pub fn get_filtered_file_tree(path: String) -> Result<FileNode, String> {
    build_file_tree_with_filter(&path).map_err(|e| format!("文件系统错误: {}", e))
}
