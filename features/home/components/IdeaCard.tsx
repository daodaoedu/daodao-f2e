import { useState } from "react";
import { MoreVertical, Shell, MessageCircle, Share2, Link as LinkIcon, Bookmark, Flag } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/atoms/dropdown-menu";
import { Badge } from "@/components/atoms/badge";

interface IdeaCardProps {
  idea: {
    id: string;
    author: {
      name: string;
      avatar?: string;
      tags: string[];
    };
    content: string;
    tags: string[];
    link?: string;
    publishDate: string;
    likes: number;
    comments: number;
  };
  onLike?: (id: string) => void;
  onComment?: (id: string) => void;
  onShare?: (id: string) => void;
  onSave?: (id: string) => void;
  onReport?: (id: string) => void;
}

export function IdeaCard({
  idea,
  onLike,
  onComment,
  onShare,
  onSave,
  onReport
}: IdeaCardProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <Card className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-3xl mx-auto bg-basic-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-basic-100 relative">
      <CardContent className="p-3 sm:p-4 md:p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary-base flex items-center justify-center mr-2 sm:mr-3">
              <span className="text-basic-white text-xs sm:text-sm font-bold">
                {idea.author.name.charAt(0)}
              </span>
            </div>
            <div>
              <div>
                <span className="text-xs sm:text-sm font-medium text-basic-400 mr-2">
                  {idea.author.name}
                </span>
              </div>
              <div className="text-xs text-basic-300 mt-0.5">
                {idea.author.tags.join(' | ')}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2 mt-0">
            <Badge
              style={{ backgroundColor: '#ffa10b' }}
              className="text-basic-white text-xs hidden sm:inline-block"
            >
              想法
            </Badge>
            <div className="text-xs text-basic-300 hidden sm:block">{idea.publishDate}</div>
            <div className="relative">
              <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 text-basic-300 hover:text-basic-400 hover:bg-basic-100 rounded-lg transition-colors"
                  >
                    <MoreVertical size={14} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-32" align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      onSave?.(idea.id);
                      setIsDropdownOpen(false);
                    }}
                    className="flex items-center cursor-pointer"
                  >
                    <Bookmark size={14} className="mr-2" />
                    儲存
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      onReport?.(idea.id);
                      setIsDropdownOpen(false);
                    }}
                    className="flex items-center cursor-pointer"
                  >
                    <Flag size={14} className="mr-2" />
                    檢舉
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <p className="text-basic-black mb-3 sm:mb-4 text-sm sm:text-base line-clamp-3 sm:line-clamp-none">{idea.content}</p>

        <div className="flex gap-1 sm:gap-2 mb-3 sm:mb-4 flex-wrap">
          {idea.tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="px-1.5 py-0.5 sm:px-2 bg-basic-100 text-basic-300 text-xs font-medium rounded-full"
            >
              {tag}
            </Badge>
          ))}
        </div>

        {idea.link && (
          <div className="flex items-center p-2 sm:p-3 bg-primary-lightest rounded-lg mb-3 sm:mb-4">
            <LinkIcon size={14} className="text-primary-base mr-1 sm:mr-2 flex-shrink-0" />
            <Button
              variant="ghost"
              onClick={() => window.open(idea.link, '_blank')}
              className="text-primary-darker text-xs sm:text-sm truncate p-0 h-auto hover:underline"
            >
              {idea.link}
            </Button>
          </div>
        )}

        <div className="pt-3 sm:pt-4 border-t border-basic-100">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLike?.(idea.id)}
              className="flex items-center space-x-1 text-basic-300 hover:text-primary-base p-1"
            >
              <Shell size={14} />
              <span className="text-xs sm:text-sm font-medium">{idea.likes}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onComment?.(idea.id)}
              className="flex items-center space-x-1 text-basic-300 hover:text-primary-base p-1"
            >
              <MessageCircle size={14} />
              <span className="text-xs sm:text-sm">{idea.comments}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onShare?.(idea.id)}
              className="text-basic-300 hover:text-primary-base p-1"
            >
              <Share2 size={14} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
