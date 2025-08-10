'use client';

import {
  closeImageDialog$,
  imageDialogState$,
  saveImage$,
  useCellValues,
  usePublisher,
  useTranslation,
} from '@mdxeditor/editor';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ResponsiveModal } from '@/components/ui/responsive-modal';

interface ImageData {
  src: string;
  title: string;
  altText: string;
}

export const ImageDialog = () => {
  const [state] = useCellValues(imageDialogState$);
  const saveImage = usePublisher(saveImage$);
  const closeImageDialog = usePublisher(closeImageDialog$);
  const t = useTranslation();

  const [error, setError] = useState('');
  const [imageData, setImageData] = useState<ImageData>({
    src: '',
    title: '',
    altText: '',
  });

  useEffect(() => {
    if (state.type === 'editing' && state.initialValues) {
      setImageData({
        src: state.initialValues.src ?? '',
        title: state.initialValues.title ?? '',
        altText: state.initialValues.altText ?? '',
      });
    }
  }, [state]);

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
    closeImageDialog();
    setError('');
    setImageData({ src: '', title: '', altText: '' });
  };

  const handleSubmit = () => {
    if (error) return;

    if (!imageData.src) {
      setError('請輸入圖片 URL');
      return;
    }

    saveImage(imageData);
    reset();
  };

  const isOpen = state.type !== 'inactive';

  const footer = (
    <footer className="flex justify-end gap-2">
      <Button type="button" onClick={handleSubmit}>
        {t('dialogControls.save', 'Save')}
      </Button>
      <Button type="button" variant="outline" onClick={reset}>
        {t('dialogControls.cancel', 'Cancel')}
      </Button>
    </footer>
  );

  return (
    <ResponsiveModal
      open={isOpen}
      onClose={reset}
      title={t('uploadImage.dialogTitle', 'Upload an image')}
      footer={footer}
    >
      <div className="flex flex-col gap-4">
        <div className="grid gap-2">
          <Label htmlFor="src">
            {t(
              'uploadImage.addViaUrlInstructionsNoUpload',
              'Add an image from an URL:'
            )}
          </Label>
          <Input
            type="text"
            id="src"
            value={imageData.src}
            onChange={handleChange('src')}
            required
          />
          {error && <p className="text-destructive text-sm">{error}</p>}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="alt">{t('uploadImage.alt', 'Alt:')}</Label>
          <Input
            type="text"
            id="alt"
            value={imageData.altText}
            onChange={handleChange('altText')}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="title">{t('uploadImage.title', 'Title:')}</Label>
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
