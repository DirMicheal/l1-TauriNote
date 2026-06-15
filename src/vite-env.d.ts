/// <reference types="vite/client" />

import type { BlockNoteEditor } from '@blocknote/core';

declare global {
  interface Window {
    editor?: BlockNoteEditor<any, any, any>;
  }

  interface PdfExportOptions {
    quality: 'low' | 'medium' | 'high';
    pageSize: 'a4' | 'letter';
    density: 'compact' | 'normal' | 'comfortable';
  }
}

export {};
