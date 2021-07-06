import React from 'react';
import styled from '@emotion/styled';

const Container = styled.footer`
  background-color: #f5f5f5;
  height: 200px;
`;

const Footer = ({ children }) => {
  return (
    <Container>
      {children}
    </Container>
  );
};

export default Footer;
