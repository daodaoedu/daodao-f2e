import React from 'react';
import styled from '@emotion/styled';
import Link from 'next/link';

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
        {list.map((value) => <Link key={value.alt} href={value.link}><li>{value.icon}</li></Link>)}
      </ul>
    </IconListWrapper>
  );
};

export default SubFooter;
