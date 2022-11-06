import React from 'react';
import styled from '@emotion/styled';
import Link from 'next/link';
import { css, keyframes } from '@emotion/css';
import { Box } from '@mui/material';
import { NAV_LINK } from '../../../../../constants/category';

const textclip = keyframes`
  to {
    background-position: 200% center;
  }
`;

const LinkListWrapper = styled.ul`
  display: flex;
  justify-content: space-around;
  align-items: center;
  position: relative;

  @media (max-width: 767px) {
    display: none;
  }
`;

const LinkItemWrapper = styled.li`
  position: relative;
  margin: 0 20px;
  cursor: pointer;
  font-weight: 500;
`;

const AnchorWrapper = styled.a``;

const List = () => {
  return (
    <LinkListWrapper>
      {NAV_LINK.map(({ name, link, target }) => (
        <LinkItemWrapper key={name} name={name}>
          {target === '_self' ? (
            <Link href={link}>{name}</Link>
          ) : (
            <AnchorWrapper
              href={link}
              target={target}
              rel="noopener noreferrer"
            >
              {name}
            </AnchorWrapper>
          )}
          {name === '找故事' && (
            <Box
              sx={{
                position: 'absolute',
                top: '-12px',
                right: '-22px',
                color: '#D4ED7B',
                fontWeight: '700',
                /* Safari */
                '-webkit-transform': 'rotate(45deg)',
                /* Firefox */
                '-moz-transform': 'rotate(45deg)',
                /* IE */
                '-ms-transform': 'rotate(45deg)',
                /* Opera */
                '-o-transform': 'rotate(45deg)',
              }}
            >
              HOT
            </Box>
          )}
        </LinkItemWrapper>
      ))}
    </LinkListWrapper>
  );
};

export default List;
