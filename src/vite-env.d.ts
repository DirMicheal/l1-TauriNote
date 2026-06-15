/// <reference types="vite/client" />

import type { BlockNoteEditor } from "@blocknote/core";

declare global {
  interface Window {
    // Editor 组件挂载时会把编辑器实例挂到 window 上，供导出 / PDF 等工具读取。
    // 编辑器使用了自定义 + 多列 schema，无法在全局声明中精确表达其泛型，
    // 因此使用 <any, any, any> 接受任意 schema 的编辑器实例。
    editor?: BlockNoteEditor<any, any, any>;
  }
}
