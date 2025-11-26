'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/shared/ui';

interface TextCollapseProps {
  text: string | null | undefined;
  maxLines?: number;
  className?: string;
  showMoreText?: string;
  showLessText?: string;
}

// 複製樣式到目標元素
const copyStylesToElement = (target: HTMLElement, source: HTMLElement) => {
  const styles = getComputedStyle(source);
  Object.assign(target.style, {
    width: `${source.offsetWidth}px`,
    fontSize: styles.fontSize,
    fontFamily: styles.fontFamily,
    lineHeight: styles.lineHeight,
    fontWeight: styles.fontWeight,
    letterSpacing: styles.letterSpacing,
  });
};

// 通用測量函數
const measureElement = (
  containerElement: HTMLElement,
  content: string,
  button?: HTMLButtonElement
): number => {
  const element = document.createElement('div');
  element.style.visibility = 'hidden';
  element.style.position = 'absolute';
  element.style.top = '0';
  element.style.left = '0';
  element.style.whiteSpace = 'pre-wrap';
  element.style.overflowWrap = 'break-word';

  copyStylesToElement(element, containerElement);

  if (button) {
    const buttonStyle = getComputedStyle(button);
    const space =
      button.offsetWidth +
      parseFloat(buttonStyle.marginLeft) +
      parseFloat(buttonStyle.marginRight);
    element.innerHTML = `${content}<span style="display: inline-block; width: ${space}px;"></span>`;
  } else {
    element.textContent = content;
  }

  document.body.appendChild(element);
  const height = element.scrollHeight;
  document.body.removeChild(element);

  return height;
};

export const TextCollapse = ({
  text,
  maxLines = 2,
  className = '',
  showMoreText = '顯示更多',
  showLessText = '顯示更少',
}: TextCollapseProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldShowButton, setShouldShowButton] = useState(false);
  const [truncatedText, setTruncatedText] = useState('');
  const [isCalculated, setIsCalculated] = useState(false);
  const containerRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const calculateTruncation = () => {
      if (!containerRef.current || !buttonRef.current || !text) {
        setShouldShowButton(false);
        setTruncatedText(text || '');
        return;
      }

      const container = containerRef.current;
      const button = buttonRef.current;

      // 測量文本尺寸
      const fullHeight = measureElement(container, text);
      const lineHeight = measureElement(container, 'A');
      const maxHeight = lineHeight * maxLines;

      // 檢查是否需要截斷
      if (fullHeight <= maxHeight) {
        setShouldShowButton(false);
        setTruncatedText(text);
        return;
      }

      setShouldShowButton(true);

      // 二分搜索找到最佳截斷點
      let left = 0;
      let right = text.length;
      let bestResult = '';

      while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const testText = `${text.substring(0, mid)}...`;
        const testHeight = measureElement(container, testText, button);

        if (testHeight <= maxHeight) {
          bestResult = testText;
          left = mid + 1;
        } else {
          right = mid - 1;
        }
      }

      setTruncatedText(bestResult);
      setIsCalculated(true);
    };

    calculateTruncation();

    const resizeObserver = new ResizeObserver(calculateTruncation);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [text, maxLines, showMoreText]);

  if (!text) return null;

  const displayText = isExpanded
    ? text
    : isCalculated && shouldShowButton
      ? truncatedText
      : text;

  const buttonText = isExpanded ? showLessText : showMoreText;
  const showButton = shouldShowButton && (isExpanded || isCalculated);

  return (
    <p
      ref={containerRef}
      className={className}
      style={{
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
        // 在計算完成前使用 CSS 限制行數，避免閃爍
        ...(!isCalculated &&
          !isExpanded && {
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: maxLines,
            overflow: 'hidden',
          }),
      }}
    >
      {displayText}
      <Button
        ref={buttonRef}
        variant="ghost"
        size="sm"
        className={`hover:text-primary-dark ml-2 h-auto p-0 text-primary-base ${
          !showButton ? 'invisible' : ''
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
        disabled={!showButton}
        aria-hidden={!showButton}
      >
        {buttonText}
      </Button>
    </p>
  );
};
