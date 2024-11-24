import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

export default function DateRadio({
  name,
  customValueName,
  value,
  isCustomValue,
  control,
}) {
  const [isCustomDate, setIsCustomDate] = useState(isCustomValue);
  const [date, setDate] = useState(value);

  const handleClickRadio = (isCustom) => {
    setIsCustomDate(isCustom);
    control.onChange({ target: { name: customValueName, value: isCustom } });
  };

  const handleChange = (_date) => {
    setDate(_date);
    control.onChange({ target: { name, value: _date } });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          label: { whiteSpace: 'nowrap' },
        }}
      >
        <FormControlLabel
          control={<Checkbox onClick={() => handleClickRadio(true)} />}
          label="自訂"
          checked={isCustomDate}
        />
        <MobileDatePicker
          inputFormat="YYYY/MM/DD"
          value={date}
          onChange={handleChange}
          onAccept={() => handleClickRadio(true)}
          minDate={dayjs().add(1, 'day')}
          maxDate={dayjs().add(4, 'year')}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              sx={{
                '& legend': { display: 'none' },
                '& fieldset': { top: 0 },
              }}
              fullWidth
            />
          )}
        />
      </Box>
      <div>
        <FormControlLabel
          control={<Checkbox onClick={() => handleClickRadio(false)} />}
          label="不限"
          checked={!isCustomDate}
        />
      </div>
    </LocalizationProvider>
  );
}
