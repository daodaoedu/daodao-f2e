'use client';

import { toast } from 'sonner';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createEditor, Descendant } from 'slate';
import {
  Slate,
  Editable,
  withReact,
  RenderElementProps,
  RenderLeafProps,
} from 'slate-react';
import { withHistory } from 'slate-history';
import { cn } from '@/utils/cn';
import CheckLink from '@/shared/components/CheckLink';
import { ImageDialog } from './ImageDialog';
import { Toolbar } from './components/toolbar';
import { Element, Leaf } from './components/elements';
import { withShortcuts, withImages, withLinks, insertImage } from './plugins';
import {
  serializeToMarkdown,
  deserializeFromMarkdown,
} from './utils/serializer';
import { MarkdownEditorProps, MarkdownEditorMethods } from './types';

type CheckLinkRef = { check: (href: string) => void };

const InternalMarkdownEditor = forwardRef<
  MarkdownEditorMethods,
  MarkdownEditorProps
>(
  (
    {
      readOnly = false,
      hasHeadings = true,
      value = '',
      placeholder = '開始輸入...',
      rootClassName,
      editorClassName,
      onChange,
      suppressLinkDefaultPrevent = false,
      disabledProse = false,
      maxLength,
    },
    ref
  ) => {
    const editorRef = useRef(
      withShortcuts(
        withLinks(withImages(withHistory(withReact(createEditor()))))
      )
    );
    const editor = editorRef.current;

    const checkLinkRef = useRef<CheckLinkRef>(null);
    const [length, setLength] = useState(value.length);
    const [imageDialog, setImageDialog] = useState<{
      open: boolean;
      initialData?: { src: string; title: string; altText: string };
    }>({ open: false });

    // 將 Markdown 轉換為 Slate 值
    const slateValue = useMemo(() => {
      try {
        return deserializeFromMarkdown(value);
      } catch (error) {
        console.warn('Failed to parse markdown:', error);
        return [
          { type: 'paragraph', children: [{ text: value }] },
        ] as Descendant[];
      }
    }, [value]);

    const handleChange = useCallback(
      (newValue: Descendant[]) => {
        const markdown = serializeToMarkdown(newValue);

        if (maxLength && markdown.length > maxLength) {
          toast.error(`最多只能輸入 ${maxLength} 個字元`);
          return;
        }

        if (maxLength) {
          setLength(markdown.length);
        }

        onChange?.(markdown);
      },
      [maxLength, onChange]
    );

    const renderElement = useCallback(
      (props: RenderElementProps) => <Element {...props} />,
      []
    );
    const renderLeaf = useCallback(
      (props: RenderLeafProps) => <Leaf {...props} />,
      []
    );

    const handleImageInsert = useCallback(
      (url: string, alt?: string, title?: string) => {
        if (url) {
          insertImage(editor, url, alt, title);
        }
        setImageDialog({ open: false });
      },
      [editor]
    );

    const handleImageDialogOpen = useCallback(() => {
      setImageDialog({ open: true });
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        focus: () => {
          editor.selection = {
            anchor: { path: [0, 0], offset: 0 },
            focus: { path: [0, 0], offset: 0 },
          };
        },
        getMarkdown: () => serializeToMarkdown(editor.children),
        setMarkdown: (markdown: string) => {
          const newValue = deserializeFromMarkdown(markdown);
          editor.children = newValue;
          editor.onChange();
        },
        insertMarkdown: (markdown: string) => {
          // 簡單實作：在當前位置插入文字
          editor.insertText(markdown);
        },
      }),
      [editor]
    );

    // 處理連結點擊
    useEffect(() => {
      const handleClick = (e: Event) => {
        if (suppressLinkDefaultPrevent) {
          return;
        }

        if (!readOnly) {
          return;
        }

        let dom = e.target as HTMLAnchorElement;
        while (dom?.tagName !== 'A') {
          if (!dom?.parentElement) break;
          dom = dom.parentElement as HTMLAnchorElement;
        }

        if (dom?.tagName === 'A') {
          e.preventDefault();
          checkLinkRef.current?.check(dom.href);
        }
      };

      if (readOnly) {
        document.addEventListener('click', handleClick);
        return () => {
          document.removeEventListener('click', handleClick);
        };
      }

      return undefined;
    }, [readOnly, suppressLinkDefaultPrevent]);

    return (
      <div
        className={cn(
          !readOnly && [
            'rounded-lg border border-solid border-basic-200',
            'ring-offset-background focus-within:ring-1 focus-within:ring-primary-base focus-within:ring-ring',
          ],
          rootClassName
        )}
      >
        <Slate
          editor={editor}
          initialValue={slateValue}
          onChange={handleChange}
        >
          {!readOnly && (
            <Toolbar
              hasHeadings={hasHeadings}
              onImageInsert={handleImageDialogOpen}
            />
          )}
          <Editable
            className={cn(
              disabledProse ? 'disabled-prose' : 'prose min-h-36',
              readOnly ? 'min-h-0 !p-0' : 'min-w-full p-4',
              editorClassName
            )}
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            placeholder={placeholder}
            readOnly={readOnly}
            spellCheck
            autoFocus={false}
          />
        </Slate>

        <CheckLink ref={checkLinkRef} />

        {maxLength && maxLength > 0 && !readOnly && (
          <div className="body-sm mx-8 mb-2 text-right text-basic-300">
            {length} / {maxLength}
          </div>
        )}

        <ImageDialog
          open={imageDialog.open}
          onClose={() => setImageDialog({ open: false })}
          onSave={(data) =>
            handleImageInsert(data.src, data.altText, data.title)
          }
          initialData={imageDialog.initialData}
        />
      </div>
    );
  }
);

export default InternalMarkdownEditor;
