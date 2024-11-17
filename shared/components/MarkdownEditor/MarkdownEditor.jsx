import { forwardRef, useEffect, useId, useMemo, useRef } from 'react';
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
  },
  ref
) {
  const id = useId();
  const checkLinkRef = useRef(null);
  const markdown = useRef(value);
  const editorSelectors = 'markdown-editor';
  const pluginsSettings = useMemo(
    () =>
      Object.entries(generatePluginsSettings({ diffMarkdown: markdown.current }))
        .filter(([key]) => {
          if (readOnly) {
            return key !== 'toolbar';
          }
          if (key === 'headings') {
            return hasHeadings;
          }
          return true;
        })
        .map(([_, plugin]) => plugin),
    [markdown.current]
  );

  useEffect(() => {
    const editor = document.getElementById(id).querySelector(`.${editorSelectors}`);

    const handleClick = (e) => {
      if (suppressLinkDefaultPrevent) {
        return;
      }

      if (!readOnly) {
        e.preventDefault();
        return;
      }

      let { target } = e;
      while (target.tagName !== 'A') {
        if (editor === target) break;
        target = target.parentElement;
      }
      if (target.tagName === 'A') {
        e.preventDefault();
        checkLinkRef.current?.check(target.href);
      }
    };

    editor.addEventListener('click', handleClick);
    return () => editor.removeEventListener('click', handleClick);
  }, []);

  return (
    <div id={id} className={rootClassName}>
      <MDXEditor
        key={readOnly ? 'readOnly' : 'withToolbar'}
        ref={ref}
        readOnly={readOnly}
        markdown={markdown.current}
        onChange={onChange}
        placeholder={placeholder}
        suppressHtmlProcessing
        className={className}
        contentEditableClassName={cn(
          editorSelectors,
          disabledProse ? 'disabled-prose' : 'prose',
          readOnly && '!p-0',
          editorClassName
        )}
        plugins={pluginsSettings}
        translation={(keyString, defaultText, interpolations) => {
          const keys = keyString.split('.');
          const text = keys.reduce((acc, key) => acc?.[key], zhTW);
          return typeof text === 'string'
            ? text.replace(/{{([^{}]+)}}/g, (_, p1) => interpolations?.[p1] || '')
            : defaultText;
        }}
      />
      <CheckLink ref={checkLinkRef} />
    </div>
  );
}

const MarkdownEditor = forwardRef(InternalMarkdownEditor);

export default MarkdownEditor;
