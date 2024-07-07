import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import DeleteSvg from '@/public/assets/icons/delete.svg';
import Image from '@/shared/components/Image';
import { StyledUpload } from '../Form.styled';
import UploadSvg from './UploadSvg';

export default function Upload({ name, value, control }) {
  const [preview, setPreview] = useState(value || '');
  const [error, setError] = useState('');
  const inputRef = useRef();

  const changeHandler = (file) => {
    const event = {
      target: {
        name,
        value: file,
      },
    };
    control.onChange(event);
  };

  const handleFile = (file) => {
    const imageType = /image.*/;
    const maxSize = 500 * 1024; // 500 KB

    setPreview('');
    setError('');
    if (!file.type.match(imageType)) {
      setError('僅支援上傳圖片唷！');
      return;
    }

    if (file.size > maxSize) {
      setError('圖片最大限制 500 KB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
    changeHandler(file);
  };

  const handleDragEnter = (e) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const handleDragOver = (e) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.stopPropagation();
    e.preventDefault();

    const { files } = e.dataTransfer;
    if (files?.[0]) handleFile(files[0]);
  };

  const handleChange = (e) => {
    const { files } = e.target;
    if (files?.[0]) handleFile(files[0]);
  };

  const handleClear = () => {
    setPreview('');
    setError('');
    inputRef.current.value = '';
    changeHandler('');
  };

  useEffect(() => {
    if (typeof value === 'string') setPreview(value);
  }, [value]);

  return (
    <Box sx={{ position: 'relative' }}>
      {preview && (
        <Button
          variant="text"
          size="small"
          sx={{
            position: 'absolute',
            right: 0,
            top: '-2rem',
            gap: 0.25,
            span: {
              marginTop: 0.25,
            },
          }}
          onClick={handleClear}
        >
          <img src={DeleteSvg.src} alt="delete icon" />
          <span>清除</span>
        </Button>
      )}
      <StyledUpload
        className={preview ? 'has-image' : ''}
        onClick={() => inputRef.current.click()}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {preview && (
          <Image
            height="300px"
            className="preview"
            src={preview}
            alt="預覽封面圖"
          />
        )}
        <UploadSvg isActive={!!preview} />
        <span className="upload-message">
          {preview ? '上傳其他圖片' : '點擊此處或將圖片拖曳至此'}
        </span>
        <input
          type="file"
          ref={inputRef}
          accept="image/*"
          onChange={handleChange}
        />
      </StyledUpload>
      <span className="error-message">{error}</span>
    </Box>
  );
}
