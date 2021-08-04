import React from 'react';
import styled from '@emotion/styled';

const Container = styled.main`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  margin: auto;
  margin-top: 40px;
`;

const PageContainer = ({ children }) => {
  return (
    <Container>
      {children}
    </Container>
  );
};

export default PageContainer;
