/// <reference types="vite/client" />

import type { BlockNoteEditor } from "@blocknote/core";

declare global {
  interface Window {
    editor?: BlockNoteEditor<any, any, any>;
  }
}
