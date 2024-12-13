import React from 'react';
import styled from '@emotion/styled';
import Link from 'next/link';

const LogoWrapper = styled.div`
  cursor: pointer;
  z-index: 100;
`;
const Logo = () => {
  return (
    <Link href="/" passHref>
      <LogoWrapper>
        <img src="/new-logo.png" alt="logo" width="219" height="31" />
      </LogoWrapper>
    </Link>
  );
};

export default Logo;
