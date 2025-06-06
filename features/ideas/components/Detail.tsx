import React from 'react';
import { Button } from '@/components/atoms/button';
import {
  Edit,
  Trash2,
  Hash,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  ExternalLink,
  Calendar,
  User
} from 'lucide-react';
import Image from '@/shared/components/Image';
import { IdeaSchema } from '@/services/modules/ideas/schema';
import { formatIdeaDate, getVisibilityLabel, getTagCategoryClass } from '../utils';

interface IdeaDetailProps {
  data?: IdeaSchema;
  onEditClick: () => void;
  onDeleteClick: () => void;
  onLikeClick?: () => void;
  onShareClick?: () => void;
  isLiked?: boolean;
  isLoading?: boolean;
}

const IdeaDetail: React.FC<IdeaDetailProps> = ({
  data,
  onEditClick,
  onDeleteClick,
  onLikeClick,
  onShareClick,
  isLiked = false,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-base mx-auto" />
          <p className="body-sm text-basic-300">載入中...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <div className="space-y-3">
          <div className="text-4xl">🔍</div>
          <h3 className="heading-sm text-basic-500">找不到想法</h3>
          <p className="body-sm text-basic-300">這個想法可能已被刪除或不存在</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* 標題與操作區域 */}
      <div className="space-y-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <h1 className="heading-lg text-primary-darker mb-3">
              {data.title}
            </h1>

            {/* 作者資訊 */}
            <div className="flex items-center gap-4 text-basic-400 body-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{data.authorName || '匿名用戶'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatIdeaDate(data.createdDate || '')}</span>
              </div>
              <span className="px-2 py-1 bg-primary-base/10 text-primary-darker rounded-full text-xs border border-primary-base/20">
                {getVisibilityLabel(data.visibility)}
              </span>
            </div>
          </div>

          {/* 操作按鈕 */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onEditClick}
              className="border-basic-200 text-basic-500 hover:border-primary-base hover:text-primary-base"
            >
              <Edit className="h-4 w-4 mr-2" />
              編輯
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDeleteClick}
              className="border-red-200 text-red-600 hover:border-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              刪除
            </Button>
          </div>
        </div>
      </div>

      {/* 內容區域 */}
      <div className="space-y-6">
        {/* 主要內容 */}
        <div className="prose prose-lg max-w-none">
          <p className="body-lg text-basic-500 leading-relaxed whitespace-pre-wrap">
            {data.content}
          </p>
        </div>

        {/* 標籤 */}
        {data.tags && data.tags.length > 0 && (
          <div className="space-y-3">
            <h3 className="heading-sm text-basic-500">標籤</h3>
            <div className="flex flex-wrap gap-2">
              {data.tags.map((tag) => (
                <span
                  key={tag}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm border transition-colors ${
                    getTagCategoryClass('custom') // 預設使用 custom 樣式，或者根據 tag 內容判斷類別
                  }`}
                >
                  <Hash className="h-3 w-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 圖片展示 */}
        {data.imageUrls && data.imageUrls.length > 0 && (
          <div className="space-y-3">
            <h3 className="heading-sm text-basic-500">圖片</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.imageUrls.map((url, index) => (
                <div key={url} className="relative group">
                  <Image
                    src={url}
                    alt={`${data.title} - 圖片 ${index + 1}`}
                    className="w-full h-64 object-cover rounded-lg border border-basic-200 group-hover:shadow-lg transition-shadow"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 影片展示 */}
        {data.videoUrls && data.videoUrls.length > 0 && (
          <div className="space-y-3">
            <h3 className="heading-sm text-basic-500">影片</h3>
            <div className="space-y-4">
              {data.videoUrls.map((url) => (
                <div key={url} className="relative">
                  <video
                    src={url}
                    controls
                    className="w-full rounded-lg border border-basic-200 shadow-sm"
                  >
                    <track kind="captions" />
                    您的瀏覽器不支援影片播放。
                  </video>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 學習資源 */}
        {data.ideaResources && data.ideaResources.length > 0 && (
          <div className="space-y-3">
            <h3 className="heading-sm text-basic-500">學習資源</h3>
            <div className="space-y-3">
              {data.ideaResources.map((resource) => (
                <a
                  key={resource.url}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block p-4 bg-white border border-basic-200 rounded-lg hover:border-primary-base hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="body-sm font-medium text-primary-darker group-hover:text-primary-base">
                        {resource.name}
                      </h4>
                      <p className="body-sm text-basic-400 mt-1 truncate">
                        {resource.url}
                      </p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-basic-300 group-hover:text-primary-base transition-colors flex-shrink-0 ml-3" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 互動與統計區域 */}
      <div className="border-t border-basic-200 pt-6">
        <div className="flex items-center justify-between">
          {/* 互動按鈕 */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onLikeClick}
              className={`text-sm ${
                isLiked
                  ? 'text-red-500 hover:text-red-600'
                  : 'text-basic-400 hover:text-red-500'
              }`}
            >
              <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
              {data.likeCount || 0}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-sm text-basic-400 hover:text-primary-base"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              {data.commentCount || 0}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onShareClick}
              className="text-sm text-basic-400 hover:text-primary-base"
            >
              <Share2 className="h-4 w-4 mr-2" />
              分享
            </Button>
          </div>

          {/* 統計資訊 */}
          <div className="flex items-center gap-6 text-sm text-basic-400">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{data.viewCount || 0} 次觀看</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdeaDetail;
