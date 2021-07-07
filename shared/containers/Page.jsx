import React from 'react';
import styled from '@emotion/styled';

const Container = styled.main`
  display: flex;
  justify-content: space-between;
  margin-left: 100px;
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
