import { v4 as uuidv4 } from 'uuid';
import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import {
  Box,
  TextField,
  MenuItem,
  Typography,
} from '@mui/material';
import { addWeeks, addDays, format } from 'date-fns';
import { DatePicker } from '@/components/ui/date-picker';
import { StyledGroup } from './Edit.styled';
import MilestonePanel from './MilestonePanel';
import ErrorMessage from './ErrorMessage';

const StyledDateSection = styled(Box)`
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  width: 100%;
  gap: 10px;

  .startDate, .endDate, .frequency {
    flex-shrink: 0;
    width: 25%;
  }

  @media (max-width: 767px) {
    flex-wrap: wrap;
    .startDate, .endDate {
      width: calc(50% - 5px);
    }
    .frequency {
      width: 100%;
    }
  }
`;

export default function MilestoneGroup({
  milestones = [],
  onChangeHandler = null,
  isDisabled = false,
  errorMessage = null,
}) {
  const eventWeekRange = 22;
  const [startDate, setStartDate] = useState('2025-02-09');
  const [/** endDate */, setEndDate] = useState(addWeeks(new Date(startDate), 22));
  const [frequency, setFrequency] = useState('biweekly');

  function arabicToChinese(num) {
    const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

    if (num < 1 || num > 100 || !Number.isInteger(num)) {
      return 'Input Number must >= 1 && =< 100';
    }

    if (num === 100) {
      return '一百';
    }

    const tens = Math.floor(num / 10);
    const ones = num % 10;

    if (tens === 0) {
      return digits[ones];
    }
    if (tens === 1) {
      return ones === 0 ? '十' : `十${digits[ones]}`;
    }
    return `${digits[tens]}十${ones === 0 ? '' : digits[ones]}`;
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
      const start = addDays(new Date(dateToStart), i * interval);
      const end = addDays(start, interval - 1);
      const existingMilestone = defaultMilestones[i] || {};
      const newSubMilestones = (mode === 'create') ? [] : existingMilestone.subMilestones || [];

      newData.push({
        ...existingMilestone,
        _tempId: existingMilestone._tempId || `temp_${uuidv4()}`,
        name: existingMilestone.name || '',
        startDate: format(start, 'yyyy-MM-dd'),
        endDate: format(end, 'yyyy-MM-dd'),
        subMilestones: newSubMilestones,
      });
    }

    return [...newData];
  }
  const handleFrequency = (e) => {
    // if change frequency, clear all data
    setFrequency(e.target.value);
    const changedMilestones = calculateMilestones(startDate, e.target.value, []);
    onChangeHandler('milestonesName', changedMilestones);
  };

  const handleEndDate = (/** fakeDate */) => {
    const eventEndDate = addWeeks(new Date(startDate), eventWeekRange);
    setEndDate(eventEndDate);
  };

  const updateMilestone = (newMilestone) => {
    const changedMilestones = milestones.map((item) => (item._tempId === newMilestone._tempId ? newMilestone : item));
    onChangeHandler('milestonesName', changedMilestones);
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
      onChangeHandler('milestonesName', initMilestones);
    }
  }, []);

  return (
    <>
      <Typography sx={{ fontWeight: 500, mb: '8px' }}>
        學習里程碑 *
      </Typography>
      <Typography
        sx={{
          color: '#92989A', fontWeight: 400, fontSize: '14px', mb: '8px',
        }}
      >
        請依據時間與精力設定里程碑（入選後時程表須包含每兩週需繳交的學習任務）
      </Typography>
      <Box sx={{ padding: '8px 0', width: '100%' }}>
        <StyledGroup>
          <StyledDateSection>
            <div className="startDate">
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                開始日期
              </Typography>
              <DatePicker
                value={new Date('2025-02-09')}
                disabled
                placeholder="2025/02/09"
                className="w-full h-12"
              />
            </div>

            <div className="endDate">
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                結束日期
              </Typography>
              <DatePicker
                value={new Date('2025-07-12')}
                disabled
                placeholder="2025/07/12"
                className="w-full h-12"
              />
            </div>

            <TextField
              className="frequency"
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
                },
              }}
            >
              <MenuItem value="weekly">每週</MenuItem>
              <MenuItem value="biweekly">每兩週</MenuItem>
            </TextField>
          </StyledDateSection>
        </StyledGroup>
          <StyledGroup>
            {milestones.map((milestone, i) => {
              const interval = frequency === 'biweekly' ? 14 : 7;
              const taskStartDate = addDays(new Date('2025-02-09'), i * interval);
              const taskEndDate = addDays(taskStartDate, interval - 1);
              const weekNumber = frequency === 'biweekly' ? arabicToChinese(i * 2 + 1) : arabicToChinese(i + 1);
              return (
                <MilestonePanel
                  key={milestone._tempId || uuidv4()}
                  milestone={milestone}
                  startDate={format(taskStartDate, 'yyyy/MM/dd')}
                  endDate={format(taskEndDate, 'yyyy/MM/dd')}
                  weekNumber={`第${weekNumber}週`}
                  onChange={updateMilestone || null}
                  isDisabled={isDisabled}
                />
              );
            })}
          </StyledGroup>

        <ErrorMessage
          errText={errorMessage || null}
        />
      </Box>
    </>
  );
}
