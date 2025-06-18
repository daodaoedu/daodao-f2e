import { useState } from "react";
import { MoreVertical, Shell, MessageCircle, Share2, User, Bookmark, Flag } from "lucide-react";
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

interface PlanCardProps {
  plan: {
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
  };
  onJoin?: (id: string) => void;
  onComment?: (id: string) => void;
  onShare?: (id: string) => void;
  onSave?: (id: string) => void;
  onReport?: (id: string) => void;
}

export function PlanCard({
  plan,
  onJoin,
  onComment,
  onShare,
  onSave,
  onReport
}: PlanCardProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <Card className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-3xl mx-auto bg-basic-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-basic-100 group relative">
      <CardContent className="p-3 sm:p-4 md:p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2 sm:mr-3">
              <User size={14} className="text-indigo-600" />
            </div>
            <div>
              <div>
                <span className="text-xs sm:text-sm font-medium text-basic-400 mr-2">
                  {plan.author.name}
                </span>
              </div>
              <div className="text-xs text-basic-300 mt-0.5">
                {plan.author.tags.join(' | ')}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2 mt-0">
            <Badge className="bg-indigo-100 text-indigo-800 text-xs hidden sm:inline-block">
              學習計劃
            </Badge>
            <div className="text-xs text-basic-300 hidden sm:block">{plan.publishDate}</div>
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
                      onSave?.(plan.id);
                      setIsDropdownOpen(false);
                    }}
                    className="flex items-center cursor-pointer"
                  >
                    <Bookmark size={14} className="mr-2" />
                    儲存
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      onReport?.(plan.id);
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

        <h3 className="font-bold text-basic-black mb-2 text-base sm:text-lg group-hover:text-indigo-600 transition-colors">
          {plan.title}
        </h3>

        <p className="text-basic-300 text-sm mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-none">
          {plan.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
          {plan.tags.slice(0, 2).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="px-1.5 py-0.5 sm:px-2 bg-basic-100 text-basic-300 text-xs font-medium rounded-full"
            >
              {tag}
            </Badge>
          ))}
          {plan.tags.length > 2 && (
            <Badge
              variant="secondary"
              className="px-1.5 py-0.5 sm:px-2 bg-basic-100 text-basic-300 text-xs font-medium rounded-full"
            >
              +{plan.tags.length - 2}
            </Badge>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-3 sm:mb-4">
          <div className="w-full relative">
            <Progress value={plan.progress} className="h-2" />
            <span className="absolute right-0 -top-6 text-xs text-basic-300 font-medium">
              {plan.progress}%
            </span>
          </div>
        </div>

        {/* Streak and Status Row */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center space-x-1">
            <span className="text-sm">🔥</span>
            <span className="text-xs text-basic-300 font-medium">{plan.streak}天</span>
          </div>
          <Badge
            className={
              plan.status === '已完成'
                ? 'bg-success/20 text-success'
                : 'bg-tips/20 text-tips'
            }
          >
            {plan.status}
          </Badge>
        </div>

        <div className="pt-3 sm:pt-4 border-t border-basic-100">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onJoin?.(plan.id)}
              className="flex items-center space-x-1 text-basic-300 hover:text-indigo-600 p-1"
            >
              <Shell size={14} />
              <span className="text-xs sm:text-sm font-medium">{plan.participants}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onComment?.(plan.id)}
              className="flex items-center space-x-1 text-basic-300 hover:text-indigo-600 p-1"
            >
              <MessageCircle size={14} />
              <span className="text-xs sm:text-sm">{plan.comments}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onShare?.(plan.id)}
              className="text-basic-300 hover:text-indigo-600 p-1"
            >
              <Share2 size={14} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
