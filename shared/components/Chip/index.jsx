import ClearIcon from '@mui/icons-material/Clear';
import { DeletableChip, SwitchableChip } from './Styled';

const Chip = ({ value, isActive, onClick, onDelete }) => {
  const StyledChip = onDelete ? DeletableChip : SwitchableChip;

  return (
    <StyledChip
      label={value}
      value={value}
      onClick={onClick}
      onDelete={onDelete}
      deleteIcon={onDelete && <ClearIcon />}
      className={isActive ? 'isActive' : ''}
    />
  );
};

export default Chip;
