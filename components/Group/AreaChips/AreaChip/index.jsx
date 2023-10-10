import { memo } from 'react';
import Chip from '@mui/material/Chip';
import ClearIcon from '@mui/icons-material/Clear';

const AreaChip = ({ value, onDelete }) => {
  return (
    <Chip
      label={value}
      value={value}
      onDelete={onDelete}
      deleteIcon={<ClearIcon />}
      sx={{
        backgroundColor: '#16B9B3',
        opacity: '100%',
        color: 'white',
        margin: '0px 5px',
        whiteSpace: 'nowrap',
        fontWeight: 500,
        fontSize: '16px',
        '.MuiChip-label': {
          pr: '6px',
        },
        '.MuiChip-deleteIcon': {
          mr: '4px',
          padding: '4px',
          fontSize: '24px',
          color: 'white',
          borderRadius: '50%',
          '&:hover': {
            color: 'white',
            background: 'rgba(255, 255, 255, 0.3)',
          },
        },
      }}
    />
  );
};

export default memo(AreaChip);
