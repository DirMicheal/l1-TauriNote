import { useState, useRef, useEffect } from 'react';
// @ts-ignore
import PropTypes from 'prop-types';
import { invoke } from '@tauri-apps/api/core';

// 定义节点类型
interface FileNode {
  name: string;
  is_dir: boolean;
  children: FileNode[];
  full_path: string;
}

// 组件属性定义
interface TreeNodeProps {
  node: FileNode;
  depth?: number;
  onRefresh: () => void;
  onRead: (path: string) => void;
  onDeleteRefresh: () => void;
}

// 新建状态类型
interface CreatingState {
  isCreating: boolean;
  isDirectory: boolean;
  name: string;
  parentPath: string;
}

// 文件图标映射
// @ts-ignore
const getFileIcon = (filename: string) => { 
  return   '📄';
};


function getExtension(path: string): string {
  // 正则表达式匹配扩展名部分
  const extensionRegex = /(\.[^\\.]+)$/;
  const match = path.match(extensionRegex);

  if (match) {
    return match[1]; // 返回扩展名部分
  }

  return ""; // 如果没有扩展名，返回空字符串
}

function getFileNameWithoutExtension(filePath: string): string {
  // 替换 Windows 风格的反斜杠为正斜杠，统一处理
  const normalizedPath = filePath.replace(/\\/g, '/');
  
  // 使用正斜杠分割路径，取最后一部分作为文件名
  const fileNameWithExtension = normalizedPath.split('/').pop() || '';
  
  // 去掉文件扩展名
  const fileNameWithoutExtension = fileNameWithExtension.split('.').slice(0, -1).join('.');
  
  return fileNameWithoutExtension;
}

const TreeNode = ({ node, depth = 0, onRefresh ,onRead,onDeleteRefresh}: TreeNodeProps) => {
  // 状态管理
  const [isExpanded, setIsExpanded] = useState(true);
  const [editingName, setEditingName] = useState('');
  const [fileName, setFileName] = useState("");
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    targetNode: null as FileNode | null,
    position: { x: 0, y: 0 }
  });
  const [creatingItem, setCreatingItem] = useState<CreatingState>({
    isCreating: false,
    isDirectory: false,
    name: '',
    parentPath: ''
  });

  // DOM引用
  const nodeRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const createInputRef = useRef<HTMLInputElement>(null);

  // 自动聚焦新建输入框
  useEffect(() => {
    if (creatingItem.isCreating && createInputRef.current) {
      
      createInputRef.current.focus();
    }
  }, [creatingItem.isCreating]);

  // 文件操作统一处理
  const handleFileOperation = async (operation: string, args: any) => {
    try {
      closeContextMenu()
      await invoke(operation, args);
      onRefresh();
    } catch (error) {
      alert(`${operation} 操作失败: ${error}`);
    }
  };

  // 启动新建流程（修复点1：使用右键菜单的目标节点路径）
  const startCreating = (isDirectory: boolean) => {
    if (!contextMenu.targetNode) return;
    
    setCreatingItem({
      isCreating: true,
      isDirectory,
      name: '',
      parentPath: contextMenu.targetNode.full_path // 关键修复：使用右键点击的节点路径
    });
    closeContextMenu();
  };

  // 确认新建（修复点2：使用存储的父路径）
  const confirmCreate = async () => {
    if (!creatingItem.name.trim()) {
      alert('名称不能为空');
      return;
    }

    try { 
     setTimeout( async() => {
       // 定义允许的文件扩展名列表
       const allowedExtensions = ['html', 'txt','md','tn'];
      // 检查文件扩展名是否在允许的列表中
       const hasAllowedExtension = allowedExtensions.some(ext => creatingItem.name?.endsWith(`.${ext}`));
       if(!hasAllowedExtension && !creatingItem.isDirectory  ) creatingItem.name = `${creatingItem.name}.tn` 
      await invoke('create_path', {
        parentPath: creatingItem.parentPath, // 使用存储的父路径
        name: creatingItem.name,
        isDirectory: creatingItem.isDirectory,
        content:""
      });
      onRefresh();

     }, 0);
    } catch (error) {
      alert(`创建失败: ${error}`);
    } finally {
      cancelCreate();
    }
  };

  // 取消新建
  const cancelCreate = () => {
    setCreatingItem(prev => ({
      ...prev,
      isCreating: false,
      name: ''
    }));
  };

  // 关闭所有交互元素
  const closeContextMenu = () => {
    setContextMenu(prev => ({ ...prev, visible: false }));
    setEditingName('');
  };

  // 右键菜单处理（修复点3：保留目标节点）
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      visible: true,
      targetNode: node,
      position: { x: e.clientX, y: e.clientY}
    });
  };

  // 全局事件监听
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node) && 
          !nodeRef.current?.contains(e.target as Node)) {
        closeContextMenu();
      }
    };

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeContextMenu();
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

 
  
  return (
    <div 
      ref={nodeRef}
      className="tree-node  "
      onContextMenu={handleContextMenu}
      data-is-dir={node.is_dir}
    >
      {/* 节点主体（修复点4：移除无效...语法） */}
      <div
        className="node-content flex items-center"
        style={{   paddingLeft: `${depth * 16}px`, 
                   backgroundColor: contextMenu.visible ? 'rgba(0, 120, 212, 0.1)' : 'transparent',
                  cursor: node.is_dir ? 'pointer' : 'default'
        }}
        onClick={() => node.is_dir && setIsExpanded(!isExpanded)}>

        {node.is_dir && (  <span className="toggle-icon h-9 flex items-center" style={{ marginRight: 8 }}>  {isExpanded ? '▼' : '▶'}  </span> )}
        <span className="type-icon h-9 flex items-center" style={{ marginRight: 8 }}> {node.is_dir ? '📁' : getFileIcon(node.name)} </span>
        {editingName ? (
          <input className='w-full h-9 flex items-center' ref={inputRef} value={fileName}  onChange={(e) =>{ setFileName( e.target.value) }}
            onBlur={() => {handleFileOperation('rename_file', {oldPath: node.full_path, newName: `${fileName}${getExtension(editingName)}`})  }} 
            onKeyDown={(e) => {    
              if (e.key === 'Enter') handleFileOperation('rename_file', { oldPath: node.full_path,  newName: `${fileName}${getExtension(editingName)}` });
              if (e.key === 'Escape') closeContextMenu();
            }} 
            style={{ padding: '4px 8px', border: '1px solid #0078d4',borderRadius: 3, outline: 'none',position: 'relative',  zIndex: 1500 }}
            autoFocus
          />
        ) : (
            <div className="node-name cursor-pointer h-9 flex items-center" onClick={()=>{!node.is_dir && onRead(node.full_path)}} >
            { node.is_dir ? node.name:   getFileNameWithoutExtension(node.name)  }
            </div>
        )}
      </div>

      {/* 新建输入框（修复点5：正确显示条件） */}
      {creatingItem.isCreating && (
        <div 
          className="new-item h-9 flex items-center justify-center"
          style={{paddingLeft: `${(depth + 1) * 16}px`,   margin: '4px 0',  display: 'flex', alignItems: 'center', position: 'relative',  zIndex: 1001 }}
        >
          <span style={{marginRight: 8, color: creatingItem.isDirectory ? '#4ec9b0' : '#569cd6'  }}>
            {creatingItem.isDirectory ? '📁' : getFileIcon('new-file')}
          </span>
          <input
            ref={createInputRef}
            value={creatingItem.name}
            placeholder={`输入${creatingItem.isDirectory ? '文件夹' : '文件'}名称`}
            onChange={(e) => setCreatingItem(prev => ({
              ...prev,
              name: e.target.value.replace(/[\\/:"*?<>|]/g, '') // 过滤非法字符
            }))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') confirmCreate();
              if (e.key === 'Escape') cancelCreate();
            }}
            onBlur={cancelCreate}
            className='w-full h-9'
            style={{ padding: '4px 8px', border: '1px solid #0078d4', borderRadius: 3, backgroundColor: '#f1efef',  outline: 'none'  }}
          />
        </div>
      )}

      {/* 右键菜单（修复点6：完整样式定义） */}
      {contextMenu.visible && (
        <div
          ref={menuRef}
          className="context-menu fixed left-[var(--context-menu-x)] top-[var(--context-menu-y)] z-1000 bg-[#fcfcfc] rounded-lg p-2 min-w-[160px] shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
          style={{ 
            left: contextMenu.position.x,
            top: contextMenu.position.y,
            zIndex: 1000,
             
          }}
        >
           {contextMenu.targetNode?.is_dir && (
    <>
      <div className="menu-item hover:bg-gray-100 cursor-pointer p-2" onClick={() => startCreating(false)}>
        新建文件
      </div>
      <div className="menu-item hover:bg-gray-100 cursor-pointer p-2" onClick={() => startCreating(true)}>
        新建文件夹
      </div>
      <hr className="border border-[#d4d4d4] my-2" />
    </>
  )}
  <div
    className="menu-item hover:bg-gray-100 cursor-pointer p-2"
    onClick={() => {
      if (contextMenu.targetNode) {
        setFileName(getFileNameWithoutExtension(contextMenu.targetNode.name));
        setEditingName(contextMenu.targetNode.name);
      }
    }}
  >
    重命名
  </div>
  <div
    className="menu-item hover:bg-gray-100 cursor-pointer p-2"
    onClick={() => {
      if (contextMenu.targetNode) {
        handleFileOperation('delete_path', { path: contextMenu.targetNode.full_path });
      }
      if (!node.is_dir) {
        onDeleteRefresh();
      }
    }}
  >
    删除
  </div>
        </div>
      )}

      {/* 子节点容器 */}
      {node.is_dir && isExpanded && (
        <div className="children">
          {node.children.map((child, index) => (
            <TreeNode
              key={`${child.full_path}-${index}`}
              node={child}
              depth={depth + 1}
              onDeleteRefresh={onDeleteRefresh}
              onRefresh={onRefresh}
              onRead={onRead}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Prop类型校验
TreeNode.propTypes = {
  node: PropTypes.shape({
    name: PropTypes.string.isRequired,
    is_dir: PropTypes.bool.isRequired,
    children: PropTypes.array.isRequired,
    full_path: PropTypes.string.isRequired,
  }).isRequired,
  depth: PropTypes.number,
  onRefresh: PropTypes.func.isRequired
};

export default TreeNode;