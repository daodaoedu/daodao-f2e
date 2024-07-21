import { Typography, TextField } from '@mui/material';
import { StyledGroup } from './Edit.styled';

function EditFormInput({
  title = '',
  parmKey = '',
  value = '',
  onChange = () => ({}),
  errorMsg = '',
  isRequire = false,
  placeholder = '',
}) {
  return (
    <StyledGroup>
      <Typography fontWeight="500">
        {title} {isRequire && '*'}
      </Typography>
      <TextField
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

export default EditFormInput;
