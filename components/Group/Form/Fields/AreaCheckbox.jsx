import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Select from './Select';

export default function AreaCheckbox({
  options,
  itemLabel,
  itemValue,
  name,
  value,
  onChange,
}) {
  return (
    <>
      <Box sx={{ display: 'flex', label: { whiteSpace: 'nowrap' } }}>
        <FormControlLabel control={<Checkbox />} label="實體活動" />
        <Select
          name={name}
          options={options}
          placeholder="地點"
          value={value}
          itemLabel={itemLabel}
          itemValue={itemValue}
          onChange={onChange}
        />
      </Box>
      <div>
        <FormControlLabel control={<Checkbox />} label="線上" />
      </div>
      <div>
        <FormControlLabel control={<Checkbox />} label="待討論" />
      </div>
    </>
  );
}
