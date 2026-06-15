const getStylesByDensity = (density: 'compact' | 'normal' | 'comfortable' = 'normal') => {
    // 基于密度调整边距和行高（normal 的默认页边距为 10mm）
    let pageMargin = 10;
    let lineHeight = '1.6';
    let fontSize = '12pt';
    let elementMargin = '0.5em';
    let paragraphMargin = '0.5em 0';
    let headingMarginTop = '1em';
    let headingMarginBottom = '0.5em';
    let tableMargin = '20px 0';
    let imgMargin = '20px auto';
    let listMargin = '0.5em 0';
    let cellPadding = '1.5mm';
    
    // 根据密度调整样式
    switch(density) {
      case 'compact':
        pageMargin = 5; // 减小页边距
        lineHeight = '1.3'; // 减小行高
        fontSize = '11pt'; // 减小字体
        elementMargin = '0.3em'; // 减小元素间距
        paragraphMargin = '0.3em 0'; // 减小段落间距
        headingMarginTop = '0.7em'; // 减小标题上边距
        headingMarginBottom = '0.3em'; // 减小标题下边距
        tableMargin = '10px 0'; // 减小表格边距
        imgMargin = '10px auto'; // 减小图片边距
        listMargin = '0.3em 0'; // 减小列表边距
        cellPadding = '1mm'; // 减小单元格内边距
        break;
      case 'comfortable':
        pageMargin = 15; // 增加页边距
        lineHeight = '1.8'; // 增加行高
        fontSize = '13pt'; // 增加字体
        elementMargin = '0.8em'; // 增加元素间距
        paragraphMargin = '0.8em 0'; // 增加段落间距
        headingMarginTop = '1.3em'; // 增加标题上边距
        headingMarginBottom = '0.8em'; // 增加标题下边距
        tableMargin = '30px 0'; // 增加表格边距
        imgMargin = '30px auto'; // 增加图片边距
        listMargin = '0.8em 0'; // 增加列表边距
        cellPadding = '2mm'; // 增加单元格内边距
        break;
    }
    
    // 计算派生的内容宽度（不再修改全局 PDF_CONFIG，保持函数纯净）
    const contentWidth = 210 - (pageMargin * 2);
    
    return {
      pageMargin,
      contentWidth,
      lineHeight,
      fontSize,
      elementMargin,
      paragraphMargin,
      headingMarginTop,
      headingMarginBottom,
      tableMargin,
      imgMargin,
      listMargin,
      cellPadding
    };
  };

export default getStylesByDensity;