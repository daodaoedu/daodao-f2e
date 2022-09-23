import React from 'react';
import Link from 'next/link';
import styled from '@emotion/styled';
import { Chip } from '@mui/material';
import { useRouter } from 'next/router';
import { SEARCH_TAGS } from '../../../../constants/category';

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
      {SEARCH_TAGS['全部'].map((text) => (
        <li key={text}>
          <Chip
            onClick={() => router.push(`/search?tags=${text}`)}
            label={text}
            value={text}
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
