import React from 'react';
import Chip from '@mui/material/Chip';
import { COLOR_TABLE } from '@/constants/notion';

const CategoryChip = ({ value, onClick, isActive }) => {
  return (
    <Chip
      label={value}
      value={value}
      onClick={onClick}
      sx={{
        backgroundColor: isActive ? '#DEF5F5' : COLOR_TABLE.default,
        opacity: isActive ? '100%' : '40%',
        cursor: 'pointer',
        margin: '0px 5px',
        whiteSpace: 'nowrap',
        fontWeight: 500,
        fontSize: '16px',
        '&:hover': {
          backgroundColor: '#DEF5F5',
        },
      }}
    />
  );
};

export default React.memo(CategoryChip);
