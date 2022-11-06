import React from 'react';
import styled from '@emotion/styled';
import SubFooter from './SubFooter';
import MainFooter from './MainFooter';

const FooterWrapper = styled.footer`
  background-color: #536166;
  min-height: 270px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const Footer = () => {
  return (
    <FooterWrapper>
      <MainFooter />
      <SubFooter />
    </FooterWrapper>
  );
};

export default Footer;
