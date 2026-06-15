/// <reference types="vite/client" />

import type { BlockNoteEditor } from "@blocknote/core";

declare global {
  interface Window {
    /** 全局 BlockNote 编辑器实例（在 Editor 组件挂载时赋值） */
    editor?: BlockNoteEditor;
  }
}

export {};
