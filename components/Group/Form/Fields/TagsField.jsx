import { useEffect, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import FormHelperText from '@mui/material/FormHelperText';
import ClearIcon from '@mui/icons-material/Clear';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { StyledChip, StyledTagsField } from '../Form.styled';

function TagsField({ name, helperText, control }) {
  const [tags, setTags] = useState([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const handleInput = (e) => {
    const { value } = e.target;
    if (value.length > 8) setError('標籤最多 8 個字');
    else setError('');
    setInput(value);
  };

  const handleKeyDown = (e) => {
    if (error) return;
    const tag = input.trim();
    if (e.key !== 'Enter' || !tag) return;
    if (tags.indexOf(tag) > -1) return;
    setTags((pre) => [...pre, tag]);
    setInput('');
  };

  const handleDelete = (tag) => () => {
    setTags((pre) => pre.filter((t) => t !== tag));
  };

  useEffect(() => {
    const event = {
      target: {
        name,
        value: tags,
      },
    };
    control.onChange(event);
  }, [tags]);

  return (
    <>
      <StyledTagsField>
        {tags.map((tag) => (
          <StyledChip
            key={tag}
            label={tag}
            size="small"
            deleteIcon={<ClearIcon />}
            onDelete={handleDelete(tag)}
          />
        ))}
        {tags.length < 8 && (
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
