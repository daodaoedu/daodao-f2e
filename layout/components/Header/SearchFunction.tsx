import { useState } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

interface SearchFunctionProps {
  onSearch: (query: string) => void;
  onSearchToggle?: (isActive: boolean) => void;
  className?: string;
}

export function SearchFunction({ onSearch, onSearchToggle, className }: SearchFunctionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery);
      onSearchToggle?.(true);
      setIsExpanded(false);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    onSearch('');
    onSearchToggle?.(false);
    setIsExpanded(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleBlur = () => {
    if (!searchQuery.trim()) {
      setIsExpanded(false);
    }
  };

  return (
    <div className={cn('relative', className)}>
      {isExpanded ? (
        <div className="flex items-center">
          <div className="relative">
            <Input
              type="text"
              placeholder="搜尋主題實踐、想法..."
              className="w-64 rounded-3xl border border-basic-white/20 bg-basic-white/10 py-2 pl-10 pr-8 text-basic-white backdrop-blur-sm placeholder:text-basic-white/70 focus:border-transparent focus:bg-basic-white focus:text-basic-black focus:ring-2 focus:ring-basic-white/50 focus:placeholder:text-basic-300"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
            />
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-basic-white/70" />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="absolute right-1 top-1/2 size-6 -translate-y-1/2 rounded-lg p-0 text-basic-white/70 hover:text-basic-white"
              >
                ✕
              </Button>
            )}
          </div>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          className="rounded-lg p-2 text-basic-white/70 transition-colors hover:bg-basic-white/10 hover:text-basic-white"
          onClick={() => setIsExpanded(true)}
        >
          <Search size={20} />
        </Button>
      )}
    </div>
  );
}
