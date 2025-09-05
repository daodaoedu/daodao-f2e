'use client';

import { useState } from 'react';
import { cn } from '@/utils/cn';

interface MobileMenuProps {
  className?: string;
}

export function MobileMenu({ className }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { label: '首頁', href: '#home' },
    { label: '特色', href: '#features' },
    { label: '功能', href: '#functions' },
    { label: '方案', href: '#plans' },
    { label: '關於', href: '#about' },
  ];

  return (
    <div className={cn('fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200', className)}>
      <div className="flex justify-around items-center py-2">
        {menuItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="flex flex-col items-center space-y-1 px-3 py-2 text-xs text-gray-600 hover:text-primary transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <span>{item.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
