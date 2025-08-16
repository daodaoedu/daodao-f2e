import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
            className="text-[#536166] p-[5px] min-w-0 rounded-full"
          >
            <EllipsisVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="rounded-lg min-w-[150px] p-3 shadow-lg">
          <DropdownMenuItem asChild className="p-2">
            <a
              href="https://forms.gle/NkVbDWC3eXk4P4gv7"
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-[146px] block"
            >
              檢舉
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
