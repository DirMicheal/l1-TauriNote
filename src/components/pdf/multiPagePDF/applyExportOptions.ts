import { PDF_CONFIG, type PDFConfig } from '../config';
import getStylesByDensity from '../getStylesByDensity';

/**
 * 应用导出选项并生成完整配置
 * @param options 用户提供的导出选项
 * @returns 完整的 PDF 配置对象（不修改全局状态）
 */
const applyExportOptions = (options: Partial<PdfExportOptions>): PDFConfig => {
  const quality = options.quality === 'low' ? 0.7 : options.quality === 'medium' ? 0.85 : 0.95;
  const pageSize = (options.pageSize || 'a4') as 'a4';
  const density = (options.density || 'normal') as PDFConfig['density'];

  const densityStyles = getStylesByDensity(density);

  return {
    ...PDF_CONFIG,
    quality,
    pageSize,
    density,
    pageMargin: densityStyles.pageMargin,
    contentWidth: densityStyles.contentWidth,
  };
};

export default applyExportOptions;
