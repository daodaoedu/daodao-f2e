import ClearIcon from '@mui/icons-material/Clear';
import { DeletableChip, SwitchableChip } from './Styled';

const Chip = ({ value, isActive, onClick, onDelete }) => {
  const StyledChip = onDelete ? DeletableChip : SwitchableChip;

  return (
    <StyledChip
      label={value}
      value={value}
      isActive={isActive}
      onClick={onClick}
      onDelete={onDelete}
      deleteIcon={onDelete && <ClearIcon />}
    />
  );
};

export default Chip;
