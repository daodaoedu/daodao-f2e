import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

export default function CheckboxGroup({
  options,
  name,
  value = [],
  control,
  handleValues,
}) {
  const handleCheckboxChange = (_value) => {
    const hasValue = value.includes(_value);
    const updatedValue = hasValue
      ? value.filter((v) => v !== _value)
      : [...value, _value];
    const newValue = handleValues(
      hasValue ? 'remove' : 'add',
      _value,
      updatedValue,
    );

    control.onChange({ target: { name, value: newValue } });
  };

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
      {options.map((option) => (
        <FormControlLabel
          key={option.value}
          sx={{ flex: '0 0 124px' }}
          control={
            <Checkbox onClick={() => handleCheckboxChange(option.value)} />
          }
          label={option.label}
          checked={value.includes(option.value)}
        />
      ))}
    </Box>
  );
}
