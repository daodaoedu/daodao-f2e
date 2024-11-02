import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

export default function CheckboxGroup({ options, name, value, control }) {
  const handleCheckboxChange = (_value) => {
    const updatedValue = value.includes(_value)
      ? value.filter((v) => v !== _value)
      : [...value, _value];
    control.onChange({ target: { name, value: updatedValue } });
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
