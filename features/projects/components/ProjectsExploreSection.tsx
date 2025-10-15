'use client';

import React, { useState, useCallback } from 'react';
import { CustomLink } from '@/shared/ui/custom-link';
import { format } from 'date-fns';
import {
  Search, Plus, FolderOpen, SortAsc, RefreshCw, Share2, Flag, Eye,
} from 'lucide-react';
import Shell from '@/public/assets/icons/shell.svg';
import Comment from '@/public/assets/icons/comment.svg';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import {
  Card, CardContent,
} from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/shared/ui/avatar';
import { Progress } from '@/shared/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { usePublicProjects } from '@/services/projects/core/hooks';
import type { ProjectSchema } from '@/services/projects/core/schema';

interface ProjectsExploreSectionProps {
  className?: string;
  showHeader?: boolean;
  showCreateButton?: boolean;
  showSearchBar?: boolean;
  onCreateClick?: () => void;
}

const ProjectsExploreSection: React.FC<ProjectsExploreSectionProps> = ({
  className = '',
  showHeader = true,
  showCreateButton = true,
  showSearchBar = true,
  onCreateClick,
}) => {
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'createdDate' | 'updatedDate' | 'title'>('createdDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Use projects hook to fetch data - using public projects for explore page
  const {
    data: projects,
    isLoading,
    error,
    mutate: refresh,
  } = usePublicProjects();

  // Filter and sort projects locally
  const filteredProjects = React.useMemo(() => {
    if (!projects) return [];

    let filtered = projects;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((project: ProjectSchema) => project.title.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query) ||
        project.goal.toLowerCase().includes(query));
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      let aValue: string | Date;
      let bValue: string | Date;

      switch (sortBy) {
        case 'title':
          aValue = a.title;
          bValue = b.title;
          break;
        case 'updatedDate':
          aValue = new Date(a.updatedDate);
          bValue = new Date(b.updatedDate);
          break;
        case 'createdDate':
        default:
          aValue = new Date(a.createdDate);
          bValue = new Date(b.createdDate);
          break;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [projects, searchQuery, sortBy, sortOrder]);

  // Handlers
  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handleSortChange = useCallback((newSortBy: typeof sortBy, newSortOrder: typeof sortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  }, []);


  // Sort options
  const sortOptions = [
    { label: '最新建立', sortBy: 'createdDate' as const, sortOrder: 'desc' as const },
    { label: '最舊建立', sortBy: 'createdDate' as const, sortOrder: 'asc' as const },
    { label: '最近更新', sortBy: 'updatedDate' as const, sortOrder: 'desc' as const },
    { label: '標題 A-Z', sortBy: 'title' as const, sortOrder: 'asc' as const },
    { label: '標題 Z-A', sortBy: 'title' as const, sortOrder: 'desc' as const },
  ];

  const getCurrentSortLabel = () => {
    const current = sortOptions.find((opt) => opt.sortBy === sortBy && opt.sortOrder === sortOrder);
    return current?.label || '最新建立';
  };

  // Project Card Component
  const ProjectCard = ({ project }: { project: ProjectSchema }) => {
    const completedMilestones = project.milestones?.filter((m) => m.isCompleted).length || 0;
    const totalMilestones = project.milestones?.length || 0;
    const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
    const isCompleted = completedMilestones === totalMilestones && totalMilestones > 0;

    // Get earliest startDate and latest endDate from milestones
    const getProjectDateRange = () => {
      if (!project.milestones || project.milestones.length === 0) return null;

      const dates = project.milestones
        .filter(m => m.startDate || m.endDate)
        .flatMap(m => [m.startDate, m.endDate].filter(Boolean) as string[]);

      if (dates.length === 0) return null;

      const sortedDates = dates.map(d => new Date(d)).sort((a, b) => a.getTime() - b.getTime());
      const startDate = sortedDates[0];
      const endDate = sortedDates[sortedDates.length - 1];

      return { startDate, endDate };
    };

    const dateRange = getProjectDateRange();

    const cardContent = (
      <Card
        className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-3xl bg-basic-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-basic-200 group relative cursor-pointer"
      >
        <CardContent className="p-3 sm:p-4 md:p-6">
          {/* Header Section - User Info & Actions */}
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

            {/* Right Side - Badge, Time */}
            <div className="flex items-center space-x-1 sm:space-x-2 mt-0">
              <Badge className="bg-yellow-500 text-basic-white text-xs hidden sm:inline-block">
                學習計劃
              </Badge>
              <div className="text-xs text-basic-300 hidden sm:block">
                {dateRange ? (
                  `${format(dateRange.startDate, 'yyyy/MM/dd')} - ${format(dateRange.endDate, 'yyyy/MM/dd')}`
                ) : (
                  format(new Date(project.createdDate), 'yyyy/MM/dd')
                )}
              </div>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-bold text-basic-500 mb-2 text-base sm:text-lg transition-colors">
            {project.title}
          </h3>

          {/* Description */}
          <p className="text-basic-300 text-sm mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-none">
            {project.description}
          </p>

          {/* Strategy Tags */}
          {project.strategy && project.strategy.length > 0 && (
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
          )}

          {/* Progress Bar */}
          <div className="mb-3 sm:mb-4">
            <div className="w-full relative">
              <Progress value={progress} className="h-2" />
              <span className="absolute right-0 -top-6 text-xs text-basic-300 font-medium">
                {progress}%
              </span>
            </div>
          </div>

          {/* Milestones Count & Status Badge */}
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center space-x-1">
              <Flag className="h-4 w-4 text-primary-base" />
              <span className="text-xs text-basic-300 font-medium">{totalMilestones}個里程碑</span>
            </div>
            <Badge
              className={
                isCompleted
                  ? 'bg-success/20 text-success'
                  : 'bg-tips/20 text-tips'
              }
            >
              {isCompleted ? '已完成' : '進行中'}
            </Badge>
          </div>

          {/* Action Buttons - Shell, Comment, Eye, Share */}
          <div className="pt-3 sm:pt-4">
            <div className="flex items-center justify-end gap-4 text-xs text-basic-300">
              <div className="flex items-center gap-1">
                <Shell />
                <span>{totalMilestones}</span>
              </div>
              <div className="flex items-center gap-1">
                <Comment />
                <span>0</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>0</span>
              </div>
              <div className="flex items-center gap-1">
                <Share2 className="h-4 w-4" />
                <span>0</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );

    return (
      <CustomLink href={`/projects/detail?id=${project.id}`} className="block max-w-xs sm:max-w-sm md:max-w-md lg:max-w-3xl mx-auto">
        {cardContent}
      </CustomLink>
    );
  };

  if (error) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <FolderOpen className="mx-auto mb-4 size-12 text-basic-200" />
            <h3 className="text-basic-600 mb-2 text-lg font-medium">載入失敗</h3>
            <p className="mb-4 text-basic-400">
              {error?.message || '無法載入學習計劃，請稍後再試'}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refresh()}
              className="flex items-center gap-2"
            >
              <RefreshCw className="size-4" />
              重新載入
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {showHeader && (
        <div className="pb-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <FolderOpen className="size-5 text-primary-base" />
              探索學習計劃
              {filteredProjects && (
                <span className="text-sm font-normal text-basic-400">
                  (
                  {filteredProjects.length}
                  )
                </span>
              )}
            </h2>
            {showCreateButton && (
              onCreateClick ? (
                <Button
                  size="sm"
                  onClick={onCreateClick}
                  className="flex items-center gap-2"
                >
                  <Plus className="size-4" />
                  <span className="hidden sm:inline">建立計劃</span>
                </Button>
              ) : (
                <CustomLink href="/manage/projects/create">
                  <Button
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Plus className="size-4" />
                    <span className="hidden sm:inline">建立計劃</span>
                  </Button>
                </CustomLink>
              )
            )}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Search and Filter Bar */}
        {showSearchBar && (
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-basic-400" />
              <Input
                placeholder="搜尋計劃標題、描述、目標..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              {/* Sort Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <SortAsc className="size-4" />
                    <span className="hidden sm:inline">{getCurrentSortLabel()}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {sortOptions.map((option) => (
                    <DropdownMenuItem
                      key={`${option.sortBy}-${option.sortOrder}`}
                      onClick={() => handleSortChange(option.sortBy, option.sortOrder)}
                      className={`cursor-pointer ${
                        sortBy === option.sortBy && sortOrder === option.sortOrder
                          ? 'bg-primary-50 text-primary-600'
                          : ''
                      }`}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

            {/* Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => refresh()}
              className="flex items-center gap-2"
              disabled={isLoading}
            >
              <RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          </div>
        )}

        {/* Projects Content */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }, (_, index) => (
              <Card
                key={`project-skeleton-${Date.now()}-${index}`}
                className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-3xl mx-auto bg-basic-white rounded-2xl shadow-sm border border-basic-200 animate-pulse"
              >
                <CardContent className="p-3 sm:p-4 md:p-6">
                  <div className="h-36 bg-basic-100 rounded-lg" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="py-12 text-center">
            <FolderOpen className="mx-auto mb-4 size-16 text-basic-200" />
            <h3 className="text-basic-600 mb-2 text-lg font-medium">
              {searchQuery ? '找不到相關計劃' : '還沒有學習計劃'}
            </h3>
            <p className="mb-6 text-basic-400">
              {searchQuery
                ? '嘗試調整搜尋關鍵字'
                : '建立你的第一個學習計劃！'}
            </p>
            {showCreateButton && (
              onCreateClick ? (
                <Button onClick={onCreateClick} className="flex items-center gap-2">
                  <Plus className="size-4" />
                  建立第一個計劃
                </Button>
              ) : (
                <CustomLink href="/manage/projects/create">
                  <Button className="flex items-center gap-2">
                    <Plus className="size-4" />
                    建立第一個計劃
                  </Button>
                </CustomLink>
              )
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProjects.map((project: ProjectSchema) => (
              <ProjectCard key={project.id} project={project} />
            ))}

            {/* Projects Count Info */}
            {filteredProjects.length > 0 && (
              <div className="pt-4 text-center">
                <p className="text-sm text-basic-400">
                  顯示
                  {' '}
                  {filteredProjects.length}
                  {' '}
                  個學習計劃
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsExploreSection;
