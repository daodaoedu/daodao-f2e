'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { ResponsiveModal } from '@/shared/ui/responsive-modal';

interface ImageData {
  src: string;
  title: string;
  altText: string;
}

interface ImageDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ImageData) => void;
  initialData?: Partial<ImageData>;
}

export const ImageDialog = ({ open, onClose, onSave, initialData }: ImageDialogProps) => {

  const [error, setError] = useState('');
  const [imageData, setImageData] = useState<ImageData>({
    src: '',
    title: '',
    altText: '',
  });

  useEffect(() => {
    if (initialData) {
      setImageData({
        src: initialData.src ?? '',
        title: initialData.title ?? '',
        altText: initialData.altText ?? '',
      });
    }
  }, [initialData]);

  const handleChange = (key: keyof ImageData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (key === 'src') {
      // Validate that the URL starts with https://
      if (value.startsWith('https://') || value === '') {
        setError('');
      } else {
        setError('僅支援 https 開頭的 URL');
      }
    }
    setImageData((prev) => ({ ...prev, [key]: value }));
  };

  const reset = () => {
    onClose();
    setError('');
    setImageData({ src: '', title: '', altText: '' });
  };

  const handleSubmit = () => {
    if (error) return;

    if (!imageData.src) {
      setError('請輸入圖片 URL');
      return;
    }

    onSave(imageData);
    reset();
  };

  const footer = (
    <footer className="flex justify-end gap-2">
      <Button type="button" onClick={handleSubmit}>
        儲存
      </Button>
      <Button type="button" variant="outline" onClick={reset}>
        取消
      </Button>
    </footer>
  );

  return (
    <ResponsiveModal
      open={open}
      onClose={reset}
      title="上傳圖片"
      footer={footer}
    >
      <div className="flex flex-col gap-4">
        <div className="grid gap-2">
          <Label htmlFor="src">
            從網址新增圖片：
          </Label>
          <Input
            type="text"
            id="src"
            value={imageData.src}
            onChange={handleChange('src')}
            required
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="alt">替代文字：</Label>
          <Input
            type="text"
            id="alt"
            value={imageData.altText}
            onChange={handleChange('altText')}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="title">標題：</Label>
          <Input
            type="text"
            id="title"
            value={imageData.title}
            onChange={handleChange('title')}
          />
        </div>
      </div>
    </ResponsiveModal>
  );
};
