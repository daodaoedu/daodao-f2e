import React, { useEffect } from 'react';
// 第一個 import 不使用的变量
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { v4 as uuidv4 } from 'uuid';
import { colors } from '@/constants/light-path';

interface ConfettiProps {
  active: boolean;
}

const Confetti: React.FC<ConfettiProps> = ({ active }) => {
  useEffect(() => {
    // 如果不活躍則返回
    if (!active) return () => {};

    // 創建一個全局動畫樣式
    const styleEl = document.createElement('style');
    styleEl.setAttribute('id', 'confetti-animation-style');
    styleEl.innerHTML = `
      @keyframes fall {
        0% {
          transform: translateY(0) rotate(0deg);
          opacity: 1;
        }
        100% {
          transform: translateY(100vh) rotate(360deg);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(styleEl);

    // 清理函式
    return () => {
      const existingStyle = document.getElementById('confetti-animation-style');
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, [active]);

  if (!active) return null;
  const uniqueId = uuidv4();

  // 生成紙屑碎片
  const pieces = Array(100).fill(0).map(() => {
    const left = Math.random() * 100;
    // 刪除未使用的 top 屬性
    const size = Math.random() * 10 + 5;
    const duration = Math.random() * 1 + 2;
    const delay = Math.random() * 0.5;

    // 隨機選擇一個顏色
    const colorOptions = [colors.primary, colors.secondary, colors.accent, colors.background];
    const color = colorOptions[Math.floor(Math.random() * colorOptions.length)];

    // 創建不同形狀以增加變化
    const shapeType = Math.floor(Math.random() * 3);
    let shape = 'rounded-sm'; // 默認矩形
    if (shapeType === 1) shape = 'rounded-full'; // 圓形
    if (shapeType === 2) shape = 'rotate-45 rounded-sm'; // 菱形

    return (
      <div
        key={`confetti-${uniqueId}`}
        className={`absolute ${shape}`}
        style={{
          left: `${left}%`,
          top: `-5%`,
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: color,
          animation: `fall ${duration}s ease-in ${delay}s forwards`,
          opacity: 0,
        }}
      />
    );
  });

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces}
    </div>
  );
};

export default Confetti;
