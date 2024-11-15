import { Dialog, DialogTitle, DialogContent } from '@mui/material';
import {
  closeImageDialog$,
  imageDialogState$,
  saveImage$,
  useCellValues,
  usePublisher,
  useTranslation,
} from '@mdxeditor/editor';
import { useState } from 'react';

export const ImageDialog = () => {
  const [state] = useCellValues(imageDialogState$);
  const saveImage = usePublisher(saveImage$);
  const closeImageDialog = usePublisher(closeImageDialog$);
  const t = useTranslation();
  const [error, setError] = useState('');
  const [imageData, setImageData] = useState({
    src: '',
    title: '',
    altText: '',
    file: []
  });

  const handleChange = (key) => (e) => {
    const { value } = e.target;
    if (key === 'src') {
      if (value.startsWith('https://')) {
        setError('');
      } else {
        setError('僅支援 https 開頭的 URL');
      }
    }
    setImageData((pre) => ({ ...pre, [key]: value }));
  };

  const reset = () => {
    closeImageDialog();
    setError('');
    setImageData({ src: '', title: '', altText: '', file: [] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (error) return;
    saveImage(imageData);
    reset();
  };

  return (
    <Dialog
      keepMounted
      scroll="body"
      open={state.type !== 'inactive'}
      onClose={reset}
    >
      <DialogTitle className="heading-lg">{t('uploadImage.dialogTitle', 'Upload an image')}</DialogTitle>
      <DialogContent>
        <form
          className="flex flex-col gap-2"
          onSubmit={handleSubmit}
        >
          <div>
            <label htmlFor="src" className="text-sm text-gray-700">
              {t('uploadImage.addViaUrlInstructionsNoUpload', 'Add an image from an URL:')}
            </label>
            <input
              type="text"
              id="src"
              className="w-full border"
              value={imageData.src}
              onChange={handleChange('src')}
            />
            {error && <p className="text-alert text-xs mt-0.5">{error}</p>}
          </div>

          <div>
            <label htmlFor="alt" className="text-sm text-gray-700">
              {t('uploadImage.alt', 'Alt:')}
            </label>
            <input
              type="text"
              id="alt"
              className="w-full border"
              value={imageData.altText}
              onChange={handleChange('altText')}
            />
          </div>

          <div>
            <label htmlFor="title" className="text-sm text-gray-700">
              {t('uploadImage.title', 'Title:')}
            </label>
            <input
              type="text"
              id="title"
              className="w-full border"
              value={imageData.title}
              onChange={handleChange('title')}
            />
          </div>

          <div className="flex justify-end gap-2 mt-1">
            <button
              type="submit"
              className="bg-primary-base text-white px-4 py-1 rounded-full"
              title={t('dialogControls.save', 'Save')}
              aria-label={t('dialogControls.save', 'Save')}
            >
              {t('dialogControls.save', 'Save')}
            </button>
            <button
              type="button"
              className="bg-basic-100 text-gray-700 px-4 py-1 rounded-full"
              title={t('dialogControls.cancel', 'Cancel')}
              aria-label={t('dialogControls.cancel', 'Cancel')}
              onClick={reset}
            >
              {t('dialogControls.cancel', 'Cancel')}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
