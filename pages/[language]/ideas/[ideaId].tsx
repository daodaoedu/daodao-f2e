import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText, Eye, Share2 } from 'lucide-react';
import { parseToString } from '@/utils/helper';
import { useIdea } from '@/features/ideas/hooks';
import CommentSection from '@/shared/components/Comment/CommentSection';
import { CommentType } from '@/services/comments';
import Shell from '@/public/assets/icons/shell.svg';
import Comment from '@/public/assets/icons/comment.svg';
import { Image } from '@/shared/ui/image';
import { ROLE } from '@/constants/member';
import DefaultAvatar from '@/public/assets/icons/default-avatar.svg';
import { Button } from '@/shared/ui/button';

const IdeaDetailPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ideaId = parseToString(searchParams?.get('ideaId'));

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
          <Button onClick={() => router.push('/ideas')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回想法列表
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-palest">
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-basic-white rounded-2xl p-3 md:p-10">
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
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  {idea.user?.photoURL ? (
                    <Image
                      src={idea.user.photoURL}
                      alt={`${idea.user.name}'s avatar`}
                      width={30}
                      height={30}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-[30px] h-[30px] flex-shrink-0">
                      <DefaultAvatar />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-[#536166]">{idea.user?.name || '匿名用戶'}</span>
                    </div>
                    {idea.user?.roleList?.[0] && (
                      <div className="text-sm font-normal text-[#92989A]">
                        {ROLE.find((r) => r.value === idea.user.roleList[0])?.label || idea.user.roleList[0]}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 text-xs bg-primary-base rounded-full text-white whitespace-nowrap">
                    想法
                  </div>
                  <span className="text-sm text-[#92989A]">
                    {new Date(idea.createdDate).toLocaleDateString('zh-TW')}
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
                  <div className="flex flex-wrap">
                    {idea.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center mr-2 px-2 py-1 rounded-full text-sm bg-basic-100  text-gray-700 border border-primary-base/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 資源連結 */}
              {idea.ideaResources && idea.ideaResources.length > 0 && (
                <div className="mt-6">
                  <div className="space-y-2">
                    {idea.ideaResources.map((resource) => (
                      <Link
                        key={resource.url}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-2 rounded-lg hover:bg-basic-50/50 transition-colors group/resource"
                      >
                        <FileText className="h-5 w-5 mr-2 text-primary-base flex-shrink-0" />
                        <span className="body-sm text-basic-500 group-hover/resource:text-primary-darker truncate">
                          {resource.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </main>

            {/* 統計資訊 */}
            <footer className="pt-6 border-t border-basic-200">
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
        <div className="mt-6 bg-basic-white rounded-2xl p-3 md:p-10">
          <CommentSection targetId={Number(idea.id)} targetType={CommentType.Idea} />
        </div>
      </div>
    </div>
  );
};

export default IdeaDetailPage;
