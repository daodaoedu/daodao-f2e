import { Button } from '@/shared/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/ui/dropdown-menu';
import { EllipsisVertical } from 'lucide-react';

// Styled components removed - using shadcn DropdownMenu instead

export default function Dropdown({ sx }) {
  const style = sx || {};

  return (
    <div style={style}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="min-w-0 rounded-full p-[5px] text-[#536166]"
          >
            <EllipsisVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-[150px] rounded-lg p-3 shadow-lg">
          <DropdownMenuItem asChild className="p-2">
            <a
              href="https://forms.gle/NkVbDWC3eXk4P4gv7"
              target="_blank"
              rel="noopener noreferrer"
              className="block min-w-[146px]"
            >
              檢舉
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
