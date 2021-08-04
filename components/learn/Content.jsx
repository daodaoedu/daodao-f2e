import React from 'react';
import styled from '@emotion/styled';

const ContentWrapper = styled.div`
    width: 90%;
    margin: 0 auto;
    background-color: #f5f5f5;
`;

const Content = ({ title, intro, link }) => {
  return (
    <ContentWrapper>
      <h1>{title}</h1>
      <p>{intro}</p>
      <a href={link} target="_blank" rel="noreferrer">網站連結</a>
    </ContentWrapper>
  );
};

export default Content;
