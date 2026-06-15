import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
// 导入antd的样式文件 - 更新为Ant Design 5.x的正确路径
import 'antd/dist/reset.css';

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
