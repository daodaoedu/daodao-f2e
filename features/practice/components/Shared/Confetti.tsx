import React, { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { colors } from '@/constants/practice';

interface ConfettiProps {
  active: boolean;
}

// 定義在組件外面避免重複創建
const CONFETTI_INDICES = Array.from({ length: 100 }, (_, i) => i);

const Confetti: React.FC<ConfettiProps> = ({ active }) => {
  useEffect(() => {
    if (!active) return () => {};

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

    return () => {
      const existingStyle = document.getElementById('confetti-animation-style');
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, [active]);

  if (!active) return null;

  const uniqueId = uuidv4();

  const pieces = CONFETTI_INDICES.map((index) => {
    const left = Math.random() * 100;
    const size = Math.random() * 10 + 5;
    const duration = Math.random() * 1 + 2;
    const delay = Math.random() * 0.5;

    const colorOptions = [colors.primary, colors.secondary, colors.accent, colors.background];
    const color = colorOptions[Math.floor(Math.random() * colorOptions.length)];

    const shapeType = Math.floor(Math.random() * 3);
    let shape = 'rounded-sm';
    if (shapeType === 1) shape = 'rounded-full';
    if (shapeType === 2) shape = 'rotate-45 rounded-sm';

    return (
      <div
        key={`confetti-${uniqueId}-${index}`}
        className={`absolute ${shape}`}
        style={{
          left: `${left}%`,
          top: '-5%',
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
