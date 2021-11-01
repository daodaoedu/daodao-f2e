import React from 'react';
import styled from '@emotion/styled';

const IconListWrapper = styled.div`
    h2 {
        margin-bottom: 10px;
    }
    ul {
        display: flex;
        justify-content: flex-start;
        align-items: center;
    }
    li {
        cursor: pointer;
        margin: auto 10px;
    }
`;

const SubFooter = ({ title, list }) => {
  return (
    <IconListWrapper>
      <h2>{title}</h2>
      <ul>
        {list.map((value) => <a key={value.alt} href={value.link} target="_blank" rel="noopener noreferrer"><li>{value.icon}</li></a>)}
      </ul>
    </IconListWrapper>
  );
};

export default SubFooter;
