import { useState } from 'react';
import styled from "@emotion/styled";
import {
  Typography,
  Box,
  Grid,
  IconButton,
  MenuItem,
  Select,
  InputBase,
} from '@mui/material';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import SendIcon from '@mui/icons-material/Send';
import ClearIcon from '@mui/icons-material/Clear';
import {
  ZH_WEEK_DAY_MAP,
  ISOToWeekday,
  weekdayToISO
} from './dateMap';

const StyledMenuItem = styled(MenuItem)`
  padding: 8px;
  margin-bottom: 4px;
  margin-right: 4px;
  border-radius: 4px;
`;

const FixedLabel = styled(Typography)`
  font-size: 14px;
  color: #293A3D;
  width: 20px;
  text-align: center;
  width: 20px;
  flex-shrink: 0;
`;
const StyledContainer = styled(Box)`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;
  width: 100%;

  .content {
    flex-grow: 1;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: 10px;
  }

  .buttons {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }
`;

const StyledButtonGroup = styled(Box)`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;
const StyledGridItem = styled(Grid)`
  background-color: #FFF;
  display: flex;
  padding: 12px 16px;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  align-self: stretch;
  border-radius: 8px;

  &:focus-within {
    border: 1px solid #16B9B3;
    padding: 11px 15px;
  }

  .title {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
    justify-content: space-between;
    flex-wrap: nowrap;
    
    p {
      color: #293A3D;
      font-size: 14px;
      font-style: normal;
      font-weight: 400;
      line-height: 140%;
    }
  }
`;
const StyledWeekdaySelector = styled(Select)`
    font-size: 12px;
    font-style: normal;
    font-weight: 300;
    line-height: 140%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    max-width: 150px;
    min-width: 56px;
    gap: 8px;
    padding: 0 0 0 0;
    height: 100%;
    
    .MuiSelect-select.MuiSelect-multiple {
      padding: 0;
      font-size: 14px;
      font-style: normal;
      font-weight: 400;
      line-height: 140%;
      color: #92989A;
    }

    .MuiSvgIcon-root {
      width: 16px;
      height: 16px;
      fill: #92989A;
    }
`;
const StyledInputBase = styled(InputBase)`
  width: 100%;
  border-radius: 8px;
  padding: 0;
  box-sizing: border-box;
  
  &.Mui-focused {
    padding: 0px;
  }

  &:focus-visible {
    outline: none;
  }

  .MuiInputBase-input {
    padding: 0;
    line-height: 140%;
    font-size: 14px;
    font-weight: 400;
    line-height: 140%;

    &:focus, &:focus-visible {
      outline: 0;    
    }
  }
`;

const StyledCancelButton = styled(IconButton)`
  &.MuiIconButton-root {
    display: flex;
    width: 24px;
    height: 24px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    border-radius: 2px;
    opacity: 0.5;
    background-color: #DBDBDB;

    @media (hover: hover) {
      &:hover {
        background-color: #89DAD7;
      }
    }
  }

  .MuiSvgIcon-root {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }
`;
const StyledSubmitButton = styled(IconButton)`

  &.MuiIconButton-root {
    display: flex;
    width: 24px;
    height: 24px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    border-radius: 2px;
    opacity: 0.5;
    background-color: #DBDBDB;

    @media (hover: hover) {
      &:hover {
        background-color: #89DAD7;
      }
    }
  }

  .MuiSvgIcon-root {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }
`;

export default function EditSubMilestone({
  milestone = {
    dates: [],
    name: '',
    description: '',
  },
  index = 0,
  onShow,
  onSubmit,
  tempId,
  type = 'create'
}) {
  const [newMilestone, setNewMilestone] = useState(milestone);

  const handleChangeWeekdays = (e) => {
    setNewMilestone({
      ...newMilestone,
      dates: e.target.value
    });
  };

  const handleChangeName = (e) => {
    setNewMilestone({
      ...newMilestone,
      name: e.target.value
    });
  };
  const handleClickSendButton = () => {
    onShow(false);
    onSubmit({
      ...newMilestone,
      _tempId: tempId
    });
  };
  const handleCloseEditPanel = () => {
    onShow(false);
  };

  return (
    <StyledGridItem item xs={12}>
      <StyledContainer>
        <FixedLabel component="span">{`${index + 1}.`}</FixedLabel>
        <StyledInputBase
          placeholder="任務名稱"
          onChange={handleChangeName}
          size="small"
          value={newMilestone.name || ''}
          notched="false"
        />

        <StyledButtonGroup>
          <StyledWeekdaySelector
            multiple
            placeholder="自訂"
            displayEmpty
            value={newMilestone.dates}
            onChange={handleChangeWeekdays}
            input={(
              <InputBase placeholder="自訂" startAdornment={(<CalendarTodayOutlinedIcon />)} />
            )}
            renderValue={
              (selected) =>
                selected?.length ? selected
                  .map((ISODate) => ISOToWeekday(ISODate))
                  .filter(Boolean)
                  .join(", ") : '自訂'
            }
            sx={{
              '.MuiSelect-icon': {
                display: 'none',
              },
            }}
            MenuProps={{
              PaperProps: {
                style: {
                  padding: '12px',
                  maxHeight: 150,
                  overflowY: 'auto',
                  scrollbarWidth: 'thin',
                  maxWidth: '140px'
                },
              },
              MenuListProps: {
                style: {
                  padding: '0'
                }
              }
            }}
          >
            {ZH_WEEK_DAY_MAP.map((zhDay) => {
              const isSelected = newMilestone.dates.includes(weekdayToISO(zhDay));
              return (
                <StyledMenuItem
                  key={zhDay}
                  value={weekdayToISO(zhDay)}
                  style={{
                    backgroundColor: isSelected ? '#DEF5F5' : 'transparent',
                    margin: '0 0 4px',
                    color: '#293A3D',
                  }}
                >
                  {zhDay}
                </StyledMenuItem>
              );
            })}
          </StyledWeekdaySelector>

          <StyledCancelButton
            onClick={handleCloseEditPanel}
            className="cancel"
            aria-label="cancel"
          >
            <ClearIcon />
          </StyledCancelButton>

          <StyledSubmitButton
            onClick={handleClickSendButton}
            className="submit"
            aria-label="submit"
          >
            <SendIcon />
          </StyledSubmitButton>
        </StyledButtonGroup>
      </StyledContainer>
    </StyledGridItem>
  );
}
