// 导出工具函数
import { message } from 'antd';
import { saveAs } from 'file-saver';

// 获取当前编辑器内容
const getCurrentContent = async (format: 'html' | 'markdown') => {
  // 通过全局编辑器实例获取内容
  if (window.editor) {
    try {
      if (format === 'html') {
        return await window.editor.blocksToHTMLLossy(window.editor.document);
      } else {
        return await window.editor.blocksToMarkdownLossy(window.editor.document);
      }
    } catch (error) {
      console.error(`获取${format}内容失败:`, error);
      message.error(`获取${format}内容失败`);
      return null;
    }
  }
  return null;
};

// 导出HTML文件
export const exportToHTML = async (fileName: string = 'document') => {
  const progressKey = 'html-export-progress';
  message.loading({ content: '正在导出HTML...', key: progressKey, duration: 0 });
  
  try {
    const htmlContent = await getCurrentContent('html');
    if (!htmlContent) {
      message.error({ content: '导出失败：无法获取内容', key: progressKey });
      return;
    }
    
    // 构建完整的HTML文档
    const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${fileName}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    img {
      max-width: 100%;
      height: auto;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 16px 0;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
    }
    th {
      background-color: #f5f5f5;
    }
    code {
      background-color: #f5f5f5;
      padding: 2px 4px;
      border-radius: 3px;
      font-family: monospace;
    }
    pre {
      background-color: #f5f5f5;
      padding: 16px;
      border-radius: 4px;
      overflow-x: auto;
    }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`;
    
    // 创建Blob对象并下载
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    saveAs(blob, `${fileName}.html`);
    
    message.success({ content: 'HTML导出成功', key: progressKey });
  } catch (error) {
    console.error('HTML导出失败:', error);
    message.error({ content: '导出失败，请重试', key: progressKey });
  }
};

// 导出Markdown文件
export const exportToMarkdown = async (fileName: string = 'document') => {
  const progressKey = 'md-export-progress';
  message.loading({ content: '正在导出Markdown...', key: progressKey, duration: 0 });
  
  try {
    const markdownContent = await getCurrentContent('markdown');
    if (!markdownContent) {
      message.error({ content: '导出失败：无法获取内容', key: progressKey });
      return;
    }
    
    // 创建Blob对象并下载
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    saveAs(blob, `${fileName}.md`);
    
    message.success({ content: 'Markdown导出成功', key: progressKey });
  } catch (error) {
    console.error('Markdown导出失败:', error);
    message.error({ content: '导出失败，请重试', key: progressKey });
  }
};