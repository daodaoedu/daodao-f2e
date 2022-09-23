import React from 'react';
import styled from '@emotion/styled';
import Chip from '@mui/material/Chip';
import { COLOR_TABLE } from '../../../../constants/notion';

const ListWrapper = styled.ul`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  /* flex-wrap: wrap; */
  margin: 10px 0;
  max-width: calc(100vw - 49px);
  overflow-x: scroll;
  -ms-overflow-style: none; /* IE */
  scrollbar-width: none; /* Firefox */
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Edge and Opera */
  }
`;

const Tags = ({ tags, onDelete }) => {
  if (tags.length === 0) {
    return <></>;
  }
  return (
    <ListWrapper>
      {tags.map(({ key, value }) => (
        <Chip
          key={value}
          label={value}
          sx={{
            backgroundColor: COLOR_TABLE.default,
            cursor: 'pointer',
            margin: '5px',
            whiteSpace: 'nowrap',
            fontWeight: 500,
            fontSize: '14px',
            '&:hover': {
              opacity: '60%',
              transition: 'transform 0.4s',
            },
          }}
          onClick={() => onDelete(key, value)}
          onDelete={() => onDelete(key, value)}
        />
      ))}
    </ListWrapper>
  );
};

export default Tags;
