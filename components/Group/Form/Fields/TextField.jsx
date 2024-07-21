import MuiTextField from '@mui/material/TextField';

export default function TextField({
  id,
  placeholder,
  multiline,
  name,
  helperText,
  control,
  value,
  error,
}) {
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
        helperText={helperText}
        {...control}
      />
      <span className="error-message">{error}</span>
    </>
  );
}
