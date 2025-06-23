import React, { useState, useCallback } from 'react';
import { Search, Plus, FolderOpen, SortAsc, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMyProjects } from '@/services/projects/core/hooks';
import type { ProjectSchema } from '@/services/projects/core/schema';
import Link from 'next/link';

interface ProjectsExploreSectionProps {
  className?: string;
  showHeader?: boolean;
  showCreateButton?: boolean;
  onCreateClick?: () => void;
}

const ProjectsExploreSection: React.FC<ProjectsExploreSectionProps> = ({
  className = '',
  showHeader = true,
  showCreateButton = true,
  onCreateClick,
}) => {
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'createdDate' | 'updatedDate' | 'title'>('createdDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Use projects hook to fetch data
  const {
    data: projects,
    isLoading,
    error,
    mutate: refresh,
  } = useMyProjects();

  // Filter and sort projects locally
  const filteredProjects = React.useMemo(() => {
    if (!projects) return [];

    let filtered = projects;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((project) =>
        project.title.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query) ||
        project.goal.toLowerCase().includes(query)
      );
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

  const handleCreateClick = () => {
    if (onCreateClick) {
      onCreateClick();
    } else {
      // Default behavior - navigate to create page
      window.location.href = '/manage/projects/create';
    }
  };

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
    return (
      <Card className="hover:shadow-md transition-shadow duration-200 border border-basic-200">
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Link
                  href={`/projects/detail?id=${project.id}`}
                  className="text-lg font-semibold text-basic-black hover:text-primary-base transition-colors line-clamp-1"
                >
                  {project.title}
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-basic-400">
                    建立於 {new Date(project.createdDate).toLocaleDateString('zh-TW')}
                  </span>
                  {project.isPublic && (
                    <Badge variant="outline" className="text-xs">
                      公開
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-basic-600 text-sm line-clamp-2 leading-relaxed">
              {project.description}
            </p>

            {/* Goal */}
            {project.goal && (
              <div className="bg-primary-50 rounded-lg p-3">
                <h4 className="text-sm font-medium text-primary-700 mb-1">學習目標</h4>
                <p className="text-sm text-primary-600 line-clamp-1">{project.goal}</p>
              </div>
            )}

            {/* Author Info */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-primary-600">
                  {project.user.name.charAt(0)}
                </span>
              </div>
              <span className="text-sm text-basic-500">{project.user.name}</span>
              <span className="text-xs text-basic-400 ml-auto">
                v{project.version}
              </span>
            </div>

            {/* Motivation Tags */}
            {project.motivation && project.motivation.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {project.motivation.slice(0, 3).map((tag) => (
                  <Badge key={`motivation-${tag}`} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {project.motivation.length > 3 && (
                  <Badge variant="secondary" className="text-xs text-basic-400">
                    +{project.motivation.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Action */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-basic-400">
                更新於 {new Date(project.updatedDate).toLocaleDateString('zh-TW')}
              </span>
              <Link
                href={`/projects/detail?id=${project.id}`}
                className="text-xs text-primary-base hover:text-primary-darker"
              >
                查看詳情 →
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (error) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <FolderOpen className="w-12 h-12 text-basic-200 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-basic-600 mb-2">載入失敗</h3>
            <p className="text-basic-400 mb-4">
              {error?.message || '無法載入學習計劃，請稍後再試'}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refresh()}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              重新載入
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full ${className}`}>
      {showHeader && (
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FolderOpen className="w-5 h-5 text-primary-base" />
              探索學習計劃
              {filteredProjects && (
                <span className="text-sm font-normal text-basic-400">
                  ({filteredProjects.length})
                </span>
              )}
            </CardTitle>
            {showCreateButton && (
              <Button
                size="sm"
                onClick={handleCreateClick}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">建立計劃</span>
              </Button>
            )}
          </div>
        </CardHeader>
      )}

      <CardContent className="space-y-4">
        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-basic-400 w-4 h-4" />
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
                  <SortAsc className="w-4 h-4" />
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
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Projects Content */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={`project-skeleton-${Date.now()}-${index}`} className="animate-pulse">
                <div className="bg-basic-100 rounded-lg h-36" />
              </div>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="w-16 h-16 text-basic-200 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-basic-600 mb-2">
              {searchQuery ? '找不到相關計劃' : '還沒有學習計劃'}
            </h3>
            <p className="text-basic-400 mb-6">
              {searchQuery
                ? '嘗試調整搜尋關鍵字'
                : '建立你的第一個學習計劃！'
              }
            </p>
            {showCreateButton && (
              <Button onClick={handleCreateClick} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                建立第一個計劃
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}

            {/* Projects Count Info */}
            {filteredProjects.length > 0 && (
              <div className="text-center pt-4">
                <p className="text-sm text-basic-400">
                  顯示 {filteredProjects.length} 個學習計劃
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectsExploreSection;
