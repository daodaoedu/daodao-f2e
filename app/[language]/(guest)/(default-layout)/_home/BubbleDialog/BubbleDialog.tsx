'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/utils/cn';
import Image from 'next/image';

interface BubbleDialogProps {
  className?: string;
}

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
const type = (
  text: string,
  setCurrentText: React.Dispatch<React.SetStateAction<string>>,
  intervalsRef: React.MutableRefObject<Set<NodeJS.Timeout>>
): Promise<void> => {
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
const erase = (
  setCurrentText: React.Dispatch<React.SetStateAction<string>>,
  intervalsRef: React.MutableRefObject<Set<NodeJS.Timeout>>
): Promise<void> => {
  return new Promise((resolve) => {
    const eraseInterval = setInterval(() => {
      setCurrentText((prevText) => {
        if (prevText.length > 0) {
          return prevText.slice(0, -1);
        } 
          clearInterval(eraseInterval);
          intervalsRef.current.delete(eraseInterval);
          resolve();
          return '';
        
      });
    }, ERASE_SPEED);
    intervalsRef.current.add(eraseInterval);
  });
};

// 計算氣泡寬度以避免抖動
const fitBubbleWidth = (
  textRef: React.RefObject<HTMLDivElement | null>,
  setBubbleWidth: React.Dispatch<React.SetStateAction<number | null>>
) => {
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
const startAnimation = (
  setCurrentText: React.Dispatch<React.SetStateAction<string>>,
  intervalsRef: React.MutableRefObject<Set<NodeJS.Timeout>>
) => {
  let currentLineIndex = 0;
  let isAnimating = true;
  
  const animateNextLine = async () => {
    if (!isAnimating) return; // 如果動畫被停止，則退出
    
    if (currentLineIndex >= LINES.length) {
      currentLineIndex = 0; // 重新開始
    }
    
    const currentLine = LINES[currentLineIndex];
    await type(currentLine, setCurrentText, intervalsRef);
    await wait(PAUSE_DONE);
    await erase(setCurrentText, intervalsRef);
    await wait(PAUSE_NEXT);
    
    currentLineIndex += 1;
    
    // 使用 requestAnimationFrame 來確保動畫流暢
    if (isAnimating) {
      requestAnimationFrame(animateNextLine);
    }
  };
  
  animateNextLine();
  
  // 返回停止函數
  return () => {
    isAnimating = false;
  };
};

export function BubbleDialog({ className }: BubbleDialogProps) {
  const [currentText, setCurrentText] = useState('');
  const [bubbleWidth, setBubbleWidth] = useState<number | null>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const intervalsRef = useRef<Set<NodeJS.Timeout>>(new Set());

  useEffect(() => {
    // 計算氣泡寬度
    fitBubbleWidth(textRef, setBubbleWidth);
    
    // 開始動畫並獲取停止函數
    const stopAnimation = startAnimation(setCurrentText, intervalsRef);
    
    // 清理函數
    return () => {
      // 停止動畫
      stopAnimation();
      
      // 清理所有 interval
      intervalsRef.current.forEach((interval) => {
        clearInterval(interval);
      });
      intervalsRef.current.clear();
    };
  }, []);

  return (
    <div className={cn(
      'relative pb-[60px] pt-12 overflow-x-clip flex flex-col items-center justify-center min-h-[400px]',
      className
    )}>
      {/* 對話文字區域 */}
      <div className="w-full flex justify-between items-center pl-6 pr-[10%]  md:pr-[20%] md:text-xl">
        <p className="text-primary-darker font-medium">在這裡你可以...</p>
        <div 
          ref={textRef}
          id="type-animation"
          className="px-6 py-2 bg-primary-palest border-2 border-mascot-aqua rounded-[20px] inline-flex items-center whitespace-nowrap overflow-hidden leading-[1.4] h-10 relative"
          style={bubbleWidth ? { width: `${bubbleWidth}px` } : undefined}
        >
          {currentText}
          {/* 打字游標 */}
          <span className="inline-block w-[0.12em] h-4 ml-[0.1em] border-r-[0.12em] border-r-current animate-pulse translate-y-[1px]" />
        </div>
      </div>
      
      {/* 吉祥物區域 */}
      <div className="pr-6 pt-6 text-xl md:text-3xl font-semibold w-full relative z-10 mt-5 md:pr-[20%] ">
        <div className="relative rounded-tr-[100px] bg-mascot-brightBlue py-[60px] min-h-[120px] flex items-center justify-center">
          <div className="text-left w-full">
            <Image 
              src="/assets/landing-page/mascot-face.svg" 
              width={118} 
              height={92} 
              alt="吉祥物臉部"
              className="absolute -top-5 right-[3px] z-[2]"
            />
            <p className="text-basic-white my-2 font-semibold mb-1 w-full px-6">讓學習從壓力來源</p>
            <p className="text-basic-darker my-2 font-semibold w-full px-6">變成生活中最期待的部分</p>
          </div>
        </div>
      </div>
      
      {/* 綠色圓弧裝飾圖片 */}
      <Image 
        src="/assets/landing-page/deco-island.svg" 
        width={208} 
        height={208} 
        alt="綠色圓弧裝飾"
        className="absolute right-[calc(208px/2)] bottom-0"
      />
    </div>
  );
}
