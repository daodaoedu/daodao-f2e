import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useFieldArray } from 'react-hook-form';
import {
  Image as ImageIcon,
  Hash,
  Link as LinkIcon,
  X,
  Edit,
  Trash2,
} from 'lucide-react';
import NextImage from 'next/image';
import type {
  CreateIdeaFormSchema,
  UpdateIdeaFormSchema
} from '@/services/ideas';
import {
  useIdeaFormValidation,
  useUpdateIdeaFormValidation
} from '@/features/ideas/hooks/useIdeaFormValidation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// 預設標籤
const DEFAULT_TAGS = [
  '程式設計', '設計思維', '創業', '學習方法', '時間管理',
  '創意發想', '人工智慧', '用戶體驗', '專案管理', '心理學'
];

// 創建想法表單組件
interface IdeaCreateFormProps {
  mode: 'create';
  defaultValues?: Partial<CreateIdeaFormSchema>;
  onSubmit: (data: CreateIdeaFormSchema) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

const IdeaCreateForm: React.FC<IdeaCreateFormProps> = ({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  // Local state
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>(defaultValues?.tags || []);
  const [customTagInput, setCustomTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [editingResourceIndex, setEditingResourceIndex] = useState<number | null>(null);
  const [editResourceData, setEditResourceData] = useState({ name: '', url: '' });

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form setup
  const form = useIdeaFormValidation();

  // Field array for resources
  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: 'ideaResources',
  });

  // Watch form values
  const watchedContent = form.watch('content');

  // 設置預設值
  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
      setSelectedTags(defaultValues.tags || []);
    }
  }, [defaultValues, form]);

  // Handlers
  const handleFormSubmit = useCallback(async (data: CreateIdeaFormSchema) => {
    const submitData = {
      ...data,
      tags: selectedTags,
    };
    await onSubmit(submitData);
  }, [onSubmit, selectedTags]);

  const handleImageUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      form.setValue('imageFiles', [file]);
    }
  }, [form]);

  const handleImageRemove = useCallback(() => {
    setPreviewImage(null);
    form.setValue('imageFiles', null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [form]);

  const addTag = useCallback((tagName: string) => {
    if (!selectedTags.includes(tagName) && selectedTags.length < 5) {
      setSelectedTags((prev) => [...prev, tagName]);
    }
  }, [selectedTags]);

  const handleCustomTag = useCallback(() => {
    if (customTagInput.trim() && !selectedTags.includes(customTagInput.trim()) && selectedTags.length < 5) {
      const newTagsArray = [...selectedTags, customTagInput.trim()];
      setSelectedTags(newTagsArray);
      setCustomTagInput('');
      setShowTagSuggestions(false);
    }
  }, [customTagInput, selectedTags]);

  const addResource = useCallback(() => {
    append({ name: '', url: '' });
    setEditingResourceIndex(fields.length);
    setEditResourceData({ name: '', url: '' });
  }, [append, fields.length]);

  const startEditResource = useCallback((index: number) => {
    const resource = fields[index];
    setEditingResourceIndex(index);
    setEditResourceData({ name: resource.name, url: resource.url });
  }, [fields]);

  const saveResource = useCallback(() => {
    if (editingResourceIndex !== null && editResourceData.name.trim() && editResourceData.url.trim()) {
      update(editingResourceIndex, editResourceData);
      setEditingResourceIndex(null);
      setEditResourceData({ name: '', url: '' });
    }
  }, [editingResourceIndex, editResourceData, update]);

  const cancelEditResource = useCallback(() => {
    if (editingResourceIndex !== null && editingResourceIndex >= fields.length - 1 && !fields[editingResourceIndex]?.name) {
      remove(editingResourceIndex);
    }
    setEditingResourceIndex(null);
    setEditResourceData({ name: '', url: '' });
  }, [editingResourceIndex, fields, remove]);

  const charactersUsed = watchedContent?.length || 0;
  const charactersRemaining = 5000 - charactersUsed;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-primary-base px-6 py-4 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center border border-white border-opacity-30 text-white font-medium mr-3">
              💡
            </div>
            <div>
              <h1 className="text-white font-medium text-lg">
                分享新想法
              </h1>
              <p className="text-white text-sm opacity-80">
                與島友分享你的學習洞察和創新想法
              </p>
            </div>
          </div>
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <form onSubmit={form.handleSubmit(handleFormSubmit)}>
        <div className="bg-white rounded-b-2xl p-6 space-y-6">
          {/* Main Content */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="content" className="text-sm text-basic-500">
                想法內容 <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="content"
                placeholder="分享你的學習洞察、重要發現或創新想法..."
                rows={8}
                {...form.register('content')}
                className="border-basic-200 hover:border-primary-base focus:border-primary-base resize-none"
              />
              <div className="flex justify-between items-center">
                {form.formState.errors.content && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.content.message}
                  </p>
                )}
                <span className={`text-xs ml-auto ${charactersRemaining < 100 ? 'text-red-500' : 'text-basic-400'}`}>
                  {charactersUsed}/5000 字
                </span>
              </div>
            </div>

            {/* Visibility */}
            <div className="space-y-2">
              <Label className="text-sm text-basic-500">可見性</Label>
              <Select
                value={form.watch('visibility')}
                onValueChange={(value) => form.setValue('visibility', value as 'public' | 'private')}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="選擇可見性" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">🌍 公開 - 所有人都能看到</SelectItem>
                  <SelectItem value="private">🔒 私人 - 只有你能看到</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label className="text-sm text-basic-500">標籤 (最多5個)</Label>

              {/* Selected Tags */}
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedTags.map((tag, index) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-base/10 text-primary-darker border border-primary-base/20"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => setSelectedTags((prev) => prev.filter((_, i) => i !== index))}
                        className="ml-2 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Tag Input */}
              <div className="relative">
                <Input
                  value={customTagInput}
                  onChange={(e) => {
                    setCustomTagInput(e.target.value);
                    setShowTagSuggestions(e.target.value.length > 0);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCustomTag();
                    }
                  }}
                  placeholder="輸入自定義標籤..."
                  className="border-basic-200 hover:border-primary-base focus:border-primary-base"
                  disabled={selectedTags.length >= 5}
                />
                {customTagInput && (
                  <Button
                    type="button"
                    onClick={handleCustomTag}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 px-2 text-xs"
                    disabled={selectedTags.length >= 5}
                  >
                    添加
                  </Button>
                )}
              </div>

              {/* Tag Suggestions */}
              {showTagSuggestions && (
                <div className="border border-basic-200 rounded-lg p-3 bg-basic-50">
                  <p className="text-xs text-basic-500 mb-2">建議標籤：</p>
                  <div className="flex flex-wrap gap-2">
                    {DEFAULT_TAGS
                      .filter((tag) => !selectedTags.includes(tag) && tag.toLowerCase().includes(customTagInput.toLowerCase()))
                      .slice(0, 8)
                      .map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => addTag(tag)}
                          disabled={selectedTags.length >= 5}
                          className="px-2 py-1 text-xs rounded-full bg-white border border-basic-200 hover:border-primary-base hover:bg-primary-base/5 transition-colors disabled:opacity-50"
                        >
                          #{tag}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label className="text-sm text-basic-500">圖片 (選填)</Label>
              <div className="border-2 border-dashed border-basic-200 rounded-lg p-6 text-center hover:border-primary-base transition-colors">
                {previewImage ? (
                  <div className="relative inline-block">
                    <NextImage
                      src={previewImage}
                      alt="Preview"
                      width={200}
                      height={150}
                      className="rounded-lg object-cover"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleImageRemove}
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div>
                    <ImageIcon className="h-12 w-12 mx-auto text-basic-300 mb-2" />
                    <p className="text-sm text-basic-500 mb-2">點擊上傳圖片或拖拽到此處</p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleImageUpload}
                      className="text-primary-base border-primary-base hover:bg-primary-base hover:text-white"
                    >
                      選擇圖片
                    </Button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Resources */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-basic-500">相關資源 (選填)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addResource}
                  className="text-primary-base border-primary-base hover:bg-primary-base hover:text-white"
                >
                  <LinkIcon className="h-3 w-3 mr-1" />
                  添加資源
                </Button>
              </div>

              {fields.length > 0 && (
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id}>
                      {editingResourceIndex === index ? (
                        <div className="border border-primary-base rounded-lg p-4 bg-primary-base/5">
                          <div className="space-y-3">
                            <Input
                              placeholder="資源名稱"
                              value={editResourceData.name}
                              onChange={(e) => setEditResourceData((prev) => ({ ...prev, name: e.target.value }))}
                              className="border-basic-200"
                            />
                            <Input
                              placeholder="資源網址 (https://...)"
                              value={editResourceData.url}
                              onChange={(e) => setEditResourceData((prev) => ({ ...prev, url: e.target.value }))}
                              className="border-basic-200"
                            />
                            <div className="flex justify-end space-x-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={saveResource}
                                size="sm"
                                disabled={!editResourceData.name.trim() || !editResourceData.url.trim()}
                              >
                                保存
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={cancelEditResource}
                                size="sm"
                              >
                                取消
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-3 rounded-lg border transition-colors hover:shadow-sm bg-basic-50 border-basic-200">
                          <div className="flex items-center flex-1">
                            <LinkIcon className="h-4 w-4 mr-3 text-primary-base flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <span className="text-sm text-primary-darker block truncate">
                                {field.name || '未命名資源'}
                              </span>
                              {field.url && (
                                <span className="text-xs text-basic-400 block truncate">
                                  {field.url}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-3">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditResource(index)}
                              className="text-basic-400 hover:text-blue-500 h-8 w-8 p-0"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => remove(index)}
                              className="text-basic-400 hover:text-red-500 h-8 w-8 p-0"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-basic-200 pt-6">
            <div className="flex items-center justify-between">
              <div className="text-xs text-basic-400">
                <Hash className="h-3 w-3 inline mr-1" />
                記得添加相關標籤，讓更多人發現你的想法
              </div>
              <div className="flex items-center space-x-3">
                {onCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isLoading}
                  >
                    取消
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={isLoading || !watchedContent?.trim()}
                  className="bg-primary-base hover:bg-primary-darker text-white disabled:bg-basic-300"
                >
                  {isLoading ? '發布中...' : '發布想法'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

// 更新想法表單組件
interface IdeaUpdateFormProps {
  mode: 'update';
  defaultValues?: Partial<UpdateIdeaFormSchema>;
  onSubmit: (data: UpdateIdeaFormSchema) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

const IdeaUpdateForm: React.FC<IdeaUpdateFormProps> = ({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  // 簡化的更新表單，只包含基本功能
  const form = useUpdateIdeaFormValidation(defaultValues);

  const watchedContent = form.watch('content');

  const handleFormSubmit = useCallback(async (data: UpdateIdeaFormSchema) => {
    await onSubmit(data);
  }, [onSubmit]);

  return (
    <div className="max-w-4xl mx-auto">
      {/* 類似的 UI 結構，但標題改為 "編輯想法" */}
      <div className="bg-primary-base px-6 py-4 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center border border-white border-opacity-30 text-white font-medium mr-3">
              💡
            </div>
            <div>
              <h1 className="text-white font-medium text-lg">編輯想法</h1>
              <p className="text-white text-sm opacity-80">修改你的想法內容和相關資源</p>
            </div>
          </div>
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <form onSubmit={form.handleSubmit(handleFormSubmit)}>
        <div className="bg-white rounded-b-2xl p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="content" className="text-sm text-basic-500">
                想法內容 <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="content"
                placeholder="分享你的學習洞察、重要發現或創新想法..."
                rows={8}
                {...form.register('content')}
                className="border-basic-200 hover:border-primary-base focus:border-primary-base resize-none"
              />
              {form.formState.errors.content && (
                <p className="text-xs text-red-500">
                  {form.formState.errors.content.message}
                </p>
              )}
            </div>
          </div>

          <div className="border-t border-basic-200 pt-6">
            <div className="flex items-center justify-end space-x-3">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  取消
                </Button>
              )}
              <Button
                type="submit"
                disabled={isLoading || !watchedContent?.trim()}
                className="bg-primary-base hover:bg-primary-darker text-white disabled:bg-basic-300"
              >
                {isLoading ? '更新中...' : '更新想法'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

// 主要導出組件
type IdeaFormProps = IdeaCreateFormProps | IdeaUpdateFormProps;

const IdeaForm: React.FC<IdeaFormProps> = ({ mode, ...restProps }) => {
  if (mode === 'create') {
    return <IdeaCreateForm mode={mode} {...(restProps as Omit<IdeaCreateFormProps, 'mode'>)} />;
  }
  return <IdeaUpdateForm mode={mode} {...(restProps as Omit<IdeaUpdateFormProps, 'mode'>)} />;
};

export default IdeaForm;
