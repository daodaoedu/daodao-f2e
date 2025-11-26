import React from 'react';
import { RenderElementProps, RenderLeafProps } from 'slate-react';
import { Image } from '@/shared/ui/image';
import { CustomLink } from '@/shared/ui/custom-link';
import { HeadingLevel } from '../types';

export const Element = ({
  attributes,
  children,
  element,
}: RenderElementProps) => {
  switch (element.type) {
    case 'block-quote':
      return <blockquote {...attributes}>{children}</blockquote>;
    case 'bulleted-list':
      return <ul {...attributes}>{children}</ul>;
    case 'heading-1':
    case 'heading-2':
    case 'heading-3':
    case 'heading-4':
    case 'heading-5':
    case 'heading-6': {
      const level = parseInt(element.type.split('-')[1] ?? '1', 10) as HeadingLevel;
      const HeadingTag = `h${level}` as React.ElementType;
      return <HeadingTag {...attributes}>{children}</HeadingTag>;
    }
    case 'list-item':
      return <li {...attributes}>{children}</li>;
    case 'numbered-list':
      return <ol {...attributes}>{children}</ol>;
    case 'link':
      return (
        <CustomLink href={element.url} {...attributes}>
          {children}
        </CustomLink>
      );
    case 'image':
      return (
        <div {...attributes}>
          {children}
          <Image
            src={element.url}
            alt={element.alt || ''}
            title={element.title || ''}
          />
        </div>
      );
    case 'thematic-break':
      return <hr {...attributes} />;
    default:
      return <p {...attributes}>{children}</p>;
  }
};

export const Leaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  let result = children;

  if ('bold' in leaf && leaf.bold) {
    result = <strong>{result}</strong>;
  }

  if ('code' in leaf && leaf.code) {
    result = <code>{result}</code>;
  }

  if ('italic' in leaf && leaf.italic) {
    result = <em>{result}</em>;
  }

  if ('underline' in leaf && leaf.underline) {
    result = <u>{result}</u>;
  }

  return <span {...attributes}>{result}</span>;
};
