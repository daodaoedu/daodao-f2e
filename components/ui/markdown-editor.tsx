"use client";

import { toast } from "sonner";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CreateLink,
  DiffSourceToggleWrapper,
  InsertThematicBreak,
  ListsToggle,
  UndoRedo,
  MDXEditor,
  diffSourcePlugin,
  headingsPlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  Separator,
  InsertImage,
  imagePlugin,
  MDXEditorMethods,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import { cn } from "@/utils/cn";
import zhTW from "@/shared/components/MarkdownEditor/locales/zh-tw";
import { ImageDialog } from "@/shared/components/MarkdownEditor/ImageDialog";
import CheckLink from "@/shared/components/CheckLink";

const toolbarContents = () => (
  <DiffSourceToggleWrapper>
    <UndoRedo />
    <Separator />
    <BlockTypeSelect />
    <BoldItalicUnderlineToggles />
    <CreateLink />
    <InsertImage />
    <InsertThematicBreak />
    <ListsToggle />
  </DiffSourceToggleWrapper>
);

const generatePluginsSettings = ({ diffMarkdown = "" }) => ({
  diffSource: diffSourcePlugin({ viewMode: "rich-text", diffMarkdown }),
  headings: headingsPlugin({ allowedHeadingLevels: [1, 2, 3] }),
  image: imagePlugin({ ImageDialog }),
  linkDialog: linkDialogPlugin(),
  link: linkPlugin(),
  lists: listsPlugin(),
  quote: quotePlugin(),
  markdownShortcut: markdownShortcutPlugin(),
  thematicBreak: thematicBreakPlugin(),
  toolbar: toolbarPlugin({ toolbarContents }),
});

interface MarkdownEditorProps {
  readOnly?: boolean;
  hasHeadings?: boolean;
  value?: string;
  placeholder?: string;
  rootClassName?: string;
  className?: string;
  editorClassName?: string;
  suppressLinkDefaultPrevent?: boolean;
  disabledProse?: boolean;
  maxLength?: number;
  onChange?: (value: string) => void;
}

type CheckLinkRef = { check: (href: string) => void };
type EditorError = { error: string; source: string };

const moreSpaceRegex = /(\n)?( {2} +)/g;

const replaceSpace = (value: string) =>
  value.replace(moreSpaceRegex, (_, p1, p2) => `${p1 ?? ""}&#x20;${p2}`);

const MarkdownEditor = forwardRef<MDXEditorMethods, MarkdownEditorProps>(
  (
    {
      readOnly = false,
      hasHeadings,
      value = "",
      placeholder,
      rootClassName,
      className,
      editorClassName,
      onChange,
      suppressLinkDefaultPrevent = false,
      disabledProse = false,
      maxLength,
    },
    ref
  ) => {
    const formattedValue = typeof value === "string" ? value : "";
    const markdownEditorWrapperRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<EditorError | null>(null);
    const editorRef = useRef<MDXEditorMethods>(null);
    const checkLinkRef = useRef<CheckLinkRef>(null);
    const markdownRef = useRef(replaceSpace(formattedValue));
    const [length, setLength] = useState(formattedValue.length);
    const editorSelectors = "markdown-editor";
    const pluginsSettings = useMemo(
      () =>
        Object.entries(
          generatePluginsSettings({ diffMarkdown: markdownRef.current })
        )
          .filter(([key]) => {
            if (readOnly) {
              return key !== "toolbar";
            }
            if (key === "headings") {
              return hasHeadings;
            }
            return true;
          })
          .map(([, plugin]) => plugin),
      [markdownRef.current]
    );

    const renderKey = useMemo(() => {
      if (!readOnly) return "withToolbar";
      if (formattedValue === markdownRef.current) return "readOnly";
      markdownRef.current = formattedValue;
      return crypto.randomUUID();
    }, [readOnly, formattedValue]);

    const handleChange = (markdown: string) => {
      if (maxLength && markdown.length > maxLength) {
        toast.error(`最多只能輸入 ${maxLength} 個字元`);
        return;
      }
      if (maxLength) {
        setLength(markdown.length);
      }
      onChange?.(markdown);
    };

    useImperativeHandle(
      ref,
      () => ({
        focus: () => {
          editorRef.current?.focus(() => {
            markdownEditorWrapperRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "center",
              inline: "center",
            });
          });
        },
        getMarkdown: () => editorRef.current?.getMarkdown() ?? "",
        setMarkdown: (v) => editorRef.current?.setMarkdown(v),
        insertMarkdown: (v) => editorRef.current?.insertMarkdown(v),
      }),
      []
    );

    useEffect(() => {
      const editor = markdownEditorWrapperRef.current?.querySelector(
        `.${editorSelectors}`
      );

      const handleClick = (e: Event) => {
        if (suppressLinkDefaultPrevent) {
          return;
        }

        if (!readOnly) {
          e.preventDefault();
          return;
        }

        let dom = e.target as HTMLAnchorElement;
        while (dom?.tagName !== "A") {
          if (editor === dom) break;
          dom = dom?.parentElement as HTMLAnchorElement;
        }
        if (dom?.tagName === "A") {
          e.preventDefault();
          checkLinkRef.current?.check(dom.href);
        }
      };

      editor?.addEventListener("click", handleClick);
      return () => {
        editor?.removeEventListener("click", handleClick);
      };
    }, []);

    useEffect(() => {
      const handleCheckMoreSpace = () => {
        const sourceEditor = markdownEditorWrapperRef.current?.querySelector(
          ".mdxeditor-source-editor"
        );

        if (sourceEditor) return;
        editorRef.current?.setMarkdown(replaceSpace(formattedValue));
      };

      if (moreSpaceRegex.test(formattedValue)) {
        window.addEventListener("click", handleCheckMoreSpace);
      }

      return () => {
        window.removeEventListener("click", handleCheckMoreSpace);
      };
    }, [formattedValue]);

    return (
      <div
        ref={markdownEditorWrapperRef}
        className={cn(
          !readOnly && [
            "border border-solid border-basic-200 rounded-lg",
            "ring-offset-background focus-within:ring-1 focus-within:ring-ring focus-within:ring-primary-base"
          ],
          rootClassName
        )}
      >
        {error && readOnly && (
          <div
            className={cn(
              disabledProse ? "disabled-prose" : "prose",
              "whitespace-pre-wrap"
            )}
          >
            {formattedValue}
          </div>
        )}
        <MDXEditor
          key={renderKey}
          ref={editorRef}
          markdown={markdownRef.current}
          readOnly={readOnly}
          className={className}
          placeholder={placeholder}
          contentEditableClassName={cn(
            editorSelectors,
            disabledProse ? "disabled-prose" : "prose min-h-36",
            readOnly ? "!p-0 min-h-0" : "min-w-full",
            editorClassName
          )}
          suppressHtmlProcessing
          onChange={handleChange}
          onError={setError}
          plugins={pluginsSettings}
          translation={(keyString, defaultText, interpolations) => {
            const keys = keyString.split(".");
            // 等 i18n 完成後，在調整
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            const text: unknown = keys.reduce((acc, key) => acc?.[key], zhTW);
            return typeof text === "string"
              ? text.replace(
                  /{{([^{}]+)}}/g,
                  (_, p1) => interpolations?.[p1] || ""
                )
              : defaultText;
          }}
        />
        <CheckLink ref={checkLinkRef} />
        {maxLength && maxLength > 0 && !readOnly && (
          <div className="mx-8 mb-2 text-right body-sm text-basic-300">
            {length} / {maxLength}
          </div>
        )}
      </div>
    );
  }
);

export default MarkdownEditor;
