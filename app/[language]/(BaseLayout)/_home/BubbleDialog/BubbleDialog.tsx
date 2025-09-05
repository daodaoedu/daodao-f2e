'use client';

import './BubbleDialog.css';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/utils/cn';
import Image from 'next/image';

interface BubbleDialogProps {
  className?: string;
}

export function BubbleDialog({ className }: BubbleDialogProps) {
  const [currentText, setCurrentText] = useState('');
  const [bubbleWidth, setBubbleWidth] = useState<number | null>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const intervalsRef = useRef<Set<NodeJS.Timeout>>(new Set());

  // 使用 type-animation.js 的相同設定
  const LINES = [
    '看看別人怎麼做',
    '參考成功案例',
    '從作品得到靈感',
    '把方法帶回你的計畫',
  ];

  const TYPE_SPEED = 120;   // 打字速度（每字）
  const PAUSE_DONE = 1900;  // 打完停留
  const ERASE_SPEED = 100;  // 退格速度
  const PAUSE_NEXT = 200;   // 換句前的間隔

  // 等待函數
  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // 打字動畫
  const type = (text: string): Promise<void> => {
    return new Promise((resolve) => {
      let i = 0;
      const typeInterval = setInterval(() => {
        if (i < text.length) {
          setCurrentText(text.slice(0, i + 1));
          i += 1;
        } else {
          clearInterval(typeInterval);
          intervalsRef.current.delete(typeInterval);
          resolve();
        }
      }, TYPE_SPEED);
      intervalsRef.current.add(typeInterval);
    });
  };

  // 退格動畫
  const erase = (): Promise<void> => {
    return new Promise((resolve) => {
      const eraseInterval = setInterval(() => {
        setCurrentText((prevText) => {
          if (prevText.length > 0) {
            return prevText.slice(0, -1);
          } else {
            clearInterval(eraseInterval);
            intervalsRef.current.delete(eraseInterval);
            resolve();
            return '';
          }
        });
      }, ERASE_SPEED);
      intervalsRef.current.add(eraseInterval);
    });
  };

  // 計算氣泡寬度以避免抖動
  const fitBubbleWidth = () => {
    if (!textRef.current) return;
    
    const probe = document.createElement('span');
    probe.style.cssText = `
      position: absolute; 
      visibility: hidden; 
      white-space: nowrap;
      font: ${getComputedStyle(textRef.current).font};
    `;
    document.body.appendChild(probe);
    
    let max = 0;
    LINES.forEach((s) => {
      probe.textContent = s;
      max = Math.max(max, probe.getBoundingClientRect().width);
    });
    document.body.removeChild(probe);
    
    // 加上內邊距與邊框
    const styles = getComputedStyle(textRef.current);
    const padX = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
    const borderX = parseFloat(styles.borderLeftWidth) + parseFloat(styles.borderRightWidth);
    setBubbleWidth(Math.ceil(max + padX + borderX));
  };

  // 開始動畫
  const startAnimation = () => {
    let currentLineIndex = 0;
    let isAnimating = true;
    
    const animateNextLine = async () => {
      if (!isAnimating) return; // 如果動畫被停止，則退出
      
      if (currentLineIndex >= LINES.length) {
        currentLineIndex = 0; // 重新開始
      }
      
      const currentLine = LINES[currentLineIndex];
      await type(currentLine);
      await wait(PAUSE_DONE);
      await erase();
      await wait(PAUSE_NEXT);
      
      currentLineIndex += 1;
      
      // 使用 requestAnimationFrame 來確保動畫流暢
      if (isAnimating) {
        requestAnimationFrame(() => {
          setTimeout(animateNextLine, 0);
        });
      }
    };
    
    animateNextLine();
    
    // 返回停止函數
    return () => {
      isAnimating = false;
    };
  };

  useEffect(() => {
    // 計算氣泡寬度
    fitBubbleWidth();
    
    // 開始動畫並獲取停止函數
    const stopAnimation = startAnimation();
    
    // 清理函數
    return () => {
      // 停止動畫
      stopAnimation();
      
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
      // 清理所有 interval
      intervalsRef.current.forEach((interval) => {
        clearInterval(interval);
      });
      intervalsRef.current.clear();
    };
  }, []);

  return (
    <div className={cn('section-block bubble-dialog', className)}>
      <div className="dialog-text">
        <p className="text-dark-green">在這裡你可以...</p>
        <div 
          ref={textRef}
          id="type-animation"
          style={bubbleWidth ? { width: `${bubbleWidth}px` } : {}}
        >
          {currentText}
        </div>
      </div>
      <div className="block-mascot">
        <div className="block-mascot-body">
          <div className="container">
            <Image 
              src="/assets/landing-page/mascot-face.svg" 
              width={118} 
              height={92} 
              alt="吉祥物臉部"
            />
            <p className="text-white">讓學習從壓力來源</p>
            <p>變成生活中最期待的部分</p>
          </div>
        </div>
      </div>
      {/* 綠色圓弧裝飾圖片 */}
      <Image 
        src="/assets/landing-page/deco-island.svg" 
        width={208} 
        height={208} 
        alt="綠色圓弧裝飾"
        className="position-absolute"
        style={{ right: 'calc(208px / 2)', bottom: 0 }}
      />
    </div>
  );
}
