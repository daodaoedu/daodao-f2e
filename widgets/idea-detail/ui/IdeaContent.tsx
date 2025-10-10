import { Link as LinkIcon } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import type { IdeaSchema, IdeaResourceSchema } from '@/services/ideas';

interface IdeaContentProps {
  idea: IdeaSchema;
}

export function IdeaContent({ idea }: IdeaContentProps) {
  return (
    <main>
      <div className="prose max-w-none">
        <p className="text-basic-500 leading-relaxed whitespace-pre-wrap">{idea.content}</p>
      </div>

      {/* 標籤 */}
      {idea.tags && idea.tags.length > 0 && (
        <div className="mt-6">
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {idea.tags.map((tag: string) => (
              <Badge
                key={tag}
                variant="secondary"
                className="px-1.5 py-0.5 sm:px-2 bg-basic-100 text-basic-300 text-xs font-medium rounded-full"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* 資源連結 */}
      {idea.resources && idea.resources.length > 0 && (
        <div className="mt-6">
          <div className="space-y-3">
            {idea.resources.map((resource: IdeaResourceSchema) => (
              <div
                key={resource.url}
                className="flex items-center p-2 sm:p-3 bg-primary-lightest rounded-lg"
              >
                <LinkIcon size={14} className="text-primary-base mr-1 sm:mr-2 flex-shrink-0" />
                {resource.url ? (
                  <Button
                    variant="ghost"
                    onClick={() => window.open(resource.url, '_blank')}
                    className="text-primary-darker text-xs sm:text-sm truncate p-0 h-auto hover:underline"
                  >
                    {resource.name}
                  </Button>
                ) : (
                  <span className="text-primary-darker text-xs sm:text-sm truncate">
                    {resource.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
