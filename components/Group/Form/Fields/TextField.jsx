import MuiTextField from '@mui/material/TextField';
import MarkdownEditor from '@/shared/components/MarkdownEditor/MarkdownEditor';

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
      {multiline ? (
        <MarkdownEditor
          rootClassName="p-px bg-basic-200 rounded-md focus-within:bg-primary-base"
          className="bg-white rounded-md"
          ref={(element) => control.setRef?.(name, element)}
          value={value}
          placeholder={placeholder}
          onChange={(markdown) => control.onChange({ target: { name, value: markdown } })}
        />
      ) : (
        <MuiTextField
          inputRef={(element) => control.setRef?.(name, element)}
          fullWidth
          id={id}
          name={name}
          sx={{ '& legend': { display: 'none' } }}
          size="small"
          placeholder={placeholder}
          value={value}
          helperText={helperText}
          {...control}
        />
      )}
      <span className="error-message">{error}</span>
    </>
  );
}
