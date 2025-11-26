'use client';

import { useState } from 'react';
import { Link as LinkIcon, X, Plus, Save } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Textarea } from '@/shared/ui/textarea';
import { Input } from '@/shared/ui/input';
import type { IdeaSchema, IdeaResourceSchema } from '@/services/ideas';

/**
 * 為編輯模式的資源添加唯一 ID
 *
 * 為什麼需要這個:
 * - 當資源列表中有重複的 name 或 url 時,僅用 name 或 url 作為 key 會導致錯誤刪除
 * - 使用 crypto.randomUUID() 生成的唯一 ID 確保每個資源都能被正確識別和刪除
 * - 保存時會將 id 移除,只傳送原始的 { name, url } 資料給後端
 */
interface EditableResource extends IdeaResourceSchema {
  id: string;
}

interface IdeaContentProps {
  idea: IdeaSchema;
  isEditing?: boolean;
  onSave?: (data: { content: string; tags: string[]; resources: IdeaResourceSchema[] }) => void;
  onCancel?: () => void;
}

export function IdeaContent({ idea, isEditing = false, onSave, onCancel }: IdeaContentProps) {
  const [editContent, setEditContent] = useState(idea.content);
  const [editTags, setEditTags] = useState<string[]>(idea.tags || []);
  // 為每個資源添加唯一 ID 以確保正確刪除
  const [editResources, setEditResources] = useState<EditableResource[]>(
    () => (idea.resources || []).map((resource) => ({
      ...resource,
      id: crypto.randomUUID(),
    }))
  );
  const [newTag, setNewTag] = useState('');
  const [newResourceName, setNewResourceName] = useState('');
  const [newResourceUrl, setNewResourceUrl] = useState('');

  const handleAddTag = () => {
    if (newTag.trim() && editTags.length < 5 && !editTags.includes(newTag.trim())) {
      setEditTags([...editTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditTags(editTags.filter((tag) => tag !== tagToRemove));
  };

  const handleAddResource = () => {
    if (newResourceName.trim() && newResourceUrl.trim()) {
      setEditResources([
        ...editResources,
        {
          name: newResourceName.trim(),
          url: newResourceUrl.trim(),
          id: crypto.randomUUID(),
        },
      ]);
      setNewResourceName('');
      setNewResourceUrl('');
    }
  };

  const handleRemoveResource = (id: string) => {
    // 使用唯一 ID 刪除,避免重複資源造成錯誤刪除
    setEditResources(editResources.filter((resource) => resource.id !== id));
  };

  const handleSave = () => {
    if (onSave) {
      onSave({
        content: editContent,
        tags: editTags,
        resources: editResources.map((resource) => ({
          name: resource.name,
          url: resource.url,
        })),
      });
    }
  };

  if (isEditing) {
    return (
      <main className="space-y-4">
        {/* 內容編輯 */}
        <div>
          <div className="text-sm font-medium text-basic-700 mb-2">
            想法內容 <span className="text-alert">*</span>
          </div>
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            placeholder="分享你的想法..."
            rows={6}
            maxLength={1000}
            className="w-full resize-none"
            aria-label="想法內容"
          />
          <div className="text-xs text-basic-500 mt-1 text-right">
            {editContent.length}/1000
          </div>
        </div>

        {/* 標籤編輯 */}
        <div>
          <div className="text-sm font-medium text-basic-700 mb-2">
            標籤 (最多5個)
          </div>

          {/* 新增標籤輸入 */}
          {editTags.length < 5 && (
            <div className="flex gap-2 mb-3">
              <Input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="輸入標籤"
                maxLength={20}
                className="flex-1"
                aria-label="新增標籤"
              />
              <Button
                onClick={handleAddTag}
                disabled={!newTag.trim()}
                size="sm"
                variant="outline"
                aria-label="新增標籤"
              >
                <Plus className="size-4" />
              </Button>
            </div>
          )}

          {/* 當前標籤 */}
          {editTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {editTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="px-2 py-1 bg-basic-100 text-basic-500 text-xs font-medium rounded-full inline-flex items-center gap-1"
                >
                  {tag}
                  <Button
                    onClick={() => handleRemoveTag(tag)}
                    variant="ghost"
                    size="sm"
                    className="size-auto p-0 h-auto hover:text-alert ml-1"
                  >
                    <X className="size-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* 資源連結編輯 */}
        <div>
          <div className="text-sm font-medium text-basic-700 mb-2">
            資源連結
          </div>

          {/* 新增資源輸入 */}
          <div className="space-y-2 mb-3">
            <Input
              type="text"
              value={newResourceName}
              onChange={(e) => setNewResourceName(e.target.value)}
              placeholder="資源名稱"
              maxLength={100}
              aria-label="資源名稱"
            />
            <div className="flex gap-2">
              <Input
                type="url"
                value={newResourceUrl}
                onChange={(e) => setNewResourceUrl(e.target.value)}
                placeholder="資源連結 (https://...)"
                className="flex-1"
                aria-label="資源連結"
              />
              <Button
                onClick={handleAddResource}
                disabled={!newResourceName.trim() || !newResourceUrl.trim()}
                size="sm"
                variant="outline"
                aria-label="新增資源"
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </div>

          {/* 當前資源 */}
          {editResources.length > 0 && (
            <div className="space-y-2">
              {editResources.map((resource) => (
                <div
                  key={resource.id}
                  className="flex items-center justify-between p-2 sm:p-3 bg-primary-lightest rounded-lg"
                >
                  <div className="flex items-center flex-1 min-w-0">
                    <LinkIcon size={14} className="text-primary-base mr-1 sm:mr-2 flex-shrink-0" />
                    <span className="text-primary-darker text-xs sm:text-sm truncate">
                      {resource.name}
                    </span>
                  </div>
                  <Button
                    onClick={() => handleRemoveResource(resource.id)}
                    variant="ghost"
                    size="sm"
                    className="size-auto p-1 h-auto hover:text-alert ml-2"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 編輯操作按鈕 */}
        <div className="flex gap-2 pt-4">
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1"
          >
            取消
          </Button>
          <Button
            onClick={handleSave}
            disabled={!editContent.trim()}
            className="flex-1"
          >
            <Save className="size-4 mr-2" />
            儲存
          </Button>
        </div>
      </main>
    );
  }

  // 顯示模式（原始設計）
  return (
    <main>
      <div className="prose max-w-none">
        <p className="text-basic-500 leading-relaxed whitespace-pre-wrap">{idea.content}</p>
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
            {idea.resources.map((resource: IdeaResourceSchema) => (
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
  );
}
