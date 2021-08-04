import React from 'react';
import styled from '@emotion/styled';
import Link from 'next/link';

const IntroListWrapper = styled.div`
    ul {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
    }
    li {
      cursor: pointer;
    }
`;

const IntroList = ({ title, list }) => {
  return (
    <IntroListWrapper>
      <h2>{title}</h2>
      <ul>
        {list.map((value) => (
          <Link key={value.name} href={value.link}>
            <li>
              {value.name}
            </li>
          </Link>
        ))}
      </ul>
    </IntroListWrapper>
  );
};

export default IntroList;
