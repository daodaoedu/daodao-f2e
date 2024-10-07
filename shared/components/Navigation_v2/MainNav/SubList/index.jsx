import React from 'react';
import styled from '@emotion/styled';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { Button } from '@mui/material';
import openLoginWindow from '@/utils/openLoginWindow';
import UserAvatar from './UserAvatar';

const LinkListWrapper = styled.ul`
  display: flex;
  justify-content: space-around;
  align-items: center;
  position: relative;
  li {
    cursor: pointer;
    font-weight: 500;
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
  const user = useSelector((state) => state.user);

  return (
    <SubListWrapper>
      <LinkListWrapper>
        <li>
          <Link href="/contribute/resource" passHref>
            <p className="login" role="presentation">
              新增資源
            </p>
          </Link>
        </li>
        <li>
          {user._id ? (
            <UserAvatar user={user} />
          ) : (
            <Button
              onClick={() => openLoginWindow()}
              sx={{
                height: '40px',
                padding: '5px 20px',
                color: '#fff',
                borderRadius: '20px',
                border: '1px solid #fff',
                marginLeft: '40px',
              }}
            >
              登入
            </Button>
          )}
        </li>
      </LinkListWrapper>
    </SubListWrapper>
  );
};

export default SubList;
