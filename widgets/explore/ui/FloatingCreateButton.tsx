'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Lightbulb, Target, BookOpen } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import type { FloatingCreateButtonProps } from '../types';

// TODO: Add translation support after keys are added to Google Sheets
export function FloatingCreateButton({ onCreateIdea }: FloatingCreateButtonProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const createOptions = [
    { label: '想法', action: 'idea', icon: Lightbulb },
    { label: '主題實踐', path: '/practice/create', icon: Target },
    { label: '學習計劃', path: '/projects/create', icon: BookOpen },
  ];

  const handleCreate = (pathOrAction: string) => {
    if (pathOrAction === 'idea') {
      onCreateIdea();
    } else {
      router.push(pathOrAction);
    }
    setShowMenu(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowMenu(false);
      buttonRef.current?.focus();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  return (
    <div ref={menuRef} className="fixed bottom-6 right-6 z-50">
      {showMenu && (
        <div
          className="absolute bottom-16 right-0 bg-basic-white rounded-lg shadow-lg border border-basic-200 p-2 min-w-[160px]"
          role="menu"
          aria-label="創建選單"
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          {createOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <Button
                key={option.label}
                variant="ghost"
                onClick={() => handleCreate(option.path || option.action || '')}
                role="menuitem"
                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-basic-100 rounded-md justify-start h-auto"
              >
                <IconComponent className="h-4 w-4 text-basic-500" aria-hidden="true" />
                <span className="text-sm font-medium text-basic-500">{option.label}</span>
              </Button>
            );
          })}
        </div>
      )}

      <Button
        ref={buttonRef}
        onClick={() => setShowMenu(!showMenu)}
        aria-label="創建新項目"
        aria-expanded={showMenu}
        aria-haspopup="menu"
        className="bg-primary-base hover:bg-primary-darker text-primary-foreground rounded-full p-4 shadow-lg transition-colors h-auto"
      >
        <Plus className="h-6 w-6" aria-hidden="true" />
      </Button>
    </div>
  );
}
