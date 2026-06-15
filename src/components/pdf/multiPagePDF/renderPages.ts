 
import jsPDF from "jspdf"; // 生成PDF文件
import createPageContainerAndFillContent from "./createPageContainerAndFillContent"
import renderPageToCanvas from "./renderPageToCanvas";
import { message } from "antd"; // 用于显示提示信息
import addCanvasToPDF from "./addCanvasToPDF"
/**
 * 渲染多页内容到PDF
 * @param container 打印容器
 * @param pdf PDF实例
 * @param pageBreaks 分页断点
 * @param totalPages 总页数
 * @param progressKey 进度提示的key
 */
const renderPages = async (
    container: HTMLElement,
    pdf: jsPDF,
    _pageBreaks: number[],
    totalPages: number,
    progressKey: string
  ): Promise<void> => {
    let elements = Array.from(container.children);
    let pageIndex = 0; // 当前页码
  
    while (elements.length > 0) {
      const { pageContainer, includedElements } = createPageContainerAndFillContent(elements);
      const canvas = await renderPageToCanvas(pageContainer, includedElements);
  
      await addCanvasToPDF(pdf, canvas, pageIndex, totalPages);
      
      // 确保页面容器从DOM中移除
      if (document.body.contains(pageContainer)) {
        document.body.removeChild(pageContainer);
      }
  
      // 更新进度提示
      message.loading({ content: `正在生成PDF (${pageIndex + 1}/${totalPages})`, key: progressKey, duration: 0 });
  
      // 更新剩余元素列表
      elements = elements.slice(includedElements.length);
  
      // 允许UI更新和垃圾回收
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  };

  export default renderPages