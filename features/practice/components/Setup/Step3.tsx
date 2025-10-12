import React, { useState } from 'react';
import {
  Plus, X, Link as LinkIcon, AlertCircle,
} from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { CustomLink } from '@/shared/ui/custom-link';

interface Step3Props {
  handleNextStep: () => void;
  handlePrevStep?: () => void;
  validationErrors?: Record<string, string>;
  resources: Array<{ id: number; name: string; url: string }>;
  newResourceName: string;
  newResourceUrl: string;
  setNewResourceName: (value: string) => void;
  setNewResourceUrl: (value: string) => void;
  addResource: () => void;
  removeResource: (id: number) => void;
}

const Step3: React.FC<Step3Props> = ({
  handleNextStep,
  handlePrevStep,
  validationErrors = {},
  resources,
  newResourceName,
  newResourceUrl,
  setNewResourceName,
  setNewResourceUrl,
  addResource,
  removeResource,
}) => {
  const [urlError, setUrlError] = useState<string>('');
  const [nameError, setNameError] = useState<string>('');

  // 驗證資源名稱
  const validateName = (name: string) => {
    if (!name.trim()) {
      setNameError('請輸入資源名稱');
      return false;
    }
    if (name.length > 100) {
      setNameError('資源名稱不可超過 100 字');
      return false;
    }
    setNameError('');
    return true;
  };

  // 驗證 URL
  const validateUrl = (url: string) => {
    if (!url.trim()) {
      setUrlError('');
      return true; // URL 是選填的
    }

    // 使用簡單的 URL 格式檢查
    if (!/^https?:\/\/.+/.test(url)) {
      setUrlError('請輸入有效的網址');
      return false;
    }

    setUrlError('');
    return true;
  };

  // 處理新增資源
  const handleAddResource = () => {
    const isNameValid = validateName(newResourceName);
    const isUrlValid = validateUrl(newResourceUrl);

    if (isNameValid && isUrlValid) {
      addResource();
      setNameError('');
      setUrlError('');
    }
  };

  // 處理名稱變更
  const handleNameChange = (value: string) => {
    setNewResourceName(value);
    if (nameError) {
      validateName(value);
    }
  };

  // 處理 URL 變更
  const handleUrlChange = (value: string) => {
    setNewResourceUrl(value);
    if (urlError) {
      validateUrl(value);
    }
  };
  return (
    <div className="overflow-hidden rounded-lg border border-basic-200 bg-white shadow-sm">
      <div className="p-6">
        <div className="mb-2 flex items-center">
          <div className="mr-2 size-2 rounded-full bg-primary-base" />
          <span className="text-sm text-basic-400">主題實踐</span>
        </div>
        <h3 className="text-2xl font-bold text-basic-600">資源</h3>
        <p className="mt-1 text-sm text-basic-400">
          新增實踐中可能會用的資源，例如書籍、Podcast或影片
        </p>
      </div>

      <div className="p-6 pt-0">
        <div className="space-y-6">
          <div className="rounded-lg border border-border p-4">
            <div className="mb-4 flex items-center justify-between">
              <Label className="text-sm font-medium text-basic-600">添加資源</Label>
              <span className="text-xs text-basic-400">
                {resources.length}
                /5
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="mb-2 block text-xs font-medium text-basic-600">
                  資源名稱
                  {' '}
                  <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="例如：原子習慣、How to Learn Faster podcast"
                    value={newResourceName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    onBlur={() => validateName(newResourceName)}
                    className={cn(
                      'text-basic-600 placeholder:text-basic-400',
                      (validationErrors.resourceName || nameError) && 'border-destructive'
                    )}
                    maxLength={100}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-basic-400">
                    {newResourceName.length}
                    /100
                  </span>
                </div>
                {nameError && (
                  <div className="mt-1 flex items-center text-xs text-destructive">
                    <AlertCircle className="mr-1 size-3" />
                    <span>{nameError}</span>
                  </div>
                )}
                <p className="mt-1 text-xs text-basic-400">
                  輸入清楚的資源名稱，方便日後查找
                </p>
              </div>

              <div>
                <Label className="mb-2 block text-xs font-medium text-basic-600">
                  資源連結
                </Label>
                <Input
                  type="url"
                  placeholder="https://..."
                  value={newResourceUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  onBlur={() => validateUrl(newResourceUrl)}
                  className={cn(
                    'text-basic-600 placeholder:text-basic-400',
                    (validationErrors.resourceUrl || urlError) && 'border-destructive'
                  )}
                />
                {urlError && (
                  <div className="mt-1 flex items-center text-xs text-destructive">
                    <AlertCircle className="mr-1 size-3" />
                    <span>{urlError}</span>
                  </div>
                )}
                <p className="mt-1 text-xs text-basic-400">
                  請輸入完整的網址（需以 https:// 開頭）
                </p>
              </div>

              <div className="pt-2">
                <Button
                  onClick={handleAddResource}
                  disabled={!newResourceName.trim() || resources.length >= 5 || !!nameError || !!urlError}
                  className="flex items-center"
                >
                  <Plus className="mr-2 size-4" />
                  添加資源
                </Button>

                {validationErrors.resources && (
                  <p className="mt-2 text-sm text-destructive">{validationErrors.resources}</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <Label className="mb-3 block text-sm font-medium text-basic-600">已添加的資源</Label>

            {resources.length > 0 ? (
              <div className="space-y-3">
                {resources.map((resource) => (
                  <div key={resource.id} className="w-full">
                    {resource.url ? (
                      <CustomLink
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex w-full items-center rounded-lg  border border-primary/20 bg-primary-lightest p-4 text-sm font-medium text-primary transition-colors"
                      >
                        <div className="mr-3 flex size-8 shrink-0 items-center justify-center rounded-lg">
                          <LinkIcon className="size-4 text-primary" />
                        </div>
                        <span className="flex-1 truncate">{resource.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeResource(resource.id);
                          }}
                          className="ml-2 size-auto p-1 text-primary hover:text-destructive"
                        >
                          <X className="size-4" />
                        </Button>
                      </CustomLink>
                    ) : (
                      <div className="flex w-full items-center rounded-lg border border-primary/20 bg-primary-lightest p-4 text-sm font-medium text-primary">
                        <div className="mr-3 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <LinkIcon className="size-4 text-primary" />
                        </div>
                        <div className="flex items-center text-sm font-medium transition-colors">
                          <span className="truncate">{resource.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeResource(resource.id)}
                          className="ml-2 size-auto p-1 text-primary hover:text-destructive"
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-basic-200 bg-basic-50 py-8 text-center text-basic-400">
                <p className="text-sm">尚未添加任何資源</p>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <p className="text-center text-sm text-basic-600">
              你的資源分享將能幫助有相同興趣的島友們
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between p-6 pt-0">
        <Button
          variant="outline"
          onClick={handlePrevStep}
          className="bg-white text-basic-600 border-basic-200 hover:bg-white hover:border-primary-base hover:text-basic-600"
        >
          上一步
        </Button>
        <Button
          onClick={handleNextStep}
          className="bg-primary-base text-white hover:bg-primary-base/90"
        >
          下一步
        </Button>
      </div>
    </div>
  );
};

export default Step3;
