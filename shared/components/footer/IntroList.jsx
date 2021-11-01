import React from 'react';
import styled from '@emotion/styled';

const IntroListWrapper = styled.div`
  margin: 0 10px;
  
  h2 {
      margin-bottom: 10px;
  }
  ul {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
  }
  li {
    cursor: pointer;
    margin: 8px;
    font-size: 14px;
  }
`;

const IntroList = ({ name, list }) => {
  return (
    <IntroListWrapper>
      <h2>{name}</h2>
      <ul>
        {list.map((value) => (
          <a key={value.name} href={value.link} target="_blank" rel="noopener noreferrer">
            <li>
              {value.name}
            </li>
          </a>
        ))}
      </ul>
    </IntroListWrapper>
  );
};

export default IntroList;
