import calculatePageBreaks from "../calculatePageBreaks";
import { PDF_CONFIG } from "../config";
/**
 * 计算总页数和分页断点
 * @param container 打印容器
 * @returns 包含分页断点和总页数的对象
 */
const calculateTotalPagesAndBreaks = (container: HTMLElement): { pageBreaks: number[], totalPages: number } => {
    const pageBreaks = calculatePageBreaks(container);
    const estimatedTotalPages = Math.ceil(container.scrollHeight / 
      ((297 - PDF_CONFIG.pageMargin * 2) * (PDF_CONFIG.dpi / 25.4)));
    const totalPages = Math.max(pageBreaks.length + 1, estimatedTotalPages); // 取较大值确保足够页数
  
    return { pageBreaks, totalPages };
  };
  export default calculateTotalPagesAndBreaks;