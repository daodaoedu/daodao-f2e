import { useEffect, useId, useRef } from 'react';
import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CodeToggle,
  CreateLink,
  DiffSourceToggleWrapper,
  InsertThematicBreak,
  ListsToggle,
  UndoRedo,
  MDXEditor,
  codeBlockPlugin,
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
import zhTW from './locales/zh-tw';
import { ImageDialog } from './ImageDialog';
import CheckLink from '../CheckLink';

const toolbarContents = () => (
  <DiffSourceToggleWrapper>
    <UndoRedo />
    <Separator />
    <BoldItalicUnderlineToggles />
    <Separator />
    <CodeToggle />
    <Separator />
    <ListsToggle />
    <Separator />
    <BlockTypeSelect />
    <Separator />
    <CreateLink />
    <InsertImage />
    <InsertThematicBreak />
  </DiffSourceToggleWrapper>
);

const generatePlugins = (diffMarkdown = '') => [
  codeBlockPlugin(),
  diffSourcePlugin({ viewMode: 'rich-text', diffMarkdown }),
  headingsPlugin({ allowedHeadingLevels: [1, 2, 3] }),
  imagePlugin({ ImageDialog }),
  linkDialogPlugin(),
  linkPlugin(),
  listsPlugin(),
  markdownShortcutPlugin(),
  quotePlugin(),
  thematicBreakPlugin()
];

const generatePluginWithToolbar = (diffMarkdown = '') => [
  ...generatePlugins(diffMarkdown),
  toolbarPlugin({ toolbarContents })
];

export default function MarkdownEditor({ readOnly = false, value = '123123', onChange }) {
  const id = useId();
  const checkLinkRef = useRef(null);

  useEffect(() => {
    const editor = document.getElementById(id).querySelector('.prose');

    const handleClick = (e) => {
      let { target } = e;
      e.preventDefault();
      while (target.tagName !== 'A') {
        if (editor === target) break;
        target = target.parentElement;
      }
      if (target.tagName === 'A') {
        checkLinkRef.current?.check(target.href);
      }
    };

    editor.addEventListener('click', handleClick);
    return () => editor.removeEventListener('click', handleClick);
  }, []);

  return (
    <div id={id}>
      <MDXEditor
        key={readOnly ? 'readOnly' : 'withToolbar'}
        readOnly={readOnly}
        markdown={value}
        onChange={onChange}
        suppressHtmlProcessing
        contentEditableClassName="prose"
        plugins={readOnly ? generatePlugins(value) : generatePluginWithToolbar(value)}
        translation={(keyString, defaultValue, interpolations) => {
          const keys = keyString.split('.');
          const text = keys.reduce((acc, key) => acc?.[key], zhTW);
          return typeof text === 'string'
            ? text.replace(/{{([^{}]+)}}/g, (_, p1) => interpolations?.[p1] || '')
            : defaultValue;
        }}
      />
      <CheckLink ref={checkLinkRef} />
    </div>
  );
}
