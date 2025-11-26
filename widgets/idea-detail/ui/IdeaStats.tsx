import { Eye, Share2 } from 'lucide-react';
import Shell from '@/public/assets/icons/shell.svg';
import Comment from '@/public/assets/icons/comment.svg';
import type { IdeaSchema } from '@/services/ideas';

interface IdeaStatsProps {
  idea: IdeaSchema;
}

export function IdeaStats({ idea }: IdeaStatsProps) {
  return (
    <footer className="pt-6">
      <div className="flex items-center justify-end gap-4 text-xs text-basic-300">
        <div className="flex items-center gap-1">
          <Shell />
          <span>{idea.likeCount || 0}</span>
        </div>
        <div className="flex items-center gap-1">
          <Comment />
          <span>{idea.commentCount || 0}</span>
        </div>
        <div className="flex items-center gap-1">
          <Eye className="h-4 w-4" />
          <span>{idea.viewCount || 0}</span>
        </div>
        <div className="flex items-center gap-1">
          <Share2 className="h-4 w-4" />
          <span>{idea.shareCount || 0}</span>
        </div>
      </div>
    </footer>
  );
}
