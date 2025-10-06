'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Eye, Share2, Link as LinkIcon } from 'lucide-react';
import { useIdea } from '@/features/ideas/hooks';
import CommentSection from '@/shared/components/Comment/CommentSection';
import { CommentType } from '@/services/comments';
import Shell from '@/public/assets/icons/shell.svg';
import Comment from '@/public/assets/icons/comment.svg';
import { Image } from '@/components/ui/image';
import { ROLE } from '@/constants/member';
import DefaultAvatar from '@/public/assets/icons/default-avatar.svg';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const IdeaDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const ideaId = params?.ideaId as string;

  const { idea, isLoading, isError } = useIdea(ideaId || '');

  if (!ideaId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-palest flex items-center justify-center">
        <div className="text-lg">載入中...</div>
      </div>
    );
  }

  if (isError || !idea) {
    return (
      <div className="min-h-screen bg-primary-palest flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-md p-6 w-full max-w-3xl text-center">
          <h1 className="text-xl font-bold mb-4">找不到想法</h1>
          <Button onClick={() => router.push('/explore')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回探索頁面
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-palest pt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-basic-white rounded-2xl p-4 md:p-8 lg:p-10 mt-6">
          {/* 返回按鈕 */}
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 text-basic-500 hover:text-primary-base px-0"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>

          {/* 想法內容 */}
          <div className="space-y-6">
            <header>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                <div className="flex items-start gap-3 flex-1">
                  {idea.user?.photoURL ? (
                    <Image
                      src={idea.user.photoURL}
                      alt={`${idea.user.name}'s avatar`}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-[40px] h-[40px] flex-shrink-0">
                      <DefaultAvatar />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-base text-[#536166]">{idea.user?.name || '匿名用戶'}</span>
                    </div>
                    {idea.user?.roleList?.[0] && (
                      <div className="text-sm font-normal text-[#92989A]">
                        {ROLE.find((r) => r.value === idea.user.roleList?.[0])?.label || idea.user.roleList?.[0]}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="px-3 py-1 text-xs bg-primary-base rounded-full text-white whitespace-nowrap text-center">
                    想法
                  </div>
                  <span className="text-sm text-[#92989A] text-center sm:text-left">
                    {new Date(idea.createdAt).toLocaleDateString('zh-TW')}
                  </span>
                </div>
              </div>
            </header>

            <main>
              <div className="prose max-w-none">
                <p className="text-basic-500 leading-relaxed whitespace-pre-wrap">
                  {idea.content}
                </p>
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
                    {idea.resources.map((resource: { url: string; name: string }) => (
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

            {/* 統計資訊 */}
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
          </div>

        </div>

        {/* 評論區塊 */}
        <div className="mt-6 bg-basic-white rounded-2xl p-4 md:p-8 lg:p-10">
          <CommentSection targetId={Number(idea.id)} targetType={CommentType.Idea} />
        </div>
      </div>
    </div>
  );
};

export default IdeaDetailPage;