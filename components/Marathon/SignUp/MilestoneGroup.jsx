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

export default function MilestoneGroup({
  milestones = [],
  onChange = null,
  isDisabled = false
}) {
  const testMilestones = [
    {
      name: "第一階段 - 初步學習",
      startDate: "2024-01-10T00:00:00.000Z",
      endDate: "2024-02-10T00:00:00.000Z",
      subMilestones: [
        {
          name: "學習自主學習方法",
          dates: ["2024-01-05T00:00:00.000Z", "2024-01-06T00:00:00.000Z"],
          description: "學員將學習不同的自主學習方法，並選擇適合自己的方式。",
        },
        {
          name: "設立學習目標",
          dates: ["2024-01-07T00:00:00.000Z", "2024-01-08T00:00:00.000Z"],
          description: "學員將設立短期和長期的學習目標。",
        },
      ],
    },
    {
      name: "第二階段 - 應用實踐",
      startDate: "2024-03-01T00:00:00.000Z",
      endDate: "2024-03-15T00:00:00.000Z",
      subMilestones: [
        {
          name: "實踐學習技巧",
          dates: ["2024-02-25T00:00:00.000Z", "2024-02-28T00:00:00.000Z"],
          description: "學員將開始實踐所學的時間管理與學習技巧。",
        },
        {
          name: "評估學習成果",
          dates: ["2024-03-10T00:00:00.000Z", "2024-03-12T00:00:00.000Z"],
          description: "學員將評估自己在學習過程中的進展，並調整學習策略。",
        },
      ],
    },
  ];

  const eventWeekRange = 11; // Must be 11 weeks
  const [startDate, setStartDate] = useState(dayjs());
  const [endDate, setEndDate] = useState(dayjs().add('11', 'week'));
  const [frequency, setFrequency] = useState('weekly');

  function calculateMilestones(
    dateToStart = dayjs(),
    freq = 'weekly',
    defaultMilestones = []
  ) {
    const interval = (freq === 'weekly') ? 7 : 14;
    const milestoneLength = (freq === 'weekly') ? 11 : 6;
    const week = (freq === 'weekly') ? ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一'] : ['一', '三', '五', '七', '九', '十一'];
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
        weekNumber: `第${week[i]}週`,
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

    onChange({
      type: 'UPDATE_FIELD',
      payload: {
        key: 'milestones',
        value: changedMilestones
      }
    });
  };
  useEffect(() => {
    const storgedStartDate = milestones[0]?.startDate || dayjs();
    setStartDate(storgedStartDate);

    const biWeeklyMilestonesLength = 6;
    const weeklyMilestonesLength = 11;
    let initMilestones = [];

    if (isDisabled) {
      if (milestones.length === biWeeklyMilestonesLength) {
        setFrequency('biweekly');
      } else {
        setFrequency('weekly');
      }
    } else {
      if (milestones.length === biWeeklyMilestonesLength) {
        setFrequency('biweekly');
        initMilestones = calculateMilestones(storgedStartDate, 'biweekly', milestones);
        onChange({
          type: 'UPDATE_FIELD',
          payload: {
            key: 'milestones',
            value: initMilestones
          }
        });
        return;
      }

      if (milestones.length === weeklyMilestonesLength) {
        setFrequency('weekly');
        initMilestones = calculateMilestones(storgedStartDate, 'weekly', milestones);
        onChange({
          type: 'UPDATE_FIELD',
          payload: {
            key: 'milestones',
            value: initMilestones
          }
        });
        return;
      }

      if (!milestones.length) {
        setFrequency('weekly');
        initMilestones = calculateMilestones(dayjs(), 'weekly', []);
        onChange({
          type: 'UPDATE_FIELD',
          payload: {
            key: 'milestones',
            value: initMilestones
          }
        });
      }
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
                  value={startDate}
                  minDate={dayjs()}
                  onChange={handleStartDate}
                  inputFormat="YYYY-MM-DD"
                  disabled={isDisabled}
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
                  value={endDate}
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
            {milestones.map((milestone, _i) => {
              return (
                <MilestonePanel
                  key={milestone._tempId}
                  milestone={milestone}
                  onChange={updateMilestone}
                  isDisabled={isDisabled}
                />
              );
            })}
          </StyledGroup>
        </LocalizationProvider>
      </Box>
    </>
  );
}
