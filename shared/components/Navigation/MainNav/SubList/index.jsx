import React from 'react';
import styled from '@emotion/styled';
import { Button } from '@mui/material';
import { useAuth, useAuthDispatch } from '@/contexts/Auth';
import UserAvatar from './UserAvatar';
import MarathonList from './MarathonList';

const LinkListWrapper = styled.ul`
  display: flex;
  justify-content: space-around;
  align-items: center;
  position: relative;
  li {
    cursor: pointer;
    font-weight: 500;
  }
  @media (max-width: 1023px) {
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

  @media (max-width: 1023px) {
    display: none;
  }
`;

const SubList = () => {
  const auth = useAuth();
  const authDispatch = useAuthDispatch();

  return (
    <SubListWrapper>
      <LinkListWrapper>
        <li>
          <MarathonList />
        </li>
        <li>
          {auth.isLoggedIn ? (
            <UserAvatar user={auth.user} />
          ) : (
            <Button
              onClick={() => authDispatch.openLoginModal()}
              sx={{
                height: '40px',
                padding: '5px 5px',
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
