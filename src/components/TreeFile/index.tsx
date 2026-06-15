import React, { useEffect, useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import TreeNode from './TreeNode';
 
let filePath = ""


function getStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    console.error("获取 localStorage 失败:", error);
    return null;
  }
}


function setStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    console.error("设置 localStorage 失败:", error);
  }
}

interface TreeFileProps {
  // @ts-ignore
  onReadFile:({content:string,type:string}) => void; 
  onDeleteRefresh: () => void;
}

function getFileDetails(filePath: string): { fileName: string; type: string } {
  // 替换 Windows 风格的反斜杠为正斜杠，统一处理
  const normalizedPath = filePath.replace(/\\/g, '/');
  
  // 使用正斜杠分割路径，取最后一部分作为文件名（带扩展名）
  const fileNameWithExtension = normalizedPath.split('/').pop() || '';
  
  // 分割文件名和扩展名
  const parts = fileNameWithExtension.split('.');
  
  // 如果文件名中没有点（没有扩展名），则返回完整文件名和空扩展名
  if (parts.length === 1) {
      return { fileName: parts[0], type: '' };
  }

  // 如果有扩展名，去掉最后一个部分作为扩展名，其余部分作为文件名
  const fileName = parts.slice(0, -1).join('.');
  const type = parts.pop() || '';

  return { fileName, type };
}


const TreeFile: React.FC<TreeFileProps> = ({onReadFile,onDeleteRefresh}) => {
    const [fileTree, setFileTree] = useState(null); 

    
    const handleOpenFolder = async () => {  
      try {
      const selected = await open({    directory: true,   multiple: false,   title: "选择笔记文件夹"     });
       
    
      
       
      if (selected) {
       
          // @ts-ignore
          setStorage("filePath", selected);
          // @ts-ignore
          filePath =  selected 
          const tree = await invoke('get_filtered_file_tree', { path: selected }); 
          // @ts-ignore
          setFileTree(tree);
       
      }
    } catch (error) {
      console.error("获取文件树失败:", error);
    }
    };
  
    const getTree = async () => {
       const path =  getStorage("filePath")
      const tree = await invoke('get_filtered_file_tree', { path  }); 
      // @ts-ignore
      setFileTree(tree);
    }
    useEffect(() => {
      getTree()
    })

      // 统一的刷新方法
  const refreshTree = async () => {  
    if (!filePath) return;    
    try { 
      const tree = await invoke('get_filtered_file_tree', { path: filePath });
      // @ts-ignore
      setFileTree(tree);  
    } catch (error) {
      alert(`刷新失败: ${error}`);
    }
  };

  const read_file_content = async (path: string) => { 
    const type = getFileDetails(path) 
    const content = await  invoke('read_file_content', { path }) 
    // @ts-ignore
    onReadFile({content, ...type,path}); 
  }

    return (
      <div >
        <div className="bg-[#18181B] rounded-lg text-center h-8 flex items-center justify-center" onClick={handleOpenFolder}>
            <button className="text-white text-sm font-bold" >打开笔记</button>  
        </div>
        <div className=" h-[calc(100vh-45vh)] overflow-y-auto overflow-hidden">
        {fileTree && <TreeNode onDeleteRefresh={onDeleteRefresh} node={fileTree} onRefresh={refreshTree} onRead={read_file_content} />}
        </div>
      </div>
    );
  }
  
 

export default TreeFile;