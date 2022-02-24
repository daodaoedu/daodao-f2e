import React from "react";
import styled from "@emotion/styled";

const LinkListWrapper = styled.ul`
  display: flex;
  justify-content: space-around;
  align-items: center;
  position: relative;
  li {
    cursor: pointer;
  }
  @media (max-width: 767px) {
    display: none;
  }
`;

const SubListWrapper = styled.div`
  /* color: rgba(255, 255, 255, 0.7); */
  color: white;
  .login,
  .logout {
    cursor: pointer;
  }
  .icon {
    width: 32px;
    /* border-radius: 50%; */
  }

  .coin-field {
    display: flex;
    align-items: center;
    span {
      margin: 10px;
    }
  }

  @media (max-width: 767px) {
    display: none;
  }
`;

const SubList = () => {
  return (
    <SubListWrapper>
      <LinkListWrapper>
        <li>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            target="_blank"
            href="/contribute/resource"
            rel="noopener noreferrer"
          >
            <p className="login" role="presentation">
              新增資源
            </p>
          </a>
        </li>
      </LinkListWrapper>
    </SubListWrapper>
  );
};

export default SubList;
