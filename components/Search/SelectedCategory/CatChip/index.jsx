import React from 'react';
import Chip from '@mui/material/Chip';
import { useRouter } from 'next/router';
import { COLOR_TABLE } from '../../../../constants/notion';

const CatChip = ({ value, onClickCategory }) => {
  const { query } = useRouter();
  return (
    <Chip
      label={value}
      value={value}
      onClick={onClickCategory}
      sx={{
        backgroundColor: (query?.cats ?? '').includes(value)
          ? COLOR_TABLE.green
          : COLOR_TABLE.default,
        opacity: (query?.cats ?? '').includes(value) ? '100%' : '40%',
        cursor: 'pointer',
        margin: '5px',
        whiteSpace: 'nowrap',
        fontWeight: 500,
        fontSize: '16px',
        '&:hover': {
          backgroundColor: COLOR_TABLE.green,
        },

        // "&:hover": {
        //   opacity: "100%",
        //   transition: "all 0.5s ease",
        //   backgroundColor: (query?.cats ?? "").includes(value)
        //     ? COLOR_TABLE.default
        //     : COLOR_TABLE.green,
        // },
      }}
    />
  );
};

export default CatChip;
