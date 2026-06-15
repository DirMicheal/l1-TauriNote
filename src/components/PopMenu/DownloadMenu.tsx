
import type { MenuProps } from 'antd';
import TeenyiconsPdfOutline from '../../assets/TeenyiconsPdfOutline.svg';
import handleDownload from '../pdf';
import { Modal, Radio, Button, Space } from 'antd';
import { useState } from 'react';
import { exportToHTML, exportToMarkdown } from '../../utils/exportUtils';
import markdownSVG from "../../assets/TablerMarkdown.svg"
import Html5 from "../../assets/LogosHtml5.svg"

// PDF导出选项接口
interface PdfExportOptionsData {
  quality: string;
  pageSize: string;
  density: string;
}

// PDF导出选项组件
const PdfExportOptions = ({ onExport, onCancel }: { onExport: (options: PdfExportOptionsData) => void, onCancel: () => void }) => {
  const [quality, setQuality] = useState('high');
  const [pageSize, setPageSize] = useState('a4');
  const [density, setDensity] = useState('normal');
  
  return (
    <div className="pdf-export-options">
      <div className="mb-4">
        <div className="font-medium mb-2">导出质量</div>
        <Radio.Group value={quality} onChange={(e) => setQuality(e.target.value)}>
          <Space direction="vertical">
            <Radio value="high">高质量 (推荐，文件较大)</Radio>
            <Radio value="medium">中等质量 (平衡大小和质量)</Radio>
            <Radio value="low">低质量 (文件较小，适合分享)</Radio>
          </Space>
        </Radio.Group>
      </div>
      
      <div className="mb-4">
        <div className="font-medium mb-2">页面大小</div>
        <Radio.Group value={pageSize} onChange={(e) => setPageSize(e.target.value)}>
          <Space direction="vertical">
            <Radio value="a4">A4 (210 × 297 mm)</Radio>
            <Radio value="letter">Letter (215.9 × 279.4 mm)</Radio>
          </Space>
        </Radio.Group>
      </div>
      
      <div className="mb-4">
        <div className="font-medium mb-2">内容密度</div>
        <Radio.Group value={density} onChange={(e) => setDensity(e.target.value)}>
          <Space direction="vertical">
            <Radio value="compact">紧凑 (减少空白，更多内容)</Radio>
            <Radio value="normal">标准 (默认布局)</Radio>
            <Radio value="comfortable">宽松 (更多留白，易于阅读)</Radio>
          </Space>
        </Radio.Group>
      </div>
      
      <div className="flex justify-end mt-4">
        <Button onClick={onCancel} className="mr-2">取消</Button>
        <Button type="primary" onClick={() => onExport({ quality, pageSize, density })}>导出</Button>
      </div>
    </div>
  );
};

// 处理PDF导出的函数
const handlePdfExport = () => {
  Modal.confirm({
    title: '导出PDF',
    content: <PdfExportOptions
      onExport={(options) => {
        Modal.destroyAll();
        if (!options) return;
        handleDownload(options);
      }}
      onCancel={() => Modal.destroyAll()}
    />,
    icon: null,
    footer: null,
    width: 400,
    closable: true,
    maskClosable: true,
  });
};

// 定义导出菜单项
const DownloadMenu: MenuProps['items'] = [
  {
    key: 'pdf',
    label: (
      <div className="flex items-center hover:bg-gray-100 p-1 rounded transition-colors">
        <div className="w-5 h-5 cursor-pointer mr-2">
          <img src={TeenyiconsPdfOutline} alt="PDF图标" />
        </div>
        <a onClick={handlePdfExport}>
          <span className="text-gray-700 font-medium">导出PDF</span>
        </a>
      </div>
    )
  },
  {
    key: 'markdown',
    label: (
      <div className="flex items-center hover:bg-gray-100 p-1 rounded transition-colors">
        <div className="w-5 h-5 cursor-pointer mr-2 flex items-center justify-center"> 
          <img src={markdownSVG} alt="markdown图标" />
        </div>
        <a onClick={() => exportToMarkdown()}>
          <span className="text-gray-700 font-medium">导出Markdown</span>
        </a>
      </div>
    )
  },
  {
    key: 'html',
    label: (
      <div className="flex items-center hover:bg-gray-100 p-1 rounded transition-colors">
        <div className="w-5 h-5 cursor-pointer mr-2 flex items-center justify-center"> 
          <img src={Html5} alt="Html图标" />
          
        </div>
        <a onClick={() => exportToHTML()}>
          <span className="text-gray-700 font-medium">导出HTML</span>
        </a>
      </div>
    )
  }
];

export default DownloadMenu;