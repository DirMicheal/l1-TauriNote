

// 处理Markdown表格的函数
const processMarkdownTable = (tableLines: string[]): string => {
    if (tableLines.length < 3) return ''; // 至少需要表头、分隔行和一行数据
    
    // 提取表头和数据行
    const headerLine = tableLines[0];
    const dataLines = tableLines.slice(2); // 跳过分隔行
    
    // 解析表头
    const headers = headerLine.split('|')
      .map(cell => cell.trim())
      .filter(cell => cell.length > 0);
    
    // 构建表格HTML
    let tableHtml = '<table style="width: 100%; border-collapse: collapse; margin: 10px 0; page-break-inside: auto; table-layout: fixed;">';
    
    // 添加表头
    tableHtml += '<thead><tr>';
    headers.forEach(header => {
      tableHtml += `<th style="padding: 4px; border: 0.5px solid #000; background-color: #f5f5f5; font-weight: bold; word-break: break-word;">${header}</th>`;
    });
    tableHtml += '</tr></thead>';
    
    // 添加数据行
    tableHtml += '<tbody>';
    dataLines.forEach(line => {
      const cells = line.split('|')
        .map(cell => cell.trim())
        .filter(cell => cell.length > 0);
      
      if (cells.length > 0) {
        tableHtml += '<tr>';
        cells.forEach(cell => {
          tableHtml += `<td style="padding: 4px; border: 0.5px solid #000; word-break: break-word;">${cell}</td>`;
        });
        tableHtml += '</tr>';
      }
    });
    tableHtml += '</tbody></table>';
    
    return tableHtml;
}

export default processMarkdownTable;