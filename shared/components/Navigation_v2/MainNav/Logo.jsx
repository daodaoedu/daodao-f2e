import React from 'react';
import styled from '@emotion/styled';
import Link from 'next/link';

const LogoWrapper = styled.div`
  margin: 0 15px;
  cursor: pointer;
  z-index: 100;
`;
const Logo = () => {
  return (
    <Link href="/" passHref>
      <LogoWrapper>
        <img src="/logo.png" alt="logo" width="106" height="50" />
      </LogoWrapper>
    </Link>
  );
};

export default Logo;
