import {waitForLayout,mmToPx,PDF_CONFIG} from "./config"
// 改进的自动标记函数
const autoMarkUnbreakableElements = async (container: HTMLElement) => {
    // 等待浏览器完成初始布局
    await waitForLayout();
  
    // 计算页面高度阈值（A4纸减去边距）
    const pageHeightPx = mmToPx(297 - 2 * PDF_CONFIG.pageMargin);
    const PAGE_THRESHOLD = 0.85; // 提高阈值以更精确地控制分页
    const thresholdHeight = pageHeightPx * PAGE_THRESHOLD;
  
    // 预处理：确保所有图片已加载完成
    const images = Array.from(container.querySelectorAll('img'));
    await Promise.all(images.map(img => 
      img.complete ? Promise.resolve() : new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve; // 处理图片加载失败的情况
      })
    ));
  
    // 自动标记表格和大图片为不可分割
    container.querySelectorAll('table, img').forEach(el => {
      const { height } = el.getBoundingClientRect();
      // 如果表格或图片高度超过页面高度的40%，标记为不可分割
      if (height > pageHeightPx * 0.4) {
        el.classList.add('unbreakable');
      }
    });
  
    // 二次等待布局稳定
    await waitForLayout();
  
    // 按元素垂直位置排序
    const sortedElements = Array.from(container.children).sort((a, b) => {

        const rectA = a.getBoundingClientRect();
        const rectB = b.getBoundingClientRect();;
        return rectA.top - rectB.top || rectA.left - rectB.left;
      });
  
    // 跟踪当前累计高度
    let accumulatedHeight = 0;
    let pageCount = 1;
  
    // 遍历排序后的元素进行智能分页
    sortedElements.forEach((el, index) => {
      // 获取元素尺寸（包含外边距）
      const { height } = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      const margin = parseFloat(style.marginTop) + parseFloat(style.marginBottom);
      const elHeight = (height + margin) * PDF_CONFIG.scaleFactor;
  
      // 更新累计高度
      accumulatedHeight += elHeight;
      
      // 标记逻辑：基于累计高度和内容类型
      const isHeading = el.tagName.match(/^H[1-6]$/);
      const isParagraph = el.tagName === 'P';
      // 移除未使用的变量声明
      
      // 智能分页策略
      let shouldMark = false;
      
      // 1. 基于高度的分页
      if (accumulatedHeight > thresholdHeight) {
        shouldMark = true;
      }
      
      // 2. 避免标题单独分页
      if (isHeading && index < sortedElements.length - 1) {
        shouldMark = false; // 标题不单独分页
      }
      
      // 3. 避免段落在页面底部只显示一行
      if (isParagraph && accumulatedHeight > thresholdHeight * 0.95) {
        const lines = Math.ceil(height / parseFloat(style.lineHeight));
        if (lines <= 2) shouldMark = true; // 如果段落只有1-2行且接近页面底部，强制分页
      }
  
      if (shouldMark) {
        // el.classList.add('unbreakable');
        // 记录页数增加
        pageCount++;
        // 重置累计高度
        accumulatedHeight = elHeight;
      }
    });
    
    // 返回估计的页数（用于进度显示）
    return pageCount;
  };

  export default autoMarkUnbreakableElements;