import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Select from './Select';

export default function AreaCheckbox({
  options,
  itemLabel,
  itemValue,
  name,
  value = [],
  control,
}) {
  const [isPhysicalArea, setIsPhysicalArea] = useState(false);

  const getPhysicalArea = (data) =>
    options.find((option) => data.includes(option.name));

  const handleChange = (val, action, _value) => {
    if (action === 'add' && _value === '待討論') {
      control.onChange({ target: { name, value: ['待討論'] } });
      setIsPhysicalArea(false);
      return;
    }
    if (action === 'remove' && !val.length) {
      control.onChange({ target: { name, value: ['待討論'] } });
      setIsPhysicalArea(false);
      return;
    }
    control.onChange({ target: { name, value: val.filter((v) => v !== '待討論') } });
  };

  const physicalAreaValue = getPhysicalArea(value)?.name || '';

  const toggleIsPhysicalArea = () => {
    const updatedValue = value.filter((v) => !getPhysicalArea([v]));
    if (isPhysicalArea && updatedValue.includes('待討論')) {
      handleChange(updatedValue, 'add', '待討論');
    } else {
      handleChange(updatedValue);
      setIsPhysicalArea((pre) => !pre);
    }
  };

  const handleCheckboxChange = (_value) => {
    const hasValue = value.includes(_value);
    const action = hasValue ? 'remove' : 'add';
    const updatedValue = hasValue
      ? value.filter((v) => v !== _value)
      : [...value, _value];
    handleChange(updatedValue, action, _value);
  };

  const handlePhysicalAreaChange = ({ target }) => {
    const updatedValue = value
      .filter((v) => !getPhysicalArea([v]))
      .concat(target.value);
    handleChange(updatedValue, 'add', target.value);
  };

  const physicalAreaControl = {
    onChange: handlePhysicalAreaChange,
    onBlur: handlePhysicalAreaChange,
  };

  useEffect(() => {
    if (value.find((v) => getPhysicalArea([v]))) setIsPhysicalArea(true);
  }, [value]);

  return (
    <>
      <Box sx={{ display: 'flex', label: { whiteSpace: 'nowrap' } }}>
        <FormControlLabel
          control={<Checkbox onClick={toggleIsPhysicalArea} />}
          label="實體活動"
          checked={isPhysicalArea}
        />
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
      {isPhysicalArea && !physicalAreaValue && <span className="ml-28 text-alert">請選擇地點</span>}
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
