// 完整修改内容
// use std::{fs,path::{Path, PathBuf}, ffi::OsStr};
use std::ffi::OsStr;
use std::fs::{self, File};
use std::io::Write;
use std::path::{Path, PathBuf};

// 重命名文件
#[tauri::command]
pub fn rename_file(old_path: String, new_name: String) -> Result<(), String> {
    // 将字符串转换为路径
    let path = Path::new(&old_path);
    // 获取路径的父路径
    let parent = path.parent().ok_or("无效路径")?;
    // 将新名称与父路径拼接成新的路径
    let new_path = parent.join(new_name);

    // 如果新路径已存在，则返回错误
    if new_path.exists() {
        return Err("名称已存在".into());
    }

    // 重命名文件
    fs::rename(path, &new_path).map_err(|e| format!("重命名失败: {}", e))
}

// 删除路径
#[tauri::command]
pub fn delete_path(path: String) -> Result<(), String> {
    // 将字符串转换为路径
    let path = Path::new(&path);
    // 如果路径是目录，则删除目录及其内容
    if path.is_dir() {
        fs::remove_dir_all(path)
    // 否则，删除文件
    } else {
        fs::remove_file(path)
    }
    .map_err(|e| format!("删除失败: {}", e))
}

// 创建路径
#[tauri::command]
pub fn create_path(
    parent_path: String,
    name: String,
    is_directory: bool,
    content: String,
) -> Result<(), String> {
    let path = PathBuf::from(&parent_path).join(&name);

    // 1. 存在性检查
    if path.exists() {
        return Err(format!("'{}' 已存在", path.display()));
    }

    // 2. 创建目录逻辑
    if is_directory {
        return fs::create_dir(&path)
            .map_err(|e| format!("创建目录失败: {} ({})", path.display(), e));
    }

    // 3. 扩展名白名单验证
    let ext = path
        .extension()
        .and_then(OsStr::to_str)
        .map(|s| s.to_lowercase())
        .unwrap_or_default();

    if !matches!(ext.as_str(), "html" | "md" | "txt" | "json" | "tn") {
        return Err(format!("不支持 .{} 文件类型", ext));
    }

    // 4. 自动创建父目录
    if let Some(parent) = path.parent() {
        if !parent.exists() {
            fs::create_dir_all(parent)
                .map_err(|e| format!("创建父目录失败: {} ({})", parent.display(), e))?;
        }
    }

    // 5. 智能默认内容生成
    let final_content =
        if content.trim().is_empty() {
            match ext.as_str() {
                "md" => "# 新建文档\n\n开始编写内容...".to_string(),
                "html" => r#"<!DOCTYPE html>
            <html lang="zh-CN">
            <head>
                <meta charset="UTF-8">
                <title>新建文档\n\n开始编写内容...</title>
            </head>
            <body></body>
            </html>"#
                    .to_string(),
                "tn" => "[{\"type\": \"paragraph\", \"content\": \"新建文档开始编写内容...\"}]"
                    .to_string(),
                "json" => "[{\"type\": \"paragraph\", \"content\": \"新建文档开始编写内容...\"}]"
                    .to_string(),
                _ => "请输入内容".to_string(),
            }
        } else {
            content
        };

    // 6. 原子化写入流程
    let temp_path = path.with_extension("tmp");

    // 写入临时文件
    File::create(&temp_path)
        .and_then(|mut f| {
            f.write_all(final_content.as_bytes())?;
            f.sync_all()?; // 确保写入磁盘
            Ok(())
        })
        .map_err(|e| format!("文件写入失败: {} ({})", temp_path.display(), e))?;

    // 重命名替换原文件
    fs::rename(&temp_path, &path).map_err(|e| {
        format!(
            "文件提交失败: {} → {} ({})",
            temp_path.display(),
            path.display(),
            e
        )
    })?;

    Ok(())
}

// 读取文件内容
#[tauri::command]
pub fn read_file_content(path: String) -> Result<String, String> {
    // 验证路径安全性
    if path.contains("..") {
        return Err("禁止访问上级目录".into());
    }

    // 统一路径格式
    let normalized_path = std::path::Path::new(&path)
        .canonicalize()
        .map_err(|e| format!("路径解析失败: {}", e))?;

    // 检查文件类型
    let metadata =
        std::fs::metadata(&normalized_path).map_err(|e| format!("获取文件元数据失败: {}", e))?;

    // 如果路径不是文件，则返回错误
    if !metadata.is_file() {
        return Err("路径不是文件".into());
    }

    // 读取文件内容
    let content =
        std::fs::read_to_string(&normalized_path).map_err(|e| format!("文件读取失败: {}", e))?;

    Ok(content)
}

// 修改文件内容
#[tauri::command]
pub fn write_file_content(path: String, content: String) -> Result<(), String> {
    // 将路径字符串转换为 Path
    let path = Path::new(&path);

    // 打开文件，如果文件不存在则创建，清空文件内容
    let mut file = match fs::File::create(&path) {
        Ok(file) => file,
        Err(e) => return Err(format!("无法创建或打开文件: {}", e)),
    };

    // 写入内容
    match file.write_all(content.as_bytes()) {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("写入文件时出错: {}", e)),
    }
}
