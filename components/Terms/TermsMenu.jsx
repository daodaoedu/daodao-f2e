import React from 'react';
import styled from '@emotion/styled';
import Link from 'next/link';
import { useRouter } from 'next/router';

const TermsMenuWrapper = styled.nav`
  position: sticky;
  top: 138px;
  left: 0;
  padding: 40px 0;
  margin-right: 1em;
  background-color: #fff;
  width: 200px;
  border-radius: 4px;
  box-shadow: 0px 2px 1px -1px rgba(0, 0, 0, 0.2),
    0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12);

  @media (max-width: 1040px) {
    display: none;
  }

  h2 {
    margin-bottom: 1em;
    padding: 0 1em;
    font-weight: 500;
    font-size: 18px;
  }

  ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }

  li {
    margin-bottom: 10px;
  }

  a {
    color: #16b9b3;
    padding: 0 1em;

    @media (hover: hover) {
      &:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }
    }
  }

  .current {
    position: relative;

    &:before {
      content: '';
      position: absolute;
      left: 0em;
      top: 50%;
      transform: translateY(-50%);
      width: 0;
      height: 0;
      border-top: 0.5em solid transparent;
      border-bottom: 0.5em solid transparent;
      border-left: 0.5em solid #16b9b3;
      border-right: 0.5em solid transparent;
    }
  }
`;

const TermsMenu = () => {
  const router = useRouter();
  const currentPath = router.pathname;

  return (
    <TermsMenuWrapper>
      <h2>網站規約</h2>
      <ul>
        <li>
          <Link
            href="/terms/privacypolicy"
            className={currentPath === '/terms/privacypolicy' ? 'current' : ''}
          >
            隱私權政策
          </Link>
        </li>
        <li>
          <Link
            href="/terms/ipr"
            className={currentPath === '/terms/ipr' ? 'current' : ''}
          >
            智慧財產權
          </Link>
        </li>
        <li>
          <Link
            href="/terms/service"
            className={currentPath === '/terms/service' ? 'current' : ''}
          >
            使用者條款
          </Link>
        </li>
      </ul>
    </TermsMenuWrapper>
  );
};

export default TermsMenu;
