import {PDF_CONFIG} from "./config"

// 计算分页断点 - 优化版，更精确地处理分页，解决内容截取问题
const calculatePageBreaks = (container: HTMLElement): number[] => {
    const elements = Array.from(container.children);
    const breaks: number[] = [];
    
    // 计算A4页面可用高度（毫米转像素，考虑DPI和缩放）
    const maxHeightPx = (297 - PDF_CONFIG.pageMargin * 2) * 
                       (PDF_CONFIG.dpi / 25.4) * 
                       PDF_CONFIG.scaleFactor * 0.92; // 提高阈值到92%，减少内容截断风险
    
    let currentHeight = 0;
    let currentPageElements: Element[] = [];
    
    // 预处理：确保表格有正确的样式和属性
    container.querySelectorAll('table').forEach(table => {
      // 确保表格有明确的宽度和边框
      table.style.width = '100%';
      table.style.borderCollapse = 'collapse';
      table.style.pageBreakInside = 'auto'; // 允许表格跨页
      table.style.tableLayout = 'fixed'; // 固定表格布局，防止内容溢出
      
      // 处理表格内的单元格
      table.querySelectorAll<HTMLElement>('td, th').forEach(cell => {
        cell.style.border = '0.5mm solid #000';
        cell.style.padding = '1.5mm';
        cell.style.wordBreak = 'break-word'; // 确保长文本自动换行
      });
    });
    
    // 遍历元素计算分页点
    elements.forEach((el, index) => { 
      // 获取元素高度（包含外边距）
      const { height } = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      const margin = parseFloat(style.marginTop) + parseFloat(style.marginBottom);
      const elHeight = (height + margin) * PDF_CONFIG.scaleFactor;
      
      // 特殊处理不可分割元素
      const isUnbreakable = el.classList.contains('unbreakable');
      const isHeading = el.tagName.match(/^H[1-6]$/);
      const isTable = el.tagName === 'TABLE';
      
      // 避免标题单独分页
      if (isHeading && index < elements.length - 1) {
        // 如果当前页已经接近满了，先分页再放标题
        if (currentHeight > 0 && currentHeight > maxHeightPx * 0.85) {
          breaks.push(index);
          currentHeight = elHeight;
          currentPageElements = [el];
          return;
        }
      }
      
      // 表格特殊处理 - 改进表格分页逻辑
      if (isTable) {
       
        // 如果表格不是特别大，尝试保持完整
        if (elHeight <= maxHeightPx * 1.2) {
          // 如果当前页已有内容且添加表格后会超出页面大部分，则在表格前分页
         
          if (currentHeight > 0 && currentHeight + elHeight > maxHeightPx * 0.85) {
            breaks.push(index);
            currentHeight = elHeight;
            currentPageElements = [el];
            return;
          }
        } else {
          // 对于特别大的表格，允许它跨页显示，但确保它从新页开始
          if (currentHeight > 0) {
            breaks.push(index);
            currentHeight = elHeight;
            currentPageElements = [el];
            return;
          }
        }
      }
      
      // 处理不可分割元素
      if (isUnbreakable) {
        // 如果不可分割元素太大，超过一页
        
        if (elHeight > maxHeightPx) {
          // 如果当前页已有内容，先分页
          if (currentHeight > 0) {
            breaks.push(index);
            currentHeight = elHeight;
            currentPageElements = [el];
            return;
          }
          // 即使元素超大，也必须放在某页，此时不分页
        } 
        // 如果当前页已有内容且添加不可分割元素会超出页面，则在此元素前分页
        else if (currentHeight > 0 && currentHeight + elHeight > maxHeightPx * 0.9) {
          breaks.push(index);
          currentHeight = elHeight;
          currentPageElements = [el];
          return;
        }
      }
      
      // 普通元素分页逻辑
      if (currentHeight + elHeight > maxHeightPx) {
        // 当前元素无法放入当前页时添加分页标记
        breaks.push(index);
        currentHeight = elHeight; // 新页开始累积高度
        currentPageElements = [el];
      } else {
        currentHeight += elHeight;
        currentPageElements.push(el);
      }
    });
  
    // 过滤无效分页点并返回
    return breaks.filter(b => b < elements.length);
  };
  export default calculatePageBreaks