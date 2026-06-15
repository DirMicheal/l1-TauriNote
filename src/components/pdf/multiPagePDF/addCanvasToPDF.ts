import jsPDF from "jspdf"; // 生成PDF文件
import { type PDFConfig } from "../config";

/**
 * 将Canvas添加到PDF
 * @param pdf PDF实例
 * @param canvas 渲染后的Canvas
 * @param pageIndex 当前页码
 * @param totalPages 总页数
 * @param config PDF配置
 */
const addCanvasToPDF = async (pdf: jsPDF, canvas: HTMLCanvasElement, pageIndex: number, totalPages: number, config: PDFConfig): Promise<void> => {
    // 添加新页面（首页除外）
    if (pageIndex > 0) pdf.addPage();

    // 计算图片尺寸并添加到PDF
    const imgWidth = config.contentWidth;
    let imgHeight = (canvas.height * imgWidth) / canvas.width;

    // 改进的超高内容处理 - 解决内容截断问题
    const maxAllowedHeight = 277; // A4高度减去边距 (297 - 20)

    if (imgHeight > maxAllowedHeight * 1.5) {
      // 内容过高，需要分割处理

      const pagesNeeded = Math.ceil(imgHeight / maxAllowedHeight);

      for (let i = 0; i < pagesNeeded; i++) {
        if (i > 0) {
          pdf.addPage();
          pageIndex++; // 更新页码计数
        }

        const sourceY = i * (canvas.height / pagesNeeded);
        const sourceHeight = canvas.height / pagesNeeded;

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = sourceHeight;
        const tempCtx = tempCanvas.getContext('2d');

        if (tempCtx) {
          tempCtx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);

          const partImgHeight = (sourceHeight * imgWidth) / canvas.width;

          const tempImageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
          const tempPixelData = tempImageData.data;
          let hasContent = false;

          for (let p = 0; p < tempPixelData.length; p += 40) {
            const r = tempPixelData[p];
            const g = tempPixelData[p + 1];
            const b = tempPixelData[p + 2];

            if (r < 250 || g < 250 || b < 250) {
              hasContent = true;
              break;
            }
          }


          if (hasContent) {
            // 获取图像数据并添加到PDF
            const imageData = tempCanvas.toDataURL('image/jpeg', config.quality);
            pdf.addImage(
              imageData,
              'JPEG',
              config.pageMargin,
              config.pageMargin,
              imgWidth,
              partImgHeight,
              undefined,
              'FAST'
            );
          }

          // 清理临时Canvas上下文
          tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        }

        // 帮助垃圾回收释放临时Canvas
        tempCanvas.width = 0;
        tempCanvas.height = 0;
      }

      pageIndex += pagesNeeded - 1;
    } else if (imgHeight > maxAllowedHeight) {
      // 内容稍微超出一页，进行缩放处理
      const scale = maxAllowedHeight / imgHeight;
      imgHeight = maxAllowedHeight;
      const scaledWidth = imgWidth * scale;
      const xOffset = (config.contentWidth - scaledWidth) / 2 + config.pageMargin;

      pdf.addImage(
        canvas.toDataURL('image/jpeg', config.quality),
        'JPEG',
        xOffset,
        config.pageMargin,
        scaledWidth,
        imgHeight,
        undefined,
        'FAST'
      );
    } else {
      // 正常大小内容的处理
      pdf.addImage(
        canvas.toDataURL('image/jpeg', config.quality),
        'JPEG',
        config.pageMargin,
        config.pageMargin,
        imgWidth,
        imgHeight,
        undefined,
        'FAST'
      );
    }

    // 添加页码
    const pageText = `${pageIndex + 1} / ${totalPages}`;
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text(pageText, 210 - config.pageMargin - 10, 297 - config.pageMargin - 3, { align: 'right' });
  };

  export default addCanvasToPDF;
