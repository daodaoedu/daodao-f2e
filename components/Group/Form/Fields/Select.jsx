import { useState } from 'react';
import FormControl from '@mui/material/FormControl';
import MuiSelect from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

export default function Select({
  id,
  name,
  placeholder,
  options = [],
  itemLabel = 'label',
  fullWidth = true,
  multiple,
  sx,
  disabled,
  control,
  value,
  error,
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
        disabled={disabled}
        {...control}
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
      <span className="error-message">{error}</span>
    </FormControl>
  );
}
