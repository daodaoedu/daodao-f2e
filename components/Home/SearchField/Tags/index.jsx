import React from 'react';
import styled from '@emotion/styled';
import { Chip } from '@mui/material';
import { useRouter } from 'next/router';
import { HOT_TAGS } from '@/constants/category';

const TagsWrapper = styled.ul`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    justify-content: flex-start;
  }
`;

const SearchField = () => {
  const router = useRouter();
  return (
    <TagsWrapper>
      {HOT_TAGS.map(({ value, label }) => (
        <li key={value}>
          <Chip
            onClick={() => router.push(`/resource/categories/${value}`)}
            label={label}
            value={value}
            sx={{
              backgroundColor: '#fff',
              opacity: '80%',
              cursor: 'pointer',
              margin: '5px',
              whiteSpace: 'nowrap',
              fontWeight: 500,
              fontSize: '16px',
              '&:hover': {
                opacity: '100%',
                backgroundColor: '#fff',
                transition: 'transform 0.4s',
              },
            }}
          />
        </li>
      ))}
    </TagsWrapper>
  );
};

export default SearchField;
