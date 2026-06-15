// 导入必要的库
import { message } from 'antd'; // 用于显示提示信息
import generateMultiPagePDF from "./multiPagePDF"
import processMarkdownTable from "./processMarkdownTable";

/**
 * 处理下载事件的函数 - 增强版，解决空白PDF问题
 */
const handleDownload = async (options: Partial<PdfExportOptions> = {}) => {
  // 创建唯一的消息键，避免消息冲突
  const loadingKey = `pdf-loading-${Date.now()}`;
  
  try {
    // 检查编辑器实例是否存在
    if(!window.editor) {
      message.error('找不到编辑器内容');
      return;
    }
    
    // 显示加载提示
    message.loading({ content: '准备生成PDF...', key: loadingKey, duration: 0 });
     
    
    // 从编辑器获取HTML内容 - 增强版，确保捕获所有内容
    let html = '';
    
    try {
      // 主要方法：使用blocksToHTMLLossy
      if (window.editor?.blocksToHTMLLossy) {
        html = await window.editor.blocksToHTMLLossy(window.editor.document) || '';
         
        
        // 验证HTML内容
        if (!html || html.trim().length === 0 || html.length < 50) {
          console.warn('主方法HTML内容无效或过短:', html);
          throw new Error('HTML内容无效');
        }
        
        // 清理和增强HTML内容
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // 处理表格，确保它们有正确的样式和结构
        tempDiv.querySelectorAll('table').forEach(table => {
          // 确保表格有明确的宽度和边框
          table.setAttribute('style', 'width: 100%; border-collapse: collapse; margin: 10px 0; page-break-inside: auto; table-layout: fixed;');
          
          // 处理表格内的单元格
          table.querySelectorAll('td, th').forEach(cell => {
            cell.setAttribute('style', 'padding: 4px; border: 0.5px solid #000 !important; word-break: break-word; vertical-align: middle;');
          });
          
          // 确保表头有背景色
          table.querySelectorAll('th').forEach(th => {
            th.style.backgroundColor = '#f5f5f5';
            th.style.fontWeight = 'bold';
          });
        });
        
        // 处理pre和code元素中包含CSS代码的部分，但不移除它们
        const codeElements = tempDiv.querySelectorAll('pre, code');
        codeElements.forEach(el => {
          if (el.textContent && (
              el.textContent.includes('<style') || 
              el.textContent.includes('@tailwind') || 
              el.textContent.includes('{ ') || 
              el.textContent.includes(' }') ||
              el.textContent.includes('css')
            )) {
            // 不移除CSS代码块，而是添加样式使其正确显示
            el.setAttribute('style', 'background-color: #f5f5f5; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px; line-height: 1.4; white-space: pre-wrap; word-break: break-word; color: #333333;');
          }
        });
        
        // 处理图片，确保它们有正确的样式
        tempDiv.querySelectorAll('img').forEach(img => {
          img.setAttribute('style', 'max-width: 100%; height: auto; display: block; margin: 10px auto; page-break-inside: avoid;');
          // 确保所有图片都有alt属性
          if (!img.alt) img.alt = 'image';
        });
        
        // 处理标题，确保它们不会被分页截断
        tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(heading => {
          heading.setAttribute('style', 'page-break-after: avoid; break-after: avoid; margin-top: 1em; margin-bottom: 0.5em; font-weight: bold; color: #000;');
        });
        
        // 获取清理后的HTML
        html = tempDiv.innerHTML;
        
        // 添加基本样式确保内容可见
        html = `<div style="background-color: #FFFFFF; color: #000000;">${html}</div>`;
      } else {
        throw new Error('blocksToHTMLLossy方法不存在');
      }
    } catch (htmlError) {
      console.error('主方法获取HTML内容失败:', htmlError);
      
      // 备用方法1：使用blocksToMarkdownLossy
      try {
        if (window.editor?.blocksToMarkdownLossy) {
          const markdown = await window.editor.blocksToMarkdownLossy(window.editor.document) || '';
          if (markdown && markdown.trim().length > 0) {
            // 增强版Markdown转HTML，更好地处理表格和格式
            const enhancedHtml = [];
            const lines = markdown.split('\n');
            let inTable = false;
            let tableContent: string[] = [];
            
            for (let i = 0; i < lines.length; i++) {
              const line = lines[i];
              
              // 检测表格开始
              if (line.includes('|') && !inTable && (i + 1 < lines.length) && lines[i + 1].includes('|-')) {
                inTable = true;
                tableContent = [line];
                continue;
              }
              
              // 收集表格内容
              if (inTable) {
                tableContent.push(line);
                // 检测表格结束
                if (!lines[i + 1] || !lines[i + 1].includes('|')) {
                  // 处理表格
                  const tableHtml = processMarkdownTable(tableContent);
                  enhancedHtml.push(tableHtml);
                  inTable = false;
                  tableContent = [];
                }
                continue;
              }
              
              // 处理标题
              if (line.trim().startsWith('#')) {
                const match = line.match(/^#+/);
                const level = match ? match[0].length : 1;
                const text = line.replace(/^#+\s+/, '');
                enhancedHtml.push(`<h${level} style="page-break-after: avoid; margin-top: 1em; margin-bottom: 0.5em; font-weight: bold;">${text}</h${level}>`);
              }
              // 处理普通段落
              else if (line.trim()) {
                enhancedHtml.push(`<p style="margin: 0.5em 0; text-align: justify;">${line}</p>`);
              }
              // 处理空行
              else {
                enhancedHtml.push('<br>');
              }
            }
            
            html = `<div style="background-color: #FFFFFF; color: #000000;" class="markdown-content">
              ${enhancedHtml.join('')}
            </div>`;
            
          } else {
            throw new Error('Markdown内容为空');
          }
        } else {
          throw new Error('blocksToMarkdownLossy方法不存在');
        }
      } catch (backupError) {
        console.error('备用方法1也失败:', backupError);
        
        // 备用方法2：直接获取DOM内容
        try {
          const editorElement = document.querySelector('.editor-container') || 
                               document.querySelector('.blocknote-editor') ||
                               document.querySelector('[data-content-type="editor"]') ||
                               document.querySelector('.editor') ||
                               document.querySelector('[contenteditable="true"]');
          
          if (editorElement) {
            // 克隆DOM以避免修改原始内容
            const clonedEditor = editorElement.cloneNode(true) as HTMLElement;
            
            // 处理表格和其他元素
            clonedEditor.querySelectorAll('table').forEach(table => {
              table.setAttribute('style', 'width: 100%; border-collapse: collapse; margin: 10px 0; page-break-inside: auto; table-layout: fixed;');
              table.querySelectorAll('td, th').forEach(cell => {
                cell.setAttribute('style', 'padding: 4px; border: 0.5px solid #000 !important; word-break: break-word;');
              });
            });
            
            html = `<div style="background-color: #FFFFFF; color: #000000;">${clonedEditor.innerHTML}</div>`;
             
          } else {
            throw new Error('找不到编辑器DOM元素');
          }
        } catch (domError) {
          console.error('所有获取内容方法均失败:', domError);
          
          // 最后的备用方法：创建一个简单的内容
          html = `<div style="background-color: #FFFFFF; color: #000000; padding: 20px; font-family: Arial, sans-serif;">
            <h1 style="color: #000000;">文档内容</h1>
            <p style="color: #000000;">无法获取完整内容，这是一个备用页面。</p>
            <p style="color: #000000;">请尝试使用其他导出方式或联系支持团队。</p>
          </div>`;
        }
      }
    }
    
    // 内容验证和应急处理
    if (!html || html.trim().length === 0) {
      console.error('所有方法均未获取到有效内容');
      message.error({ content: '无法获取文档内容，请重试', key: loadingKey });
      return;
    }
    
    // 记录内容来源，用于调试
 
    
    // 确保HTML有完整的结构
    if (!html.includes('<body') && !html.includes('<html')) {
      
      
      // 检查是否包含样式标签，如果包含则提取出来
      let extractedStyles = '';
      const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
      let styleMatch;
      
      // 提取所有样式标签内容
      while ((styleMatch = styleRegex.exec(html)) !== null) {
        extractedStyles += styleMatch[1] + '\n';
        // 从原HTML中移除样式标签，避免样式代码显示在内容中
        html = html.replace(styleMatch[0], '');
      }
      
      // 构建完整的HTML结构，将提取的样式放入head中
      html = `<!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8"> 
        <style>
          /* 基础样式 */
          body { font-family: Arial, "Microsoft YaHei", sans-serif; line-height: 1.6; }
          p { margin: 0.5em 0; }
          h1, h2, h3, h4, h5, h6 { margin-top: 1em; margin-bottom: 0.5em; }
          img { max-width: 100%; height: auto; display: block; margin: 10px auto; }
          .content { visibility: visible !important; display: block !important; }
          * { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          
          /* 表格样式 */
          table { width: 100% !important; border-collapse: collapse; margin: 10px 0; }
          th, td { padding: 4px; border: 0.5px solid #000 !important; }
          th { background-color: #f5f5f5; }
          
          /* 提取的自定义样式 */
           ${extractedStyles}
        </style>
      </head>
      <body>
        <div class="content">${html}</div>
      </body>
      </html>`;  
    }
    
    // 更新加载提示
    message.loading({ content: '正在处理文档内容...', key: loadingKey, duration: 0 });
    
    // 生成文件名 - 使用更友好的格式
    const now = new Date();
    const dateStr = now.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '-');
    const timeStr = now.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).replace(/:/g, '-');
    
    const filename = `文档-${dateStr}-${timeStr}.pdf`;
    
    // 更新加载提示
    message.loading({ content: '正在生成PDF，请稍候...', key: loadingKey, duration: 0 });
    

  


    // 生成PDF文件 
    const pdf = await generateMultiPagePDF(html, options);
    
    // 获取页数
    const pageCount = pdf.getNumberOfPages(); 
    
    if (pageCount === 0) {
      console.error('PDF生成失败：页数为0');
      throw new Error('生成的PDF没有内容，请检查文档');
    }
    
    // 更新加载提示
    message.loading({ content: '正在保存PDF文件...', key: loadingKey, duration: 0 });
    
    // 验证PDF对象
    if (!pdf || typeof pdf.save !== 'function') {
      console.error('PDF对象无效:', pdf);
      throw new Error('PDF生成失败：无效的PDF对象');
    }
    
    // 保存文件前记录状态 
    try {
      // 保存文件
      pdf.save(filename);
      
      // 显示成功提示（包含页数信息）
      message.success({
        content: `已成功生成 ${pageCount} 页PDF文档`,
        key: loadingKey,
        duration: 3
      });
      
      // 记录成功信息 
    } catch (saveError: unknown) {
      console.error('保存PDF文件时出错:', saveError);
      throw new Error(`保存PDF失败: ${(saveError as Error).message || '未知错误'}`);
    }
    
    // 避免页面刷新，改为清理资源
    setTimeout(() => {
      // 清理内存
      (window as any).collectGarbage?.();
    }, 1000);
    
  } catch (err) {
    // 错误处理
    console.error('PDF生成失败:', err);
    message.error({
      content: err instanceof Error ? `生成失败: ${err.message}` : '生成失败，请稍后重试',
      key: loadingKey,
      duration: 5
    });
  }
};

// 导出默认处理函数
export default handleDownload;