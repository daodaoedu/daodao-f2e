import React from 'react';
import styled from '@emotion/styled';

const Container = styled.main`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  margin: auto;
  padding-top: 40px;
  min-height: 100vh;
`;

const PageContainer = ({ children }) => {
  return <Container>{children}</Container>;
};

export default PageContainer;
