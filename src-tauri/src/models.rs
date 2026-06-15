// 添加 pub 修饰所有结构体和字段
use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct FileNode {
    pub name: String,
    pub is_dir: bool,
    pub children: Vec<FileNode>,
    pub full_path: String,
}
