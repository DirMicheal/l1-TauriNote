import { PDF_CONFIG,   waitForLayout } from "../config";
import html2canvas from "html2canvas"; // 将HTML转换为Canvas
/**
 * 将当前页渲染为Canvas
 * @param pageContainer 当前页容器
 * @param includedElements 已包含的元素数组
 * @returns 渲染后的Canvas
 */
const renderPageToCanvas = async (pageContainer: HTMLElement, _includedElements: Element[]): Promise<HTMLCanvasElement> => {
 
 
    // 确保容器已添加到DOM并可见
    document.body.appendChild(pageContainer);
  
    // 强制布局计算
    void pageContainer.offsetHeight;
  
    // 临时使容器可见以确保正确渲染
    const originalStyles: Record<string, string> = {};
    ['position', 'left', 'top', 'opacity', 'zIndex', 'visibility'].forEach(prop => {
      originalStyles[prop] = pageContainer.style[prop as any];
    });
  
    // 临时设置为可见但不影响布局
    Object.assign(pageContainer.style, {
       position: 'fixed',
        left: '-5000px', 
       top: '0', opacity: '1', zIndex: '9999', visibility: 'visible', pointerEvents: 'none' });
  
    // 强制重新计算布局
    await waitForLayout();
  
    // 使用html2canvas渲染当前页为Canvas
    let canvas;
    try {
      // 在渲染前处理页面容器中的样式标签，防止样式代码显示在内容中
      const styleElements = pageContainer.querySelectorAll('style');
      const extractedStyles: string[] = [];
  
      // 提取所有样式内容并移除样式标签
      styleElements.forEach(styleEl => {
        if (styleEl.textContent) {
          extractedStyles.push(styleEl.textContent);
        }
        styleEl.parentNode?.removeChild(styleEl);
      });
  
      // 处理pre元素中的样式代码，但不移除元素
      const preElements = pageContainer.querySelectorAll('pre');
      preElements.forEach(preEl => {
        // 不再移除包含样式代码的pre元素，而是添加样式使其正确显示
        if (preEl.textContent && preEl.textContent.includes('<style')) {
          // 添加样式使代码块在PDF中正确显示
          preEl.style.backgroundColor = '#f5f5f5';
          preEl.style.padding = '10px';
          preEl.style.borderRadius = '4px';
          preEl.style.fontFamily = 'monospace';
          preEl.style.fontSize = '12px';
          preEl.style.lineHeight = '1.4';
          preEl.style.whiteSpace = 'pre-wrap';
          preEl.style.wordBreak = 'break-word';
          preEl.style.color = '#333333';
        }
      });
  
      // 确保容器背景色是白色
      pageContainer.style.backgroundColor = '#FFFFFF';
  
      // 添加额外的样式确保内容可见
      const visibilityStyle = document.createElement('style');
      visibilityStyle.textContent = `
        * { 
          color: #000000 !important; 
          background-color: transparent !important;
          visibility: visible !important; 
          opacity: 1 !important; 
        }
        body, html, div { background-color: #FFFFFF !important; }
      `;
      pageContainer.appendChild(visibilityStyle);
  
      canvas = await html2canvas(pageContainer, {
        scale: PDF_CONFIG.scaleFactor, // 高清渲染
        useCORS: true, // 允许跨域资源
        logging: true, // 开启调试日志以便排查问题
        backgroundColor: '#FFFFFF', // 白色背景
        windowHeight: pageContainer.scrollHeight, // 精确设置窗口高度
        imageTimeout: PDF_CONFIG.timeout, // 图片加载超时设置
        allowTaint: true, // 允许污染画布以确保内容显示
        foreignObjectRendering: false, // 禁用foreignObject渲染，避免黑屏问题
        removeContainer: false, // 不自动移除容器
        onclone: (clonedDoc) => {
          // 在克隆文档中应用额外的样式优化
          const style = clonedDoc.createElement('style');
          style.textContent = `
            * { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            /* 确保内容不会被截断 */
            body, html { margin: 0; padding: 0; overflow: visible !important; background-color: #FFFFFF !important; }
            /* 改进表格在PDF中的显示 */
            table { page-break-inside: auto !important; border-collapse: collapse; width: 100%; }
            tr { page-break-inside: avoid; page-break-after: auto; }
            td, th { border: 0.5px solid #000; padding: 4px; }
            th { background-color: #f5f5f5; }
            /* 确保所有元素可见 */
            * { visibility: visible !important; opacity: 1 !important; color: #000000 !important; }
            /* 确保图片显示 */
            img { display: block !important; max-width: 100%; margin: 10px auto; }
            /* 添加提取的样式 */ 
 
 


/* 段落样式 */
 

/* 链接样式 */
a {
  color: #0066cc;
  text-decoration: underline;
}

/* 代码块样式 */
pre, code {
  font-family: monospace;
  background-color: #f5f5f5;
  padding: 0.5em;
  border-radius: 3px;
  font-size: 9pt;
  white-space: pre-wrap;
  word-break: break-all;
  border: 1px solid #ddd;
}

/* 引用样式 */
blockquote {
  border-left: 3px solid #ccc;
  padding-left: 1em;
  margin-left: 0;
  color: #666;
  font-style: italic;
}

/* 分隔线样式 */
hr {
  border: none;
  border-top: 1px solid #ccc;
  margin: 1em 0;
}



/* 确保内容可见 */
.content, .markdown-content {
  visibility: visible !important;
  display: block !important;
  opacity: 1 !important;
}


          `;
          // ${extractedStyles.join('\n')}
          console.log(extractedStyles.join('\n'));
          
          clonedDoc.head.appendChild(style);
  
          // 确保克隆文档的body有白色背景
          if (clonedDoc.body) {
            clonedDoc.body.style.backgroundColor = '#FFFFFF';
            clonedDoc.body.style.color = '#000000';
          }
  
          // 处理克隆文档中的pre和code元素，但不移除它们
          const styleTextElements = clonedDoc.querySelectorAll<HTMLElement>('pre, code');
          styleTextElements.forEach(el => {
            if (el.textContent && (el.textContent.includes('<style') || el.textContent.includes('@tailwind'))) {
              // 不移除元素，而是添加样式使其正确显示
              el.style.backgroundColor = '#f5f5f5';
              el.style.padding = '10px';
              el.style.borderRadius = '4px';
              el.style.fontFamily = 'monospace';
              el.style.fontSize = '12px';
              el.style.lineHeight = '1.4';
              el.style.whiteSpace = 'pre-wrap';
              el.style.wordBreak = 'break-word';
              el.style.color = '#333333';
            }
          });
  
          // 记录克隆后的内容状态
        
        }
      });
  
     
  
      // 检查生成的Canvas是否有内容
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixelData = imageData.data;
  
        // 检查是否全黑或全透明
        let isAllBlack = true;
        let isAllTransparent = true;
  
        for (let i = 0; i < pixelData.length; i += 4) {
          const r = pixelData[i];
          const g = pixelData[i + 1];
          const b = pixelData[i + 2];
          const a = pixelData[i + 3];
  
          // 检查是否不是黑色
          if (r > 10 || g > 10 || b > 10) {
            isAllBlack = false;
          }
  
          // 检查是否不是透明
          if (a > 10) {
            isAllTransparent = false;
          }
  
          // 如果已经确认既不全黑也不全透明，可以提前退出循环
          if (!isAllBlack && !isAllTransparent) {
            break;
          }
        }
   
  
        // 如果Canvas全黑或全透明，创建一个带有错误信息的替代Canvas
        if (isAllBlack || isAllTransparent) {
          console.error('Canvas渲染异常：内容全黑或全透明');
  
          // 创建一个新的Canvas
          const fallbackCanvas = document.createElement('canvas');
          fallbackCanvas.width = canvas.width;
          fallbackCanvas.height = canvas.height;
          const fallbackCtx = fallbackCanvas.getContext('2d');
  
          if (fallbackCtx) {
            // 填充白色背景
            fallbackCtx.fillStyle = '#FFFFFF';
            fallbackCtx.fillRect(0, 0, fallbackCanvas.width, fallbackCanvas.height);
  
            // 添加一些文本内容
            fallbackCtx.font = '16px Arial';
            fallbackCtx.fillStyle = '#000000';
            fallbackCtx.fillText('正在尝试恢复内容...', 50, 50);
  
            // 尝试直接绘制DOM内容
            try {
              // 获取原始内容的文本
              const contentText = pageContainer.innerText || '无法获取内容';
              const lines = contentText.split('\n').filter(line => line.trim().length > 0);
  
              // 绘制文本内容
              lines.forEach((line, index) => {
                if (index < 30) { // 限制行数
                  fallbackCtx.fillText(line.substring(0, 80), 50, 80 + index * 20); // 限制每行长度
                }
              });
   
            } catch (fallbackError) {
              console.error('创建应急内容失败:', fallbackError);
              fallbackCtx.fillText('无法渲染内容，请尝试其他导出选项', 50, 80);
            }
  
            // 使用应急Canvas替代原Canvas
            canvas = fallbackCanvas;
          }
        }
      }
    } catch (renderError: unknown) {
      console.error('Canvas渲染失败:', renderError);
  
      // 创建一个应急Canvas
      canvas = document.createElement('canvas');
      canvas.width = 595; // A4宽度，72dpi
      canvas.height = 842; // A4高度，72dpi
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // 绘制错误信息
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = '16px Arial';
        ctx.fillStyle = '#ff0000';
        ctx.fillText('渲染失败: ' + ((renderError as Error).message || '未知错误'), 50, 50);
        ctx.fillText('请尝试简化文档内容后重试', 50, 80);
      }
    }
  
    // 恢复原始样式
    Object.keys(originalStyles).forEach(prop => {
      pageContainer.style[prop as any] = originalStyles[prop];
    });
    
    // 清理添加的样式元素
    const addedStyleElement = pageContainer.querySelector('style');
    if (addedStyleElement) {
      pageContainer.removeChild(addedStyleElement);
    }
    
    // 从DOM中移除页面容器
    if (document.body.contains(pageContainer)) {
      document.body.removeChild(pageContainer);
    }
  
    return canvas;
  };

  export default renderPageToCanvas;