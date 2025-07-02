import { useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    <div className={cn("relative", className)}>
      {isExpanded ? (
        <div className="flex items-center">
          <div className="relative">
            <Input
              type="text"
              placeholder="搜尋主題實踐、想法..."
              className="w-64 pl-10 pr-8 py-2 border border-basic-white/20 bg-basic-white/10 backdrop-blur-sm text-basic-white placeholder:text-basic-white/70 rounded-3xl focus:ring-2 focus:ring-basic-white/50 focus:border-transparent focus:bg-basic-white focus:text-basic-black focus:placeholder:text-basic-300"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
            />
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-basic-white/70" />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 text-basic-white/70 hover:text-basic-white h-6 w-6 p-0 rounded-lg"
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
          className="text-basic-white/70 hover:text-basic-white p-2 rounded-lg hover:bg-basic-white/10 transition-colors"
          onClick={() => setIsExpanded(true)}
        >
          <Search size={20} />
        </Button>
      )}
    </div>
  );
}
