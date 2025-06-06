import React, { useState } from 'react';
import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import { LinkIcon, X } from 'lucide-react';
import { validateIdeaForm } from '../utils';

interface ResourceData {
  name: string;
  url: string;
}

interface AddResourceFormProps {
  onConfirm: (data: ResourceData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const AddResourceForm: React.FC<AddResourceFormProps> = ({
  onConfirm,
  onCancel,
  isLoading = false
}) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    const validation = validateIdeaForm({
      title: 'dummy', // AddResourceForm doesn't need title validation
      content: 'dummy', // AddResourceForm doesn't need content validation
      ideaResources: [{ name, url }]
    });

    if (validation.isValid) {
      onConfirm({ name, url });
      // Reset form after successful submission
      setName('');
      setUrl('');
      setErrors({});
    } else {
      // Extract resource-specific errors
      const resourceErrors: Record<string, string> = {};
      if (validation.errors.resource_0_name) {
        resourceErrors.name = validation.errors.resource_0_name;
      }
      if (validation.errors.resource_0_url) {
        resourceErrors.url = validation.errors.resource_0_url;
      }
      if (!name.trim()) {
        resourceErrors.name = '請輸入資源名稱';
      }
      if (!url.trim()) {
        resourceErrors.url = '請輸入資源網址';
      }
      setErrors(resourceErrors);
    }
  };

  const handleCancel = () => {
    setName('');
    setUrl('');
    setErrors({});
    onCancel();
  };

  const isValid = name.trim() && url.trim() && Object.keys(errors).length === 0;

  return (
    <div
      className="p-4 rounded-lg border transition-all duration-200 bg-white"
      style={{
        borderColor: '#16b9b360'
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="heading-sm text-primary-darker flex items-center">
          <LinkIcon className="h-4 w-4 mr-2" />
          新增學習資源
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          className="text-basic-300 hover:text-basic-500"
          disabled={isLoading}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="resource-name" className="body-sm text-basic-500">
            資源名稱
          </Label>
          <Input
            id="resource-name"
            type="text"
            placeholder="例如：React 官方文檔"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) {
                setErrors((prev) => ({ ...prev, name: '' }));
              }
            }}
            className={`
              transition-colors
              ${errors.name
                ? 'border-alert focus:border-alert focus:ring-alert/20'
                : 'border-border hover:border-primary-base focus:border-primary-base focus:ring-primary-base/20'
              }
            `}
            disabled={isLoading}
          />
          {errors.name && (
            <p className="text-xs text-alert mt-1">{errors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="resource-url" className="body-sm text-basic-500">
            資源連結
          </Label>
          <Input
            id="resource-url"
            type="url"
            placeholder="https://react.dev"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (errors.url) {
                setErrors((prev) => ({ ...prev, url: '' }));
              }
            }}
            className={`
              transition-colors
              ${errors.url
                ? 'border-alert focus:border-alert focus:ring-alert/20'
                : 'border-border hover:border-primary-base focus:border-primary-base focus:ring-primary-base/20'
              }
            `}
            disabled={isLoading}
          />
          {errors.url && (
            <p className="text-xs text-alert mt-1">{errors.url}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancel}
          disabled={isLoading}
          className="border-basic-200 text-basic-500 hover:bg-basic-100"
        >
          取消
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={handleSubmit}
          disabled={!isValid || isLoading}
          className="bg-primary-base hover:bg-primary-darker text-white disabled:bg-basic-300"
        >
          {isLoading ? '新增中...' : '新增資源'}
        </Button>
      </div>
    </div>
  );
};

export default AddResourceForm;
