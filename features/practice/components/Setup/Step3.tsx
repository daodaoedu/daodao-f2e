import React, { useState } from 'react';
import { Plus, X, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

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
  removeResource
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
    <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
      <div className="p-6">
        <div className="flex items-center mb-2">
          <div className="w-2 h-2 rounded-full mr-2 bg-primary" />
          <span className="text-sm text-muted-foreground">主題實踐</span>
        </div>
        <h3 className="text-2xl font-bold text-foreground">資源</h3>
        <p className="text-sm text-muted-foreground mt-1">
          新增實踐中可能會用的資源，例如書籍、Podcast或影片
        </p>
      </div>

      <div className="p-6 pt-0">
        <div className="space-y-6">
          <div className="border border-border rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <Label className="text-sm font-medium text-foreground">添加資源</Label>
              <span className="text-xs text-muted-foreground">{resources.length}/5</span>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="block text-xs font-medium text-foreground mb-2">
                  資源名稱 <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="例如：原子習慣、How to Learn Faster podcast"
                    value={newResourceName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    onBlur={() => validateName(newResourceName)}
                    className={cn((validationErrors.resourceName || nameError) && "border-destructive")}
                    maxLength={100}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    {newResourceName.length}/100
                  </span>
                </div>
                {nameError && (
                  <div className="flex items-center mt-1 text-xs text-destructive">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    <span>{nameError}</span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  輸入清楚的資源名稱，方便日後查找
                </p>
              </div>

              <div>
                <Label className="block text-xs font-medium text-foreground mb-2">
                  資源連結
                </Label>
                <Input
                  type="url"
                  placeholder="https://..."
                  value={newResourceUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  onBlur={() => validateUrl(newResourceUrl)}
                  className={cn((validationErrors.resourceUrl || urlError) && "border-destructive")}
                />
                {urlError && (
                  <div className="flex items-center mt-1 text-xs text-destructive">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    <span>{urlError}</span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  請輸入完整的網址（需以 https:// 開頭）
                </p>
              </div>

              <div className="pt-2">
                <Button
                  onClick={handleAddResource}
                  disabled={!newResourceName.trim() || resources.length >= 5 || !!nameError || !!urlError}
                  className="flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  添加資源
                </Button>

                {validationErrors.resources && (
                  <p className="mt-2 text-sm text-destructive">{validationErrors.resources}</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-foreground mb-3 block">已添加的資源</Label>

            {resources.length > 0 ? (
              <div className="space-y-3">
                {resources.map((resource) => (
                  <div key={resource.id} className="w-full">
                    {resource.url ? (
                      <Link
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center p-4 bg-primary-lightest  border border-primary/20 rounded-lg text-sm font-medium text-primary transition-colors group"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mr-3">
                          <LinkIcon className="h-4 w-4 text-primary" />
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
                          className="text-primary hover:text-destructive ml-2 p-1 h-auto w-auto"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </Link>
                    ) : (
                      <div className="w-full flex items-center p-4 bg-primary-lightest border border-primary/20 rounded-lg text-sm font-medium text-primary">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mr-3">
                          <LinkIcon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex items-center font-medium text-sm transition-colors">
                          <span className="truncate">{resource.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeResource(resource.id)}
                          className="text-primary hover:text-destructive ml-2 p-1 h-auto w-auto"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground bg-muted/50 rounded-lg border border-border">
                <p className="text-sm">尚未添加任何資源</p>
              </div>
            )}
          </div>

          <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
            <p className="text-sm text-center text-foreground">
              你的資源分享將能幫助有相同興趣的島友們
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 pt-0 flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevStep}
        >
          上一步
        </Button>
        <Button
          onClick={handleNextStep}
        >
          下一步
        </Button>
      </div>
    </div>
  );
};

export default Step3;
