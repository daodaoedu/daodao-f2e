import { useState } from "react";
import { useRouter } from 'next/navigation';
import { Plus, Lightbulb, Target, BookOpen, ChevronDown, MoreVertical, Shell, MessageCircle, Share2, Link as LinkIcon, Bookmark, Flag, User, Flame } from 'lucide-react';
import SEOConfig from '@/components/SEOConfig';
import getPrivateLayout from '@/layout/core/getPrivateLayout';
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
import { Container } from "@/components/ui/container";
import { cn } from "@/utils/cn";

// ========================================
// ExploreTabs Component
// ========================================
interface ExploreTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onCreateNew: (type: string) => void;
}

function ExploreTabs({ activeTab, onTabChange, onCreateNew }: ExploreTabsProps) {
  const tabs = ['推薦', '主題實踐', '學習計劃', '想法'];

  const createOptions = [
    {
      id: 'practice',
      title: '主題實踐',
      description: '短期專注練習 (7-30天)'
    },
    {
      id: 'plan',
      title: '學習計劃',
      description: '深度系統學習 (2-6個月)'
    },
    {
      id: 'idea',
      title: '想法',
      description: '快速分享洞察'
    }
  ];

  return (
    <div className="border-b border-basic-200 mb-4 sm:mb-8 flex justify-center bg-basic-100 py-2 sm:py-4 px-4">
      <div className="w-full max-w-3xl">
        <nav className="flex items-center justify-between -mb-px">
          <div className="flex space-x-2 sm:space-x-4 lg:space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <Button
                key={tab}
                variant="ghost"
                onClick={() => onTabChange(tab)}
                className={cn(
                  "py-2 sm:py-4 px-1 sm:px-2 border-b-2 font-medium text-xs sm:text-sm transition-colors rounded-none whitespace-nowrap flex-shrink-0",
                  activeTab === tab
                    ? "border-primary-base text-primary-base"
                    : "border-transparent text-basic-300 hover:text-basic-400 hover:border-basic-200"
                )}
              >
                {tab}
              </Button>
            ))}
          </div>

          <div className="relative ml-2 sm:ml-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-2 sm:px-4 py-1 sm:py-2 text-primary-base hover:text-primary-darker font-medium hover:bg-primary-lightest rounded-lg text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">+ 開始</span>
                  <span className="sm:hidden">+</span>
                  <ChevronDown size={14} className="ml-1 transition-transform ui-open:rotate-180" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-64 sm:w-72 mt-1" align="end">
                {createOptions.map((option, index) => (
                  <DropdownMenuItem
                    key={option.id}
                    className={cn(
                      "flex items-start w-full px-4 py-3 text-left hover:bg-primary-lightest cursor-pointer",
                      index < createOptions.length - 1 && "border-b border-basic-100"
                    )}
                    onClick={() => onCreateNew(option.id)}
                  >
                    <div>
                      <div className="font-medium text-basic-black">{option.title}</div>
                      <div className="text-sm text-basic-300 mt-1">{option.description}</div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>
      </div>
    </div>
  );
}

// ========================================
// IdeaCard Component
// ========================================

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

function IdeaCard({
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

// ========================================
// PracticeCard Component
// ========================================

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

function PracticeCard({
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

// ========================================
// PlanCard Component
// ========================================

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

function PlanCard({
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

        <div className="mb-3 sm:mb-4">
          <div className="w-full relative">
            <Progress value={plan.progress} className="h-2" />
            <span className="absolute right-0 -top-6 text-xs text-basic-300 font-medium">
              {plan.progress}%
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center space-x-1">
            <Flame className="h-3 w-3 text-orange-500" />
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

// ========================================
// Floating Create Button Component
// ========================================

function FloatingCreateButton() {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  const createOptions = [
    { label: '想法', path: '/ideas/create', icon: Lightbulb },
    { label: '主題實踐', path: '/practice/create', icon: Target },
    { label: '學習計劃', path: '/projects/create', icon: BookOpen },
  ];

  const handleCreate = (path: string) => {
    router.push(path);
    setShowMenu(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Create Options Menu */}
      {showMenu && (
        <div className="absolute bottom-16 right-0 bg-basic-white rounded-lg shadow-lg border border-basic-200 p-2 min-w-[160px]">
          {createOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <Button
                key={option.label}
                variant="ghost"
                onClick={() => handleCreate(option.path)}
                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-basic-100 rounded-md justify-start h-auto"
              >
                <IconComponent className="h-4 w-4 text-basic-400" />
                <span className="text-sm font-medium text-basic-black">{option.label}</span>
              </Button>
            );
          })}
        </div>
      )}

      {/* Main Create Button */}
      <Button
        onClick={() => setShowMenu(!showMenu)}
        className="bg-primary-base hover:bg-primary-darker text-basic-white rounded-full p-4 shadow-lg transition-colors h-auto"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}

function ExplorePage() {
  const [activeExploreTab, setActiveExploreTab] = useState('推薦');
  const [searchQuery, setSearchQuery] = useState('');
   // TODO: Implement search functionality
   console.log(setSearchQuery); // Temporary to avoid unused variable warning
  const [isSearching, setIsSearching] = useState(false);

  // Mock data - in real app would come from API
  const mockIdea = {
    id: '1',
    author: {
      name: '林小明',
      tags: ['UX設計師', '產品經理']
    },
    content: 'this is an idea',
    tags: ['程式設計', '資料科學'],
    link: 'test',
    publishDate: '01/06/2025',
    likes: 3,
    comments: 2
  };

  const mockPractice = {
    id: '2',
    title: 'UI/UX 設計思維實戰',
    author: {
      name: '李設計',
      tags: ['UX設計師', '設計思維']
    },
    description: '深入了解用戶體驗設計流程，從研究到原型製作',
    tags: ['用戶研究', 'Figma', '設計思維'],
    publishDate: '25/05/2025 - 18/06/2025',
    participants: 189,
    comments: 2,
    progress: 65,
    streak: 7,
    status: '進行中' as const,
    category: '書籍'
  };

  const mockPlan = {
    id: '3',
    title: '全端開發工程師養成計劃',
    author: {
      name: '陳老師',
      tags: ['全端工程師', '技術導師']
    },
    description: '從零基礎到獨立開發完整網路應用，涵蓋前端、後端、資料庫設計與部署',
    tags: ['React', 'Node.js', 'MongoDB', '系統設計'],
    publishDate: '20/05/2025 - 20/09/2025',
    participants: 67,
    comments: 8,
    progress: 42,
    streak: 12,
    status: '進行中' as const
  };

  const handleCreateNew = (type: string) => {
    console.log('Creating new:', type);
    // In real app, would navigate to creation form
  };

  const handleCardAction = (action: string, id: string) => {
    console.log(`${action} for item:`, id);
    // In real app, would handle the specific action
  };

  const renderContent = () => {
    if (isSearching) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-basic-black mb-2">搜尋結果</h2>
              <p className="text-basic-300">關於 "{searchQuery}" 的結果</p>
            </div>
            <Button
              variant="ghost"
              onClick={() => setIsSearching(false)}
              className="px-4 py-2 text-primary-base hover:text-primary-darker font-medium hover:bg-primary-lightest rounded-lg"
            >
              返回瀏覽
            </Button>
          </div>
          <div className="space-y-8">
            <p className="text-basic-300">搜尋結果將顯示於此：{searchQuery}</p>
          </div>
        </div>
      );
    }

    return (
      <>
        <ExploreTabs
          activeTab={activeExploreTab}
          onTabChange={setActiveExploreTab}
          onCreateNew={handleCreateNew}
        />

        <div className="space-y-8 mb-16">
          {/* Ideas */}
          {(activeExploreTab === '推薦' || activeExploreTab === '想法') && (
            <div className="flex flex-col items-center space-y-6">
              <IdeaCard
                idea={mockIdea}
                onLike={(id) => handleCardAction('like', id)}
                onComment={(id) => handleCardAction('comment', id)}
                onShare={(id) => handleCardAction('share', id)}
                onSave={(id) => handleCardAction('save', id)}
                onReport={(id) => handleCardAction('report', id)}
              />
            </div>
          )}

          {/* Practices */}
          {(activeExploreTab === '推薦' || activeExploreTab === '主題實踐') && (
            <div className="flex flex-col items-center space-y-6">
              <PracticeCard
                practice={mockPractice}
                onJoin={(id) => handleCardAction('join', id)}
                onComment={(id) => handleCardAction('comment', id)}
                onShare={(id) => handleCardAction('share', id)}
                onSave={(id) => handleCardAction('save', id)}
                onReport={(id) => handleCardAction('report', id)}
              />
            </div>
          )}

          {/* Plans */}
          {activeExploreTab === '學習計劃' && (
            <div className="flex flex-col items-center space-y-6">
              <PlanCard
                plan={mockPlan}
                onJoin={(id) => handleCardAction('join', id)}
                onComment={(id) => handleCardAction('comment', id)}
                onShare={(id) => handleCardAction('share', id)}
                onSave={(id) => handleCardAction('save', id)}
                onReport={(id) => handleCardAction('report', id)}
              />
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <>
      <SEOConfig
        title="探索 - 島島阿學學習社群"
        description="探索學習內容，發現新的想法、實踐和計劃"
        keywords="島島阿學,探索,學習,想法,實踐,計劃"
        author="島島阿學"
        copyright="島島阿學"
        imgLink="https://www.daoedu.tw/assets/brand/horizontal-primary-logo.svg"
      />

      <div className="min-h-screen bg-basic-100 relative">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Container>
            {renderContent()}
          </Container>
        </main>

        {/* Floating Create Button */}
        <FloatingCreateButton />
      </div>
    </>
  );
}

ExplorePage.getLayout = getPrivateLayout;

export default ExplorePage;
