import { useState } from "react";
import { MoreVertical, Shell, MessageCircle, Share2, User, Bookmark, Flag, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface PracticeCardProps {
  practice: {
    id: string;
    title: string;
    author: {
      name: string;
      avatar?: string;
      tags: string[];
    };
    description: string;
    tags: string[];
    publishDate: string;
    participants: number;
    comments: number;
    progress: number;
    streak: number;
    status: '進行中' | '已完成';
    category?: string;
  };
  onJoin?: (id: string) => void;
  onComment?: (id: string) => void;
  onShare?: (id: string) => void;
  onSave?: (id: string) => void;
  onReport?: (id: string) => void;
}

export function PracticeCard({
  practice,
  onJoin,
  onComment,
  onShare,
  onSave,
  onReport
}: PracticeCardProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <Card className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-3xl mx-auto bg-basic-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-basic-100 group relative">
      <CardContent className="p-3 sm:p-4 md:p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary-lightest flex items-center justify-center mr-2 sm:mr-3">
              <User size={14} className="text-primary-base" />
            </div>
            <div>
              <div>
                <span className="text-xs sm:text-sm font-medium text-basic-400 mr-2">
                  {practice.author.name}
                </span>
              </div>
              <div className="text-xs text-basic-300 mt-0.5">
                {practice.author.tags.join(' | ')}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2 mt-0">
            <Badge className="bg-primary-lightest text-primary-darker text-xs hidden sm:inline-block">
              主題實踐
            </Badge>
            <div className="text-xs text-basic-300 hidden sm:block">{practice.publishDate}</div>
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
                      onSave?.(practice.id);
                      setIsDropdownOpen(false);
                    }}
                    className="flex items-center cursor-pointer"
                  >
                    <Bookmark size={14} className="mr-2" />
                    儲存
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      onReport?.(practice.id);
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

        <h3 className="font-bold text-basic-black mb-2 text-base sm:text-lg group-hover:text-primary-base transition-colors flex items-center">
          {practice.title}
          {practice.category && (
            <Badge className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              {practice.category}
            </Badge>
          )}
        </h3>

        <p className="text-basic-300 text-sm mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-none">
          {practice.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
          {practice.tags.slice(0, 2).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="px-1.5 py-0.5 sm:px-2 bg-basic-100 text-basic-300 text-xs font-medium rounded-full"
            >
              {tag}
            </Badge>
          ))}
          {practice.tags.length > 2 && (
            <Badge
              variant="secondary"
              className="px-1.5 py-0.5 sm:px-2 bg-basic-100 text-basic-300 text-xs font-medium rounded-full"
            >
              +{practice.tags.length - 2}
            </Badge>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-3 sm:mb-4">
          <div className="w-full bg-basic-200 rounded-full h-2 relative">
            <Progress
              value={practice.progress}
              className="h-2 bg-primary-base rounded-full"
            />
            <span className="absolute right-0 -top-6 text-xs text-basic-300 font-medium">
              {practice.progress}%
            </span>
          </div>
        </div>

        {/* Streak and Status Row */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center space-x-1">
            <Flame className="h-3 w-3 text-orange-500" />
            <span className="text-xs text-basic-300 font-medium">{practice.streak}天</span>
          </div>
          <Badge
            className={
              practice.status === '已完成'
                ? 'bg-success/20 text-success'
                : 'bg-tips/20 text-tips'
            }
          >
            {practice.status}
          </Badge>
        </div>

        <div className="pt-3 sm:pt-4 border-t border-basic-100">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onJoin?.(practice.id)}
              className="flex items-center space-x-1 text-basic-300 hover:text-primary-base p-1"
            >
              <Shell size={14} />
              <span className="text-xs sm:text-sm font-medium">{practice.participants}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onComment?.(practice.id)}
              className="flex items-center space-x-1 text-basic-300 hover:text-primary-base p-1"
            >
              <MessageCircle size={14} />
              <span className="text-xs sm:text-sm">{practice.comments}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onShare?.(practice.id)}
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
