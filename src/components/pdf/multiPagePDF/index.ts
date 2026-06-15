
import jsPDF from "jspdf"; // 生成PDF文件
import { message } from "antd"; // 用于显示提示信息
import applyExportOptions from "./applyExportOptions";
import type { PdfExportOptions } from "../types";
import createPrintContainer from "../createPrintContainer";
import createPDFInstance from "./createPDFInstance";
import calculateTotalPagesAndBreaks from "./calculateTotalPagesAndBreaks";
import renderPages from "./renderPages";
/**
 * 主入口函数：生成多页PDF
 * @param html 需要转换的HTML内容
 * @param options 导出选项
 * @returns 包含多页内容的PDF对象
 */
const generateMultiPagePDF = async (html: string, options: PdfExportOptions = {}): Promise<jsPDF> => {
    applyExportOptions(options);
    const container = await createPrintContainer(html);
    const pdf = createPDFInstance();
    const { pageBreaks, totalPages } = calculateTotalPagesAndBreaks(container);
  
    // 创建进度提示
    const progressKey = 'pdf-progress';
    message.loading({ content: `正在生成PDF (0/${totalPages})`, key: progressKey, duration: 0 });
  
    try {
      await renderPages(container, pdf, pageBreaks, totalPages, progressKey);
    } finally {
      // 清理进度提示和主容器
      message.destroy(progressKey);
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
    }
  
    return pdf;
  };

  export default generateMultiPagePDF;