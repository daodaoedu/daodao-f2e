import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import {
  Grid,
  IconButton,
  Typography
} from '@mui/material';
import EditSubMilestone from './EditSubMilestone';
import { ISOToWeekday } from './dateMap';

const FixedLabel = styled(Typography)`
  font-size: 14px;
  color: #293A3D;
  width: 20px;
  text-align: center;
  font-style: normal;
  font-weight: 400;
  line-height: 140%;
`;
const StyledGridItem = styled(Grid)`
  background-color: #FFF;
  display: flex;
  height: auto;
  padding: 12px 16px;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 8px;
  align-self: stretch;
  border-radius: 8px;

  .content {
    flex-grow: 1;
  }

  .title {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
    justify-content: flex-start;
    flex-wrap: nowrap;
    margin-bottom: 10px;

    p {
      color: #293A3D;
      font-size: 14px;
      font-style: normal;
      font-weight: 400;
      line-height: 140%;
    }
  }
  
  .buttons {
    margin-left: auto;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: center;
    gap: 10px;
    display: none;
    height: 100%;
  }

  @media (hover: hover) {
    &:hover {
      cursor: pointer;
    }
    &:hover .buttons {
      display: flex;
    }
  }
  @media (max-width: 767px) {
    .buttons {
      display: flex;
    }
  }

  .weekday {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    padding-left: 20px;
    gap: 5px;
    
    span {
      color: #92989A;
      font-size: 12px;
      font-style: normal;
      font-weight: 300;
      line-height: 140%;
    }

    .MuiSvgIcon-root {
      width: 14px;
      height: 14px;
      fill: #92989A;
    }

    @media (max-width: 767px) {
      align-items: flex-start;
      .MuiSvgIcon-root {
        margin-top: 0.06em;
      }
    }
  }

  
  .MuiIconButton-root {
    display: flex;
    width: 24px;
    height: 24px;
    justify-content: center;
    align-items: center;
    gap: var(--Number-10, 10px);
    border-radius: 2px;
    opacity: 0.5;
    background: #DBDBDB;

    &:hover {
      background-color: #89DAD7;
    }
  }

  .MuiSvgIcon-root {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }
`;

export default function SubMilestonePanel({
  subMilestone,
  index,
  onChange = null,
  onDelete,
  isDisabled = false
}) {
  const [/** newMilestone */, setNewMilestone] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const formattedWeekdays = subMilestone.dates
    .map((ISODate) => ISOToWeekday(ISODate))
    .filter(Boolean)
    .join(", ");

  const handleDelete = () => {
    onDelete(subMilestone);
  };
  const handleEdit = () => {
    setIsEditing(true);
  };
  useEffect(() => {
    setNewMilestone(subMilestone);
  }, [subMilestone]);
  return (
    <>
      {isEditing ?
        (
          <EditSubMilestone
            milestone={subMilestone}
            index={index}
            onShow={setIsEditing}
            onSubmit={onChange}
            type="edit"
            tempId={subMilestone._tempId}
          />
        ) : (
          <StyledGridItem item xs={12} key={subMilestone._tempId}>
            <div className="content">
              <div className="title">
                <FixedLabel component="span">
                  {`${index + 1}.`}
                </FixedLabel>
                <Typography component="p">
                  {subMilestone.name || ''}
                </Typography>
              </div>
              <div className="weekday">
                <CalendarTodayOutlinedIcon />
                <span>{formattedWeekdays}</span>
              </div>
            </div>
            {!isDisabled && (
              <div className="buttons">
                <IconButton
                  aria-label="delete"
                  className="delete"
                  onClick={handleDelete}
                >
                  <DeleteOutlineIcon />
                </IconButton>
                <IconButton
                  aria-label="edit"
                  className="edit"
                  onClick={handleEdit}
                >
                  <EditOutlinedIcon />
                </IconButton>
              </div>
            )}
          </StyledGridItem>
        )}
    </>
  );
}
