import { useState } from 'react';
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
  control,
}) {
  const [isPhysicalArea, setIsPhysicalArea] = useState(false);

  const getPhysicalArea = (data) =>
    options.find((option) => data.includes(option.name));

  const handleChange = (val) =>
    control.onChange({ target: { name, value: val } });

  const physicalAreaValue = getPhysicalArea(value)?.name || '';

  const toggleIsPhysicalArea = () => {
    const updatedValue = value.filter((v) => !getPhysicalArea([v]));
    handleChange(updatedValue);
    setIsPhysicalArea((pre) => !pre);
  };

  const handleCheckboxChange = (_value) => {
    const updatedValue = value.includes(_value)
      ? value.filter((v) => v !== _value)
      : [...value, _value];
    handleChange(updatedValue);
  };

  const handlePhysicalAreaChange = ({ target }) => {
    const updatedValue = value
      .filter((v) => !getPhysicalArea([v]))
      .concat(target.value);
    handleChange(updatedValue);
  };

  const physicalAreaControl = {
    onChange: handlePhysicalAreaChange,
    onBlur: handlePhysicalAreaChange,
  };

  return (
    <>
      <Box sx={{ display: 'flex', label: { whiteSpace: 'nowrap' } }}>
        <FormControlLabel
          control={<Checkbox onClick={toggleIsPhysicalArea} />}
          label="實體活動"
          checked={isPhysicalArea}
        />
        <Box width="100%" onClick={() => setIsPhysicalArea(true)}>
          <Select
            name={name}
            options={options}
            placeholder="地點"
            value={physicalAreaValue}
            itemLabel={itemLabel}
            itemValue={itemValue}
            control={physicalAreaControl}
          />
        </Box>
      </Box>
      <div>
        <FormControlLabel
          control={<Checkbox onClick={() => handleCheckboxChange('線上')} />}
          label="線上"
          checked={value.includes('線上')}
        />
      </div>
      <div>
        <FormControlLabel
          control={<Checkbox onClick={() => handleCheckboxChange('待討論')} />}
          label="待討論"
          checked={value.includes('待討論')}
        />
      </div>
    </>
  );
}
