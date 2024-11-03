import { forwardRef } from 'react';
import { Typography, TextField } from '@mui/material';
import { StyledGroup } from './Edit.styled';

function EditFormInput(
  {
    title = '',
    parmKey = '',
    value = '',
    onChange = () => ({}),
    errorMsg = '',
    isRequire = false,
    placeholder = '',
  },
  ref,
) {
  return (
    <StyledGroup>
      <Typography fontWeight="500">
        {title} {isRequire && '*'}
      </Typography>
      <TextField
        inputRef={ref}
        name={parmKey}
        value={value}
        fullWidth
        placeholder={placeholder}
        onChange={(e) => onChange({ key: parmKey, value: e.target.value })}
        error={!!errorMsg}
        helperText={errorMsg}
      />
    </StyledGroup>
  );
}

export default forwardRef(EditFormInput);
