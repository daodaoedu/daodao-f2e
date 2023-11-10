import { useMemo } from 'react';
import { styled } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import MuiSelect from '@mui/material/Select';

const Input = styled(InputBase)(() => ({
  '& .MuiInputBase-input': {
    padding: '8px 16px',
    position: 'relative',
    backgroundColor: '#DEF5F5',
    border: '1px solid',
    borderColor: '#DEF5F5',
    borderRadius: 8,
    fontSize: 14,
  },
}));

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

export default function Select({
  value,
  onChange,
  renderValue,
  width = 200,
  placeholder,
  multiple,
  items = [],
  itemValue = 'name',
  itemLabel = 'name',
  sx,
}) {
  const MenuProps = useMemo(
    () => ({
      PaperProps: {
        sx: {
          maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
          width,
        },
      },
    }),
    [width],
  );

  const getValue = (any, key) => (typeof any === 'object' ? any[key] : any);

  const checkValue = useMemo(() => {
    const map = items.reduce((_map, item) => {
      _map.set(getValue(item, itemValue), item);
      return _map;
    }, new Map());

    return value.filter((item) => map.has(getValue(item, itemValue)));
  }, [multiple, value, items, itemValue]);

  return (
    <FormControl sx={{ width, ...sx }} size="small">
      <MuiSelect
        multiple={multiple}
        displayEmpty
        value={checkValue}
        onChange={onChange}
        input={<Input />}
        renderValue={renderValue}
        MenuProps={MenuProps}
        sx={{ '.MuiSelect-select': { py: '6px' } }}
      >
        {placeholder && (
          <MenuItem disabled value="" sx={{ fontSize: 14 }}>
            {placeholder}
          </MenuItem>
        )}
        {items.map((item) => (
          <MenuItem
            key={getValue(item, itemValue)}
            value={getValue(item, itemValue)}
            sx={{
              fontSize: 14,
              '&.Mui-selected': {
                background: '#DEF5F5',
              },
            }}
          >
            {getValue(item, itemLabel)}
          </MenuItem>
        ))}
      </MuiSelect>
    </FormControl>
  );
}
