import React from 'react';
import styled from '@emotion/styled';
import Link from 'next/link';
import { NAV_LINK } from '../../../../../constants/category';

const LinkListWrapper = styled.ul`
  display: flex;
  justify-content: space-around;
  align-items: center;
  position: relative;
  li {
    margin: 0 20px;
    cursor: pointer;
    font-weight: 500;
  }
  @media (max-width: 767px) {
    display: none;
  }
`;
const List = () => {
  return (
    <LinkListWrapper>
      {NAV_LINK.map(({ name, link, target }) => (
        <li key={name}>
          {target === '_self' ? (
            <Link href={link}>{name}</Link>
          ) : (
            <a href={link} target={target} rel="noopener noreferrer">
              {name}
            </a>
          )}
        </li>
      ))}
    </LinkListWrapper>
  );
};

export default List;
