import React, { useState, useCallback, useRef } from 'react';
import { useForm, useFieldArray, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { Textarea } from '@/components/atoms/textarea';
import { Label } from '@/components/atoms/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/atoms/select';
import {
  Image as ImageIcon,
  Hash,
  Link as LinkIcon,
  X,
  Edit,
  Trash2,
} from 'lucide-react';
import Image from '@/shared/components/Image';
import type {
  CreateIdeaRequest,
  UpdateIdeaRequest,
} from '@/services/modules/ideas';
import { createIdeaSchema, updateIdeaSchema } from '@/services/modules/ideas/schema';
import AddResourceForm from './AddResourceForm';
import { useIdeasContext } from '../contexts';
import { generateUniqueId, getTagCategoryClass } from '../utils';
import type { IdeaTag } from '../types';

// Form Props
interface IdeaFormCreateProps {
  id?: undefined;
  isLoading: boolean;
  defaultValues?: Partial<CreateIdeaRequest>;
  onSubmit: (data: CreateIdeaRequest) => void;
  onCancel?: () => void;
}

interface IdeaFormUpdateProps {
  id: string;
  isLoading: boolean;
  defaultValues?: Partial<UpdateIdeaRequest>;
  onSubmit: (data: UpdateIdeaRequest) => void;
  onCancel?: () => void;
}

type IdeaFormProps = IdeaFormCreateProps | IdeaFormUpdateProps;

const IdeaForm: React.FC<IdeaFormProps> = ({
  id,
  defaultValues,
  isLoading,
  onSubmit,
  onCancel,
}) => {
  // Context and state
  const { state: contextState, addTag, removeTag } = useIdeasContext();
  const [previewImage, setPreviewImage] = useState<string | null>(
    defaultValues?.imageUrls?.[0] ?? null
  );
  const [isAddingResource, setIsAddingResource] = useState(false);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [customTagInput, setCustomTagInput] = useState('');
  const [editingResourceId, setEditingResourceId] = useState<number | null>(null);
  const [editResourceName, setEditResourceName] = useState('');
  const [editResourceUrl, setEditResourceUrl] = useState('');
  const [urlError, setUrlError] = useState('');

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form setup
  const methods = useForm<CreateIdeaRequest | UpdateIdeaRequest>({
    resolver: zodResolver(id ? updateIdeaSchema : createIdeaSchema) as unknown as Resolver<CreateIdeaRequest | UpdateIdeaRequest>,
    defaultValues: {
      title: '',
      content: '',
      imageUrls: [],
      visibility: 'public',
      ideaResources: [],
      tags: [],
      ...defaultValues,
    } as CreateIdeaRequest | UpdateIdeaRequest,
  });

  // Field array for resources
  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: 'ideaResources',
  });

  // Watch form values
  const watchedContent = methods.watch('content');
  const watchedTitle = methods.watch('title');

  // Handlers
  const handleFormSubmit = useCallback((data: CreateIdeaRequest | UpdateIdeaRequest) => {
    if (typeof id === 'string') {
      onSubmit(data as UpdateIdeaRequest);
    } else {
      onSubmit(data as CreateIdeaRequest);
    }
  }, [id, onSubmit]);

  const handleImageUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleImageRemove = useCallback(() => {
    methods.setValue('imageUrls', []);
    setPreviewImage(null);
  }, [methods]);

  const handleTagClick = useCallback((tag: IdeaTag) => {
    const currentTags = methods.watch('tags') || [];
    if (!currentTags.includes(tag.name) && currentTags.length < 3) {
      methods.setValue('tags', [...currentTags, tag.name]);
      addTag(tag);
    }
    setShowTagSuggestions(false);
  }, [methods, addTag]);

  const removeTagFromForm = useCallback((tagName: string) => {
    const currentTags = methods.watch('tags') || [];
    const filteredTags = currentTags.filter((t: string) => t !== tagName);
    methods.setValue('tags', filteredTags);

    // Find and remove from context
    const contextTag = contextState.selectedTags.find((t: IdeaTag) => t.name === tagName);
    if (contextTag) {
      removeTag(contextTag.id);
    }
  }, [methods, contextState.selectedTags, removeTag]);

  const createCustomTag = useCallback(() => {
    if (customTagInput.trim()) {
      const currentTags = methods.watch('tags') || [];
      if (!currentTags.includes(customTagInput.trim()) && currentTags.length < 3) {
        const newTag: IdeaTag = {
          id: generateUniqueId().toString(),
          name: customTagInput.trim(),
          category: 'custom',
          count: 1
        };
        methods.setValue('tags', [...currentTags, newTag.name]);
        addTag(newTag);
        setCustomTagInput('');
        setShowTagSuggestions(false);
      }
    }
  }, [customTagInput, methods, addTag]);

  const addNewResource = useCallback((resourceData: { name: string; url: string }) => {
    const newResource = {
      id: generateUniqueId(),
      name: resourceData.name.trim(),
      url: resourceData.url.trim(),
    };
    append(newResource);
    setIsAddingResource(false);
  }, [append]);

  const startEditResource = useCallback((resource: { id: number; name: string; url: string }) => {
    setEditingResourceId(resource.id);
    setEditResourceName(resource.name);
    setEditResourceUrl(resource.url);
  }, []);

  const saveEditResource = useCallback(() => {
    setUrlError('');

    if (editResourceName.trim() && editResourceUrl.trim()) {
      const urlPattern = /^https?:\/\/.+/;
      if (!urlPattern.test(editResourceUrl.trim())) {
        setUrlError('請輸入有效的網址格式，例如：https://example.com');
        return;
      }

      const resourceIndex = fields.findIndex((f) => f.id === String(editingResourceId));
      if (resourceIndex !== -1) {
        methods.setValue(`ideaResources.${resourceIndex}.name`, editResourceName.trim());
        methods.setValue(`ideaResources.${resourceIndex}.url`, editResourceUrl.trim());
      }

      setEditingResourceId(null);
      setEditResourceName('');
      setEditResourceUrl('');
      setUrlError('');
    }
  }, [editResourceName, editResourceUrl, editingResourceId, fields, methods]);

  const cancelEditResource = useCallback(() => {
    setEditingResourceId(null);
    setEditResourceName('');
    setEditResourceUrl('');
    setUrlError('');
  }, []);

  const charactersUsed = watchedContent?.length || 0;
  const charactersRemaining = 2000 - charactersUsed;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-primary-base px-6 py-4 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center border border-white border-opacity-30 text-white font-medium mr-3">
              💡
            </div>
            <div>
              <h1 className="text-white font-medium text-lg">
                {id ? '編輯想法' : '分享新想法'}
              </h1>
              <p className="text-white text-sm opacity-80">
                與島友分享你的學習洞察和創新想法
              </p>
            </div>
          </div>
          {onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="text-white hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={methods.handleSubmit((data) => handleFormSubmit(data as unknown as (CreateIdeaRequest | UpdateIdeaRequest)))}>
        <div className="bg-white rounded-b-2xl shadow-lg overflow-hidden">
          <div className="p-6 space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="body-sm text-basic-500">
                想法標題 *
              </Label>
              <Input
                id="title"
                placeholder="給你的想法一個吸引人的標題..."
                {...methods.register('title')}
                className="border-basic-200 hover:border-primary-base focus:border-primary-base"
              />
              {methods.formState.errors.title && (
                <p className="text-xs text-red-500">
                  {methods.formState.errors.title.message}
                </p>
              )}
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content" className="body-sm text-basic-500">
                想法內容 *
              </Label>
              <Textarea
                id="content"
                placeholder="分享你的學習洞察、重要發現或創新想法..."
                rows={8}
                {...methods.register('content')}
                className="border-basic-200 hover:border-primary-base focus:border-primary-base resize-none"
              />
              <div className="flex justify-between items-center">
                {methods.formState.errors.content && (
                  <p className="text-xs text-red-500">
                    {methods.formState.errors.content.message}
                  </p>
                )}
                <p className={`text-xs ml-auto ${
                  charactersRemaining < 100 ? 'text-red-500' : 'text-basic-300'
                }`}
                >
                  {charactersUsed}/2000
                </p>
              </div>
            </div>

            {/* Visibility */}
            <div className="space-y-2">
              <Label className="body-sm text-basic-500">
                可見性
              </Label>
              <Select
                value={methods.watch('visibility')}
                onValueChange={(value) => methods.setValue('visibility', value as 'public' | 'private')}
              >
                <SelectTrigger className="border-basic-200 hover:border-primary-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">公開 - 所有人都可以看到</SelectItem>
                  <SelectItem value="private">私人 - 只有自己可以看到</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Toolbar */}
            <div className="flex items-center space-x-2 py-3 border-t border-basic-200">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleImageUpload}
                className="text-basic-400 hover:text-primary-base"
              >
                <ImageIcon className="h-4 w-4 mr-1" />
                圖片
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowTagSuggestions(!showTagSuggestions)}
                className="text-basic-400 hover:text-primary-base"
              >
                <Hash className="h-4 w-4 mr-1" />
                標籤
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsAddingResource(true)}
                className="text-basic-400 hover:text-primary-base"
              >
                <LinkIcon className="h-4 w-4 mr-1" />
                資源
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      setPreviewImage(event.target?.result as string);
                    };
                    reader.readAsDataURL(file);
                    methods.setValue('imageFiles', [file]);
                  }
                }}
              />
            </div>

            {/* Image Preview */}
            {previewImage && (
              <div className="relative group">
                <Image
                  src={previewImage}
                  alt="preview"
                  className="w-full max-h-64 object-contain rounded-lg"
                />
                <Button
                  type="button"
                  variant="alert"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleImageRemove}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Tags */}
            {contextState.selectedTags.length > 0 && (
              <div className="space-y-2">
                <Label className="body-sm text-basic-500">已選標籤</Label>
                <div className="flex flex-wrap gap-2">
                  {contextState.selectedTags.map((tag) => (
                    <span
                      key={tag.id}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm border transition-colors ${
                        getTagCategoryClass(tag.category)
                      }`}
                    >
                      <Hash className="h-3 w-3 mr-1" />
                      {tag.name}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTagFromForm(tag.name)}
                        className="ml-2 h-4 w-4 p-0 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tag Suggestions */}
            {showTagSuggestions && (
              <div className="relative">
                <div className="bg-white border border-basic-200 rounded-lg shadow-lg mt-1 z-10 max-h-64 overflow-y-auto">
                  <div className="p-3">
                    <div className="mb-3 pb-3 border-b border-basic-100">
                      <p className="text-xs text-basic-300 mb-2 px-2">建立新標籤</p>
                      <div className="flex space-x-2">
                        <Input
                          type="text"
                          value={customTagInput}
                          onChange={(e) => setCustomTagInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              createCustomTag();
                            }
                          }}
                          placeholder="輸入新標籤名稱"
                          className="text-sm"
                        />
                        <Button
                          type="button"
                          onClick={createCustomTag}
                          disabled={!customTagInput.trim() || contextState.selectedTags.length >= 3}
                          size="sm"
                          className="bg-primary-base hover:bg-primary-darker"
                        >
                          新增
                        </Button>
                      </div>
                    </div>

                    <div className="text-xs text-basic-300 mb-2 px-2">熱門標籤</div>
                    {contextState.availableTags.map((tag) => (
                      <Button
                        key={tag.id}
                        type="button"
                        variant="ghost"
                        onClick={() => handleTagClick(tag)}
                        className="w-full text-left px-3 py-2 rounded-lg flex items-center justify-between group transition-colors hover:bg-basic-100"
                        disabled={!!(contextState.selectedTags.find((t) => t.id === tag.id) || contextState.selectedTags.length >= 3)}
                      >
                        <div className="flex items-center">
                          <Hash className="h-3 w-3 mr-2 text-basic-400" />
                          <span className={`text-sm ${
                            contextState.selectedTags.find((t) => t.id === tag.id) || contextState.selectedTags.length >= 3
                              ? 'text-basic-300'
                              : 'text-basic-500'
                          }`}
                          >
                            {tag.name}
                          </span>
                        </div>
                        <span className="text-xs text-basic-300">{tag.count}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Resources */}
            {fields.length > 0 && (
              <div className="space-y-3">
                <Label className="body-sm text-basic-500">學習資源</Label>
                {fields.map((field, index) => (
                  editingResourceId === Number(field.id) ? (
                    <div
                      key={field.id}
                      className="space-y-3 p-4 rounded-lg border bg-white"
                      style={{
                        borderColor: '#16b9b360'
                      }}
                    >
                      <div>
                        <Label className="block text-sm font-medium mb-2 text-primary-darker">
                          資源名稱
                        </Label>
                        <Input
                          type="text"
                          value={editResourceName}
                          onChange={(e) => setEditResourceName(e.target.value)}
                          placeholder="例如：設計思考入門指南"
                          className="border-basic-200 hover:border-primary-base focus:border-primary-base"
                        />
                      </div>
                      <div>
                        <Label className="block text-sm font-medium mb-2 text-primary-darker">
                          資源連結
                        </Label>
                        <Input
                          type="url"
                          value={editResourceUrl}
                          onChange={(e) => {
                            setEditResourceUrl(e.target.value);
                            setUrlError('');
                          }}
                          placeholder="https://example.com"
                          className={`border-basic-200 hover:border-primary-base focus:border-primary-base ${
                            urlError ? 'border-red-500 focus:border-red-500' : ''
                          }`}
                        />
                        {urlError && (
                          <p className="text-xs text-red-500 mt-1">{urlError}</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          type="button"
                          onClick={saveEditResource}
                          disabled={!editResourceName.trim() || !editResourceUrl.trim()}
                          size="sm"
                          className="bg-primary-base hover:bg-primary-darker"
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
                  ) : (
                    <div
                      key={field.id}
                      className="flex items-center justify-between p-3 rounded-lg border transition-colors hover:shadow-sm bg-muted/50"
                      style={{
                        borderColor: '#99ecff80'
                      }}
                    >
                      <div className="flex items-center flex-1">
                        <LinkIcon className="h-4 w-4 mr-3 text-primary-base flex-shrink-0" />
                        <span className="text-sm text-primary-darker truncate">
                          {field.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 ml-3">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditResource(field as unknown as { id: number; name: string; url: string })}
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
                  )
                ))}
              </div>
            )}

            {/* Add Resource Form */}
            {isAddingResource && (
              <AddResourceForm
                onConfirm={addNewResource}
                onCancel={() => setIsAddingResource(false)}
              />
            )}

            {/* Insights */}
            {contextState.selectedTags.length > 0 && (
              <div className="p-4 rounded-lg border bg-muted/30">
                <div className="flex items-center mb-2">
                  <div className="h-4 w-4 mr-2 text-primary-base">💡</div>
                  <span className="text-xs font-medium text-primary-base">
                    根據你的標籤，這個想法可能會幫助到 <strong>15-20 位</strong> 對相關主題有興趣的夥伴
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-basic-100 border-t border-basic-200">
            <div className="flex justify-between items-center">
              <div className="text-xs text-basic-300">
                * 必填欄位
              </div>
              <div className="flex space-x-3">
                {onCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="border-basic-200 text-basic-500 hover:bg-basic-100"
                  >
                    取消
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={isLoading || !watchedTitle?.trim() || !watchedContent?.trim()}
                  className="bg-primary-base hover:bg-primary-darker text-white disabled:bg-basic-300"
                >
                  {isLoading ? (id ? '更新中...' : '發布中...') : (id ? '更新想法' : '發布想法')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default IdeaForm;
