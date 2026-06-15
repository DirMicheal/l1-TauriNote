import { getPrintContainerStyle, type PDFConfig } from "../config";

/**
 * 创建当前页的容器并填充内容
 * @param elements 剩余待处理的元素数组
 * @param config PDF配置
 * @returns 包含当前页容器和已包含的元素数组的对象
 */
const createPageContainerAndFillContent = (elements: Element[], config: PDFConfig): { pageContainer: HTMLElement, includedElements: Element[] } => {
    const pageContainer = document.createElement('div');
    Object.assign(pageContainer.style, { ...getPrintContainerStyle(config), position: 'fixed', left: '-9999px', top: '-9999px', opacity: '0', zIndex: '-1000', pointerEvents: 'none' });

    let accumulatedHeight = 0;
    const maxHeight =  (297 - config.pageMargin * 2) * (config.dpi / 25.4) * config.scaleFactor;
    const includedElements: Element[] = [];

    for (const el of elements) {


      const elHeight = el.getBoundingClientRect().height * config.scaleFactor;

      const isUnbreakable = el.classList.contains('unbreakable');

      // 特殊处理：标题、表格、不可分割元素等逻辑

      if (accumulatedHeight + elHeight > maxHeight) {


        // 如果不是不可分割元素且当前页已有内容，则分页
        if (!isUnbreakable && accumulatedHeight > 0) break;

            // 特殊情况：单个元素高度超过一页，但必须处理
            // 这种情况下我们仍然添加元素，后续会对超大元素进行特殊处理
            // 为超大元素添加特殊样式，允许跨页
            if (el instanceof HTMLElement) {
              el.style.pageBreakInside = 'auto';
              el.style.breakInside = 'auto';
            }
      }

      includedElements.push(el);
      accumulatedHeight += elHeight;
    }

    pageContainer.append(...includedElements);
    document.body.appendChild(pageContainer);

    return { pageContainer, includedElements };
  };

  export default createPageContainerAndFillContent;
