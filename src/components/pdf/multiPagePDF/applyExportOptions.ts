import { PDF_CONFIG } from "../config";
/**
 * 应用导出选项并更新配置
 * @param options 用户提供的导出选项
 * @returns 应用后的导出选项
 */ 
const applyExportOptions = (options: any): any => {
    // 根据传入的quality参数，设置导出质量
  const exportOptions = {
    quality: options.quality === 'low' ? 0.7 : options.quality === 'medium' ? 0.85 : 0.95,
    pageSize: options.pageSize || 'a4',
    // 如果传入的density参数存在，则使用传入的值，否则使用默认值'normal'
    density: options.density || 'normal'
  };

  // 将导出质量设置到PDF_CONFIG对象中
  PDF_CONFIG.quality = exportOptions.quality;
  // 将导出页面大小设置到PDF_CONFIG对象中，并指定类型为'a4'
  PDF_CONFIG.pageSize = exportOptions.pageSize as 'a4';
  // 将导出密度设置到PDF_CONFIG对象中，并指定类型为'compact' | 'normal' | 'comfortable'
  PDF_CONFIG.density = exportOptions.density as 'compact' | 'normal' | 'comfortable';

  // 返回导出选项对象
  return exportOptions;
};

export default applyExportOptions;