import getStylesByDensity from './getStylesByDensity';
// PDF生成配置常量
export const PDF_CONFIG = {
    pageSize: 'a4' as const,       // PDF页面尺寸
    pageMargin: 10,                // 页面边距（毫米）
    scaleFactor: 3,                // 渲染缩放因子（提升清晰度）
    dpi: 300,                      // 输出分辨率（点/英寸）
    contentWidth: 190,             // 实际内容宽度（210mm - 20mm边距）
    timeout: 120000,               // html2canvas渲染超时时间（毫秒）
    quality: 0.95,                 // 图像质量（0-1）
    imageCompression: 'FAST',      // 图像压缩算法
    fontFaces: true,               // 启用字体嵌入
    density: 'normal' as 'compact' | 'normal' | 'comfortable' // 内容密度
  };

// 打印容器的样式配置
export const getPrintContainerStyle = (): Record<string, string> => { 
    return {
      position: 'absolute',         // 绝对定位避免影响原页面布局
      left: '-9999px',               // 移出可视区域，避免闪烁
      top: '-9999px',                // 移出可视区域，避免闪烁
      width: `${PDF_CONFIG.contentWidth}mm`, // 固定内容宽度
      padding: `${PDF_CONFIG.pageMargin}mm`, // 内边距与PDF页边距一致
      boxSizing: 'border-box',       // 盒模型计算方式
      backgroundColor: '#fff',       // 白色背景
      fontSize: getStylesByDensity(PDF_CONFIG.density).fontSize, // 基于密度的字体大小
      lineHeight: getStylesByDensity(PDF_CONFIG.density).lineHeight, // 基于密度的行高
      fontFamily: "'Arial', sans-serif", // 首选字体
      visibility: 'hidden',          // 隐藏容器，避免闪烁
      zIndex: '-1000',               // 确保在最底层
      opacity: '0'                   // 完全透明，避免闪烁
    };
  };


  // 定义打印容器样式常量，供后续使用
  export const PRINT_CONTAINER_STYLE = getPrintContainerStyle();

  // 等待元素布局完成
  export const waitForLayout = () => new Promise(resolve => requestAnimationFrame(resolve));

// 毫米到像素的转换函数
export const mmToPx = (mm: number): number => {
  // 转换公式：(毫米值 / 25.4) * DPI * 缩放因子
  return (mm / 25.4) * PDF_CONFIG.dpi * PDF_CONFIG.scaleFactor;
};


// 获取基于密度的样式
const densityStyles = getStylesByDensity(PDF_CONFIG.density);

export const htmlStyles =  `
/* 基础样式 */
* {
  box-sizing: border-box;
}

body, html {
  margin: 0;
  padding: 0;
  font-family: Arial, "Microsoft YaHei", sans-serif;
  line-height: ${densityStyles.lineHeight};
  color: #333;
}

/* 代码块样式 */
pre, code {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  font-family: Consolas, Monaco, 'Andale Mono', monospace;
  font-size: 12px;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-word;
  color: #333333;
  display: block;
  margin: 10px 0;
  overflow-x: auto;
  border: 1px solid #ddd;
}

/* 表格样式 */
table {
  width: 100% !important;
  border-collapse: collapse;
  margin: ${densityStyles.tableMargin};
  page-break-inside: avoid;
  table-layout: fixed;
}

th, td {
  padding: ${densityStyles.cellPadding};
  border: 0.5mm solid #000 !important;
  font-size: 10px;
  word-break: break-word;
  vertical-align: middle;
}

th {
  background-color: #f5f5f5;
  font-weight: bold;
}

/* 图片样式 */
img {
  max-width: 100% !important;
  height: auto !important;
  display: block;
  margin: ${densityStyles.imgMargin};
  page-break-inside: avoid;
  page-break-after: avoid;
  object-fit: contain;
}

/* 标题样式 */
h1, h2, h3, h4, h5, h6 {
  page-break-after: avoid;
  break-after: avoid;
  margin-top: ${densityStyles.headingMarginTop};
  margin-bottom: ${densityStyles.headingMarginBottom};
  font-weight: bold;
  color: #000;
}

h1 { font-size: 24pt; }
h2 { font-size: 20pt; }
h3 { font-size: 16pt; }
h4 { font-size: 14pt; }
h5 { font-size: 12pt; }
h6 { font-size: 10pt; }

/* 段落样式 */
p {
  margin: ${densityStyles.paragraphMargin};
  text-align: justify;
  min-height: 1em;
}

/* 列表样式 */
ul, ol {
  padding-left: 20px;
  margin: ${densityStyles.listMargin};
}

li {
  margin-bottom: ${densityStyles.elementMargin};
}

/* 链接样式 */
a {
  color: #0066cc;
  text-decoration: underline;
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

/* 不可分割元素处理 */
.unbreakable {
  page-break-inside: avoid !important;
  break-inside: avoid !important;
}

/* 确保内容可见 */
.content, .markdown-content {
  visibility: visible !important;
  display: block !important;
  opacity: 1 !important;
}

/* 修复空白内容问题 */
div:empty {
  min-height: 1em;
}

/* 确保BlockNote编辑器内容正确显示 */
[data-content-type], [data-content-type] * {
  visibility: visible !important;
  display: block;
}
`