import React from 'react';
import styled from '@emotion/styled';
import Tags from './Tag';

const TagListWrapper = styled.div`
    height: 100px;
    display: flex;
    justify-content: start;
    flex-wrap: wrap;
`;

const TagList = ({ list, onSearch }) => {
  return (
    <TagListWrapper>
      { Array.isArray(list) && list.map((tag) => <Tags key={tag} name={tag} onSearch={onSearch} />) }
    </TagListWrapper>
  );
};

export default TagList;
