import React, {
  useState, useCallback, useRef, useEffect,
} from 'react';
import Link from 'next/link';
import { useFieldArray } from 'react-hook-form';
import {
  Image as ImageIcon,
  Hash,
  Link as LinkIcon,
  X,
  Edit,
  Trash2,
  FileText,
  Video,
  BookOpen,
  Globe,
  Lightbulb,
} from 'lucide-react';
import { Image } from '@/shared/ui/image';
import type {
  CreateIdeaFormSchema,
  UpdateIdeaFormSchema,
} from '@/services/ideas';
import {
  useIdeaFormValidation,
  useUpdateIdeaFormValidation,
} from '@/features/ideas/hooks/useIdeaFormValidation';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Label } from '@/shared/ui/label';
import {
  Tooltip, TooltipContent, TooltipTrigger, TooltipProvider,
} from '@/shared/ui/tooltip';
import { Badge } from '@/shared/ui/badge';

// 預設標籤 - 參考 mobile.jsx 的分類系統
const DEFAULT_TAGS = [
  { value: 'ux-design', label: 'UX設計', category: 'design' },
  { value: 'programming', label: '程式設計', category: 'tech' },
  { value: 'data-science', label: '資料科學', category: 'tech' },
  { value: 'product-management', label: '產品管理', category: 'business' },
  { value: 'psychology', label: '心理學', category: 'psychology' },
  { value: 'behavioral-science', label: '行為科學', category: 'psychology' },
  { value: 'learning-science', label: '學習科學', category: 'education' },
  { value: 'innovative-thinking', label: '創新思維', category: 'creativity' },
  { value: 'design-thinking', label: '設計思維', category: 'design' },
  { value: 'startup', label: '創業', category: 'business' },
  { value: 'time-management', label: '時間管理', category: 'productivity' },
  { value: 'ai', label: '人工智慧', category: 'tech' },
];

// 標籤分類色彩系統 - 使用專案配色
const getTagCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    design: 'bg-primary-lightest text-primary-darker border-primary-lighter',
    tech: 'bg-basic-100 text-basic-500 border-basic-200',
    business: 'bg-success/20 text-success border-success/40',
    psychology: 'bg-tips/20 text-tips border-tips/40',
    education: 'bg-primary-palest text-primary-base border-primary-lighter',
    creativity: 'bg-tips/10 text-tips border-tips/30',
    productivity: 'bg-basic-200 text-basic-400 border-basic-300',
    custom: 'bg-basic-100 text-basic-400 border-basic-200',
  };
  return colors[category] || colors.custom;
};

// 資源類型圖示 - 參考 mobile.jsx
const getResourceIcon = (type: string) => {
  const icons: Record<string, React.ReactElement> = {
    article: <FileText size={16} />,
    course: <Video size={16} />,
    book: <BookOpen size={16} />,
    website: <Globe size={16} />,
  };
  return icons[type] || <LinkIcon size={16} />;
};

// URL 驗證函數 - 參考 mobile.jsx
const validateUrl = (url: string): boolean => {
  const urlPattern = /^https?:\/\/.+/;
  return urlPattern.test(url.trim());
};

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
  // Local state - 改進圖片和標籤管理
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>(defaultValues?.tags || []);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [editingResourceIndex, setEditingResourceIndex] = useState<number | null>(null);
  const [editResourceData, setEditResourceData] = useState({ name: '', url: '' });
  const [urlError, setUrlError] = useState('');

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 新增資源狀態
  const [showResourceInput, setShowResourceInput] = useState(false);
  const [newResourceName, setNewResourceName] = useState('');
  const [newResourceUrl, setNewResourceUrl] = useState('');
  const [customTagInput, setCustomTagInput] = useState('');

  // Form setup
  const form = useIdeaFormValidation();

  // Field array for resources
  const {
    fields, append, remove, update,
  } = useFieldArray({
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
      ideaResources: fields.map(field => ({
        name: field.name,
        url: field.url,
      })),
    };
    await onSubmit(submitData);
  }, [onSubmit, selectedTags, fields]);

  // 圖片上傳處理 - 參考 mobile.jsx 的模式
  const handleImageUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleImageChange = useCallback((files: File[]) => {
    if (files.length > 0) {
      setSelectedFiles(files);

      // 生成預覽圖片
      const readers = files.map((file) => new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      }));

      Promise.all(readers).then((urls) => {
        setPreviewImages(urls);
      });

      form.setValue('imageFiles', files);
    }
  }, [form]);

  const handleImageRemove = useCallback((index?: number) => {
    if (index !== undefined) {
      // 移除特定圖片
      const newFiles = selectedFiles.filter((_, i) => i !== index);
      const newPreviews = previewImages.filter((_, i) => i !== index);
      setSelectedFiles(newFiles);
      setPreviewImages(newPreviews);
      form.setValue('imageFiles', newFiles.length > 0 ? newFiles : null);
    } else {
      // 移除所有圖片
      setSelectedFiles([]);
      setPreviewImages([]);
      form.setValue('imageFiles', null);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [form, selectedFiles, previewImages]);

  // 標籤管理 - 參考 mobile.jsx 的模式（最多3個標籤）
  const addTag = useCallback((tag: typeof DEFAULT_TAGS[0] | string) => {
    const tagValue = typeof tag === 'string' ? tag : tag.label;
    if (!selectedTags.includes(tagValue) && selectedTags.length < 3) {
      setSelectedTags((prev) => [...prev, tagValue]);
    }
    setShowTagSuggestions(false);
  }, [selectedTags]);

  const createCustomTag = useCallback((tagInput: string) => {
    if (tagInput.trim() && !selectedTags.includes(tagInput.trim()) && selectedTags.length < 3) {
      const newTagsArray = [...selectedTags, tagInput.trim()];
      setSelectedTags(newTagsArray);
      setShowTagSuggestions(false);
      return true;
    }
    return false;
  }, [selectedTags]);

  const removeTag = useCallback((tagToRemove: string) => {
    setSelectedTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  }, []);

  const startEditResource = useCallback((index: number) => {
    const resource = fields[index];
    setEditingResourceIndex(index);
    setEditResourceData({ name: resource.name, url: resource.url });
  }, [fields]);

  const saveResource = useCallback(() => {
    setUrlError('');

    if (editingResourceIndex !== null && editResourceData.name.trim() && editResourceData.url.trim()) {
      // URL 驗證 - 參考 mobile.jsx
      if (!validateUrl(editResourceData.url.trim())) {
        setUrlError('請輸入有效的網址格式，例如：https://example.com');
        return;
      }

      update(editingResourceIndex, editResourceData);
      setEditingResourceIndex(null);
      setEditResourceData({ name: '', url: '' });
      setUrlError('');
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

  return (
    <div className="bg-basic-50 flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between bg-primary-base bg-gradient-to-r px-6 py-4">
          <div className="flex items-center">
            <div className="flex size-10 items-center justify-center rounded-full border border-white/30 bg-white/20 font-medium text-white">
              島
            </div>

            <div className="ml-3">
              <div className="text-sm font-medium text-white">分享新想法</div>
              <div className="mt-1 text-xs text-white opacity-80">
                與島友分享你的學習洞察和創新想法
              </div>
            </div>
          </div>
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              className="p-2 text-white hover:bg-white/20"
            >
              <X className="size-5" />
            </Button>
          )}
        </div>

        <form onSubmit={form.handleSubmit(handleFormSubmit)}>
          <div className="p-6">
            {/* Main Content - 參考 desktop.jsx 的左側線條設計 */}
            <div className="mb-6">
              <div className="relative">
                <div className="flex items-start">
                  {/* 動態高度的垂直線 */}
                  <div
                    className={`mr-4 mt-4 w-0.5 rounded-full bg-basic-300 transition-all duration-200 ${watchedContent && watchedContent.split('\n').length > 5 ? 'h-32'
                      : watchedContent && watchedContent.split('\n').length > 3 ? 'h-24'
                        : watchedContent && watchedContent.split('\n').length > 1 ? 'h-16' : 'h-8'
                    }`}
                  />
                  <div className="flex-1">
                    <Textarea
                      {...form.register('content')}
                      placeholder="分享你的學習洞察、重要發現或創新想法..."
                      className="text-basic-700 min-h-[24px] w-full resize-none rounded-none !border-0 !border-none bg-transparent px-0 py-4 leading-6 shadow-none focus:border-transparent focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
                      maxLength={5000}
                    />
                    <div className="mt-2 text-right text-xs text-basic-400">
                      {charactersUsed}
                      /5000
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons - 使用共用組件 */}
              <div className={`relative ml-5 flex items-center space-x-2 transition-all duration-200 ${charactersUsed > 0 ? 'mt-6' : 'mt-2'
              }`}
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleImageUpload}
                        className="text-basic-600 hover:bg-basic-100"
                      >
                        <ImageIcon className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>添加圖片</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowTagSuggestions(!showTagSuggestions)}
                        className="text-basic-600 hover:bg-basic-100"
                      >
                        <Hash className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>添加領域標籤</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowResourceInput(!showResourceInput)}
                        className="text-basic-600 hover:bg-basic-100"
                      >
                        <LinkIcon className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>分享影片、書籍、文章等資源連結，讓島友們參考</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 0) {
                      handleImageChange(files.slice(0, 3));
                    }
                  }}
                  className="hidden"
                />
              </div>
            </div>

            {form.formState.errors.content && (
              <p className="mb-2 text-xs text-red-500">
                {form.formState.errors.content.message}
              </p>
            )}

            {/* 已選擇的標籤顯示 */}
            {selectedTags.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tag) => {
                    const tagObj = DEFAULT_TAGS.find((t) => t.label === tag);
                    const category = tagObj?.category || 'custom';
                    return (
                      <Badge
                        key={tag}
                        className={`${getTagCategoryColor(category)} cursor-pointer`}
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 transition-colors hover:text-red-500"
                        >
                          <X className="size-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 標籤選擇器 - 只在點擊標籤按鈕時顯示 */}
            {showTagSuggestions && (
              <div className="mb-4">
                <div className="rounded-lg border border-basic-200 bg-white p-3 shadow-lg">
                  <div className="mb-3 border-b border-basic-100 pb-3">
                    <div className="mb-2 text-xs text-basic-500">建立新標籤</div>
                    <div className="flex space-x-2">
                      <Input
                        type="text"
                        value={customTagInput}
                        onChange={(e) => setCustomTagInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (createCustomTag(customTagInput)) {
                              setCustomTagInput('');
                            }
                          }
                        }}
                        placeholder="輸入新標籤名稱"
                        className="flex-1 text-sm"
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          if (createCustomTag(customTagInput)) {
                            setCustomTagInput('');
                          }
                        }}
                        disabled={!customTagInput.trim() || selectedTags.length >= 3}
                        className="bg-primary-base text-sm text-white hover:bg-primary-darker"
                      >
                        新增
                      </Button>
                    </div>
                  </div>

                  <div className="mb-2 text-xs text-basic-500">熱門標籤</div>
                  <div className="max-h-48 overflow-y-auto">
                    {DEFAULT_TAGS.map((tag) => (
                      <button
                        key={tag.value}
                        type="button"
                        onClick={() => addTag(tag)}
                        className="group flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors hover:bg-basic-100"
                        disabled={selectedTags.includes(tag.label) || selectedTags.length >= 3}
                      >
                        <span className={`text-sm ${selectedTags.includes(tag.label) || selectedTags.length >= 3 ? 'text-basic-400' : 'text-basic-700'}`}>
                          {tag.label}
                        </span>
                        <Badge className={`${getTagCategoryColor(tag.category)} text-xs`}>
                          {tag.category}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 圖片預覽 */}
            {previewImages.length > 0 && (
              <div className="mb-4">
                <div className="grid grid-cols-3 gap-3">
                  {previewImages.map((src, index) => (
                    <div key={src} className="group relative">
                      <Image
                        src={src}
                        alt={`Preview ${index + 1}`}
                        width={120}
                        height={120}
                        className="size-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleImageRemove(index)}
                        className="absolute -right-2 -top-2 z-10 size-6 rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600"
                      >
                        <X className="size-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 已添加的資源列表 */}

            {fields.length > 0 && (
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id}>
                    {editingResourceIndex === index ? (
                      <div className="rounded-lg border border-primary-base bg-primary-base/5 p-4">
                        <div className="space-y-3">
                          <div>
                            <Label className="text-basic-600 mb-1 text-xs">資源名稱</Label>
                            <Input
                              placeholder="例如：設計思考入門指南"
                              value={editResourceData.name}
                              onChange={(e) => setEditResourceData((prev) => ({ ...prev, name: e.target.value }))}
                              className="border-basic-200"
                            />
                          </div>
                          <div>
                            <Label className="text-basic-600 mb-1 text-xs">資源連結</Label>
                            <Input
                              placeholder="https://example.com"
                              value={editResourceData.url}
                              onChange={(e) => {
                                setEditResourceData((prev) => ({ ...prev, url: e.target.value }));
                                setUrlError('');
                              }}
                              className={urlError ? 'border-red-500' : 'border-basic-200'}
                            />
                            {urlError && (
                              <p className="mt-1 text-xs text-red-500">{urlError}</p>
                            )}
                          </div>
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
                      <div className="flex items-center justify-between rounded-lg border border-primary-base/20 bg-primary-base/5 p-3 transition-colors hover:shadow-sm">
                        <div className="flex flex-1 items-center">
                          <div className="mr-3 shrink-0 text-primary-base">
                            {getResourceIcon('custom')}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="block truncate text-sm text-primary-darker">
                              {field.name || '未命名資源'}
                            </span>
                            {field.url && (
                              <Link
                                href={field.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block truncate text-xs text-primary-base hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {field.url}
                              </Link>
                            )}
                          </div>
                        </div>
                        <div className="ml-3 flex items-center space-x-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditResource(index)}
                            className="size-8 p-0 text-basic-400 hover:text-blue-500"
                          >
                            <Edit className="size-3" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(index)}
                            className="size-8 p-0 text-basic-400 hover:text-red-500"
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 新增資源輸入框 */}
            {showResourceInput && (
              <div className="space-y-3 rounded-lg border border-primary-base/20 bg-primary-base/5 p-4">
                <div>
                  <Label className="mb-2 block text-sm font-medium text-primary-darker">
                    資源名稱
                  </Label>
                  <Input
                    type="text"
                    value={newResourceName}
                    onChange={(e) => setNewResourceName(e.target.value)}
                    placeholder="例如：設計思考入門指南"
                    className="w-full border-basic-200"
                  />
                </div>
                <div>
                  <Label className="mb-2 block text-sm font-medium text-primary-darker">
                    資源連結
                  </Label>
                  <Input
                    type="url"
                    value={newResourceUrl}
                    onChange={(e) => {
                      setNewResourceUrl(e.target.value);
                      setUrlError('');
                    }}
                    placeholder="https://example.com"
                    className={`w-full ${urlError ? 'border-red-500' : 'border-basic-200'}`}
                  />
                  {urlError && (
                    <p className="mt-1 text-xs text-red-500">{urlError}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowResourceInput(false);
                      setNewResourceName('');
                      setNewResourceUrl('');
                      setUrlError('');
                    }}
                    className="flex-1"
                  >
                    取消
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setUrlError('');
                      if (!validateUrl(newResourceUrl)) {
                        setUrlError('請輸入有效的網址格式，例如：https://example.com');
                        return;
                      }
                      const newResource = {
                        name: newResourceName,
                        url: newResourceUrl,
                      };
                      append(newResource);
                      setNewResourceName('');
                      setNewResourceUrl('');
                      setShowResourceInput(false);
                    }}
                    disabled={!newResourceName.trim() || !newResourceUrl.trim()}
                    className="flex-1 bg-primary-base text-white hover:bg-primary-darker"
                  >
                    新增
                  </Button>

                </div>
              </div>
            )}

            {/* 分類提示 */}
            {selectedTags.length > 0 && (
              <div className="mt-4 flex items-center rounded-lg bg-primary-base/5 p-3">
                <Lightbulb size={16} className="mr-2 text-primary-base" />
                <span className="text-basic-600 text-xs">
                  根據你的標籤，這個想法可能會幫助到
                  {' '}
                  <strong>15-20 位</strong>
                  {' '}
                  對相關主題有興趣的夥伴
                </span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-basic-200 pt-6">
            <div className="m-4 flex items-center  justify-end">
              <Button
                type="submit"
                disabled={isLoading || !watchedContent?.trim()}
                className="rounded-lg bg-primary-base px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-darker disabled:cursor-not-allowed disabled:bg-basic-300"
              >
                {isLoading ? '分享中...' : '分享想法'}
              </Button>
            </div>
          </div>
        </form>
      </div>
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
    <div className="mx-auto max-w-4xl">
      {/* 類似的 UI 結構，但標題改為 "編輯想法" */}
      <div className="rounded-t-2xl bg-primary-base px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="mr-3 flex size-10 items-center justify-center rounded-full border border-white border-opacity-30 bg-white bg-opacity-20 font-medium text-white">
              💡
            </div>
            <div>
              <h1 className="text-lg font-medium text-white">編輯想法</h1>
              <p className="text-sm text-white opacity-80">修改你的想法內容和相關資源</p>
            </div>
          </div>
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
      </div>

      <form onSubmit={form.handleSubmit(handleFormSubmit)}>
        <div className="space-y-6 rounded-b-2xl bg-white p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="content" className="text-sm text-basic-500">
                想法內容
                {' '}
                <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="content"
                placeholder="分享你的學習洞察、重要發現或創新想法..."
                rows={8}
                {...form.register('content')}
                className="resize-none border-basic-200 hover:border-primary-base focus:border-primary-base"
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
                className="bg-primary-base text-white hover:bg-primary-darker disabled:bg-basic-300"
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
