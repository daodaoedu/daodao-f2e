import styled from '@emotion/styled';
import MuiChip from '@mui/material/Chip';
import { COLOR_TABLE } from '@/constants/notion';

export const SwitchableChip = styled(MuiChip)`
  background-color: ${COLOR_TABLE.default};
  opacity: 0.4;
  margin: 0px 5px;
  white-space: nowrap;
  font-weight: 500;
  font-size: 16px;
  &:hover {
    background-color: #def5f5;
  }
  &.isActive {
    background-color: #def5f5;
    opacity: 1;
  }
  &.isPointer {
    cursor: pointer;
  }
`;

export const DeletableChip = styled(MuiChip)`
  background-color: #16b9b3;
  opacity: 100%;
  color: white;
  margin: 0px 5px;
  white-space: nowrap;
  font-weight: 500;
  font-size: 16px;
  .MuiChip-label {
    padding-right: 6px;
  }
  .MuiChip-deleteIcon {
    margin-right: 4px;
    padding: 4px;
    font-size: 24px;
    color: white;
    border-radius: 50%;
    &:hover {
      color: white;
      background: rgba(255, 255, 255, 0.3);
    }
  }
`;
