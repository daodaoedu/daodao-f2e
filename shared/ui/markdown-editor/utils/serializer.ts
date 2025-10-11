import { Descendant, Text } from 'slate';
import { CustomElement, CustomText, FormattedText, HeadingLevel } from '../types';

// 解析格式化文字（粗體、斜體等）
const parseFormattedText = (text: string): CustomText[] => {
  if (!text) return [{ text: '' }];

  const tokens: CustomText[] = [];
  let currentIndex = 0;

  // 處理粗體 **text**
  const boldRegex = /\*\*([^*]+)\*\*/g;
  let boldMatch = boldRegex.exec(text);

  while (boldMatch !== null) {
    // 添加前面的普通文字
    if (boldMatch.index > currentIndex) {
      const beforeText = text.substring(currentIndex, boldMatch.index);
      if (beforeText) tokens.push({ text: beforeText });
    }

    // 添加粗體文字
    tokens.push({ text: boldMatch[1], bold: true });
    currentIndex = boldMatch.index + boldMatch[0].length;
    boldMatch = boldRegex.exec(text);
  }

  // 處理斜體 *text*（但不是粗體）
  const italicRegex = /(?<!\*)\*([^*]+)\*(?!\*)/g;
  const remainingText = text.substring(currentIndex);
  const italicMatch = italicRegex.exec(remainingText);

  if (remainingText && italicMatch !== null) {
    // 添加斜體前的文字
    if (italicMatch.index > 0) {
      const beforeText = remainingText.substring(0, italicMatch.index);
      if (beforeText) tokens.push({ text: beforeText });
    }

    // 添加斜體文字
    tokens.push({ text: italicMatch[1], italic: true });
    currentIndex += italicMatch.index + italicMatch[0].length;
  }

  // 處理行內程式碼 `code`
  const codeRegex = /`([^`]+)`/g;
  const finalText = text.substring(currentIndex);
  const codeMatch = codeRegex.exec(finalText);

  if (finalText && codeMatch !== null) {
    // 添加程式碼前的文字
    if (codeMatch.index > 0) {
      const beforeText = finalText.substring(0, codeMatch.index);
      if (beforeText) tokens.push({ text: beforeText });
    }

    // 添加程式碼文字
    tokens.push({ text: codeMatch[1], code: true });
    currentIndex += codeMatch.index + codeMatch[0].length;
  }

  // 添加剩餘的普通文字
  if (currentIndex < text.length) {
    const restText = text.substring(currentIndex);
    if (restText) tokens.push({ text: restText });
  }

  return tokens.length > 0 ? tokens : [{ text }];
};

// 解析內聯格式化文字
const parseInlineText = (text: string): Descendant[] => {
  if (!text) return [{ text: '' }];

  const nodes: Descendant[] = [];
  let currentIndex = 0;

  // 處理連結 [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let linkMatch = linkRegex.exec(text);

  while (linkMatch !== null) {
    // 添加連結前的文字
    if (linkMatch.index > currentIndex) {
      const beforeText = text.substring(currentIndex, linkMatch.index);
      nodes.push(...parseFormattedText(beforeText));
    }

    // 添加連結節點
    nodes.push({
      type: 'link',
      url: linkMatch[2],
      children: parseFormattedText(linkMatch[1]),
    });

    currentIndex = linkMatch.index + linkMatch[0].length;
    linkMatch = linkRegex.exec(text);
  }

  // 添加剩餘文字
  if (currentIndex < text.length) {
    const remainingText = text.substring(currentIndex);
    nodes.push(...parseFormattedText(remainingText));
  }

  return nodes.length > 0 ? nodes : [{ text }];
};

// 序列化單個節點
const serializeNode = (node: Descendant): string => {
  if (Text.isText(node)) {
    const { text } = node;
    let result = text;

    // 檢查是否為 FormattedText 類型
    const formattedNode = node as FormattedText;

    if (formattedNode.bold) {
      result = `**${result}**`;
    }
    if (formattedNode.italic) {
      result = `*${result}*`;
    }
    if (formattedNode.underline) {
      result = `<u>${result}</u>`;
    }
    if (formattedNode.code) {
      result = `\`${result}\``;
    }

    return result;
  }

  const children = node.children.map((child) => serializeNode(child)).join('');

  switch (node.type) {
    case 'paragraph':
      return children;
    case 'heading-1':
    case 'heading-2':
    case 'heading-3':
    case 'heading-4':
    case 'heading-5':
    case 'heading-6': {
      const level = parseInt(node.type.split('-')[1], 10);
      return `${'#'.repeat(level)} ${children}`;
    }
    case 'block-quote':
      return `> ${children}`;
    case 'bulleted-list':
      return node.children
        .map((child) => `- ${serializeNode(child)}`)
        .join('\n');
    case 'numbered-list':
      return node.children
        .map((child, index) => `${index + 1}. ${serializeNode(child)}`)
        .join('\n');
    case 'list-item':
      return children;
    case 'link': {
      const linkNode = node as CustomElement & { url: string };
      return `[${children}](${linkNode.url})`;
    }
    case 'image': {
      const imageNode = node as CustomElement & {
        url: string;
        alt?: string;
        title?: string;
      };
      const alt = imageNode.alt || '';
      const title = imageNode.title ? ` "${imageNode.title}"` : '';
      return `![${alt}](${imageNode.url}${title})`;
    }
    case 'thematic-break':
      return '---';
    default:
      return children;
  }
};

export const serializeToMarkdown = (nodes: Descendant[]): string => {
  return nodes.map((node) => serializeNode(node)).join('\n\n');
};

export const deserializeFromMarkdown = (markdown: string): Descendant[] => {
  if (!markdown.trim()) {
    return [{ type: 'paragraph', children: [{ text: '' }] }];
  }

  const lines = markdown.split('\n');
  const nodes: Descendant[] = [];
  let currentNode: CustomElement | null = null;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // 空行處理
    if (!trimmedLine) {
      if (currentNode) {
        nodes.push(currentNode);
        currentNode = null;
      }
      // eslint-disable-next-line no-continue
      continue;
    }

    // 圖片 ![alt](url "title")
    const imageMatch = trimmedLine.match(
      /^!\[([^\]]*)\]\(([^)]+)(?:\s+"([^"]*)")?\)$/
    );
    if (imageMatch) {
      if (currentNode) nodes.push(currentNode);
      nodes.push({
        type: 'image',
        url: imageMatch[2],
        alt: imageMatch[1] || '',
        title: imageMatch[3] || '',
        children: [{ text: '' }],
      });
      currentNode = null;
      // eslint-disable-next-line no-continue
      continue;
    }

    // 標題
    const headingMatch = trimmedLine.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      if (currentNode) nodes.push(currentNode);
      const level = headingMatch[1].length as HeadingLevel;
      currentNode = {
        type: `heading-${level}`,
        children: parseInlineText(headingMatch[2]),
      };
      // eslint-disable-next-line no-continue
      continue;
    }

    // 引用
    if (trimmedLine.startsWith('> ')) {
      if (currentNode) nodes.push(currentNode);
      currentNode = {
        type: 'block-quote',
        children: parseInlineText(trimmedLine.substring(2)),
      };
      // eslint-disable-next-line no-continue
      continue;
    }

    // 分隔線
    if (trimmedLine.match(/^-{3,}$/)) {
      if (currentNode) nodes.push(currentNode);
      nodes.push({
        type: 'thematic-break',
        children: [{ text: '' }],
      });
      currentNode = null;
      // eslint-disable-next-line no-continue
      continue;
    }

    // 無序列表
    const bulletMatch = trimmedLine.match(/^-\s+(.*)$/);
    if (bulletMatch) {
      if (currentNode && currentNode.type !== 'bulleted-list') {
        nodes.push(currentNode);
        currentNode = null;
      }

      if (!currentNode || currentNode.type !== 'bulleted-list') {
        currentNode = {
          type: 'bulleted-list',
          children: [],
        };
      }

      const bulletListNode = currentNode as CustomElement & {
        children: CustomElement[];
      };
      bulletListNode.children.push({
        type: 'list-item',
        children: parseInlineText(bulletMatch[1]),
      });
      // eslint-disable-next-line no-continue
      continue;
    }

    // 有序列表
    const numberedMatch = trimmedLine.match(/^\d+\.\s+(.*)$/);
    if (numberedMatch) {
      if (currentNode && currentNode.type !== 'numbered-list') {
        nodes.push(currentNode);
        currentNode = null;
      }

      if (!currentNode || currentNode.type !== 'numbered-list') {
        currentNode = {
          type: 'numbered-list',
          children: [],
        };
      }

      const numberedListNode = currentNode as CustomElement & {
        children: CustomElement[];
      };
      numberedListNode.children.push({
        type: 'list-item',
        children: parseInlineText(numberedMatch[1]),
      });
      // eslint-disable-next-line no-continue
      continue;
    }

    // 普通段落
    if (currentNode && currentNode.type === 'paragraph') {
      // 繼續當前段落
      currentNode.children.push({ text: ' ' });
      currentNode.children.push(...parseInlineText(trimmedLine));
    } else {
      if (currentNode) nodes.push(currentNode);
      currentNode = {
        type: 'paragraph',
        children: parseInlineText(trimmedLine),
      };
    }
  }

  if (currentNode) {
    nodes.push(currentNode);
  }

  return nodes.length > 0
    ? nodes
    : [{ type: 'paragraph', children: [{ text: '' }] }];
};
