import { v4 as uuidv4 } from 'uuid';
import { useState } from 'react';
import styled from '@emotion/styled';

import {
  Grid,
  Typography,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AddIcon from '@mui/icons-material/Add';
import SubMilestonePanel from './SubMilestonePanel';
import EditSubMilestone from './EditSubMilestone';

import {
  StyledInputBase,
} from './Edit.styled';

const StyledWeek = styled(Typography)`
  color: #FFF;
  text-align: center;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 140%;
  display: flex;
  height: 35px;
  padding: 5px 20px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 20px;
  background: #16B9B3;
`;

const StyledGridContainer = styled(Grid)`
  display: flex;
  padding: 10px;
  align-items: center;
  gap: 10px;
  align-self: stretch;
  border-radius: 12px;
  background-color: #F3F3F3;
  width: 100%;
  border: 1px solid #ddd;
  max-width: 100%;
`;

const StyledWeekRange = styled.div`
  color: #92989A;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  padding-right: 0.25em;

  .MuiTypography-root {
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 140%;
  }

  .MuiSvgIcon-root{
    width: 14px;
    height: 14px;
    margin: 0 4px;
  }
`;

const StyledAddButton = styled.button`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  color: #92989A;
  font-size: 14px;
  font-weight: 400;
  line-height: 140%;
  gap: 8px;
  padding-right: 0.25em;

  @media (hover: hover) {
    &:hover {
      color: #16B9B3;
    
    }  
  }

`;

export default function MilestonePanel({
  milestone,
  onChange = null,
  isDisabled = false,
  startDate = '',
  endDate = '',
  weekNumber = '',
}) {
  const {
    name,
    subMilestones,
  } = milestone;
  const [onEdit, setOnEdit] = useState(false);
  const handleClickAddSubMilestone = () => {
    setOnEdit(true);
  };

  const handleChangeMilestoneName = (e) => {
    onChange({
      ...milestone,
      name: e.target.value,
    });
  };
  const handleAddSubMilestone = (subMilestone) => {
    const newSubMilestones = [...milestone.subMilestones, subMilestone];
    onChange({
      ...milestone,
      subMilestones: newSubMilestones,
    });
  };

  const handleDeleteSubMilestone = (deletedItem) => {
    const newSubMilestones = (milestone.subMilestones).filter((item) => {
      /*
        if is submitted subMilestone,
        match deleted subMilestone with item._id
      */
      if (item._id) {
        return (item._id !== deletedItem._id);
      }
      /*
        if not submitted subMilestone,
        match deleted subMilestone with item._tempId
      */
      return (item._tempId !== deletedItem._tempId);
    });
    onChange({
      ...milestone,
      subMilestones: newSubMilestones,
    });
  };

  const handleEditSubMilestone = (newItem) => {
    const newSubMilestones = (milestone.subMilestones).map((item) => {
      /*
        if is submitted subMilestone,
        match edited subMilestone with item._id
      */
      if (item._id) {
        return (newItem._id === item._id) ? newItem : item;
      }
      /*
        if not submitted subMilestone,
        match edited subMilestone with item._tempId
      */
      return (newItem._tempId === item._tempId) ? newItem : item;
    });
    onChange({
      ...milestone,
      subMilestones: newSubMilestones,
    });
  };

  return (
    <StyledGridContainer
      container
      sx={{
        marginBottom: '20px',
      }}
    >
      <Grid item xs={12} container justifyContent="space-between" alignItems="center">
        <StyledWeek variant="h6">{weekNumber}</StyledWeek>
        <StyledWeekRange>
          <Typography variant="body1">
            {startDate}
          </Typography>
          <ArrowForwardIcon />
          <Typography variant="body1">
            {endDate}
          </Typography>
        </StyledWeekRange>
      </Grid>

      <Grid item xs={12}>
        <StyledInputBase
          value={name}
          name="name"
          onChange={handleChangeMilestoneName}
          placeholder="範例:建立 Youtube 頻道"
          className="milestone"
          disabled={isDisabled}
        />
      </Grid>
      {
        milestone.subMilestones.map((subMilestone, index) => ((
          <SubMilestonePanel
            weekDay={weekNumber}
            subMilestone={subMilestone}
            index={index}
            onChange={handleEditSubMilestone}
            onDelete={handleDeleteSubMilestone}
            key={subMilestone._tempId || `temp_${uuidv4()}`}
            isDisabled={isDisabled}
          />
        )))
      }
      {/* adding pannel */}
      {onEdit && (
        <EditSubMilestone
          onShow={setOnEdit}
          index={subMilestones.length}
          tempId={`temp_${uuidv4()}`}
          onSubmit={handleAddSubMilestone}
          type="create"
        />
      )}
      {!isDisabled && (
        <Grid item xs={12} container justifyContent="flex-end">
          <StyledAddButton
            type="button"
            disabled={isDisabled}
            onClick={handleClickAddSubMilestone}
          >
            <AddIcon />
            新增子任務
          </StyledAddButton>
        </Grid>
      )}
    </StyledGridContainer>
  );
}
