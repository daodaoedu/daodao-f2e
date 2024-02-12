import MuiTextField from '@mui/material/TextField';
import { useEffect, useState } from 'react';

export default function TextField({
  id,
  placeholder,
  multiline,
  name,
  value,
  onChange,
  helperText,
  max,
  errorMessage,
}) {
  const [error, setError] = useState('');

  useEffect(() => {
    if (value.length > max) setError(errorMessage);
    else setError('');
  }, [max, value]);

  return (
    <>
      <MuiTextField
        fullWidth
        id={id}
        name={name}
        sx={{ '& legend': { display: 'none' } }}
        size="small"
        placeholder={placeholder}
        value={value}
        multiline={multiline}
        rows={multiline && 10}
        onChange={onChange}
        helperText={helperText}
      />
      <span className="error-message">{error}</span>
    </>
  );
}
