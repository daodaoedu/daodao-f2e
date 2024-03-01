import { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import FormHelperText from '@mui/material/FormHelperText';
import ClearIcon from '@mui/icons-material/Clear';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { StyledChip, StyledTagsField } from '../Form.styled';

function TagsField({ name, helperText, control, value = [] }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const handleInput = (e) => {
    const _value = e.target.value;
    if (_value.length > 8) setError('標籤最多 8 個字');
    else setError('');
    setInput(_value);
  };

  const handleKeyDown = (e) => {
    if (error) return;
    const tag = input.trim();
    if (e.key !== 'Enter' || !tag) return;
    if (value.indexOf(tag) > -1) return;
    setInput('');
    control.onChange({
      target: {
        name,
        value: [...value, tag],
      },
    });
  };

  const handleDelete = (tag) => () => {
    control.onChange({
      target: {
        name,
        value: value.filter((t) => t !== tag),
      },
    });
  };

  return (
    <>
      <StyledTagsField>
        {value.map((tag) => (
          <StyledChip
            key={tag}
            label={tag}
            size="small"
            deleteIcon={<ClearIcon />}
            onDelete={handleDelete(tag)}
          />
        ))}
        {value.length < 8 && (
          <input
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
          />
        )}
        {input.trim() && (
          <IconButton sx={{ textTransform: 'none' }} size="small" edge="end">
            <AddCircleOutlineIcon />
          </IconButton>
        )}
      </StyledTagsField>
      <FormHelperText>{helperText}</FormHelperText>
      <span className="error-message">{error}</span>
    </>
  );
}

export default TagsField;
