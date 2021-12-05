import React from 'react';
import styled from '@emotion/styled';
import Link from 'next/link';

const LogoWrapper = styled.div`
  margin: 0 15px;
  cursor: pointer;
  z-index: 100;
  & > img {
    height: 50px;
  }
`;
const Logo = () => {
  return (
    <Link href="/">
      <LogoWrapper>
        <img src="/logo.png" alt="logo" />
      </LogoWrapper>
    </Link>
  );
};

export default Logo;
