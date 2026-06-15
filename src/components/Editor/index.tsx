import {  useEffect  } from "react";
import { Alert } from "./Blocks/Alert";
import "@blocknote/mantine/style.css";
import "@blocknote/core/fonts/inter.css";
import "./index.css"
import { RiAlertFill,RiText } from "react-icons/ri";
import { BlockNoteView } from "@blocknote/mantine";
import convertFileToBase64 from "../../utils/convertFileToBase64"
import { useCreateBlockNote,SuggestionMenuController,  getDefaultReactSlashMenuItems,

  BasicTextStyleButton,
  BlockTypeSelect,
  ColorStyleButton,
  CreateLinkButton,
  FileCaptionButton,
  FileReplaceButton,
  FormattingToolbar,
  FormattingToolbarController,
  NestBlockButton,
  TextAlignButton,
  UnnestBlockButton,
  useBlockNoteEditor,
  useComponentsContext,
  DefaultReactSuggestionItem,

} from "@blocknote/react";
import { getMultiColumnSlashMenuItems,  multiColumnDropCursor, locales as multiColumnLocales, withMultiColumn } from "@blocknote/xl-multi-column";
import { BlockNoteSchema, defaultBlockSpecs, filterSuggestionItems, insertOrUpdateBlock,locales,combineByGroup, defaultStyleSpecs, type PartialBlock, type BlockNoteEditor } from "@blocknote/core";
import JSON5 from 'json5';
import { useMemo } from "react";
import Font from "./Blocks/Fonts";



/**
 * 安全解析 JSON5 字符串，返回 PartialBlock 数组或 null
 */
function safeParse(input: string): PartialBlock<any, any, any>[] | null {
  try {
    // 预处理：修复常见格式问题
    const sanitized = input
      // 移除尾随逗号
      .replace(/,\s*]/g, ']')
      .replace(/,\s*}/g, '}')
      // 为属性名添加双引号
      .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');

    // 使用JSON5解析
    const result: unknown = JSON5.parse(sanitized);

    // 类型守卫：验证解析结果是 PartialBlock 数组
    if (Array.isArray(result)) {
      return result as PartialBlock<any, any, any>[];
    }
    return null;
  } catch (error) {
    console.error('解析失败:', error);
    return null;
  }
}
const $schema = BlockNoteSchema.create({
    styleSpecs:{
      font: Font,
      ...defaultStyleSpecs
    },
    blockSpecs: {
      ...defaultBlockSpecs,
      alert: Alert,
    },
  });

  // Slash menu item to insert an Alert block
  const insertAlert = (editor: BlockNoteEditor<any, any, any>): DefaultReactSuggestionItem => ({
    title: "Alert", //Alert
    onItemClick: () => {
      insertOrUpdateBlock(editor, {
        type: "alert",
      });
    },
    aliases: [
      "alert",
      "notification",
      "emphasize",
      "warning",
      "error",
      "info",
      "success",
    ],
    group: "Other",
    icon: <RiAlertFill />,
  });


  async function uploadFile(file: File, _blockId?: string): Promise<string> {
    if (!file) return "";

    if(file.type.includes("image")){
      const base64 = await convertFileToBase64(file);
      return base64 ?? "";
    }

    return "";
  }

  interface EditorProps {
    content: string | PartialBlock<any, any, any>[];
    type?: string;
    onChange: (content: string | PartialBlock<any, any, any>[]) => void;
  }

  const SetFontStyleButton = () => {
    const editor = useBlockNoteEditor<
      typeof $schema.blockSchema,
      typeof $schema.inlineContentSchema,
      typeof $schema.styleSchema
    >();

    const Components = useComponentsContext()!;

    return (
      <Components.FormattingToolbar.Button
        label="Set Font"
        mainTooltip={"Set Font"}
        icon={<RiText />}
        onClick={() => {
          const fontName = prompt("Enter a font name") || "Comic Sans MS";

          editor.addStyles({
            font: fontName,
          });
        }}
      />
    );
  };


const   Editor: React.FC<EditorProps> = ({content,onChange,type='md'})=>{


  // Creates a new editor instance.
  const editor = useCreateBlockNote({
    dictionary: {
      ...locales.zh,
      multi_column: multiColumnLocales.zh,
    },
    dropCursor: multiColumnDropCursor,
    schema: withMultiColumn($schema) as any,
    uploadFile,
  });

  const inserts: DefaultReactSuggestionItem[] = [
    insertAlert(editor)
  ];



  async function markdownInputChanged() {
    const blocks = await editor.tryParseMarkdownToBlocks(content as string);
    editor.replaceBlocks(editor.document, blocks);
  }




  async function initialContent(){

    try {
      // 确保 content 是一个有效的 PartialBlock[] 数组
      if (typeof content === "string") {
        const parsedData = safeParse(content);
        if(editor && parsedData){
          editor.replaceBlocks(editor.document, parsedData as any);
        }
      } else if (Array.isArray(content)) {
        if(editor){
          editor.replaceBlocks(editor.document, content as any);
        }
      }
    } catch (error) {
      console.error("Error inserting blocks:", error);
    }
  }



  const handleChange = async () => {
    const html = await editor.blocksToHTMLLossy(editor.document);
    const markdown = await editor.blocksToMarkdownLossy(editor.document);

    switch(type){
      case "md":
        onChange(markdown)
        break;
      case "json":
        onChange(editor.document)
        break;
      case "html":
        onChange(html)
        break;
    case "tn":
        onChange(JSON.stringify(editor.document))
        break;
    }

  };


  useEffect(() => {
    handleChange();
      if(type ==="md"){
        markdownInputChanged()
      }

      switch(type){
        case "md":
           markdownInputChanged();
           break;
        case "json":
           initialContent();
           break;
        case "tn":
           initialContent();
           break;
      }
  }, []);

  // Gets the default slash menu items merged with the multi-column ones.
  const getSlashMenuItems = useMemo(() => {
    return async (query: string) =>
      filterSuggestionItems(
        combineByGroup(
          getDefaultReactSlashMenuItems(editor),
          [...inserts],
          getMultiColumnSlashMenuItems(editor)
        ),
        query
      );
  }, [editor]);

  window.editor = editor;

  return  <BlockNoteView editor={editor} slashMenu={false} onChange={handleChange} formattingToolbar={false}>
  {/* Replaces the default Slash Menu. */}
  <SuggestionMenuController  triggerCharacter={"/"} getItems={getSlashMenuItems}  />

    {/* Replaces the default Formatting Toolbar. */}
    <FormattingToolbarController
        formattingToolbar={() => (
          <FormattingToolbar>
            <BlockTypeSelect key={"blockTypeSelect"} />

            <FileCaptionButton key={"fileCaptionButton"} />
            <FileReplaceButton key={"replaceFileButton"} />

            <BasicTextStyleButton
              basicTextStyle={"bold"}
              key={"boldStyleButton"}
            />
            <BasicTextStyleButton
              basicTextStyle={"italic"}
              key={"italicStyleButton"}
            />
            <BasicTextStyleButton
              basicTextStyle={"underline"}
              key={"underlineStyleButton"}
            />
            <BasicTextStyleButton
              basicTextStyle={"strike"}
              key={"strikeStyleButton"}
            />
            {/* Adds SetFontStyleButton */}
            <SetFontStyleButton />

            <TextAlignButton
              textAlignment={"left"}
              key={"textAlignLeftButton"}
            />
            <TextAlignButton
              textAlignment={"center"}
              key={"textAlignCenterButton"}
            />
            <TextAlignButton
              textAlignment={"right"}
              key={"textAlignRightButton"}
            />

            <ColorStyleButton key={"colorStyleButton"} />

            <NestBlockButton key={"nestBlockButton"} />
            <UnnestBlockButton key={"unnestBlockButton"} />

            <CreateLinkButton key={"createLinkButton"} />
          </FormattingToolbar>
        )}
      />
</BlockNoteView>;
}


export default Editor
