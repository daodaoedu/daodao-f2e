import React from 'react';
import styled from '@emotion/styled';

const IntroListWrapper = styled.div`
    ul {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
    }
`;

const IntroList = ({ title, list }) => {
  return (
    <IntroListWrapper>
      <h2>{title}</h2>
      <ul>
        {list.map((name) => <li key={name}>{name}</li>)}
      </ul>
    </IntroListWrapper>
  );
};

export default IntroList;
