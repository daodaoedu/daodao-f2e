import FormControl from '@mui/material/FormControl';
import MuiSelect from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

export default function Select({
  id,
  name,
  value,
  placeholder,
  options = [],
  itemLabel = 'label',
  fullWidth = true,
  multiple,
  onChange,
  sx,
}) {
  const getValue = (any, key) => (typeof any === 'object' ? any[key] : any);
  const renderValue = (selected) => {
    if (selected.length === 0) return placeholder;
    if (Array.isArray(selected)) return selected.join('、');
    return selected;
  };

  return (
    <FormControl size="small" fullWidth>
      <MuiSelect
        displayEmpty
        multiple={multiple}
        fullWidth={fullWidth}
        renderValue={renderValue}
        id={id}
        name={name}
        sx={{
          color: value.length ? '#000' : '#92989A',
          '& legend': { display: 'none' },
          '& fieldset': { top: 0 },
          ...sx,
        }}
        value={value}
        onChange={onChange}
      >
        {placeholder && (
          <MenuItem disabled value="" sx={{ fontSize: 14 }}>
            {placeholder}
          </MenuItem>
        )}
        {options.map((item) => (
          <MenuItem
            key={getValue(item, itemLabel)}
            value={getValue(item, itemLabel)}
          >
            {getValue(item, itemLabel)}
          </MenuItem>
        ))}
      </MuiSelect>
    </FormControl>
  );
}
