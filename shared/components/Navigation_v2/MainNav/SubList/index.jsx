import React from "react";
import styled from "@emotion/styled";
import Link from "next/link";
import { Typography } from "@mui/material";
import useFirebase from "../../../../../hooks/useFirebase";
import UserAvatar from "./UserAvatar";
// import { useAuthState } from "react-firebase-hooks/auth";
// import { signInWithPopup } from "firebase/auth";
// import { useDispatch, useSelector } from "react-redux";
// import { userLogin } from "../../../../../redux/actions/user";
// import { useCollectionData } from "react-firebase-hooks/firestore";

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
  // const dispatch = useDispatch();
  const { auth, user } = useFirebase();

  return (
    <SubListWrapper>
      <LinkListWrapper>
        <li>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <Link href="/contribute/resource" passHref>
            <p className="login" role="presentation">
              新增資源
            </p>
          </Link>
        </li>
        <li>
          <UserAvatar user={user} />
        </li>
      </LinkListWrapper>
    </SubListWrapper>
  );
};

export default SubList;
