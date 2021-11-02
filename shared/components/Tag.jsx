import React, { useCallback } from 'react';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';

const TagWrapper = styled.div`
    border-radius: 10px;
    height: 15px;
    padding-top: 10px;
    padding-bottom: 10px;
    padding-left: 15px;
    padding-right: 15px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 5px;
    cursor: pointer;
    color: white;
    font-weight: 500;
    background-color: #16b9b3;
    white-space: nowrap;
`;
const Tag = ({ name }) => {
  const router = useRouter();
  const onSearch = useCallback(
    () => {
      router.push({
        query: {
          ...router.query,
          tags: name,
        }
      });
    },
    [router.query, name]
  );
  return (
    <TagWrapper onClick={onSearch}>
      {name}
    </TagWrapper>
  );
};

export default Tag;
