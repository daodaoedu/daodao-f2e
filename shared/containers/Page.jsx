import React from 'react';
import styled from '@emotion/styled';

const Container = styled.main`
  background-color: #f5f5f5;
  display: flex;
  justify-content: space-between;
`;

const PageContainer = ({ children }) => {
  return (
    <Container>
      {children}
    </Container>
  );
};

export default PageContainer;
