import { forwardRef, useEffect, useId, useMemo, useRef, useState } from 'react';
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
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import { cn } from '@/utils/cn';
import zhTW from './locales/zh-tw';
import { ImageDialog } from './ImageDialog';
import CheckLink from '../CheckLink';

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

const generatePluginsSettings = ({ diffMarkdown = '' }) => ({
  diffSource: diffSourcePlugin({ viewMode: 'rich-text', diffMarkdown }),
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
  onChange?: (value: string) => void;
  suppressLinkDefaultPrevent?: boolean;
  disabledProse?: boolean;
}

type CheckLinkRef = { check: (href: string) => void };
type EditorError = { error: string; source: string };

const moreSpaceRegex = /(\n)?( {2} +)/g;

const replaceSpace = (value: string) =>
  value.replace(moreSpaceRegex, (_, p1, p2) => `${p1 ?? ''}&#x20;${p2}`);

function InternalMarkdownEditor(
  {
    readOnly = false,
    hasHeadings,
    value = '',
    placeholder,
    rootClassName,
    className,
    editorClassName,
    onChange,
    suppressLinkDefaultPrevent = false,
    disabledProse = false,
  }: MarkdownEditorProps,
  ref: React.ForwardedRef<MDXEditorMethods>
) {
  const formattedValue = typeof value === 'string' ? value : '';
  const id = useId();
  const [error, setError] = useState<EditorError | null>(null);
  const editorRef = useRef<MDXEditorMethods>(null);
  const checkLinkRef = useRef<CheckLinkRef>(null);
  const markdownRef = useRef(replaceSpace(formattedValue));
  const editorSelectors = 'markdown-editor';
  const pluginsSettings = useMemo(
    () =>
      Object.entries(
        generatePluginsSettings({ diffMarkdown: markdownRef.current })
      )
        .filter(([key]) => {
          if (readOnly) {
            return key !== 'toolbar';
          }
          if (key === 'headings') {
            return hasHeadings;
          }
          return true;
        })
        .map(([, plugin]) => plugin),
    [markdownRef.current]
  );

  const renderKey = useMemo(() => {
    if (!readOnly) return 'withToolbar';
    if (formattedValue === markdownRef.current) return 'readOnly';
    markdownRef.current = formattedValue;
    return crypto.randomUUID();
  }, [readOnly, formattedValue]);

  useEffect(() => {
    const editor = document
      .getElementById(id)
      ?.querySelector(`.${editorSelectors}`);

    const handleClick = (e: Event) => {
      if (suppressLinkDefaultPrevent) {
        return;
      }

      if (!readOnly) {
        e.preventDefault();
        return;
      }

      let dom = e.target as HTMLAnchorElement;
      while (dom?.tagName !== 'A') {
        if (editor === dom) break;
        dom = dom?.parentElement as HTMLAnchorElement;
      }
      if (dom?.tagName === 'A') {
        e.preventDefault();
        checkLinkRef.current?.check(dom.href);
      }
    };

    editor?.addEventListener('click', handleClick);
    return () => {
      editor?.removeEventListener('click', handleClick);
    };
  }, []);

  useEffect(() => {
    const handleCheckMoreSpace = () => {
      const sourceEditor = document
        .getElementById(id)
        ?.querySelector('.mdxeditor-source-editor');

      if (sourceEditor) return;
      editorRef.current?.setMarkdown(replaceSpace(formattedValue));
    };

    if (moreSpaceRegex.test(formattedValue)) {
      window.addEventListener('click', handleCheckMoreSpace);
    }

    return () => {
      window.removeEventListener('click', handleCheckMoreSpace);
    };
  }, [formattedValue]);

  return (
    <div id={id} className={rootClassName}>
      {error && readOnly && (
        <div
          className={cn(
            disabledProse ? 'disabled-prose' : 'prose',
            'whitespace-pre-wrap'
          )}
        >
          {formattedValue}
        </div>
      )}
      <MDXEditor
        key={renderKey}
        ref={(el) => {
          editorRef.current = el;
          if (typeof ref === 'function') {
            ref(el);
          }
        }}
        readOnly={readOnly}
        markdown={markdownRef.current}
        onChange={onChange}
        placeholder={placeholder}
        suppressHtmlProcessing
        className={className}
        onError={setError}
        contentEditableClassName={cn(
          editorSelectors,
          disabledProse ? 'disabled-prose' : 'prose min-h-36',
          readOnly && '!p-0 min-h-0',
          editorClassName
        )}
        plugins={pluginsSettings}
        translation={(keyString, defaultText, interpolations) => {
          const keys = keyString.split('.');
          // 等 i18n 完成後，在調整
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          const text: unknown = keys.reduce((acc, key) => acc?.[key], zhTW);
          return typeof text === 'string'
            ? text.replace(
                /{{([^{}]+)}}/g,
                (_, p1) => interpolations?.[p1] || ''
              )
            : defaultText;
        }}
      />
      <CheckLink ref={checkLinkRef} />
    </div>
  );
}

const MarkdownEditor = forwardRef(InternalMarkdownEditor);

export default MarkdownEditor;
