import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { FiSearch } from 'react-icons/fi';
import { cn } from '@/utils/cn';

interface HeaderSearchProps {
  className?: string;
  mobileMode?: boolean;
}

const HeaderSearch: React.FC<HeaderSearchProps> = ({ className, mobileMode = false }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/new-search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  if (mobileMode) {
    return (
      <form
        onSubmit={handleSearch}
        className={cn("w-full px-4 py-2", className)}
      >
        <div className="relative flex w-full">
          <input
            type="text"
            placeholder="搜尋學習資源、計畫或揪團..."
            className="bg-primary-palest border-none rounded-full pl-4 pr-10 py-2 w-full text-basic-400 focus:ring-2 focus:ring-primary-base focus:outline-none placeholder-basic-300"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          <button
            type="submit"
            className="absolute right-0 top-0 h-full px-3 text-basic-400 hover:text-primary-base"
          >
            <FiSearch className="w-5 h-5" />
          </button>
        </div>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSearch}
      className={cn("relative", className)}
    >
      <div className={cn(
        "flex items-center h-10 rounded-full transition-all",
        isFocused
          ? "w-64 bg-white"
          : "w-10 bg-transparent hover:bg-primary-darker"
      )}
      >
        <input
          type="text"
          placeholder="搜尋學習資源、計畫或揪團..."
          className={cn(
            "h-full border-none outline-none bg-transparent",
            isFocused
              ? "pl-4 pr-10 w-full text-basic-400"
              : "w-0"
          )}
          ref={inputRef}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
          if (!searchQuery) {
            setIsFocused(false);
            }
        }}
        />
        <button
          type="button"
          onClick={(e) => {
            if (!isFocused) {
              e.preventDefault();
              setIsFocused(true);
              setTimeout(() => inputRef.current?.focus(), 10);
            } else if (searchQuery.trim()) {
                handleSearch(e as unknown as React.FormEvent);
              }
          }}
          className={cn(
            "h-full aspect-square flex items-center justify-center",
            isFocused
              ? "absolute right-0 text-basic-400"
              : "text-white"
          )}
        >
          <FiSearch className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
};

export default HeaderSearch;
