// PDF 导出相关的类型定义

/** 用户提供的 PDF 导出选项 */
export interface PdfExportOptions {
  /** 导出质量档位 */
  quality?: 'low' | 'medium' | 'high';
  /** 页面尺寸 */
  pageSize?: 'a4';
  /** 内容密度 */
  density?: 'compact' | 'normal' | 'comfortable';
}

/** 解析后用于实际渲染的导出选项（quality 已转换为 0-1 的数值） */
export interface ResolvedPdfExportOptions {
  /** 图像质量（0-1） */
  quality: number;
  pageSize: 'a4';
  density: 'compact' | 'normal' | 'comfortable';
}
