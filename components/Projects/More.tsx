import { Button } from '@/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { EllipsisVertical } from 'lucide-react';

interface MoreProps {
  projectId: string;
}
export default function More({ projectId }: MoreProps) {
  return (
    <div className="absolute right-0 top-0">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="p-0">
            <EllipsisVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="mt-4">
          <DropdownMenuItem asChild>
            <a
              href={`/manage/projects/detail?id=${projectId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-[146px]"
            >
              計畫檔案
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
