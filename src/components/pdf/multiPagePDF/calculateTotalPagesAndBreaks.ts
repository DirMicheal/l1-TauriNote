import calculatePageBreaks from "../calculatePageBreaks";
import { type PDFConfig } from "../config";

/**
 * 计算总页数和分页断点
 * @param container 打印容器
 * @param config PDF配置
 * @returns 包含分页断点和总页数的对象
 */
const calculateTotalPagesAndBreaks = (container: HTMLElement, config: PDFConfig): { pageBreaks: number[], totalPages: number } => {
    const pageBreaks = calculatePageBreaks(container, config);
    const estimatedTotalPages = Math.ceil(container.scrollHeight /
      ((297 - config.pageMargin * 2) * (config.dpi / 25.4)));
    const totalPages = Math.max(pageBreaks.length + 1, estimatedTotalPages); // 取较大值确保足够页数

    return { pageBreaks, totalPages };
  };
  export default calculateTotalPagesAndBreaks;
