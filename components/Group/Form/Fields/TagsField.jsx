import { useState, useRef } from 'react';
import IconButton from '@mui/material/IconButton';
import FormHelperText from '@mui/material/FormHelperText';
import ClearIcon from '@mui/icons-material/Clear';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { StyledChip, StyledTagsField } from '../Form.styled';

function TagsField({ name, helperText, control, value = [] }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const isComposing = useRef(false);

  const handleChange = (e) => {
    const _value = e.target.value;
    if (_value.length > 8) setError('標籤最多 8 個字');
    else setError('');
    setInput(_value);
  };

  const handleAddTag = () => {
    const tag = input.trim();
    if (!tag) return;
    if (error) return;
    if (value.includes(tag)) return;
    setInput('');
    control.onChange({
      target: {
        name,
        value: [...value, tag],
      },
    });
  };

  const handleKeyDown = (e) => {
    if (e.keyCode !== 13) return;
    if (isComposing.current) return;
    handleAddTag();
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
            onCompositionStart={() => {
              isComposing.current = true;
            }}
            onCompositionEnd={() => {
              isComposing.current = false;
            }}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
        )}
        {input.trim() && (
          <IconButton
            sx={{ textTransform: 'none' }}
            size="small"
            edge="end"
            onClick={handleAddTag}
          >
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
