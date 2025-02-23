import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { ONLINE_OPTION, TBD_OPTION } from '@/constants/areas';
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
    options.find((option) => data.includes(option.value));

  const handleChange = (val, action, _value) => {
    if (action === 'add' && _value === TBD_OPTION.value) {
      control.onChange({ target: { name, value: [TBD_OPTION.value] } });
      setIsPhysicalArea(false);
      return;
    }
    if (action === 'remove' && !val.length) {
      control.onChange({ target: { name, value: [TBD_OPTION.value] } });
      setIsPhysicalArea(false);
      return;
    }
    control.onChange({ target: { name, value: val.filter((v) => v !== TBD_OPTION.value) } });
  };

  const physicalAreaValue = getPhysicalArea(value)?.value || '';

  const toggleIsPhysicalArea = () => {
    const updatedValue = value.filter((v) => !getPhysicalArea([v]));
    if (isPhysicalArea && updatedValue.includes(TBD_OPTION.value)) {
      handleChange(updatedValue, 'add', TBD_OPTION.value);
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
          control={<Checkbox onClick={() => handleCheckboxChange(ONLINE_OPTION.value)} />}
          label={ONLINE_OPTION.label}
          checked={value.includes(ONLINE_OPTION.value)}
        />
      </div>
      <div>
        <FormControlLabel
          control={<Checkbox onClick={() => handleCheckboxChange(TBD_OPTION.value)} />}
          label={TBD_OPTION.label}
          checked={value.includes(TBD_OPTION.value)}
        />
      </div>
    </>
  );
}
