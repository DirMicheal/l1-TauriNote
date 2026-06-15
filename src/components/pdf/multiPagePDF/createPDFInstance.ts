import { PDF_CONFIG } from "../config";
import jsPDF from "jspdf"; // 生成PDF文件
/**
 * 创建PDF实例
 * @returns jsPDF实例
 */
const createPDFInstance = (): jsPDF => {
    return new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: PDF_CONFIG.pageSize,
      compress: true,
      putOnlyUsedFonts: true,
      floatPrecision: 16, // 提高浮点数精度
      hotfixes: ['px_scaling'] // 修复像素缩放问题
    });
  };
  export default createPDFInstance;