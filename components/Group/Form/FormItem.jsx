import { useId } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { StyledLabel, StyledGroup } from './Form.styled';
import Select from './Select';

function Wrapper({ id, required, label, children }) {
  return (
    <StyledGroup>
      <StyledLabel htmlFor={id} required={required}>
        {label}
      </StyledLabel>
      {children}
    </StyledGroup>
  );
}

export default function FormItem({
  type,
  label,
  placeholder,
  required,
  options,
  itemLabel,
  itemValue,
  value = '',
}) {
  const id = useId();
  const formItemId = `form-item-${id}`;
  const wrapperProps = { id: formItemId, required, label };

  if (type === 'select') {
    return (
      <Wrapper {...wrapperProps}>
        <Select
          id={formItemId}
          options={options}
          placeholder={placeholder}
          value={value}
          itemLabel={itemLabel}
          itemValue={itemValue}
        />
      </Wrapper>
    );
  }

  if (type === 'location') {
    return (
      <Wrapper {...wrapperProps}>
        <Box sx={{ display: 'flex', label: { whiteSpace: 'nowrap' } }}>
          <FormControlLabel control={<Checkbox />} label="實體活動" />
          <Select
            id={formItemId}
            options={options}
            placeholder="地點"
            value={value}
            itemLabel={itemLabel}
            itemValue={itemValue}
          />
        </Box>
        <div>
          <FormControlLabel control={<Checkbox />} label="線上" />
        </div>
        <div>
          <FormControlLabel control={<Checkbox />} label="待討論" />
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper {...wrapperProps}>
      <TextField
        fullWidth
        id={formItemId}
        sx={{ '& legend': { display: 'none' } }}
        size="small"
        placeholder={placeholder}
        value={value}
      />
    </Wrapper>
  );
}
