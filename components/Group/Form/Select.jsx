import MuiSelect from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

export default function Select({
  id,
  value,
  placeholder,
  options = [],
  itemLabel = 'label',
  itemValue = 'key',
  fullWidth = true,
  sx,
}) {
  const getValue = (any, key) => (typeof any === 'object' ? any[key] : any);

  return (
    <MuiSelect
      displayEmpty
      fullWidth={fullWidth}
      id={id}
      size="small"
      sx={{
        color: value ? '#000' : '#92989A',
        '& legend': { display: 'none' },
        '& fieldset': { top: 0 },
        ...sx,
      }}
      value={value}
    >
      {placeholder && (
        <MenuItem disabled value="">
          {placeholder}
        </MenuItem>
      )}
      {options.map((item) => (
        <MenuItem
          key={getValue(item, itemValue)}
          value={getValue(item, itemValue)}
        >
          {getValue(item, itemLabel)}
        </MenuItem>
      ))}
    </MuiSelect>
  );
}
