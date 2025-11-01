'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/shared/ui';
import { cn } from '../lib/cn';

interface TextCollapseProps {
  text: string | null | undefined;
  maxLines?: number;
  className?: string;
  showMoreText?: string;
  showLessText?: string;
}

const TextCollapseButton = ({
  children,
  ...props
}: React.ComponentProps<typeof Button>) => (
  <Button
    variant="ghost"
    size="sm"
    className="hover:text-primary-dark ml-2 h-auto p-0 text-primary-base"
    {...props}
  >
    {children}
  </Button>
);

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
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const calculateTruncation = () => {
      if (
        !containerRef.current ||
        !measureRef.current ||
        !buttonRef.current ||
        !text
      ) {
        setShouldShowButton(false);
        setTruncatedText(text || '');
        return;
      }

      // 設置測量元素的樣式與容器一致
      const containerStyles = getComputedStyle(containerRef.current);
      measureRef.current.style.width = `${containerRef.current.offsetWidth}px`;
      measureRef.current.style.fontSize = containerStyles.fontSize;
      measureRef.current.style.fontFamily = containerStyles.fontFamily;
      measureRef.current.style.lineHeight = containerStyles.lineHeight;
      measureRef.current.style.fontWeight = containerStyles.fontWeight;
      measureRef.current.style.letterSpacing = containerStyles.letterSpacing;

      // 測量完整文本
      measureRef.current.textContent = text;
      const fullHeight = measureRef.current.scrollHeight;

      // 測量單行高度
      measureRef.current.textContent = 'A';
      const lineHeight = measureRef.current.scrollHeight;
      const maxHeight = lineHeight * maxLines;

      // 如果文本不超過最大高度，不需要截斷
      if (fullHeight <= maxHeight) {
        setShouldShowButton(false);
        setTruncatedText(text);
        return;
      }

      setShouldShowButton(true);

      // 獲取按鈕實際寬度
      const buttonWidth = buttonRef.current.offsetWidth;

      // 使用二分搜索找到最佳截斷點
      let left = 0;
      let right = text.length;
      let result = '';

      while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const testText = `${text.substring(0, mid)}...`;

        // 創建一個臨時測試元素，模擬實際的顯示效果
        const tempDiv = document.createElement('div');
        tempDiv.style.visibility = 'hidden';
        tempDiv.style.position = 'absolute';
        tempDiv.style.width = `${containerRef.current.offsetWidth}px`;
        tempDiv.style.fontSize = containerStyles.fontSize;
        tempDiv.style.fontFamily = containerStyles.fontFamily;
        tempDiv.style.lineHeight = containerStyles.lineHeight;
        tempDiv.style.fontWeight = containerStyles.fontWeight;
        tempDiv.style.letterSpacing = containerStyles.letterSpacing;
        tempDiv.style.whiteSpace = 'pre-wrap';
        tempDiv.style.overflowWrap = 'break-word';

        // 創建與實際顯示相同的結構
        tempDiv.innerHTML = `${testText}<span style="margin-left: 4px; display: inline-block; width: ${buttonWidth}px; height: 1em;"></span>`;
        document.body.appendChild(tempDiv);

        const testHeight = tempDiv.scrollHeight;
        document.body.removeChild(tempDiv);

        if (testHeight <= maxHeight) {
          result = testText;
          left = mid + 1;
        } else {
          right = mid - 1;
        }
      }

      setTruncatedText(result);
      setIsCalculated(true);
    };

    calculateTruncation();

    const resizeObserver = new ResizeObserver(calculateTruncation);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [text, maxLines]);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  if (!text) {
    return null;
  }

  return (
    <div ref={containerRef} className="relative">
      {/* 隱藏的測量元素 */}
      <div
        ref={measureRef}
        className={cn('invisible absolute', className)}
        style={{
          top: 0,
          left: 0,
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
        }}
        aria-hidden="true"
      />

      {/* 隱藏的按鈕測量元素 */}
      <span
        ref={buttonRef}
        className="invisible absolute"
        style={{ top: 0, left: 0 }}
        aria-hidden="true"
      >
        <TextCollapseButton>{showMoreText}</TextCollapseButton>
      </span>

      {/* 實際顯示的內容 */}
      <div
        className={className}
        style={{
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          // 在計算完成前使用 CSS 限制行數，避免閃爍
          ...((!isCalculated && !isExpanded) && {
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: maxLines,
            overflow: 'hidden',
          }),
        }}
      >
        {isExpanded ? (
          <>
            {text}
            {shouldShowButton && (
              <TextCollapseButton onClick={handleToggle}>
                {showLessText}
              </TextCollapseButton>
            )}
          </>
        ) : (
          <>
            {isCalculated && shouldShowButton ? truncatedText : text}
            {shouldShowButton && isCalculated && (
              <TextCollapseButton onClick={handleToggle}>
                {showMoreText}
              </TextCollapseButton>
            )}
          </>
        )}
      </div>
    </div>
  );
};
