import { v4 as uuidv4 } from 'uuid';
import { useState, useEffect } from "react";
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Typography,
} from "@mui/material";
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { StyledGroup } from "./Edit.styled";
import MilestonePanel from "./MilestonePanel";
import ErrorMessage from './ErrorMessage';

export default function MilestoneGroup({
  milestones = [],
  onChange = null,
  isDisabled = false,
  onValidate = null,
  errorMessage = null
}) {
  const eventWeekRange = 22;
  const [startDate, setStartDate] = useState('2025-02-09');
  const [endDate, setEndDate] = useState(dayjs(startDate).add('22', 'week'));
  const [frequency, setFrequency] = useState('biweekly');

  function arabicToChinese(num) {
    const digits = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];

    if (num < 1 || num > 100 || !Number.isInteger(num)) {
      return "Input Number must >= 1 && =< 100";
    }

    if (num === 100) {
      return "一百";
    }

    const tens = Math.floor(num / 10);
    const ones = num % 10;

    if (tens === 0) {
      return digits[ones];
    }
    if (tens === 1) {
      return ones === 0 ? "十" : `十${digits[ones]}`;
    }
    return `${digits[tens]}十${ones === 0 ? "" : digits[ones]}`;
  }
  function calculateMilestones(
    dateToStart = '2025-02-09',
    freq = 'biweekly',
    defaultMilestones = []
  ) {
    const interval = (freq === 'weekly') ? 7 : 14;
    const milestoneLength = (freq === 'weekly') ? 22 : 11;
    const newData = [];
    const mode = defaultMilestones.length ? 'modify' : 'create';

    for (let i = 0; i < milestoneLength; i += 1) {
      const start = dayjs(dateToStart).add(i * interval, 'day');
      const end = start.add(interval - 1, 'day');
      const existingMilestone = defaultMilestones[i] || {};
      const newSubMilestones = (mode === 'create') ? [] : existingMilestone.subMilestones || [];

      newData.push({
        ...existingMilestone,
        _tempId: existingMilestone._tempId || `temp_${uuidv4()}`,
        name: existingMilestone.name || '',
        startDate: start.format('YYYY-MM-DD'),
        endDate: end.format('YYYY-MM-DD'),
        subMilestones: newSubMilestones
      });
    }

    return [...newData];
  }
  const handleFrequency = (e) => {
    // if change frequency, clear all data
    setFrequency(e.target.value);
    const changedMilestones = calculateMilestones(startDate, e.target.value, []);
    onChange({
      type: 'UPDATE_FIELD',
      payload: {
        key: 'milestones',
        value: changedMilestones
      }
    });
  };
  const handleStartDate = (eventStartDate) => {
    setStartDate(eventStartDate);
    const eventEndDate = dayjs(eventStartDate).add(eventWeekRange, 'week');
    setEndDate(eventEndDate);
    const changedMilestones = calculateMilestones(eventStartDate, frequency, milestones);
    onChange({
      type: 'UPDATE_FIELD',
      payload: {
        key: 'milestones',
        value: changedMilestones
      }
    });
  };
  const handleEndDate = (fakeDate) => {
    const eventEndDate = dayjs(startDate).add(eventWeekRange, 'week');
    setEndDate(eventEndDate);
  };

  const updateMilestone = (newMilestone) => {
    const changedMilestones = milestones.map((item, _i) => {
      return (item._tempId === newMilestone._tempId ? newMilestone : item);
    });
    // check if milestone name exist
    onValidate('milestonesName', changedMilestones, '請填寫每週 / 隔週里程碑目標');
    onChange({
      type: 'UPDATE_FIELD',
      payload: {
        key: 'milestones',
        value: changedMilestones
      }
    });
  };
  useEffect(() => {
    const weeklyMilestonesLength = 22;
    const eventStartDate = '2025-02-09';
    setStartDate(eventStartDate);
    let initMilestones = [];

    if (milestones.length === weeklyMilestonesLength) {
      setFrequency('weekly');
      initMilestones = calculateMilestones(eventStartDate, 'weekly', milestones);
    } else {
      setFrequency('biweekly');
      initMilestones = calculateMilestones(eventStartDate, 'biweekly', milestones);
    }

    if (!isDisabled) {
      onChange({
        type: 'UPDATE_FIELD',
        payload: {
          key: 'milestones',
          value: initMilestones
        }
      });
    }
  }, []);

  return (
    <>
      <Typography sx={{ fontWeight: 500, mb: '8px' }}>
        學習里程碑 *
      </Typography>
      <Typography
        sx={{ color: '#92989A', fontWeight: 400, fontSize: '14px', mb: '8px' }}
      >
        請依據時間與精力設定里程碑（入選後時程表須包含每兩週需繳交的學習任務）
      </Typography>
      <Box sx={{ padding: '8px 0', width: '100%' }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <StyledGroup>
            <Grid container alignItems="center" columnSpacing={1}>
              <Grid item xs={4}>
                <DatePicker
                  label="開始日期"
                  value="2025-02-09"
                  inputFormat="YYYY-MM-DD"
                  disabled
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      sx={{
                        height: '50px',
                        '& .MuiInputBase-root': {
                          height: '100%',
                        }
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={4}>
                <DatePicker
                  label="結束日期"
                  value="2025-07-12"
                  inputFormat="YYYY-MM-DD"
                  disabled
                  onChange={handleEndDate}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      sx={{
                        height: '50px',
                        '& .MuiInputBase-root': {
                          height: '100%',
                        },
                        '& .MuiFormHelperText-root': {
                          marginTop: '4px',
                        },
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  select
                  label="頻率"
                  defaultValue="weekly"
                  value={frequency}
                  onChange={handleFrequency}
                  variant="outlined"
                  fullWidth
                  disabled={isDisabled}
                  sx={{
                    height: '50px',
                    '& .MuiInputBase-root': {
                      height: '100%',
                    }
                  }}
                >
                  <MenuItem value="weekly">每週</MenuItem>
                  <MenuItem value="biweekly">每兩週</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </StyledGroup>
          <StyledGroup>
            {milestones.map((milestone, i) => {
              const interval = frequency === 'biweekly' ? 14 : 7;
              const taskStartDate = dayjs('2025-02-9').add(i * interval, 'day');
              const taskEndDate = taskStartDate.add(interval - 1, 'day');
              const weekNumber = frequency === 'biweekly' ? arabicToChinese(i * 2 + 1) : arabicToChinese(i + 1);
              return (
                <MilestonePanel
                  key={milestone._tempId || uuidv4()}
                  milestone={milestone}
                  startDate={taskStartDate.format('YYYY/MM/DD')}
                  endDate={taskEndDate.format('YYYY/MM/DD')}
                  weekNumber={`第${weekNumber}週`}
                  onChange={updateMilestone || null}
                  isDisabled={isDisabled}
                />
              );
            })}
          </StyledGroup>
        </LocalizationProvider>
        <ErrorMessage
          errText={errorMessage || null}
        />
      </Box>
    </>
  );
}
