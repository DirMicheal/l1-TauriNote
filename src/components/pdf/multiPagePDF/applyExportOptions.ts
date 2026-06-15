import { PDF_CONFIG } from "../config";
import getStylesByDensity from "../getStylesByDensity";
import type { PdfExportOptions, ResolvedPdfExportOptions } from "../types";

/**
 * 应用导出选项并更新全局 PDF_CONFIG
 * @param options 用户提供的导出选项
 * @returns 解析后的导出选项（quality 为 0-1 的数值）
 */
const applyExportOptions = (options: PdfExportOptions): ResolvedPdfExportOptions => {
  // 根据传入的 quality 档位换算为 0-1 的数值，缺省为高质量
  const exportOptions: ResolvedPdfExportOptions = {
    quality: options.quality === 'low' ? 0.7 : options.quality === 'medium' ? 0.85 : 0.95,
    pageSize: options.pageSize || 'a4',
    density: options.density || 'normal'
  };

  // 将解析后的选项写入全局配置
  PDF_CONFIG.quality = exportOptions.quality;
  PDF_CONFIG.pageSize = exportOptions.pageSize;
  PDF_CONFIG.density = exportOptions.density;

  // 依据密度更新页边距与内容宽度。getStylesByDensity 现为纯函数，
  // 由此处统一写回全局配置，避免渲染过程中出现竞态。
  const densityStyles = getStylesByDensity(exportOptions.density);
  PDF_CONFIG.pageMargin = densityStyles.pageMargin;
  PDF_CONFIG.contentWidth = densityStyles.contentWidth;

  return exportOptions;
};

export default applyExportOptions;
