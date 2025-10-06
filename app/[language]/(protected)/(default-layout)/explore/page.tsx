'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Lightbulb, Target, BookOpen, ChevronDown, MoreVertical, Share2, Bookmark, Flag, User, Flame } from 'lucide-react';
import Shell from '@/public/assets/icons/shell.svg';
import Comment from '@/public/assets/icons/comment.svg';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Container } from '@/components/ui/container';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/utils/cn';
import { timeDuration } from '@/utils/date';
import useSWR from 'swr';
import { fetcher } from '@/utils/http';
import { IdeaCard } from '@/features/ideas/components';
import IdeaCreateContainer from '@/features/ideas/components/IdeaCreateContainer';
import type { IdeaSchema } from '@/services/ideas/schema';

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
      description: '短期專注練習 (7-30天)',
    },
    {
      id: 'plan',
      title: '學習計劃',
      description: '深度系統學習 (2-6個月)',
    },
    {
      id: 'idea',
      title: '想法',
      description: '快速分享洞察',
    },
  ];

  return (
    <>
      <div className="mb-4 sm:mb-4 flex justify-center py-2 sm:py-4 px-4">
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-3xl bg-basic-white border border-basic-200 rounded-lg px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex space-x-2 sm:space-x-4 lg:space-x-8 overflow-x-auto">
              {tabs.map((tab) => (
                <Button
                  key={tab}
                  variant="ghost"
                  onClick={() => onTabChange(tab)}
                  className={cn(
                    'py-2 sm:py-4 px-1 sm:px-2 font-medium text-xs sm:text-sm transition-colors rounded-lg whitespace-nowrap flex-shrink-0',
                    activeTab === tab
                      ? 'bg-primary-base text-white hover:bg-primary-darker hover:text-white'
                      : 'text-basic-500 hover:text-primary-base hover:bg-primary-base/10'
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

                <DropdownMenuContent className="w-64 sm:w-72 mt-1 p-2 bg-basic-white border-basic-200 text-basic-500" align="end">
                  {createOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.id}
                      className={cn(
                        'flex items-start w-full px-4 py-3 text-left cursor-pointer hover:bg-basic-100 focus:bg-basic-100'
                      )}
                      onClick={() => onCreateNew(option.id)}
                    >
                      <div>
                        <div className="font-medium text-basic-500">{option.title}</div>
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
    </>
  );
}


// ========================================
// PracticeCard Component
// ========================================

interface PracticeCardProps {
  practice: {
    id: string;
    title: string;
    description?: string;
    contentType: string;
    customContentType?: string;
    totalAmount: number;
    currentProgress: number;
    unit: string;
    startDate: string;
    targetDate?: string;
    status: string;
    motivationType?: string;
    customMotivation?: string;
    isPublic: boolean;
    reminderEnabled: boolean;
    reminderFrequency: string;
    streak: number;
    lastCheckinDate?: string;
    practiceAction?: string;
    resources: Array<{ id: string; name: string; url?: string; type: string; description?: string; order: number; }>;
    checkIns: Array<{ id: string; practiceId: string; date: string; progress: number; totalProgress: number; note?: string; mood?: string; tags: string[]; createdAt: string; }>;
    tags: string[];
    dailyGoal?: { type: string; timeMinutes?: number; amount?: number; unit?: string; };
    user?: {
      _id?: string;
      id: string;
      name: string;
      photoURL?: string;
      roleList?: string[];
    };
    createdAt: string;
    updatedAt: string;
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
  onReport,
}: PracticeCardProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <Card className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-3xl mx-auto bg-basic-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-basic-200 group relative">
      <CardContent className="p-3 sm:p-4 md:p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <Avatar className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3">
              <AvatarImage
                src={practice.user?.photoURL && practice.user.photoURL.trim() !== '' ? practice.user.photoURL : undefined}
                alt={practice.user?.name || 'user avatar'}
              />
              <AvatarFallback className="bg-primary-lightest text-primary-base text-xs sm:text-sm font-bold">
                {practice.user?.name?.charAt(0) || <User size={14} />}
              </AvatarFallback>
            </Avatar>
            <div>
              <div>
                <span className="text-xs sm:text-sm font-medium text-basic-500 mr-2">
                  {practice.user?.name || '練習者'}
                </span>
              </div>
              <div className="text-xs text-basic-300 mt-0.5">
                {practice.user?.roleList?.join(' | ') || '實踐者'}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2 mt-0">
            <Badge className="bg-primary-lightest text-primary-darker text-xs hidden sm:inline-block">
              主題實踐
            </Badge>
            <div className="text-xs text-basic-300 hidden sm:block">{timeDuration(practice.createdAt)}</div>
            <div className="relative">
              <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 text-basic-300 hover:text-basic-500 hover:bg-basic-100 rounded-lg transition-colors"
                  >
                    <MoreVertical size={14} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-32 bg-basic-white border-basic-200 text-basic-500" align="end">
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

        <h3 className="font-bold text-basic-500 mb-2 text-base sm:text-lg group-hover:text-primary-base transition-colors flex items-center">
          {practice.title}
          <Badge className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
            {practice.contentType}
          </Badge>
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
          <div className="w-full bg-basic-100 rounded-full h-2 relative">
            <Progress
              value={(practice.currentProgress / practice.totalAmount) * 100}
              className="h-2 bg-primary-base rounded-full"
            />
            <span className="absolute right-0 -top-6 text-xs text-basic-300 font-medium">
              {Math.round((practice.currentProgress / practice.totalAmount) * 100)}%
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
              practice.status === 'completed'
                ? 'bg-success/20 text-success'
                : 'bg-tips/20 text-tips'
            }
          >
            {practice.status === 'completed' ? '已完成'
             : practice.status === 'active' ? '進行中'
             : practice.status === 'paused' ? '暫停'
             : practice.status === 'draft' ? '草稿' : '封存'}
          </Badge>
        </div>

        <div className="pt-3 sm:pt-4">
          <div className="flex items-center justify-end space-x-2 sm:space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onJoin?.(practice.id)}
              className="flex items-center space-x-1 text-basic-300 hover:text-primary-base p-1"
            >
              <Shell size={14} />
              <span className="text-xs sm:text-sm font-medium">{practice.checkIns?.length || 0}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onComment?.(practice.id)}
              className="flex items-center space-x-1 text-basic-300 hover:text-primary-base p-1"
            >
              <Comment size={14} />
              <span className="text-xs sm:text-sm">{practice.resources?.length || 0}</span>
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
// ProjectCard Component
// ========================================

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    createdDate: string;
    updatedDate: string;
    description: string;
    isPublic: boolean;
    motivation: string[];
    motivationDescription: string;
    goal: string;
    content: string;
    strategy: string[];
    strategyDescription: string;
    resourceName?: string;
    resourceUrl: string[];
    outcome: string[];
    outcomeDescription: string;
    eventId?: string;
    user: {
      _id?: string;
      id: string;
      name: string;
      photoURL?: string;
      roleList?: string[];
    };
    version: number;
    milestones: Array<{
      id: string;
      title: string;
      description: string;
      dueDate?: string;
      status: string;
      createdDate: string;
      updatedDate: string;
    }>;
  };
  onJoin?: (id: string) => void;
  onComment?: (id: string) => void;
  onShare?: (id: string) => void;
  onSave?: (id: string) => void;
  onReport?: (id: string) => void;
}

function ProjectCard({
  project,
  onJoin,
  onComment,
  onShare,
  onSave,
  onReport,
}: ProjectCardProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <Card className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-3xl mx-auto bg-basic-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-basic-200 group relative">
      <CardContent className="p-3 sm:p-4 md:p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <Avatar className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3">
              <AvatarImage
                src={project.user?.photoURL && project.user.photoURL.trim() !== '' ? project.user.photoURL : undefined}
                alt={project.user?.name || 'user avatar'}
              />
              <AvatarFallback className="bg-indigo-600 text-white text-xs font-medium">
                {project.user?.name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div>
                <span className="text-xs sm:text-sm font-medium text-basic-500 mr-2">
                  {project.user.name}
                </span>
              </div>
              <div className="text-xs text-basic-300 mt-0.5">
                {project.user.roleList?.join(' | ') || '計劃作者'}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2 mt-0">
            <Badge className="bg-indigo-100 text-indigo-800 text-xs hidden sm:inline-block">
              學習計劃
            </Badge>
            <div className="text-xs text-basic-300 hidden sm:block">{timeDuration(project.createdDate)}</div>
            <div className="relative">
              <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 text-basic-300 hover:text-basic-500 hover:bg-basic-100 rounded-lg transition-colors"
                  >
                    <MoreVertical size={14} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-32 bg-basic-white border-basic-200 text-basic-500" align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      onSave?.(project.id);
                      setIsDropdownOpen(false);
                    }}
                    className="flex items-center cursor-pointer"
                  >
                    <Bookmark size={14} className="mr-2" />
                    儲存
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      onReport?.(project.id);
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

        <h3 className="font-bold text-basic-500 mb-2 text-base sm:text-lg group-hover:text-indigo-600 transition-colors">
          {project.title}
        </h3>

        <p className="text-basic-300 text-sm mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-none">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
          {project.strategy.slice(0, 2).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="px-1.5 py-0.5 sm:px-2 bg-basic-100 text-basic-300 text-xs font-medium rounded-full"
            >
              {tag}
            </Badge>
          ))}
          {project.strategy.length > 2 && (
            <Badge
              variant="secondary"
              className="px-1.5 py-0.5 sm:px-2 bg-basic-100 text-basic-300 text-xs font-medium rounded-full"
            >
              +{project.strategy.length - 2}
            </Badge>
          )}
        </div>

        <div className="mb-3 sm:mb-4">
          <div className="w-full relative">
            <Progress value={Math.round((project.milestones.filter(m => m.status === 'completed').length / Math.max(project.milestones.length, 1)) * 100)} className="h-2" />
            <span className="absolute right-0 -top-6 text-xs text-basic-300 font-medium">
              {Math.round((project.milestones.filter(m => m.status === 'completed').length / Math.max(project.milestones.length, 1)) * 100)}%
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center space-x-1">
            <Flame className="h-3 w-3 text-orange-500" />
            <span className="text-xs text-basic-300 font-medium">{project.milestones.length}個里程碑</span>
          </div>
          <Badge
            className={
              project.milestones.filter(m => m.status === 'completed').length === project.milestones.length && project.milestones.length > 0
                ? 'bg-success/20 text-success'
                : 'bg-tips/20 text-tips'
            }
          >
            {project.milestones.filter(m => m.status === 'completed').length === project.milestones.length && project.milestones.length > 0 ? '已完成' : '進行中'}
          </Badge>
        </div>

        <div className="pt-3 sm:pt-4">
          <div className="flex items-center justify-end space-x-2 sm:space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onJoin?.(project.id)}
              className="flex items-center space-x-1 text-basic-300 hover:text-indigo-600 p-1"
            >
              <Shell size={14} />
              <span className="text-xs sm:text-sm font-medium">{project.milestones.length}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onComment?.(project.id)}
              className="flex items-center space-x-1 text-basic-300 hover:text-indigo-600 p-1"
            >
              <Comment size={14} />
              <span className="text-xs sm:text-sm">{project.resourceUrl.length}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onShare?.(project.id)}
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

function FloatingCreateButton({ onCreateIdea }: { onCreateIdea: () => void }) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const createOptions: Array<{label: string, path?: string, action?: string, icon: React.ComponentType<{className?: string}>}> = [
    { label: '想法', action: 'idea', icon: Lightbulb },
    { label: '主題實踐', path: '/practice/create', icon: Target },
    { label: '學習計劃', path: '/projects/create', icon: BookOpen },
  ];

  const handleCreate = (pathOrAction: string) => {
    if (pathOrAction === 'idea') {
      onCreateIdea();
    } else {
      router.push(pathOrAction);
    }
    setShowMenu(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  return (
    <div ref={menuRef} className="fixed bottom-6 right-6 z-50">
      {/* Create Options Menu */}
      {showMenu && (
        <div className="absolute bottom-16 right-0 bg-basic-white rounded-lg shadow-lg border border-basic-200 p-2 min-w-[160px]">
          {createOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <Button
                key={option.label}
                variant="ghost"
                onClick={() => handleCreate(option.path || option.action || '')}
                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-basic-100 rounded-md justify-start h-auto"
              >
                <IconComponent className="h-4 w-4 text-basic-500" />
                <span className="text-sm font-medium text-basic-500">{option.label}</span>
              </Button>
            );
          })}
        </div>
      )}

      {/* Main Create Button */}
      <Button
        onClick={() => setShowMenu(!showMenu)}
        className="bg-primary-base hover:bg-primary-darker text-primary-foreground rounded-full p-4 shadow-lg transition-colors h-auto"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}

export default function ExplorePage() {
  const [activeExploreTab, setActiveExploreTab] = useState('推薦');
  const [searchQuery, setSearchQuery] = useState('');
  console.log(setSearchQuery); // Temporary to avoid unused variable warning
  const [isSearching, setIsSearching] = useState(false);
  const [showIdeaCreateModal, setShowIdeaCreateModal] = useState(false);

  // 使用真實的 Ideas API - 統一使用 useSWR
  const { data: ideas, isLoading: ideasLoading, error: ideasError, mutate: mutateIdeas } = useSWR<{data: IdeaSchema[]}>('/api/v1/ideas', fetcher, {
    revalidateIfStale: false,
  });

  // 使用真實的 Practice API - 統一使用 useSWR
  const { data: practices, isLoading: practicesLoading, error: practicesError } = useSWR<{data: unknown[]}>('/api/v1/practices', fetcher, {
    revalidateIfStale: false,
  });

  // 使用真實的 Projects API (公開的 projects 而不是個人的)
  // 嘗試不同的端點路徑
  const { data: projects, isLoading: projectsLoading, error: projectsError } = useSWR<{data: unknown[]}>('/api/v1/projects', fetcher, {
    revalidateIfStale: false,
  });

  console.log('🔍 Explore Page - practices:', practices);
  console.log('🔍 Explore Page - practicesLoading:', practicesLoading);
  console.log('🔍 Explore Page - practicesError:', practicesError);
  console.log('🔍 Explore Page - projects:', projects);
  console.log('🔍 Explore Page - projectsLoading:', projectsLoading);
  console.log('🔍 Explore Page - projectsError:', projectsError);
  if (projectsError) {
    console.error('❌ Projects API 詳細錯誤:', {
      message: projectsError.message,
      status: projectsError.status,
      stack: projectsError.stack,
      full: projectsError,
    });
  }



  const handleCreateNew = (type: string) => {
    if (type === 'idea') {
      setShowIdeaCreateModal(true);
    } else {
      console.log('Creating new:', type);
      // In real app, would navigate to creation form
    }
  };

  const handleCardAction = (action: string, id: string) => {
    console.log(`${action} for item:`, id);
    // In real app, would handle the specific action
  };

  const handleIdeaCreateSuccess = (ideaId: string) => {
    console.log('Idea created successfully:', ideaId);
    setShowIdeaCreateModal(false);
    // 刷新ideas列表
    mutateIdeas();
  };

  const handleIdeaCreateError = (error: Error) => {
    console.error('Failed to create idea:', error);
    // 可以在這裡顯示錯誤提示
  };

  const handleIdeaCreateCancel = () => {
    setShowIdeaCreateModal(false);
  };

  const renderContent = () => {
    if (isSearching) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-basic-500 mb-2">搜尋結果</h2>
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
              {ideasLoading && (
                <div className="text-center text-basic-300">載入中...</div>
              )}
              {ideasError && (
                <div className="text-center text-red-500">載入失敗，請稍後再試</div>
              )}
              {Array.isArray(ideas?.data) && ideas.data.map((idea) => (
                <IdeaCard
                  key={idea.id}
                  idea={idea}
                  onClick={(id) => {
                    // 導航到詳情頁
                    window.location.href = `/ideas/${id}`;
                  }}
                  onSave={(id) => handleCardAction('save', id)}
                  onReport={(id) => handleCardAction('report', id)}
                />
              ))}
              {Array.isArray(ideas?.data) && ideas.data.length === 0 && !ideasLoading && (
                <div className="text-center text-basic-300">暫無想法內容</div>
              )}
            </div>
          )}

          {/* Practices */}
          {(activeExploreTab === '推薦' || activeExploreTab === '主題實踐') && (
            <div className="flex flex-col items-center space-y-6">
              {practicesLoading && <div className="text-center py-8">載入中...</div>}
              {practicesError && <div className="text-center py-8 text-red-500">載入 Practice 失敗</div>}
              {Array.isArray(practices?.data) && (practices.data as PracticeCardProps['practice'][]).map((practice) => (
                <PracticeCard
                  key={practice.id}
                  practice={practice}
                  onJoin={(id) => handleCardAction('join', id)}
                  onComment={(id) => handleCardAction('comment', id)}
                  onShare={(id) => handleCardAction('share', id)}
                  onSave={(id) => handleCardAction('save', id)}
                  onReport={(id) => handleCardAction('report', id)}
                />
              ))}
              {Array.isArray(practices?.data) && practices.data.length === 0 && !practicesLoading && (
                <div className="text-center py-8 text-basic-300">目前沒有 Practice 數據</div>
              )}
            </div>
          )}

          {/* Projects */}
          {activeExploreTab === '學習計劃' && (
            <div className="flex flex-col items-center space-y-6">
              {projectsLoading && <div className="text-center py-8">載入中...</div>}
              {projectsError && <div className="text-center py-8 text-red-500">載入 Projects 失敗</div>}
              {Array.isArray(projects?.data) && (projects.data as ProjectCardProps['project'][]).map((project) => (
                <ProjectCard
                  key={project.id}
                  project={{
                    ...project,
                    createdDate: project.createdDate,
                    updatedDate: project.updatedDate,
                    resourceUrl: project.resourceUrl || [],
                    milestones: project.milestones || [],
                    user: {
                      ...project.user,
                      photoURL: project.user.photoURL,
                    },
                  }}
                  onJoin={(id) => handleCardAction('join', id)}
                  onComment={(id) => handleCardAction('comment', id)}
                  onShare={(id) => handleCardAction('share', id)}
                  onSave={(id) => handleCardAction('save', id)}
                  onReport={(id) => handleCardAction('report', id)}
                />
              ))}
              {Array.isArray(projects?.data) && projects.data.length === 0 && !projectsLoading && (
                <div className="text-center py-8 text-basic-300">目前沒有學習計劃數據</div>
              )}
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-basic-white relative pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Container>
          {renderContent()}
        </Container>
      </div>

      {/* Floating Create Button */}
      <FloatingCreateButton onCreateIdea={() => setShowIdeaCreateModal(true)} />

      {/* Create Idea Modal */}
      {showIdeaCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto">
            <div className="[&_.bg-basic-50]:!bg-transparent [&_.bg-basic-50]:!min-h-auto [&_.bg-basic-50]:!p-0 [&_textarea]:!text-gray-700 [&_input]:!text-gray-700">
              <IdeaCreateContainer
                onSuccess={handleIdeaCreateSuccess}
                onError={handleIdeaCreateError}
                onCancel={handleIdeaCreateCancel}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}